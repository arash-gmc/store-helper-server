const BASE36_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

const NORMALIZER = 1000000;

export function fromBase36(base36: string) {
	let num = 0;
	for (const char of base36) {
		const value = BASE36_CHARS.indexOf(char);
		if (value === -1) {
			throw new Error(`Invalid Base36 character: ${char}`);
		}
		num = num * 36 + value;
	}
	return num - NORMALIZER;
}

export function toBase36(param: number) {
	let num = param + NORMALIZER;
	let result = '';
	while (num > 0) {
		const remainder = num % 36;
		result = BASE36_CHARS[remainder] + result;
		num = Math.floor(num / 36);
	}
	return result || '0'; // Return '0' if the number is 0
}
