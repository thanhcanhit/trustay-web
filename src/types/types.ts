// API Types for Trustay backend integration

// Authentication Types
export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone: string;
	gender: 'male' | 'female' | 'other';
	role: 'tenant' | 'landlord';
}

export type RegisterDirectRequest = RegisterRequest & {
	// Direct registration without email verification
	skipVerification?: boolean;
};

export interface VerificationRequest {
	type: 'email' | 'phone';
	email?: string;
	phone?: string;
	code?: string;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

export interface CheckPassword {
	isValid: boolean;
	errors: Array<string>;
	score: number;
	level: string;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

// Authentication Responses
export interface AuthResponse {
	access_token: string;
	refresh_token: string;
	user: UserProfile;
}

export interface VerificationResponse {
	verificationId?: string;
	verificationToken?: string;
	message: string;
}

export interface PasswordStrengthResponse {
	score: number;
	feedback: string[];
	isStrong: boolean;
}

export interface GeneratePasswordResponse {
	password: string;
	strength: number;
}

// User Types
export interface UserProfile {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	gender: 'male' | 'female' | 'other';
	role: 'tenant' | 'landlord';
	bio?: string;
	dateOfBirth?: string;
	avatarUrl?: string; // Fix: API returns avatarUrl, not avatar
	idCardNumber?: string;
	bankAccount?: string;
	bankName?: string;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateProfileRequest {
	firstName?: string;
	lastName?: string;
	phone?: string;
	gender?: 'male' | 'female' | 'other';
	role?: 'tenant' | 'landlord';
	bio?: string;
	dateOfBirth?: string;
	avatarUrl?: string;
	idCardNumber?: string;
	bankAccount?: string;
	bankName?: string;
}

// Location Types
export interface Province {
	id: number;
	name: string;
	nameEn: string | null;
	code: string;
}

export interface District {
	id: number;
	name: string;
	nameEn: string | null;
	code: string;
	provinceId: number;
}

export interface Ward {
	id: number;
	name: string;
	nameEn: string | null;
	code: string;
	level: string;
	districtId: number;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

// Error types
export interface ApiErrorResponse {
	message: string;
	code?: string;
	details?: Record<string, unknown>;
}

// Building Management Types
export interface Building {
	id: string;
	name: string;
	description?: string;
	addressLine1: string;
	addressLine2?: string;
	wardId: number;
	districtId: number;
	provinceId: number;
	country: string;
	latitude?: number;
	longitude?: number;
	isActive: boolean;
	isVerified: boolean;
	slug?: string;
	createdAt: string;
	updatedAt: string;
	ownerId: string;
	roomCount?: number;
	// Related data
	ward?: { name: string };
	district?: { name: string };
	province?: { name: string };
	owner?: {
		id: string;
		firstName: string;
		lastName: string;
		avatarUrl?: string;
		isVerifiedIdentity: boolean;
	};
	location?: {
		wardName: string;
		districtName: string;
		provinceName: string;
	};
	totalRooms?: number;
	occupiedRooms?: number;
	availableRooms?: number;
	monthlyRevenue?: number;
}

export interface CreateBuildingRequest {
	name: string;
	description?: string;
	addressLine1: string;
	addressLine2?: string;
	wardId: number;
	districtId: number;
	provinceId: number;
	country: string;
	latitude?: number;
	longitude?: number;
	isActive: boolean;
}

export type UpdateBuildingRequest = Partial<CreateBuildingRequest>;

export interface BuildingsListResponse {
	buildings: Building[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// Room Management Types
export interface RoomAmenity {
	id: string;
	roomId: string;
	systemAmenityId: string;
	customValue?: string;
	notes?: string;
	createdAt: string;
	systemAmenity: {
		name: string;
		nameEn: string;
		category: string;
	};
}

export interface RoomCost {
	id: string;
	roomId: string;
	systemCostTypeId: string;
	costType: 'fixed' | 'per_unit' | 'percentage' | 'metered' | 'tiered';
	baseRate?: number | null;
	unitPrice?: number | null;
	fixedAmount?: string;
	value?: number; // For form handling
	currency: string;
	unit: string;
	minimumCharge?: number | null;
	maximumCharge?: number | null;
	isMetered: boolean;
	meterReading?: number | null;
	lastMeterReading?: number | null;
	billingCycle: 'monthly' | 'quarterly' | 'yearly';
	includedInRent: boolean;
	isOptional: boolean;
	notes?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	systemCostType: {
		name: string;
		nameEn: string;
		category: string;
	};
}

export interface RoomRule {
	id: string;
	roomId: string;
	systemRuleId: string;
	customValue?: string;
	isEnforced: boolean;
	notes?: string;
	createdAt: string;
	systemRule: {
		name: string;
		nameEn: string;
		category: string;
		ruleType: string;
	};
}

export interface RoomPricing {
	id: string;
	roomId: string;
	basePriceMonthly: string;
	currency: string;
	depositAmount: string;
	depositMonths: number;
	utilityIncluded: boolean;
	utilityCostMonthly: string;
	cleaningFee: string;
	serviceFeePercentage: string;
	minimumStayMonths: number;
	maximumStayMonths: number;
	priceNegotiable: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface RoomInstance {
	id: string;
	roomId: string;
	roomNumber: string;
	status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
	statusReason?: string;
	floorNumber?: number;
	lastStatusChange?: string;
	isActive: boolean;
	notes?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Room {
	id: string;
	slug: string;
	buildingId: string;
	floorNumber: number;
	name: string;
	description?: string;
	roomType: 'boarding_house' | 'dormitory' | 'sleepbox' | 'apartment' | 'whole_house';
	areaSqm: string;
	maxOccupancy: number;
	totalRooms: number;
	roomNumberPrefix?: string;
	roomNumberStart?: number;
	viewCount: number;
	isActive: boolean;
	isVerified: boolean;
	createdAt: string;
	updatedAt: string;
	// Related data
	building?: {
		id: string;
		name: string;
		addressLine1?: string;
	};
	pricing?: RoomPricing;
	amenities?: RoomAmenity[];
	costs?: RoomCost[];
	rules?: RoomRule[];
	roomInstances?: RoomInstance[];
	availableInstancesCount?: number;
	occupiedInstancesCount?: number;
	statusCounts?: {
		available: number;
		occupied: number;
		maintenance: number;
		reserved: number;
		unavailable: number;
	};
}

export interface CreateRoomRequest {
	name: string;
	description?: string;
	roomType: 'boarding_house' | 'dormitory' | 'sleepbox' | 'apartment' | 'whole_house';
	areaSqm: number;
	maxOccupancy: number;
	totalRooms: number;
	floorNumber: number;
	roomNumberPrefix: string;
	roomNumberStart: number;
	pricing: RoomPricing;
	amenities: RoomAmenity[];
	costs: RoomCost[];
	rules: RoomRule[];
	isActive: boolean;
}

// Update room request with only allowed fields
export interface UpdateRoomRequest {
	name?: string;
	description?: string;
	roomType?: RoomType;
	areaSqm?: number;
	totalRooms?: number;
	pricing?: {
		basePriceMonthly?: number;
		depositAmount?: number;
		isNegotiable?: boolean;
	};
	amenities?: Array<{
		systemAmenityId: string;
		customValue?: string;
		notes?: string;
	}>;
	costs?: Array<{
		systemCostTypeId: string;
		value: number;
		costType: 'fixed' | 'per_unit' | 'percentage' | 'metered' | 'tiered';
		unit?: string;
		isMandatory?: boolean;
		isIncludedInRent?: boolean;
		notes?: string;
	}>;
	rules?: Array<{
		systemRuleId: string;
		customValue?: string;
		notes?: string;
	}>;
	isActive?: boolean;
}

export interface RoomsListResponse {
	rooms: Room[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface RoomInstancesResponse {
	data: {
		instances: RoomInstance[];
		statusCounts: {
			available: number;
			occupied: number;
			maintenance: number;
			reserved: number;
			unavailable: number;
		};
	};
}

export interface UpdateRoomInstanceStatusRequest {
	status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
	reason?: string;
}

export interface BulkUpdateRoomInstancesRequest {
	roomInstanceIds: string[];
	status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
	reason?: string;
}

// Utility types
export type UserRole = 'tenant' | 'landlord';
export type Gender = 'male' | 'female' | 'other';
export type VerificationType = 'email' | 'phone';
export type RoomType = 'boarding_house' | 'dormitory' | 'sleepbox' | 'apartment' | 'whole_house';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
export type CostType = 'fixed' | 'per_unit' | 'percentage' | 'metered' | 'tiered';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

// Listings (public rooms) types
export interface RoomListing {
	id: string;
	slug: string;
	name: string;
	roomType: string;
	maxOccupancy: number;
	isVerified: boolean;
	buildingName: string;
	buildingVerified: boolean;
	address: string;
	owner: {
		name: string;
		avatarUrl: string | null;
		gender: string;
		verifiedPhone: boolean;
		verifiedEmail: boolean;
		verifiedIdentity: boolean;
	};
	location: {
		provinceId: number;
		provinceName: string;
		districtId: number;
		districtName: string;
		wardId: number;
		wardName: string;
	};
	images: Array<{
		url: string;
		alt: string;
		isPrimary: boolean;
		sortOrder: number;
	}>;
	amenities: Array<{
		id: string;
		name: string;
		category: string;
	}>;
	costs: Array<{
		id: string;
		name: string;
		value: string;
	}>;
	pricing: {
		basePriceMonthly: string;
		depositAmount: string;
		utilityIncluded: boolean;
	};
	rules: Array<{
		id: string;
		name: string;
		type: string;
	}>;
}

export interface RoomListingsResponse {
	data: RoomListing[];
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

export interface RoomDetail {
	id: string;
	slug: string;
	name: string;
	description: string;
	roomType: string;
	areaSqm: string;
	maxOccupancy: number;
	isVerified: boolean;
	isActive: boolean;
	floorNumber: number;
	buildingName: string;
	buildingDescription: string;
	address: string;
	addressLine2: string | null;
	location: {
		provinceId: number;
		provinceName: string;
		districtId: number;
		districtName: string;
		wardId: number;
		wardName: string;
	};
	owner: {
		id: string;
		firstName: string;
		lastName: string;
		phone: string;
		avatarUrl: string | null;
		isVerifiedPhone: boolean;
		isVerifiedEmail: boolean;
		isVerifiedIdentity: boolean;
	};
	images: Array<{
		url: string;
		alt: string;
		isPrimary: boolean;
		sortOrder: number;
	}>;
	amenities: Array<{
		id: string;
		name: string;
		category: string;
		customValue: string | null;
		notes: string | null;
	}>;
	costs: Array<{
		id: string;
		name: string;
		value: string;
		category: string;
		notes: string | null;
	}>;
	pricing: {
		basePriceMonthly: string;
		depositAmount: string;
		depositMonths: number;
		utilityIncluded: boolean;
		minimumStayMonths: number;
		maximumStayMonths: number | null;
		priceNegotiable: boolean;
	};
	rules: Array<{
		id: string;
		name: string;
		type: string;
		customValue: string | null;
		notes: string | null;
		isEnforced: boolean;
	}>;
	lastUpdated: string;
}

export interface RoomSearchParams {
	search: string; // required by API, use '.' for match-all
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	roomType?: string;
	minPrice?: number;
	maxPrice?: number;
	minArea?: number;
	maxArea?: number;
	amenities?: string; // comma-separated amenity IDs
	maxOccupancy?: number;
	isVerified?: boolean;
	latitude?: number;
	longitude?: number;
	sortBy?: 'price' | 'area' | 'createdAt';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

export interface RoomSeekingPublicSearchParams {
	page?: number;
	limit?: number;
	search?: string;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	minBudget?: number;
	maxBudget?: number;
	roomType?: string;
	occupancy?: number;
	status?: 'active' | 'paused' | 'closed' | 'expired';
	isPublic?: boolean;
	sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'maxBudget' | 'viewCount' | 'contactCount';
	sortOrder?: 'asc' | 'desc';
}
