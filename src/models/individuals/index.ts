import { PaginationQuery } from '../../validations/pagination';
import { queryAndPaginate } from '../../utils/pagination';
import { Models, Types } from '../../@db_schema/src';
import { WhereOptions } from 'sequelize';
import { notDeletedBooks } from '../books';
export async function listIndividuals(
	paginationParams: PaginationQuery,
	matchCases?: WhereOptions
) {
	return await queryAndPaginate<Models.Individuals>(
		Models.Individuals,
		{
			where: matchCases,
			order: [['name', 'ASC']],
			distinct: true,
		},
		paginationParams
	);
}

export async function createIndividual(
	individualData: Omit<Types.Individual, 'id' | 'image'>
) {
	const individual = await Models.Individuals.create(
		{
			name: individualData.name,
			org_name: individualData?.org_name ?? null,
			description: individualData?.description ?? null,
			image: null,
		},
		{
			returning: true,
		}
	);
	return individual.dataValues;
}

export async function getSingleIndividualById(id: number) {
	const individual = await Models.Individuals.findByPk(id, {
		include: [{ model: notDeletedBooks }],
	});
	return individual?.dataValues;
}

export async function updateSingleIndividualById(
	id: number,
	individualData: Partial<Types.Individual>
) {
	const [, individual] = await Models.Individuals.update(individualData, {
		where: { id },
		returning: true,
	});
	return individual?.[0]?.dataValues;
}
