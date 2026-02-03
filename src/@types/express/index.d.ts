import { Types } from '../../@db_schema/src';

declare global {
	// eslint-disable-next-line no-unused-vars
	namespace Express {
		// eslint-disable-next-line no-unused-vars
		interface Request {
			user?: Types.User;
			sandboxDirectory?: string;
		}
	}
}
