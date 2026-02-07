import * as Books from '../models/books';
import { PaginationQuery } from '../validations/pagination';
import { WhereOptions } from 'sequelize';

export async function listBooks(
	paginationParams: PaginationQuery,
	matchCases?: WhereOptions
) {
	return await Books.listBooks(paginationParams, matchCases);
}
