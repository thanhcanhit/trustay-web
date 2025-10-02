'use server';

import { MESSAGE_TYPES } from '../constants/chat.constants';
import { createServerApiCall } from '../lib/api-client';

const apiCall = createServerApiCall();

export interface MessageData {
	id: string;
	conversationId: string;
	senderId: string;
	content: string;
	type: string;
	attachments: Array<{ id: string; url: string; type: string; name?: string }>;
	isEdited: boolean;
	sentAt: string;
	readAt: string | null;
}

export interface ConversationData {
	conversationId: string;
	counterpart: {
		id: string;
		firstName: string;
		lastName: string;
		avatarUrl: string | null;
	};
	lastMessage?: {
		id: string;
		content: string;
		type: string;
		sentAt: string;
	};
	unreadCount?: number;
}

export interface SendMessageData {
	recipientId?: string;
	conversationId?: string;
	content: string;
	type: string;
	attachmentUrls?: string[];
}

export interface SendMessageResponse {
	data: MessageData;
}

export interface ListMessagesResponse {
	data: MessageData[];
	nextCursor?: string;
}

export interface ListConversationsResponse {
	data: ConversationData[];
}

export interface GetMessagesParams {
	cursor?: string;
	limit?: number;
}

export async function sendMessage(
	messageData: SendMessageData,
	token?: string,
): Promise<SendMessageResponse> {
	return await apiCall<SendMessageResponse>(
		'/api/chat/messages',
		{
			method: 'POST',
			data: messageData,
		},
		token,
	);
}

export async function getMessages(
	conversationId: string,
	params: GetMessagesParams = {},
	token?: string,
): Promise<MessageData[]> {
	const queryParams = new URLSearchParams();
	if (params.cursor) queryParams.set('cursor', params.cursor);
	if (params.limit) queryParams.set('limit', params.limit.toString());

	const url = `/api/chat/conversations/${conversationId}/messages${queryParams.toString() ? `?${queryParams}` : ''}`;

	return await apiCall<MessageData[]>(
		url,
		{
			method: 'GET',
		},
		token,
	);
}

export async function markAllMessagesAsRead(conversationId: string, token?: string): Promise<void> {
	await apiCall<void>(
		`/api/chat/conversations/${conversationId}/read-all`,
		{
			method: 'POST',
		},
		token,
	);
}

export async function getConversations(token?: string): Promise<ConversationData[]> {
	const response = await apiCall<ConversationData[]>(
		'/api/chat/conversations',
		{
			method: 'GET',
		},
		token,
	);
	return response;
}

export async function getOrCreateConversation(
	participantId: string,
	token?: string,
): Promise<ConversationData> {
	try {
		const conversations = await getConversations(token);

		// Find existing conversation with this participant
		const existingConversation = conversations.find(
			(conv) => conv.counterpart.id === participantId,
		);

		if (existingConversation) {
			return existingConversation;
		}

		// If no existing conversation, send a message to create one
		// This is a common pattern where sending the first message creates the conversation
		const result = await sendMessage(
			{
				recipientId: participantId,
				content: '',
				type: MESSAGE_TYPES.TEXT,
			},
			token,
		);

		// Get the conversation data from the message response
		const conversationId = result.data.conversationId;

		// Fetch the full conversation data
		const conversationsResponse = await getConversations(token);
		const newConversation = conversationsResponse.find(
			(conv) => conv.conversationId === conversationId,
		);

		if (!newConversation) {
			throw new Error('Failed to create conversation');
		}

		return newConversation;
	} catch (error) {
		console.error('Get or create conversation error:', error);
		throw error;
	}
}
