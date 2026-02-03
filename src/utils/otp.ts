export function otpGenerator(): { code: number; expiresAt: number } {
	return {
		code: Math.floor(100000 + Math.random() * 900000),
		expiresAt: new Date().getTime() + 2 * 60 * 1000, // Add 2 minutes (2 * 60 * 1000 milliseconds)
	};
}
