import { WhereOptions } from 'sequelize';
import { Models, Types } from '../../@db_schema/src';
import { queryAndPaginate } from '../../utils/pagination';
import { PaginationQuery } from '../../validations/pagination';

export const notDeletedBooks = Models.Books.scope('notDeleted');

export async function getSingleBookByCode(book_code?: string) {
	const book = await notDeletedBooks.findOne({
		where: {
			code: book_code,
		},
		include: [
			{ model: Models.Publishers, through: { attributes: [] } },

			{
				model: Models.BookIndividuals,
				include: [Models.Individuals],
			},
			{
				model: Models.BookMetaValues,
				include: [Models.BookMetaKeys],
			},
		],
		order: [['individuals', 'is_display_lead', 'DESC']],
	});

	return book?.dataValues;
}

export async function listBooks(
	paginationParams: PaginationQuery,
	matchCases?: WhereOptions
) {
	return await queryAndPaginate<Models.Books>(
		notDeletedBooks,
		{
			where: matchCases,
			include: [
				{ model: Models.Publishers, through: { attributes: [] } },
				{
					model: Models.BookIndividuals,
					include: [Models.Individuals],
				},
				{
					model: Models.BookMetaValues,
					include: [Models.BookMetaKeys],
				},
				{ model: Models.Tags, through: { attributes: [] } },
			],
			distinct: true,
			order: [
				['updated_at', 'DESC'],
				['individuals', 'is_display_lead', 'DESC'],
			],
		},
		paginationParams
	);
}

export async function createBook(bookData: Partial<Types.Book>) {
	const now = new Date();
	const book = await notDeletedBooks.create(
		{
			code: bookData.code!,
			title: bookData?.title ?? '',
			sub_title: bookData?.sub_title ?? null,
			description: bookData?.description ?? null,
			image: bookData?.image ?? null,
			price: bookData?.price ?? 0,
			max_percent: bookData?.max_percent ?? 0,
			max_amount: bookData?.max_amount ?? 0,
			is_discounted: bookData?.is_discounted ?? false,
			is_active: bookData?.is_active ?? true,
			in_stock: bookData?.in_stock ?? false,
			is_deleted: false,
			created_at: now,
			updated_at: now,
			rate_value: 0,
			reviews_count: 0,
		},
		{
			returning: true,
		}
	);
	return book.dataValues;
}

export async function getSingleBookById(id: number) {
	const book = await notDeletedBooks.findByPk(id, {
		include: [
			{ model: Models.Publishers, through: { attributes: [] } },
			{
				model: Models.BookIndividuals,
				include: [Models.Individuals],
			},
			{
				model: Models.BookMetaValues,
				include: [Models.BookMetaKeys],
			},
			{ model: Models.SyncedInventory },
		],
		order: [
			['individuals', 'is_display_lead', 'DESC'],
			['individuals', 'id', 'ASC'],
		],
	});
	return book?.dataValues;
}

export async function updateSingleBookById(
	id: number,
	bookData: Partial<Types.Book>
) {
	const [, book] = await notDeletedBooks.update(bookData, {
		where: { id },
		returning: true,
	});
	return book?.[0]?.dataValues;
}

export async function depleteBooksById(ids: number[]) {
	const [, books] = await notDeletedBooks.update(
		{
			in_stock: false,
		},
		{
			where: {
				id: ids,
			},
			returning: true,
		}
	);
	return books.map((b) => b.dataValues);
}

export async function replenishBooksById(ids: number[]) {
	const [, books] = await notDeletedBooks.update(
		{
			in_stock: true,
		},
		{
			where: {
				id: ids,
			},
			returning: true,
		}
	);
	return books.map((b) => b.dataValues);
}

export async function bulkUpdatePrices(data: { id: number; price: number }[]) {
	const existingBooks = (
		await notDeletedBooks.findAll({
			where: {
				id: data.map((item) => item.id),
			},
		})
	).map((book) => book.toJSON()) as Types.Book[];
	const newPrices = data.reduce(
		(acc, cur) => {
			return { ...acc, [cur.id]: cur.price };
		},
		{} as Record<number, number>
	);
	// books with all required fields
	const booksToUpdate = existingBooks
		.filter((book) => book.price !== newPrices[book.id])
		.map((book) => {
			return {
				...book, // the existing book data
				price: newPrices[book.id], // Update the price
				is_discounted: false,
			};
		});
	// Use bulkCreate with updateOnDuplicate to update prices based on id
	await notDeletedBooks.bulkCreate(booksToUpdate, {
		updateOnDuplicate: ['price', 'is_discounted'], // Specify the fields to update
	});
}

export async function bulkUpdateImages(
	data: Pick<Types.Book, 'id' | 'image'>[]
) {
	const existingBooks = (
		await notDeletedBooks.findAll({
			where: {
				id: data.map((item) => item.id),
			},
		})
	).map((book) => book.toJSON()) as Types.Book[];
	const newImages = data.reduce(
		(acc, cur) => {
			return { ...acc, [cur.id]: cur.image };
		},
		{} as Record<number, Types.UploadedImage | null>
	);
	// books with all required fields
	const booksToUpdate = existingBooks
		.filter(
			(book) =>
				JSON.stringify(book.image) !== JSON.stringify(newImages[book.id])
		)
		.map((book) => {
			return {
				...book, // the existing book data
				image: newImages[book.id], // Update the image
			};
		});
	// Use bulkCreate with updateOnDuplicate to update images based on id
	await notDeletedBooks.bulkCreate(booksToUpdate, {
		updateOnDuplicate: ['image'], // Specify the fields to update
	});
}

export async function listBooksStockDetailsByID(
	book_ids: number[]
): Promise<Types.Book[]> {
	const books = await Models.Books.findAll({
		attributes: [
			'id',
			'title',
			'sub_title',
			'price',
			'code',
			'max_percent',
			'max_amount',
			'is_discounted',
			'in_stock',
		],
		where: {
			id: book_ids,
		},
		include: [
			{
				model: Models.SyncedInventory,
				attributes: ['id', 'quantity'],
			},
		],
	});

	return books.map((book) => book.dataValues);
}

export async function updateDiscountValues(
	book_id: number,
	data: { is_discounted: boolean; max_amount: number; max_percent: number }
) {
	await notDeletedBooks.update(
		{
			max_amount: data.max_amount,
			max_percent: data.max_percent,
			is_discounted: data.is_discounted,
		},
		{ where: { id: book_id } }
	);
}

export async function checkBookExists(book_id: number) {
	const book = await notDeletedBooks.findByPk(book_id);
	return !!book;
}

export async function getBooksByFilter(
	paginationParams: PaginationQuery,
	filter: WhereOptions
) {
	const result = await queryAndPaginate<Models.Books>(
		Models.Books,
		filter,
		paginationParams
	);
	return result;
}
