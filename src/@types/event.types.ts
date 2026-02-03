import { Types } from '../@db_schema/src';
import { LikeTarget, LikeType } from '../@db_schema/src/types';

export interface ActivityEventData {
	type: Types.ActivityType;
	model_name: string;
	model_id: number;
	user_id: number;
	visibility: Types.ActivityVisibility | null;
}

export interface RateCreatedEventData {
	user: Types.User;
	book: Types.Book;
}

export interface ReviewCreatedEventData {
	user: Types.User;
	book: Types.Book;
}

export interface ReviewDeletedEventData {
	user: Types.User;
	book: Types.Book;
}

export interface ReplyCreatedEventData {
	user_id: number;
	target_id: number;
	target_name: Types.ReplyTarget;
}

export interface ReplyDeletedEventData {
	user: Types.User;
	reply: Types.Reply;
}

export interface ChildReplyCreatedEventData {
	parent_reply_id: number;
}

export interface likeDislikeCreatedEventData {
	user_id: number;
	model_id: number;
}

export interface likeUnlikeEventData {
	user_id: number;
	target: LikeTarget;
	target_id: number;
	type: LikeType;
}

export interface ListItemEventData {
	user: Types.User;
	list: Types.List;
}
