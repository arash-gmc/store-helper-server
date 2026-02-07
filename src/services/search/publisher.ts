import logger from 'mb_logger';
import opensearch from '../../config/opensearch';
import * as Publishers from '../publishers';
import { AppError } from '../../utils/v1/errors';
import { bulkIndex, indexSetting } from '.';

export async function* reIndexAllPublishers() {
	await ensureExistanceOfPublishersIndecies();
	let page, page_count;
	do {
		page ? page++ : (page = 1);
		const { data: chunk, ...meta } = await Publishers.listPubs({
			page,
			limit: 1000,
		});
		page_count ??= meta.pages;
		const res = await bulkIndex('publishers', chunk);
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

export async function reIndexPublishersById(ids: number[]) {
	const publishers = await Publishers.listPubs(
		{ limit: ids.length },
		{ id: ids }
	);
	await bulkIndex('publishers', publishers.data);
}

async function ensureExistanceOfPublishersIndecies() {
	if (!(await opensearch.indices.exists({ index: 'publishers' })).body) {
		const index_res = await opensearch.indices.create({
			index: 'publishers',
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
						description: { type: 'text' },
						image: { type: 'object' },
					},
				},
			},
		});
		return index_res.body;
	}
}
