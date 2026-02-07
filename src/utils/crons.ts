import { CronJob } from 'cron';
import { checkSystemGeneralQueue } from '../services/general_queue';
import logger from 'mb_logger';
import Env from '../config/env';

export const generalQueueCheckInterval = new CronJob(
	Env.GENERAL_QUEUE_INTERVAL ?? '0 * * * *',
	async (): Promise<void> => {
		try {
			await checkSystemGeneralQueue();
		} catch (error) {
			logger.error('Error on checkSystemGeneralQueue.', error);
		}
	},
	null,
	false,
	'Asia/Tehran'
);
