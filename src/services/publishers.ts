import * as Publishers from '../models/publishers';

import { PaginationQuery } from '../validations/pagination';

import { WhereOptions } from 'sequelize';

export async function listPubs(
	paginationParams: PaginationQuery,
	matchCases?: WhereOptions
) {
	return await Publishers.listPubs(paginationParams, matchCases);
}
