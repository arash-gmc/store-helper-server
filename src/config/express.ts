import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
const { xss } = require('express-xss-sanitizer');
import hpp from 'hpp';

import log from 'mb_logger';
import envConfig from './env.config';

const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 30 + (envConfig.VERSION?.endsWith('alfa') ? 50 : 0),
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	keyGenerator: (req) =>
		JSON.stringify(
			req.headers['user-ip'] ??
				req.headers['x-forwarded-for'] ??
				req.headers['x-real-ip'] ??
				req.ip
		) +
		req.url +
		req.headers.authorization?.split('.').pop(),
});

app.set('trust proxy', 1);
app.use(bodyParser.json({ limit: 10 * 1024 * 1024 }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	helmet({
		strictTransportSecurity: {
			// hsts
			maxAge: 31536000,
			includeSubDomains: false,
		},
	})
);
app.use(cookieParser());
app.disable('x-powered-by');
app.use(limiter);
app.use(
	cors({
		origin: [
			envConfig.HOST,
			envConfig.FRONT_URL,
			...(envConfig.CORS_URLS?.split(',').filter((str) => str?.length) ?? []),
		].filter((str) => str) as string[],
		credentials: true,
	})
);
app.use(xss());
app.use(
	hpp({
		whitelist: ['searchTextFields', 'searchFields', 'searchRanges'],
	})
);
app.set('json spaces', 2);
app.use((req: Request, res: Response, next: NextFunction) => {
	log.http(
		`[${req.method}] ${req.url}${
			req.headers['content-length']
				? ' (cl: ' + req.headers['content-length'] + ')'
				: ''
		}`
	);
	if (!req.accepts('application/json')) {
		return res.status(415).json({ message: 'Unsupported Media Type' });
	}
	next();
});

export default app;
