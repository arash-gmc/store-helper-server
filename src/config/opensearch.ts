import { Client } from '@opensearch-project/opensearch';
import ENV from './env.config';
import { AppError } from '../utils/v1/errors';

if (!ENV.OPENSEARCH_URL)
	throw new AppError(`Missing [OPENSEARCH_URL] env var.`);
if (!ENV.OPENSEARCH_USER)
	throw new AppError(`Missing [OPENSEARCH_USER] env var.`);
if (!ENV.OPENSEARCH_PASS)
	throw new AppError(`Missing [OPENSEARCH_PASS] env var.`);

const opensearch = new Client({
	node: {
		url: new URL(ENV.OPENSEARCH_URL),
	},
	auth: {
		username: ENV.OPENSEARCH_USER,
		password: ENV.OPENSEARCH_PASS,
	},
	ssl: {
		rejectUnauthorized: false,
	},
});

export default opensearch;
