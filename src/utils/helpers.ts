export function parseDate(dateString: string) {
	const parts = dateString.split('-'); // Split the string into an array
	const year = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10) - 1; // Months are zero-based
	const day = parseInt(parts[2], 10);

	const date = new Date(year, month, day);

	return date;
}

export function objectPartialSetter<T>(source: T, partialData: Partial<T>): T {
	return { ...source, ...partialData };
}

export function isDefined<T>(value: T | undefined | null): value is T {
	return value != null;
}

export function getDate(date: Date) {
	const year = String(date.getFullYear());
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
