/**
 * Strips HTML tags from a string and returns plain text
 */
export function stripHtmlTags(html: string): string {
	return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Strips HTML tags and decodes HTML entities from a string
 */
export function stripHtmlTagsAndEntities(html: string): string {
	// First strip HTML tags
	let text = html.replace(/<[^>]*>/g, '');

	// Then decode common HTML entities
	const entities: Record<string, string> = {
		'&nbsp;': ' ',
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#39;': "'",
		'&apos;': "'",
		'&hellip;': '...',
		'&mdash;': '—',
		'&ndash;': '–',
		'&lsquo;': '\u2018',
		'&rsquo;': '\u2019',
		'&ldquo;': '"',
		'&rdquo;': '"',
	};

	// Replace HTML entities
	Object.entries(entities).forEach(([entity, replacement]) => {
		text = text.replace(new RegExp(entity, 'g'), replacement);
	});

	// Handle numeric entities like &#160;
	text = text.replace(/&#(\d+);/g, (_match, dec) => {
		return String.fromCharCode(dec);
	});

	// Handle hex entities like &#x20;
	text = text.replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => {
		return String.fromCharCode(parseInt(hex, 16));
	});

	// Clean up multiple spaces and trim
	return text.replace(/\s+/g, ' ').trim();
}

/**
 * Cleans description text from rich text editor by removing HTML tags and entities
 * This is the main function to use for processing description fields
 */
export function cleanDescriptionText(description: string, maxLength?: number): string {
	if (!description) return '';

	const cleaned = stripHtmlTagsAndEntities(description);

	if (maxLength) {
		return cleaned.substring(0, maxLength);
	}

	return cleaned;
}

/**
 * Limits text to a maximum number of characters, stripping HTML tags first
 */
export function limitTextLength(text: string, maxLength: number): string {
	const plainText = stripHtmlTags(text);
	return plainText.substring(0, maxLength);
}

/**
 * Limits text to a maximum number of characters, stripping HTML tags and entities first
 */
export function limitCleanTextLength(text: string, maxLength: number): string {
	const cleanText = stripHtmlTagsAndEntities(text);
	return cleanText.substring(0, maxLength);
}

/**
 * Gets the character count of plain text (stripped of HTML tags)
 */
export function getPlainTextLength(text: string): number {
	return stripHtmlTags(text).length;
}

/**
 * Gets the character count of clean text (stripped of HTML tags and entities)
 */
export function getCleanTextLength(text: string): number {
	return stripHtmlTagsAndEntities(text).length;
}

/**
 * Checks if text exceeds the maximum length after stripping HTML tags
 */
export function isTextOverLimit(text: string, maxLength: number): boolean {
	return getPlainTextLength(text) > maxLength;
}

/**
 * Checks if text exceeds the maximum length after stripping HTML tags and entities
 */
export function isCleanTextOverLimit(text: string, maxLength: number): boolean {
	return getCleanTextLength(text) > maxLength;
}
