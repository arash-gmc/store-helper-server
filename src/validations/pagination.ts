import { z } from 'zod';

/** Pagination query validation */
export const paginationQuerySchema = z.object({
	page: z.coerce.number().positive().optional(),
	limit: z.coerce.number().positive().max(100).optional(),
	searchValue: z.coerce.string().min(1).optional(),
	searchKeys: z.coerce.string().min(1).optional(),
	sortBy: z.coerce.string().min(1).optional(),
	sortOrder: z.enum(['ASC', 'DESC']).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function paginationQuery(data: unknown): PaginationQuery {
	return paginationQuerySchema.parse(data);
}
