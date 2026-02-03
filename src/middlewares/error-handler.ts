import { NextFunction, Request, Response } from 'express';
import log from 'mb_logger';
import createHttpError from 'http-errors';
import { ZodError } from 'zod';
import { CustomError } from '../utils/errors';
import envConfig from '../config/env.config';
import { AppError, ZodValidationError } from '../utils/v1/errors';
import { errorResponse } from '../responses/ApiResponse';
import { AxiosError } from 'axios';

export default function (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (err instanceof ZodError) {
		const zodError = new ZodValidationError(err.issues, 'ZodError');
		return res.status(zodError.statusCode).json(zodError);
		// return res.status(zodError.statusCode).json(errorResponse(zodError));
	}

	if (err instanceof CustomError) {
		const errorResponse = err.serializeError();
		return res.status(errorResponse.statusCode).json(errorResponse);
	}

	if (err instanceof AppError) {
		return res.status(err.statusCode).json(errorResponse(err));
	}

	if (err instanceof AxiosError) {
		if (err.response) {
			return res.status(err.response.status < 500 ? 500 : 503).json(
				errorResponse(
					new AppError('External service failed.', 503, {
						resource: 'AxiosError',
						meta: {
							status: err.response.status,
							message: err.message,
							stack: err.stack,
							data: err.response.data,
							headers: err.response.headers,
						},
					})
				)
			);
		}
		log.error('AxiosError: ' + JSON.stringify(err));
		return res.status(502).json(
			errorResponse(
				new AppError('Could not connect to external service.', 502, {
					resource: 'AxiosError',
					meta: {
						message: err.message,
						stack: err.stack,
						code: err.code,
					},
				})
			)
		);
	}

	if (createHttpError.isHttpError(err)) {
		log.error(err?.stack);
		return res.status(err.status).json({ message: err.message });
	}

	log.error(JSON.stringify(err.message));

	return res.status(500).json({
		message:
			envConfig.ENV === 'development' ? err.message : 'Internal Server Error',
		stack: envConfig.ENV === 'development' ? err.stack : undefined,
	});
	next();
}
