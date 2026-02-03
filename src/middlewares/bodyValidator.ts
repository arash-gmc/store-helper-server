import { Request, Response, NextFunction } from 'express';

export default function (validatorFN: Function) {
	return function (req: Request, res: Response, next: NextFunction) {
		const body = req.body;
		req.body = validatorFN(body);
		next();
	};
}
