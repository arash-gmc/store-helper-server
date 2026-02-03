import { Request, Response, NextFunction } from 'express';

export default function (validatorFN: Function) {
	return function (req: Request, res: Response, next: NextFunction) {
		try {
			const params = req.params;
			req.params = validatorFN(params);
			next();
		} catch (e) {
			next(e);
		}
	};
}
