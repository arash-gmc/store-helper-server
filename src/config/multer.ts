import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import { ensureDirectoryExists } from '../utils/fileSystem';
import generateRandomHex from '../utils/generateRandomHex';
import env from './env.config';

export function tempDir() {
	const dir = path.join(
		env.UPLOAD_TEMP_DIRECTORY ?? 'uploads',
		generateRandomHex(6)
	);
	ensureDirectoryExists(dir);
	return dir;
}

export function makeNewStorage(): StorageEngine {
	return multer.diskStorage({
		destination: (req, file, cb) => {
			req.sandboxDirectory ??= tempDir();
			cb(null, req.sandboxDirectory);
		},
		filename: (req, file, cb) => {
			cb(null, file.originalname);
		},
	});
}

export function uploadFileFilter(
	req: Express.Request,
	file: Express.Multer.File,
	cb: FileFilterCallback
) {
	if (file.fieldname === 'image' || file.fieldname === 'file') {
		cb(null, true);
	} else {
		cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
	}
}
