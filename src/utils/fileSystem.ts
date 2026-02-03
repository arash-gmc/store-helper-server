import fs from 'fs';
import path from 'path';
import logger from 'mb_logger';
import { ServerError } from './errors';

export function removeDir(dirPath: string) {
	try {
		logger.verbose(`FS Utils [removeDir]:Removing directory: ${dirPath}`);
		if (!fs.existsSync(dirPath)) {
			logger.error(
				`[UploadService:removeDir] Directory "${dirPath}" does not exist.`
			);
			return;
		}
		const entries = fs.readdirSync(dirPath);
		for (const entry of entries) {
			const fullPath = path.join(dirPath, entry);
			const stat = fs.lstatSync(fullPath);
			if (stat.isDirectory()) {
				removeDir(fullPath);
			} else {
				fs.unlinkSync(fullPath);
			}
		}
		fs.rmdirSync(dirPath);
		logger.verbose(
			`FS Utils [removeDir]:Removed directory successfully. (${dirPath})`
		);
	} catch (error) {
		logger.error(`FS Utils [removeDir]: ${JSON.stringify(error)}`);
		throw error;
	}
}

export function ensureDirectoryExists(destDir: string) {
	if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
	return;
}

export function copyFile(srcPath: string, destPath: string) {
	const destDir = path.dirname(destPath);
	if (!fs.existsSync(srcPath))
		throw new ServerError('Something went wrong.', 'fileSystem', {
			code: 'MISSING_SOURCE_FILE',
			resource: 'FS Utils: copyFile',
			meta: { srcPath, destPath },
		});
	ensureDirectoryExists(destDir);
	fs.copyFileSync(srcPath, destPath);
	return destPath;
}

export function removeFiles(entries: string[]) {
	for (const filePath of entries) {
		if (!fs.existsSync(filePath)) {
			logger.warn(`FS Utils [removeDir]: File "${filePath}" does not exist.`);
			continue;
		}
		fs.unlinkSync(filePath);
	}
}

const FS = {
	removeDir,
	removeFiles,
	ensureDirectoryExists,
	copyFile,
};
export default FS;
