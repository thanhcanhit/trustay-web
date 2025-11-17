// Room Seeking Post Types

export interface Decimal {
	s: number;
	e: number;
	d: number[];
}

export interface Amenity {
	id: string;
	name: string;
	nameEn: string;
	category: string;
	description?: string;
}

export interface RoomSeekingPost {
	id: string;
	title: string;
	description: string;
	slug: string;
	requesterId: string;
	preferredDistrictId: number;
	preferredWardId: number;
	preferredProvinceId: number;
	minBudget: number | Decimal;
	maxBudget: number | Decimal;
	currency: 'VND' | 'USD';
	preferredRoomType: 'boarding_house' | 'apartment' | 'house' | 'studio';
	occupancy: number;
	moveInDate: string;
	isPublic: boolean;
	expiresAt: string;
	amenityIds?: string[];
	contactCount: number;
	viewCount?: number;
	status: 'active' | 'paused' | 'closed' | 'expired';
	createdAt: string;
	updatedAt: string;
	userId?: string; // Legacy field for backwards compatibility
	// Location name fields from API response
	preferredProvince?: { id: number; name: string; nameEn?: string | null };
	preferredDistrict?: { id: number; name: string; nameEn?: string | null };
	preferredWard?: { id: number; name: string; nameEn?: string | null };
	// Amenities array
	amenities?: Amenity[];
	// Requester info (the person looking for a room)
	requester?: {
		id: string;
		name?: string;
		firstName?: string;
		lastName?: string;
		email?: string;
		phone?: string;
		avatarUrl?: string | null;
		isVerifiedPhone?: boolean;
		isVerifiedEmail?: boolean;
		isVerifiedIdentity?: boolean;
		isOnline?: boolean;
		lastActiveAt?: string;
	};
	// SEO metadata
	seo?: {
		title: string;
		description: string;
		keywords: string;
	};
	// Breadcrumb data
	breadcrumb?: {
		items: Array<{
			title: string;
			path: string;
		}>;
	};
}

export interface CreateRoomSeekingPostRequest {
	title: string;
	description: string;
	preferredDistrictId: number;
	preferredWardId: number;
	preferredProvinceId: number;
	minBudget: number;
	maxBudget: number;
	currency: 'VND' | 'USD';
	preferredRoomType: 'boarding_house' | 'apartment' | 'whole_house' | 'dormitory' | 'sleepbox';
	occupancy: number;
	moveInDate: string;
	isPublic: boolean;
	expiresAt: string;
	amenityIds: string[];
}

export interface UpdateRoomSeekingPostRequest {
	title?: string;
	description?: string;
	preferredDistrictId?: number;
	preferredWardId?: number;
	preferredProvinceId?: number;
	minBudget?: number;
	maxBudget?: number;
	currency?: 'VND' | 'USD';
	preferredRoomType?: 'boarding_house' | 'apartment' | 'whole_house' | 'dormitory' | 'sleepbox';
	occupancy?: number;
	moveInDate?: string;
	isPublic?: boolean;
	expiresAt?: string;
	amenityIds?: string[];
}

export interface RoomSeekingPostListResponse {
	data: RoomSeekingPost[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	};
}

// Search and filter types
export interface RoomSeekingSearchParams {
	page?: number;
	limit?: number;
	status?: string;
	userId?: string;
	search?: string;
	sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'maxBudget' | 'viewCount' | 'contactCount';
	sortOrder?: 'asc' | 'desc';
	preferredProvinceId?: number;
	preferredDistrictId?: number;
	preferredWardId?: number;
	minBudget?: number;
	maxBudget?: number;
	preferredRoomType?: string;
	occupancy?: number;
}

// Form validation types
export interface RoomSeekingFormData {
	title: string;
	description: string;
	preferredDistrictId: number | null;
	preferredWardId: number | null;
	preferredProvinceId: number | null;
	minBudget: number;
	maxBudget: number;
	currency: 'VND' | 'USD';
	preferredRoomType: 'boarding_house' | 'apartment' | 'house' | 'studio';
	occupancy: number;
	moveInDate: string;
	isPublic: boolean;
	expiresAt: string;
	amenityIds: string[];
}

// Constants
export const ROOM_TYPES = {
	BOARDING_HOUSE: 'boarding_house',
	DORMITORY: 'dormitory',
	SLEEPBOX: 'sleepbox',
	APARTMENT: 'apartment',
	WHOLE_HOUSE: 'whole_house',
} as const;

export const CURRENCIES = {
	VND: 'VND',
	USD: 'USD',
} as const;

export const POST_STATUSES = {
	ACTIVE: 'active',
	PAUSED: 'paused',
	CLOSED: 'closed',
	EXPIRED: 'expired',
} as const;

// Room type labels for display
export const ROOM_TYPE_LABELS = {
	[ROOM_TYPES.BOARDING_HOUSE]: 'Nhà trọ',
	[ROOM_TYPES.DORMITORY]: 'Ký túc xá',
	[ROOM_TYPES.SLEEPBOX]: 'Sleepbox',
	[ROOM_TYPES.APARTMENT]: 'Căn hộ',
	[ROOM_TYPES.WHOLE_HOUSE]: 'Nhà nguyên căn',
} as const;

// Currency labels for display
export const CURRENCY_LABELS = {
	[CURRENCIES.VND]: 'VNĐ',
	[CURRENCIES.USD]: 'USD',
} as const;

// Status labels for display
export const STATUS_LABELS = {
	[POST_STATUSES.ACTIVE]: 'Đang hoạt động',
	[POST_STATUSES.PAUSED]: 'Tạm dừng',
	[POST_STATUSES.CLOSED]: 'Đã đóng',
	[POST_STATUSES.EXPIRED]: 'Hết hạn',
} as const;
