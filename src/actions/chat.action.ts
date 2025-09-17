'use server';

import { cookies } from 'next/headers';
import { createServerApiCall } from '../lib/api-client';

const getTokenFromCookies = async (): Promise<string | null> => {
	const cookieStore = await cookies();
	const token = cookieStore.get('accessToken')?.value || null;
	return token;
};

const apiCall = createServerApiCall(getTokenFromCookies);

export interface MessageData {
	id: string;
	conversationId: string;
	senderId: string;
	receiverId: string;
	content: string;
	messageType: string;
	isRead: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ConversationData {
	id: string;
	participants: string[];
	lastMessage?: MessageData;
	unreadCount?: number;
	createdAt: string;
	updatedAt: string;
}

export interface SendMessageData {
	receiverId: string;
	content: string;
	messageType: string;
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

export async function sendMessage(messageData: SendMessageData): Promise<SendMessageResponse> {
	return await apiCall<SendMessageResponse>('/api/chat/messages', {
		method: 'POST',
		data: messageData,
	});
}

export async function getMessages(
	conversationId: string,
	params: GetMessagesParams = {},
): Promise<ListMessagesResponse> {
	const queryParams = new URLSearchParams();
	if (params.cursor) queryParams.set('cursor', params.cursor);
	if (params.limit) queryParams.set('limit', params.limit.toString());

	const url = `/api/chat/conversations/${conversationId}/messages${queryParams.toString() ? `?${queryParams}` : ''}`;

	return await apiCall<ListMessagesResponse>(url, {
		method: 'GET',
	});
}

export async function markAllMessagesAsRead(conversationId: string): Promise<void> {
	await apiCall<void>(`/api/chat/conversations/${conversationId}/read-all`, {
		method: 'POST',
	});
}

export async function getConversations(): Promise<ListConversationsResponse> {
	return await apiCall<ListConversationsResponse>('/api/chat/conversations', {
		method: 'GET',
	});
}

export async function getOrCreateConversation(participantId: string): Promise<ConversationData> {
	try {
		const conversations = await getConversations();

		// Find existing conversation with this participant
		const existingConversation = conversations.data.find((conv) =>
			conv.participants.includes(participantId),
		);

		if (existingConversation) {
			return existingConversation;
		}

		// If no existing conversation, send a message to create one
		// This is a common pattern where sending the first message creates the conversation
		const result = await sendMessage({
			receiverId: participantId,
			content: '',
			messageType: 'system',
		});

		// Get the conversation data from the message response
		const conversationId = result.data.conversationId;

		// Fetch the full conversation data
		const conversationsResponse = await getConversations();
		const newConversation = conversationsResponse.data.find((conv) => conv.id === conversationId);

		if (!newConversation) {
			throw new Error('Failed to create conversation');
		}

		return newConversation;
	} catch (error) {
		console.error('Get or create conversation error:', error);
		throw error;
	}
}
