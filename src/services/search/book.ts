import logger from 'mb_logger';
import opensearch, { checkOpenSearchConnection } from '../../config/opensearch';
import * as Books from '../books';
import { AppError } from '../../utils/v1/errors';
import * as GeneralQueuesService from '../general_queue';
import { indexSetting } from '../search';
import {
	GENERAL_QUEUE_NAME,
	GENERAL_QUEUE_TYPE,
} from '../../@db_schema/src/constants/general_queue';
import { getOrderItemsByBookIds } from '../../models/order_item';

export async function bulkIndex(indexName: string, data: any[]) {
	return await opensearch.bulk({
		body: data.reduce((acc, item) => {
			acc.push({ index: { _index: indexName, _id: item?.id } });
			acc.push(item);
			return acc;
		}, [] as any[]),
	});
}

export async function* reIndexAllBooks() {
	await checkOpenSearchConnection();
	await ensureExistanceOfBookIndecies();
	let page, page_count;
	do {
		page ? page++ : (page = 1);
		const { data: books, ...meta } = await Books.listBooks({
			page,
			limit: 1000,
		});
		await addOrderIdsToBooksIndex(
			books,
			books.map((book) => book.id)
		);
		page_count ??= meta.pages;
		const res = await bulkIndex('books', books);
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
				{ total: books.length } as Record<string, any>
			),
		};
	} while (page !== page_count);
}

export async function reIndexBooksById(ids: number[]) {
	await checkOpenSearchConnection();
	const books = await Books.listBooks({ limit: ids.length }, { id: ids });
	await bulkIndex('books', books.data);
	await addOrderIdsToBooksIndex(books.data, ids);
	logger.info('Books with these ids were updated: \n' + JSON.stringify(ids));
}

export async function addReindexingBooksTask(ids: number[]) {
	GeneralQueuesService.runOrEnqueueGeneralQueue<number[]>(
		{
			name: GENERAL_QUEUE_NAME.BOOK_INDEX_UPDATE,
			type: GENERAL_QUEUE_TYPE.SYSTEM,
			params: { book_ids: ids },
		},
		reIndexBooksById,
		ids
	);
	return;
}

async function ensureExistanceOfBookIndecies() {
	// opensearch.indices.delete({ index: 'books' });
	if (!(await opensearch.indices.exists({ index: 'books' })).body) {
		const index_res = await opensearch.indices.create({
			index: 'books',
			body: {
				settings: indexSetting,
				mappings: {
					properties: {
						id: { type: 'integer' },
						code: { type: 'keyword' },
						title: {
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
						sub_title: {
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
						price: { type: 'long' },
						max_percent: { type: 'integer' },
						max_amount: { type: 'long' },
						is_discounted: { type: 'boolean' },
						rate_value: { type: 'float' },
						reviews_count: { type: 'integer' },
						is_active: { type: 'boolean' },
						in_stock: { type: 'boolean' },
						is_deleted: { type: 'boolean' },
						created_at: { type: 'date', format: 'strict_date_time' },
						updated_at: { type: 'date', format: 'strict_date_time' },

						// Denormalized publisher object
						publishers: {
							type: 'nested',
							properties: {
								id: { type: 'integer' },
								name: {
									type: 'text',
									fields: { keyword: { type: 'keyword' } },
								},
								description: { type: 'text' },
								image: { type: 'object' },
							},
						},

						// Denormalized individuals array (authors, editors, etc.)
						individuals: {
							type: 'nested', // allows queries inside array elements
							properties: {
								id: { type: 'integer' },
								rel_type: { type: 'keyword' }, // e.g., 'author', 'editor'
								profile: {
									type: 'object',
									properties: {
										id: { type: 'integer' },
										name: {
											type: 'text',
											fields: { keyword: { type: 'keyword' } },
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
						},

						tags: {
							type: 'nested',
							properties: {
								id: { type: 'integer' },
								name: {
									type: 'keyword',
								},
							},
						},

						// Meta data (denormalized from metakeys + metavalue)
						meta_data: {
							type: 'nested',
							properties: {
								value: {
									type: 'text',
									fields: { keyword: { type: 'keyword' } },
								},
								metakey: {
									type: 'object',
									properties: {
										name: { type: 'keyword' },
										label: { type: 'text' },
										type: { type: 'keyword' },
									},
								},
							},
						},

						order_ids: { type: 'keyword' },
					},
				},
			},
		});
		return index_res.body;
	}
}

export async function addOrderIdsToBooksIndex(
	books: any[],
	book_ids: number[]
) {
	const orderItems = await getOrderItemsByBookIds(book_ids);
	books.forEach((book) => {
		const order_ids = orderItems
			.filter((orderItem) => orderItem.book_id === book.id)
			.slice(0, 20)
			.map((orderItem) => orderItem.order_id);
		book.order_ids = order_ids;
	});
}
