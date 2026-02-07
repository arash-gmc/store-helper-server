import { Models } from '../../@db_schema/src';
import { PaginationQuery } from '../../validations/pagination';
import { queryAndPaginate } from '../../utils/pagination';
import { WhereOptions } from 'sequelize';

export async function listPubs(
	paginationParams: PaginationQuery,
	matchCases?: WhereOptions
) {
	const pubs = await queryAndPaginate(
		Models.Publishers,
		{
			where: matchCases,
			order: [['id', 'DESC']],
			distinct: true,
		},
		paginationParams
	);

	return pubs;
}
