import { Request, Response, NextFunction } from 'express';

export default function (validatorFN: Function) {
	return function (req: Request, res: Response, next: NextFunction) {
		const query = req.query;
		req.query = {
			...query,
			...validatorFN(query),
		};
		next();
	};
}
