import crypto from 'crypto';

export default function (length = 6) {
	return crypto.randomBytes(length).toString('hex');
}
