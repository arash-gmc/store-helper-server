import crypto from 'crypto';

export function createHash(input: string, algorithm = 'md5', secret = '') {
	return crypto
		.createHash(algorithm)
		.update(input + secret)
		.digest('hex');
}
