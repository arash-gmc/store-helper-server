import { Op } from 'sequelize';
import { Models } from '../../@db_schema/src';

export async function getOrderItemsByBookIds(book_ids: number[]) {
	const bookItems = await Models.OrderItems.findAll({
		where: {
			book_id: {
				[Op.in]: book_ids,
			},
		},
		order: [['order_id', 'DESC']],
	});
	return bookItems.map((item) => item.dataValues);
}
