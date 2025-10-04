// Local storage for message metadata (room/room-seeking post info)
// Backend doesn't return metadata, so we need to store it client-side

const METADATA_STORAGE_KEY = 'trustay_message_metadata';
const METADATA_EXPIRY_DAYS = 30; // Keep metadata for 30 days

export interface MessageMetadata {
	messageId?: string; // Will be set after message is sent
	conversationId: string;
	timestamp: number;
	data: {
		roomId?: string;
		roomSlug?: string;
		roomName?: string;
		roomImage?: string;
		roomPrice?: string;
		roomLocation?: string;
		roomSeekingPostId?: string;
		roomSeekingTitle?: string;
		roomSeekingBudget?: string;
		roomSeekingLocation?: string;
		bookingRequestId?: string;
		roomInvitationId?: string;
	};
}

interface MetadataStore {
	[key: string]: MessageMetadata; // key: messageId or temporary key
}

// Clean up expired metadata
function cleanExpiredMetadata(store: MetadataStore): MetadataStore {
	const now = Date.now();
	const expiryTime = METADATA_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

	const cleaned: MetadataStore = {};
	Object.entries(store).forEach(([key, meta]) => {
		if (now - meta.timestamp < expiryTime) {
			cleaned[key] = meta;
		}
	});

	return cleaned;
}

// Get all metadata from storage
function getMetadataStore(): MetadataStore {
	if (typeof window === 'undefined') return {};

	try {
		const stored = localStorage.getItem(METADATA_STORAGE_KEY);
		if (!stored) return {};

		const store = JSON.parse(stored) as MetadataStore;
		return cleanExpiredMetadata(store);
	} catch (error) {
		console.error('Error loading metadata store:', error);
		return {};
	}
}

// Save metadata store
function saveMetadataStore(store: MetadataStore): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(store));
	} catch (error) {
		console.error('Error saving metadata store:', error);
	}
}

// Save metadata for a message (before sending)
export function saveMessageMetadata(
	conversationId: string,
	metadata: MessageMetadata['data'],
	tempKey?: string,
): string {
	const store = getMetadataStore();
	const key = tempKey || `temp_${Date.now()}_${Math.random()}`;

	store[key] = {
		conversationId,
		timestamp: Date.now(),
		data: metadata,
	};

	saveMetadataStore(store);
	return key;
}

// Update metadata with actual message ID after sending
export function updateMessageMetadataId(tempKey: string, messageId: string): void {
	const store = getMetadataStore();
	const meta = store[tempKey];

	if (meta) {
		delete store[tempKey];
		store[messageId] = { ...meta, messageId };
		saveMetadataStore(store);
	}
}

// Get metadata for a specific message
export function getMessageMetadata(messageId: string): MessageMetadata['data'] | null {
	const store = getMetadataStore();
	return store[messageId]?.data || null;
}

// Get metadata for all messages in a conversation
export function getConversationMetadata(
	conversationId: string,
): Record<string, MessageMetadata['data']> {
	const store = getMetadataStore();
	const result: Record<string, MessageMetadata['data']> = {};

	Object.entries(store).forEach(([messageId, meta]) => {
		if (meta.conversationId === conversationId && meta.messageId) {
			result[messageId] = meta.data;
		}
	});

	return result;
}

// Clear all metadata (for debugging/maintenance)
export function clearAllMetadata(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(METADATA_STORAGE_KEY);
}
