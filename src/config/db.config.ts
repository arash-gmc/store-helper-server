import log from 'mb_logger';
import { initDB } from '../@db_schema/src';

const sequelize = initDB({
	logging: (msg: any) => {
		log.verbose(msg);
	},
});

export default sequelize;
