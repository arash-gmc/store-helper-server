import logger from 'mb_logger';
import opensearch from '../../config/opensearch';
import * as Individuals from '../individuals';
import { AppError } from '../../utils/v1/errors';
import { bulkIndex, indexSetting } from '.';

export async function* reIndexAllIndividuals() {
	await ensureExistanceOfIndividualsIndecies();
	let page, page_count;
	do {
		page ? page++ : (page = 1);
		const { data: chunk, ...meta } = await Individuals.listIndividuals({
			page,
			limit: 1000,
		});
		page_count ??= meta.pages;
		const res = await bulkIndex('individuals', chunk);
		if (res.body.errors) {
			const error = new AppError(`failed on page #${page}`, 503, {
				fields: { items: res.body.items },
			});
			logger.error(error);
			throw error;
		}
		yield {
			page,
			page_count,
			results: res.body.items.reduce(
				(acc, cur) => {
					acc[cur.index.result ?? 'unknown'] =
						(acc[cur.index.result ?? 'unknown'] ?? 0) + 1;
					return acc;
				},
				{ total: chunk.length } as Record<string, any>
			),
		};
	} while (page !== page_count);
}

export async function reIndexIndividualsById(ids: number[]) {
	const individuals = await Individuals.listIndividuals(
		{ limit: ids.length },
		{ id: ids }
	);
	await bulkIndex('individuals', individuals.data);
}

async function ensureExistanceOfIndividualsIndecies() {
	if (!(await opensearch.indices.exists({ index: 'individuals' })).body) {
		const index_res = await opensearch.indices.create({
			index: 'individuals',
			body: {
				settings: indexSetting,
				mappings: {
					properties: {
						id: { type: 'integer' },
						name: {
							type: 'text',
							fields: {
								keyword: { type: 'keyword' },
								persian: { type: 'text', analyzer: 'persian_analyzer' },
								english: { type: 'text', analyzer: 'english_analyzer' },
								autocomplete: {
									type: 'text',
									analyzer: 'autocomplete_analyzer',
									search_analyzer: 'standard',
								},
								suggest: { type: 'completion' },
							},
						},
						org_name: {
							type: 'text',
							fields: { keyword: { type: 'keyword' } },
						},
						description: { type: 'text' },
						image: { type: 'object' },
					},
				},
			},
		});
		return index_res.body;
	}
}
