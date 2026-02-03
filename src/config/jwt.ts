import jwt from 'jsonwebtoken';
import Env from './env.config';
import { ForbiddenError } from '../utils/v1/errors';

export async function signToken(user_id: number, is_refresh = false) {
	const Secret = is_refresh ? Env.JWT_REFRESH_SECRET : Env.JWT_SECRET;
	const expireTimeInSeconds = is_refresh
		? 60 * 60 * 24 * 30 * 2
		: 60 * 60 * 24 * 30;
	const token = jwt.sign(
		{
			uid: user_id,
		},
		Secret ?? '',
		{
			expiresIn: expireTimeInSeconds,
		}
	);

	return token;
}

export async function verifyToken(
	token: string,
	is_refresh = false
): Promise<JwtPayload> {
	const Secret = is_refresh
		? process.env.JWT_REFRESH_SECRET
		: process.env.JWT_SECRET;

	return new Promise((resolve, reject) => {
		jwt.verify(token, Secret ?? '', (err, decoded) => {
			if (err) {
				const error = new ForbiddenError(
					'Forbidden: Token is invalid or expired!!!',
					{
						resource: 'AuthMiddleware@authenticateJWT',
					}
				);
				return reject(error);
			}
			resolve(decoded as JwtPayload); // Cast to JwtPayload
		});
	});
}

interface JwtPayload {
	uid: number;
}
