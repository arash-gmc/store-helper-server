import { Models } from '../../@db_schema/src';
import {
	GENERAL_QUEUE_NAME,
	GENERAL_QUEUE_STATUS,
	GENERAL_QUEUE_TYPE,
} from '../../@db_schema/src/constants/general_queue';
import logger from 'mb_logger';
import { QueueParamsByName } from '../../@db_schema/src/types/general_queue';
import { queryAndPaginate } from '../../utils/pagination';
import { PaginationQuery } from '../../validations/pagination';

export interface AddQueueInputs<
	N extends GENERAL_QUEUE_NAME = GENERAL_QUEUE_NAME,
> {
	name: N;
	type: GENERAL_QUEUE_TYPE;
	params: QueueParamsByName[N];
	description?: string;
}

export async function createGeneralQueue(data: AddQueueInputs) {
	const queue = await Models.GeneralQueues.create({
		...data,
		status: GENERAL_QUEUE_STATUS.PENDING,
	});
	return queue.dataValues;
}

export async function getSystemTodoGeneralQueue() {
	const generalQueues = await Models.GeneralQueues.findAll({
		where: {
			status: [GENERAL_QUEUE_STATUS.PENDING, GENERAL_QUEUE_STATUS.FAILED],
			type: GENERAL_QUEUE_TYPE.SYSTEM,
		},
	});
	const result = generalQueues.map((generalQueue) => generalQueue.dataValues);
	return result;
}

export async function changeGeneralQueueStatus(
	generalQueueId: number,
	status: GENERAL_QUEUE_STATUS,
	ignorelogger?: boolean
) {
	const now = new Date();
	const generalQueue = await Models.GeneralQueues.findByPk(generalQueueId);
	if (!generalQueue) return;
	generalQueue.status = status;
	if (
		status === GENERAL_QUEUE_STATUS.COMPLETED ||
		status === GENERAL_QUEUE_STATUS.FAILED
	)
		generalQueue.executed_at = now;
	await generalQueue.save();
	if (!ignorelogger)
		logger.info(
			`General Queue #${generalQueueId}: status changed to ${status}`
		);
	return generalQueue.dataValues;
}

export async function getGeneralQueues(paginationParams: PaginationQuery) {
	const generalQueues = await queryAndPaginate<Models.GeneralQueues>(
		Models.GeneralQueues,
		{
			order: [['created_at', 'DESC']],
		},
		paginationParams
	);
	return generalQueues;
}

export async function getGeneralQueueById(generalQueueId: number) {
	const generalQueue = await Models.GeneralQueues.findByPk(generalQueueId);
	return generalQueue?.dataValues;
}
