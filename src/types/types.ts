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
	systemAmenityId: string;
	customValue?: string;
	notes?: string;
}

export interface RoomCost {
	systemCostTypeId: string;
	value: number;
	costType: 'fixed' | 'per_unit' | 'percentage' | 'metered' | 'tiered';
	unit?: string;
	billingCycle: 'monthly' | 'quarterly' | 'yearly';
	includedInRent: boolean;
	isOptional: boolean;
	notes?: string;
}

export interface RoomRule {
	systemRuleId: string;
	customValue?: string;
	isEnforced: boolean;
	notes?: string;
}

export interface RoomPricing {
	basePriceMonthly: number;
	depositAmount: number;
	depositMonths: number;
	utilityIncluded: boolean;
	utilityCostMonthly?: number;
	cleaningFee?: number;
	serviceFeePercentage?: number;
	minimumStayMonths: number;
	maximumStayMonths?: number;
	priceNegotiable: boolean;
}

export interface RoomInstance {
	id: string;
	roomNumber: string;
	status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
	floorNumber: number;
	statusReason?: string;
	lastStatusChange?: string;
}

export interface Room {
	id: string;
	name: string;
	description?: string;
	roomType: 'boarding_house' | 'dormitory' | 'sleepbox' | 'apartment' | 'whole_house';
	areaSqm: string | number;
	maxOccupancy: number;
	totalRooms: number;
	floorNumber: number;
	roomNumberPrefix?: string;
	roomNumberStart?: number;
	isActive: boolean;
	isVerified?: boolean;
	slug?: string;
	buildingId: string;
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
