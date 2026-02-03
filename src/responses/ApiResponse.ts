import { ApiError, AppError } from '../utils/v1/errors';

export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
	meta?: PaginationMeta;
	error?: ApiError;
}

export interface PaginationMeta {
	pages: number;
	per_page: number;
	current_page: number;
	total_items: number;
}

export const successResponse = <T>(
	message?: string,
	data?: T | undefined,
	meta?: PaginationMeta
): ApiResponse<T | T[]> => {
	return {
		success: true,
		message,
		data,
		meta,
	};
};

export const errorResponse = (error: AppError): ApiResponse<null> => ({
	success: false,
	message: error.message,
	error: error.serializeError(),
});
export interface PaginationMeta {
	pages: number;
	per_page: number;
	current_page: number;
	total_items: number;
}

export type PaginatedResponse<T> = [T, PaginationMeta];
export const paginated = <T, DTO>(
	serviceResult: {
		data: T;
		pages: number;
		per_page: number;
		current_page: number;
		total_items: number;
	},
	// eslint-disable-next-line no-unused-vars
	mapper: (item: T) => DTO
): PaginatedResponse<DTO> => {
	return [
		mapper(serviceResult.data),
		{
			pages: serviceResult.pages,
			per_page: serviceResult.per_page,
			current_page: serviceResult.current_page,
			total_items: serviceResult.total_items,
		},
	];
};
