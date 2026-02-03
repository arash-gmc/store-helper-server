import multer from 'multer';
import { MulterInstanceType } from '../@types/MulterInstance';
import { makeNewStorage, uploadFileFilter } from '../config/multer';

export default function upload(type: MulterInstanceType) {
	const upload = multer({
		storage: makeNewStorage(),
		limits: {
			fileSize: 10 * 1024 * 1024,
		},
		fileFilter: uploadFileFilter,
	});
	switch (type) {
		case 'singleImage':
			return upload.single('image');
		case 'multiImage':
			return upload.array('image', 10);
		case 'singleFile':
			return upload.single('file');
		case 'multiFile':
			return upload.array('file', 10);
		default:
			return upload.none();
	}
}
