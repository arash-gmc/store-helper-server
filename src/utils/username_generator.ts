// Sample lists of adjectives and nouns for book readers
const adjectives = [
	'bookish',
	'curious',
	'thoughtful',
	'imaginative',
	'whimsical',
	'insightful',
	'passionate',
	'adventurous',
	'literary',
	'dreamy',
];

const nouns = [
	'reader',
	'novelist',
	'bibliophile',
	'storyteller',
	'bookworm',
	'page-turner',
	'dreamer',
	'explorer',
	'scribe',
	'narrator',
];

function getRandomElement(arr: string[]): string {
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomNumber(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min; // Generates a random integer between min and max
}

export function generateUsername(): string {
	const adjective = getRandomElement(adjectives);
	const noun = getRandomElement(nouns);
	const randomNumber = generateRandomNumber(1000, 9999); // Generate a random number between 1000 and 9999
	return `${adjective}_${noun}_${randomNumber}`;
}
