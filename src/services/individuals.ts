import * as Individuals from '../models/individuals';
import { PaginationQuery } from '../validations/pagination';
import { WhereOptions } from 'sequelize';

export async function listIndividuals(
	paginationParams: PaginationQuery,
	matchCases?: WhereOptions
) {
	return await Individuals.listIndividuals(paginationParams, matchCases);
}
