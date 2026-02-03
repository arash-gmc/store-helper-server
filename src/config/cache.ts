import NodeCache from 'node-cache';

// Create an instance of NodeCache
const CacheClass = new NodeCache({ stdTTL: 300, checkperiod: 120 });

// Create a wrapper for the remember function
const remember = async (key: string, time: number, cb: () => Promise<any>) => {
	const keyExists = CacheClass.has(key);

	if (keyExists) {
		// If the key exists, return the cached value
		const cachedValue = CacheClass.get(key) as string | undefined;
		return cachedValue ? JSON.parse(cachedValue) : cachedValue;
	}
	// If the key does not exist, call the async callback, cache the result, and return it
	const value = await cb(); // Wait for the async callback to resolve
	CacheClass.set(key, JSON.stringify(value), time);
	return value;
};

// Create the Cache object that includes both CacheClass methods and the remember function
const Cache = {
	...CacheClass, // Spread the methods of CacheClass
	remember: remember,
} as NodeCache & {
	// eslint-disable-next-line no-unused-vars
	remember: (key: string, time: number, cb: Function) => unknown;
};

// Export the Cache object
export default Cache;
