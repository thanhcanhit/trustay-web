/**
 * Utility for encoding/decoding structured message data in chat messages
 * Since backend doesn't support metadata, we embed it in the message content
 */

export interface RoomMetadata {
	roomId: string;
	roomSlug?: string;
	roomName: string;
	roomImage?: string;
	roomPrice?: string;
	roomLocation?: string;
}

export interface RoomSeekingMetadata {
	roomSeekingPostId: string;
	roomSeekingTitle: string;
	roomSeekingBudget?: string;
	roomSeekingLocation?: string;
}

export interface RoommateSeekingMetadata {
	roommateSeekingPostId: string;
	roommateSeekingPostTitle: string;
	roommateSeekingPostBudget?: string;
	roommateSeekingPostLocation?: string;
}

export interface StructuredMessageData {
	type:
		| 'invitation'
		| 'request'
		| 'roommate_application'
		| 'roommate_application_approved'
		| 'roommate_application_rejected';
	room?: RoomMetadata;
	roomSeeking?: RoomSeekingMetadata;
	roommateSeeking?: RoommateSeekingMetadata;
	message: string; // User's actual message
}

const STRUCTURED_MESSAGE_PREFIX = '::STRUCTURED::';
const STRUCTURED_MESSAGE_SUFFIX = '::END::';

/**
 * Encode structured message data into a string
 */
export function encodeStructuredMessage(data: StructuredMessageData): string {
	const jsonData = JSON.stringify(data);
	return `${STRUCTURED_MESSAGE_PREFIX}${jsonData}${STRUCTURED_MESSAGE_SUFFIX}`;
}

/**
 * Decode structured message from string
 * Returns null if message is not structured
 */
export function decodeStructuredMessage(content: string): StructuredMessageData | null {
	if (!content.startsWith(STRUCTURED_MESSAGE_PREFIX)) {
		return null;
	}

	try {
		const start = STRUCTURED_MESSAGE_PREFIX.length;
		const end = content.indexOf(STRUCTURED_MESSAGE_SUFFIX);

		if (end === -1) {
			return null;
		}

		const jsonData = content.substring(start, end);
		return JSON.parse(jsonData) as StructuredMessageData;
	} catch (error) {
		console.error('Failed to decode structured message:', error);
		return null;
	}
}

/**
 * Check if message content is structured
 */
export function isStructuredMessage(content: string): boolean {
	return content.startsWith(STRUCTURED_MESSAGE_PREFIX);
}

/**
 * Get display text from message content
 * If structured, returns the embedded message
 * Otherwise returns the content as-is
 */
export function getDisplayText(content: string): string {
	const structured = decodeStructuredMessage(content);
	return structured ? structured.message : content;
}
