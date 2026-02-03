import { Types } from '../@db_schema/src';

export interface UserInteraction {
	rate?: Types.Rate;
	lists_containing_book: Types.ListItem[];
}
