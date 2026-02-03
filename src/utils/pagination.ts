import { Request } from 'express';
import { PaginationQuery } from '../validations/pagination';
import { Model, ModelCtor } from 'sequelize';
import { Op, WhereOptions } from 'sequelize';
import { BadRequestError } from './errors';

export interface PaginationObjectInterface {
	page: number;
	offset: number;
	limit: number;
}

export function extractPaginationQuery(req: Request) {
	const query = req.query;
	return {
		page: query.page,
		limit: query.limit,
		searchValue: query.searchValue,
		searchKeys: query.searchKeys,
		sortBy: query.sortBy,
		sortOrder: query.sortOrder,
	} as PaginationQuery;
}

export async function queryAndPaginate<T extends Model>(
	model: ModelCtor<T>,
	{ where = {} as WhereOptions, ...options },
	{
		page = 1,
		limit = 25,
		searchValue,
		searchKeys,
		sortBy,
		sortOrder,
	}: PaginationQuery
) {
	const attributeTypes = {} as Record<string, string>;
	Object.entries(model.getAttributes()).forEach(([key, attributes]) => {
		attributeTypes[key] = String((attributes as any)?.type);
	});

	if (
		searchKeys
			?.split(',')
			.some((key: string) => !Object.keys(attributeTypes).includes(key))
	) {
		throw new BadRequestError(
			'Invalid searchKeys value(s).',
			'PaginationUtils@queryAndPaginate'
		);
	}

	if (sortBy && !Object.keys(attributeTypes).includes(sortBy)) {
		throw new BadRequestError(
			'Invalid sortBy value.',
			'PaginationUtils@queryAndPaginate'
		);
	}

	if (searchValue && !searchKeys?.length) {
		throw new BadRequestError(
			'searchKeys not provided.',
			'PaginationUtils@queryAndPaginate'
		);
	}

	if ((sortBy && !sortOrder) || (!sortBy && sortOrder)) {
		throw new BadRequestError(
			'sortBy and sortOrder are required.',
			'PaginationUtils@queryAndPaginate'
		);
	}

	const filters: WhereOptions = [];
	searchKeys?.split(',').forEach((key: string) => {
		if (
			['INTEGER', 'BIGINT'].includes(attributeTypes[key]) &&
			!isNaN(Number(searchValue))
		)
			filters.push({ [key]: Number(searchValue) });
		else if (['TEXT', 'VARCHAR'].some((t) => attributeTypes[key].startsWith(t)))
			filters.push({ [key]: { [Op.iLike]: `%${searchValue}%` } });
	});

	if (filters.length)
		where = {
			...where,
			[Op.or]: filters,
		};

	let order = options.order;
	if (sortBy && sortOrder) order = [[sortBy, sortOrder]];

	const result = await model.findAndCountAll({
		...options,
		where,
		order,
		limit,
		offset: (page - 1) * limit,
	});
	return {
		pages: Math.ceil(result.count / limit),
		per_page: +limit,
		current_page: +page,
		total_items: result.count,
		data: result.rows.map((b) => b.toJSON()),
	};
}

export function extractPaginationRequirements(req: Request): {
	page: number;
	offset: number;
	limit: number;
} {
	const { page = '1', per_page = '25' } = req.query;
	const pageNumber = parseInt(page as string, 10);
	const perPageNumber = parseInt(per_page as string, 10);

	return {
		page: pageNumber,
		offset: (pageNumber - 1) * perPageNumber,
		limit: perPageNumber,
	};
}

export function extractSort(req: Request): { order?: [string, string][] } {
	const { orderBy, sortBy } = req.query;
	const orderByString = typeof orderBy === 'string' ? orderBy : undefined;
	const sortByString = typeof sortBy === 'string' ? sortBy : 'ASC';

	return {
		order: orderByString ? [[orderByString, sortByString]] : undefined,
	};
}

export function extractSearch(req: Request): object | undefined {
	const { keyword, column } = req.query;

	if (!column || typeof column !== 'string' || column.trim() === '') {
		return undefined;
	}

	const columns = column.split(',').map((col) => col.trim());
	const searchConditions = columns.map((col) => ({
		[col]: { [Op.substring]: keyword },
	}));

	return {
		[Op.or]: searchConditions,
	};
}

export function createPaginationResponse(
	data: any,
	pagination: { limit: number; page: number }
) {
	return {
		pages: Math.ceil(data.count / pagination.limit),
		per_page: pagination.limit,
		current_page: pagination.page,
		total_items: data.count,
		data: data.data,
	};
}

export function createResponse(data: any) {
	return {
		data: data,
	};
}
