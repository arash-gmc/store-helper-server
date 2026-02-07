import logger from 'mb_logger';
import * as GeneralQueue from '../models/general_queue';
import { reIndexBooksById } from './search/book';
import {
	GENERAL_QUEUE_NAME,
	GENERAL_QUEUE_STATUS,
} from '../@db_schema/src/constants/general_queue';
import { GeneralQueue as GeneralQueueType } from '../@db_schema/src/types';
import { PaginationQuery } from '../validations/pagination';
import { BadRequestError, NotFoundError } from '../utils/errors';

export async function checkSystemGeneralQueue() {
	logger.info('Checking GeneralQueues...');
	const generalQueues = await GeneralQueue.getSystemTodoGeneralQueue();
	for (const generalQueue of generalQueues) {
		startGeneralQueueProcess(generalQueue);
	}
}

export async function startGeneralQueueProcess(generalQueue: GeneralQueueType) {
	try {
		await GeneralQueue.changeGeneralQueueStatus(
			generalQueue.id,
			GENERAL_QUEUE_STATUS.IN_PROGRESS,
			true
		);
		await executeGeneralQueue(generalQueue);
		return await GeneralQueue.changeGeneralQueueStatus(
			generalQueue.id,
			GENERAL_QUEUE_STATUS.COMPLETED
		);
	} catch {
		await GeneralQueue.changeGeneralQueueStatus(
			generalQueue.id,
			GENERAL_QUEUE_STATUS.FAILED
		);
	}
}

async function executeGeneralQueue(generalQueue: GeneralQueueType) {
	switch (generalQueue.name) {
		case GENERAL_QUEUE_NAME.BOOK_INDEX_UPDATE:
			return reIndexBooksById(generalQueue.params.book_ids);

		case GENERAL_QUEUE_NAME.TEST:
			return;
	}
}

export async function runOrEnqueueGeneralQueue<T>(
	generalQueueData: GeneralQueue.AddQueueInputs,
	job: (input: T) => Promise<void>,
	input: T
) {
	try {
		await job(input);
	} catch {
		logger.error(
			`problem in ${generalQueueData.name}, creating new general queue...`
		);
		await GeneralQueue.createGeneralQueue(generalQueueData);
	}
}

export async function getGeneralQueues(paginationParams: PaginationQuery) {
	return await GeneralQueue.getGeneralQueues(paginationParams);
}

export async function runGeneralQueueById(id: number) {
	const generalQueue = await GeneralQueue.getGeneralQueueById(id);
	if (!generalQueue)
		throw new NotFoundError(
			'GeneralQueue not found',
			'GeneralQueueService@executeSingleGeneralQueueById'
		);
	if (generalQueue.status === GENERAL_QUEUE_STATUS.COMPLETED)
		throw new BadRequestError(
			'GeneralQueue already completed',
			'GeneralQueueService@executeSingleGeneralQueueById'
		);
	return await startGeneralQueueProcess(generalQueue);
}
