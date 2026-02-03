import { StatusCodes } from 'http-status-codes';
import ENV from '../config/env.config';
import { ZodIssue } from 'zod';

export interface IErrorResponse {
	message: string;
	statusCode: number;
	status: string;
	comingFrom: string;
	serializeError(): IErrorResponse;
}

export interface IError {
	message: string;
	statusCode: number;
	status: string;
	comingFrom?: string;
	stack?: unknown;
	errors?: unknown;
}

export abstract class CustomError extends Error {
	abstract statusCode: number;
	abstract status: string;
	comingFrom: string;
	stack?: string;
	errors?: any;

	constructor(
		message: string,
		comingFrom: string,
		stack?: unknown,
		errors?: any
	) {
		super(message);
		this.comingFrom = comingFrom;
		this.stack = JSON.stringify(stack);
		this.errors = errors;
	}

	serializeError(): IError {
		return {
			message: this.message,
			statusCode: this.statusCode,
			status: this.status,
			errors: this.errors,
			comingFrom: ENV.ENV === 'development' ? this.comingFrom : undefined,
			stack: ENV.ENV === 'development' ? this?.stack ?? '' : undefined,
		};
	}
}

export class ServerError extends CustomError {
	statusCode = StatusCodes.SERVICE_UNAVAILABLE; //503
	status = 'error';

	constructor(message: string, comingFrom: string, stack: unknown) {
		super(message, comingFrom, stack);
	}
}

export class NotFoundError extends CustomError {
	statusCode = StatusCodes.NOT_FOUND; //503
	status = 'error';

	constructor(message: string, comingFrom: string, errors?: any) {
		super(message, comingFrom, undefined, errors);
	}
}

export class NotAcceptableError extends CustomError {
	statusCode = StatusCodes.NOT_ACCEPTABLE;
	status = 'error';

	constructor(message: string, comingFrom: string, errors?: any) {
		super(message, comingFrom, undefined, errors);
	}
}

export class BadRequestError extends CustomError {
	statusCode = StatusCodes.BAD_REQUEST;
	status = 'error';

	constructor(message: string, comingFrom: string, errors?: any) {
		super(message, comingFrom, undefined, errors);
	}
}

export class ForbiddenError extends CustomError {
	statusCode = StatusCodes.FORBIDDEN;
	status = 'error';

	constructor(message: string, comingFrom: string, errors?: any) {
		super(message, comingFrom, undefined, errors);
	}
}

export class UnauthorizedError extends CustomError {
	statusCode = StatusCodes.UNAUTHORIZED;
	status = 'error';

	constructor(message: string, comingFrom: string, errors?: any) {
		super(message, comingFrom, undefined, errors);
	}
}

export class ZodValidationError extends CustomError {
	statusCode = 400;
	status = 'error';
	errors: Record<string, string>;

	constructor(issues: ZodIssue[], comingFrom: string, stack?: unknown) {
		const errors: Record<string, string> = {};
		issues.forEach((issue) => {
			const path = issue.path.join(', ');
			errors[path] = issue.message;
		});
		super('Validation failed', comingFrom, stack);
		this.errors = errors;
	}

	serializeError(): IError {
		return {
			...super.serializeError(),
			errors: this.errors,
		};
	}
}

export class ErrnoException extends Error {
	errno?: number;
	code?: string;
	path?: string;
	syscall?: string;
	stack?: string;
}
