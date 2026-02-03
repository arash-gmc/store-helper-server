import { ZodIssue } from 'zod';
import ENV from '../../config/env.config';
import { StatusCodes } from 'http-status-codes';

const showIfDevelopment = <T>(data: T): T | undefined => {
	return ENV.ENV === 'development' ? data : undefined;
};

export interface ApiError {
	id?: string;
	code?: string;
	resource?: string;
	fields?: Record<string, string>;
	meta?: Record<string, string>;
}
export class AppError extends Error {
	statusCode: number;
	details?: ApiError | Record<string, any>;

	constructor(
		message: string,
		statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
		details?: ApiError | Record<string, any>
	) {
		super(message);
		this.name = 'AppError';
		this.statusCode = statusCode;
		this.details = details;
		Error.captureStackTrace(this, this.constructor);
	}
	serializeError(): ApiError {
		return {
			id: this.details?.id,
			code: this.details?.code,
			fields: this.details?.fields,
			resource: showIfDevelopment(this.details?.resource),
			meta: showIfDevelopment({ ...this.details?.meta, stack: this?.stack }),
		};
	}
}

export class BadRequestError extends AppError {
	constructor(
		message = 'Bad Request',
		details?: ApiError | Record<string, any>
	) {
		super(message, StatusCodes.BAD_REQUEST, details);
		this.name = 'BadRequestError';
	}
}

export class UnauthorizedError extends AppError {
	constructor(
		message = 'Unauthorized',
		details?: ApiError | Record<string, any>
	) {
		super(message, StatusCodes.UNAUTHORIZED, details);
		this.name = 'UnauthorizedError';
	}
}

export class ForbiddenError extends AppError {
	constructor(message = 'Forbidden', details?: ApiError | Record<string, any>) {
		super(message, StatusCodes.FORBIDDEN, details);
		this.name = 'ForbiddenError';
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Not Found', details?: ApiError | Record<string, any>) {
		super(message, StatusCodes.NOT_FOUND, details);
		this.name = 'NotFoundError';
	}
}

export class NotAcceptableError extends AppError {
	constructor(
		message = 'Not Acceptable',
		details?: ApiError | Record<string, any>
	) {
		super(message, StatusCodes.NOT_ACCEPTABLE, details);
		this.name = 'NotAcceptableError';
	}
}

export class ConflictError extends AppError {
	constructor(message = 'Conflict', details?: ApiError | Record<string, any>) {
		super(message, StatusCodes.CONFLICT, details);
		this.name = 'ConflictError';
	}
}

export class InternalServerError extends AppError {
	constructor(
		message = 'Internal Server Error',
		details?: ApiError | Record<string, any>
	) {
		super(message, StatusCodes.INTERNAL_SERVER_ERROR, details);
		this.name = 'InternalServerError';
	}
}

export class ZodValidationError extends AppError {
	success: boolean;
	errors: Record<string, string>;

	constructor(issues: ZodIssue[], stack?: unknown) {
		const errors: Record<string, string> = {};
		issues.forEach((issue) => {
			const path = issue.path.join(', ');
			errors[path] = issue.message;
		});

		super('Validation failed', StatusCodes.BAD_REQUEST, {
			fields: issues,
			meta: stack,
		});

		this.errors = errors;
		this.success = false;
	}
}
