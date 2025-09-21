export const MESSAGE_TYPES = {
	TEXT: 'text',
	INVITATION: 'invitation',
	REQUEST: 'request',
	REQUEST_ACCEPTED: 'request_accepted',
	REQUEST_REJECTED: 'request_rejected',
	REQUEST_CANCELLED: 'request_cancelled',
	INVITATION_ACCEPTED: 'invitation_accepted',
	INVITATION_REJECTED: 'invitation_rejected',
	INVITATION_CANCELLED: 'invitation_cancelled',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export const SYSTEM_MESSAGE_TYPES = [
	MESSAGE_TYPES.INVITATION,
	MESSAGE_TYPES.REQUEST,
	MESSAGE_TYPES.REQUEST_ACCEPTED,
	MESSAGE_TYPES.REQUEST_REJECTED,
	MESSAGE_TYPES.REQUEST_CANCELLED,
	MESSAGE_TYPES.INVITATION_ACCEPTED,
	MESSAGE_TYPES.INVITATION_REJECTED,
	MESSAGE_TYPES.INVITATION_CANCELLED,
] as const;

export type SystemMessageType = (typeof SYSTEM_MESSAGE_TYPES)[number];

export const MESSAGE_CONTENT_MAP = {
	[MESSAGE_TYPES.INVITATION]: 'Chủ trọ đã gửi lời mời thuê trọ đến cho bạn',
	[MESSAGE_TYPES.REQUEST]: 'Người thuê gửi yêu cầu thuê trọ đến cho bạn',
	[MESSAGE_TYPES.REQUEST_ACCEPTED]: 'Chủ trọ đã đồng ý yêu cầu thuê',
	[MESSAGE_TYPES.REQUEST_REJECTED]: 'Chủ trọ đã từ chối yêu cầu thuê',
	[MESSAGE_TYPES.REQUEST_CANCELLED]: 'Người thuê đã huỷ yêu cầu thuê',
	[MESSAGE_TYPES.INVITATION_ACCEPTED]: 'Người thuê đã đồng ý lời mời thuê trọ',
	[MESSAGE_TYPES.INVITATION_REJECTED]: 'Người thuê đã từ chối lời mời thuê trọ',
	[MESSAGE_TYPES.INVITATION_CANCELLED]: 'Chủ trọ đã huỷ lời mời thuê trọ',
} as const;
