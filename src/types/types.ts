// API Types for Trustay backend integration

import type { Contract } from './contract.types';
// Import and re-export types from separate files to avoid duplication
import type { Rental } from './rental.types';

export type { Rental, Contract };

// Authentication Types
export interface LoginRequest {
	identifier: string; // Email hoặc số điện thoại
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

export interface RequestChangeEmailRequest {
	newEmail: string;
	password: string;
}

export interface ConfirmChangeEmailRequest {
	newEmail: string;
	verificationCode: string;
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
	fullName?: string; // Computed field: firstName + lastName
	phone: string;
	gender: 'male' | 'female' | 'other';
	role: 'tenant' | 'landlord';
	bio?: string;
	dateOfBirth?: string;
	avatarUrl?: string; // Fix: API returns avatarUrl, not avatar
	idCardNumber?: string;
	bankAccount?: string;
	bankName?: string;
	totalBuildings?: number;
	totalRoomInstances?: number;
	isVerifiedPhone?: boolean;
	isVerifiedEmail?: boolean;
	isVerifiedIdentity?: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface RatingStats {
	totalRatings: number;
	averageRating: number;
	distribution: {
		1: number;
		2: number;
		3: number;
		4: number;
		5: number;
	};
}

export interface UserRating {
	id: string;
	rating: number;
	comment: string | null;
	createdAt: string;
	raterName: string;
	raterAvatarUrl: string | null;
}

export interface PublicUserProfile {
	id: string;
	name: string;
	email: string;
	phone?: string | null;
	avatarUrl: string | null;
	gender: 'male' | 'female' | 'other';
	role: 'tenant' | 'landlord';
	bio: string | null;
	isVerifiedPhone: boolean;
	isVerifiedEmail: boolean;
	isVerifiedIdentity: boolean;
	isVerifiedBank: boolean;
	overallRating: number;
	totalRatings: number;
	createdAt: string;
	updatedAt: string;
	ratingStats?: RatingStats;
	recentRatings?: UserRating[];
	recentGivenRatings?: UserRating[];
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
	costType: 'fixed' | 'per_person' | 'metered';
	// baseRate?: number | null;
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

// Minimal DTOs used when creating a room (backend rejects server-only fields)
export interface RoomPricingCreate {
	basePriceMonthly: number;
	depositAmount: number;
	depositMonths?: number;
	utilityIncluded?: boolean;
	utilityCostMonthly?: number;
	cleaningFee?: number;
	serviceFeePercentage?: number;
	minimumStayMonths?: number;
	maximumStayMonths?: number;
	priceNegotiable?: boolean;
}

export interface RoomAmenityCreate {
	systemAmenityId: string;
	customValue?: string;
	notes?: string;
}

export interface RoomCostCreate {
	systemCostTypeId: string;
	value: number;
	costType: 'fixed' | 'per_person' | 'metered';
	unit?: string;
	billingCycle?: 'monthly' | 'quarterly' | 'yearly';
	includedInRent?: boolean;
	isOptional?: boolean;
	notes?: string;
}

export interface RoomRuleCreate {
	systemRuleId: string;
	customValue?: string;
	isEnforced?: boolean;
	notes?: string;
}

export interface RoomImageCreate {
	path: string;
	alt?: string;
	isPrimary?: boolean;
	sortOrder?: number;
}

export interface RoomImagesCreate {
	images: RoomImageCreate[];
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
	// Optional fields from API responses
	name?: string;
	roomName?: string;
	buildingName?: string;
	areaSqm?: string;
	roomType?: string;
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
	lastUpdated: string;
	createdAt: string;
	updatedAt: string;
	// Related data
	buildingName: string;
	buildingVerified: boolean;
	address?: string;
	availableRooms?: number;

	buildingAddressLine1?: string;
	pricing?: RoomPricing;
	amenities?: RoomAmenity[];
	costs?: RoomCost[];
	rules?: RoomRule[];
	images?: RoomImageCreate[];
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
	location?: {
		wardId: number;
		wardName: string;
		districtId: number;
		districtName: string;
		provinceId: number;
		provinceName: string;
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
	pricing: RoomPricingCreate;
	amenities: RoomAmenityCreate[];
	costs: RoomCostCreate[];
	rules: RoomRuleCreate[];
	images?: RoomImagesCreate;
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
		costType: 'fixed' | 'per_person' | 'metered';
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
	images?: {
		images: RoomImageCreate[];
	};
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
export type RoomType =
	| 'boarding_house'
	| 'dormitory'
	| 'sleepbox'
	| 'apartment'
	| 'whole_house'
	| 'mini_apartment'
	| 'dorm'
	| 'shared_house';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
export type CostType = 'fixed' | 'per_unit' | 'percentage' | 'metered' | 'tiered';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

// Rental Status từ API guide
export type RentalStatus = 'active' | 'pending' | 'expired' | 'terminated';

// Contract Status và Type từ API guide
export type ContractStatus =
	| 'draft'
	| 'pending_signature'
	| 'partially_signed'
	| 'fully_signed'
	| 'active'
	| 'expired'
	| 'terminated'
	| 'signed'
	| 'cancelled';
export type ContractType =
	| 'monthly_rental'
	| 'yearly_rental'
	| 'short_term_rental'
	| 'fixed_term_rental';

// Bill Status từ API guide
export type BillStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

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

// Room Invitation Types
export interface RoomInvitation {
	id: string;
	roomId: string;
	senderId: string;
	recipientId: string;
	recipientEmail: string;
	roomSeekingPostId?: string | null;
	monthlyRent?: string | null;
	depositAmount?: string | null;
	moveInDate?: string | null;
	rentalMonths?: number | null;
	tenantId: string;
	status: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired';
	message?: string | null;
	availableFrom?: string | null;
	availableUntil?: string | null;
	invitationMessage?: string | null;
	proposedRent?: string | null;
	expiresAt?: string | null;
	isConfirmedBySender?: boolean;
	confirmedAt?: string | null;
	respondedAt?: string | null;
	createdAt: string;
	updatedAt: string;
	// Related
	roomInstance?: RoomInstance;
	tenant?: UserProfile;
	owner?: UserProfile;
	recipient?: UserProfile;
	sender: UserProfile;
	room?: {
		id: string;
		name: string;
		slug: string;
		buildingId: string;
		floorNumber: number;
		description?: string;
		roomType: string;
		areaSqm: string;
		maxOccupancy: number;
		totalRooms: number;
		viewCount: number;
		isActive: boolean;
		isVerified: boolean;
		createdAt: string;
		updatedAt: string;
		building?: {
			id: string;
			name: string;
		};
	};
}

export interface CreateRoomInvitationRequest {
	roomId: string;
	tenantId: string;
	availableFrom?: string;
	availableUntil?: string;
	invitationMessage?: string;
	proposedRent?: string;
}

export interface RespondInvitationRequest {
	status: 'accepted' | 'declined';
	tenantNotes?: string;
}

export interface InvitationListResponse {
	data: RoomInvitation[];
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

// Booking Request Types
export interface BookingRequest {
	id: string;
	roomId: string;
	tenantId: string;
	//pending   accepted  rejected   expired   cancelled   awaiting_confirmation
	status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired' | 'awaiting_confirmation';
	moveInDate: string;
	moveOutDate?: string | null;
	rentalMonths?: number | null;
	monthlyRent?: string | null;
	depositAmount?: string | null;
	totalAmount?: string | null;
	messageToOwner?: string | null;
	ownerNotes?: string | null;
	cancellationReason?: string | null;
	isConfirmedByTenant?: boolean;
	confirmedAt?: string | null;
	createdAt: string;
	updatedAt: string;
	// Related
	room?: {
		id: string;
		slug: string;
		buildingId: string;
		floorNumber: number;
		name: string;
		description: string;
		roomType: string;
		areaSqm: string;
		maxOccupancy: number;
		totalRooms: number;
		viewCount: number;
		isActive: boolean;
		isVerified: boolean;
		createdAt: string;
		updatedAt: string;
		building: {
			id: string;
			name: string;
		};
	};
	tenant?: UserProfile;
	owner?: UserProfile;
}

export interface CreateBookingRequestRequest {
	roomId: string;
	moveInDate: string;
	moveOutDate?: string;
	messageToOwner?: string;
}

export interface UpdateBookingRequestRequest {
	ownerNotes?: string;
	status?: 'accepted' | 'rejected';
}

export interface CancelBookingRequestRequest {
	cancellationReason: string;
}

export interface ConfirmBookingRequestRequest {
	tenantNotes?: string;
}

export interface BookingRequestListResponse {
	data: BookingRequest[];
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
	buildingId: string;
	buildingName: string;
	buildingVerified: boolean;
	buildingDescription: string;
	address: string;
	addressLine2: string;
	availableRooms: number;
	totalRooms: number;
	isActive: boolean;
	floorNumber: number;
	viewCount: number;
	lastUpdated: string;
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
		name: string;
		gender: string;
		email: string;
		phone: string;
		avatarUrl: string | null;
		verifiedPhone: boolean;
		verifiedEmail: boolean;
		verifiedIdentity: boolean;
		totalBuildings: number;
		totalRoomInstances: number;
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
		depositAmount?: string;
		utilityIncluded: boolean;
	};
	rules: Array<{
		id: string;
		name: string;
		type: string;
		customValue: string | null;
		notes: string | null;
		isEnforced: boolean;
	}>;
	seo: {
		title: string;
		description: string;
		keywords: string;
	};
	breadcrumb: {
		items: Array<{
			title: string;
			path: string;
		}>;
	};
	similarRooms: RoomListing[];
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

// Contract type is re-exported from contract.types.ts (see top of file)

export interface ContractSignature {
	signatureData: string; // Base64 encoded signature from canvas
	signedAt: string; // Timestamp when signed
	signedBy: string; // User ID của người ký
	signerRole?: 'landlord' | 'tenant';
	ipAddress?: string; // IP address khi ký
	deviceInfo?: string; // Device information
	signatureMethod: 'canvas' | 'upload';
	isValid: boolean; // Signature validation status
}

export interface SignContractRequest {
	contractId: string;
	signatureData: string; // Base64 từ react-signature-canvas
	signatureMethod: 'canvas' | 'upload';
}

export interface ContractAmendment {
	id: string;
	contractId: string;
	type: 'rent_increase' | 'rent_decrease' | 'term_extension' | 'term_modification' | 'other';
	description: string;
	changes: Record<string, unknown>;
	reason: string;
	status: 'pending' | 'approved' | 'rejected';
	createdAt: string;
	updatedAt: string;
}

export interface CreateContractAmendmentRequest {
	type: 'rent_increase' | 'rent_decrease' | 'term_extension' | 'term_modification' | 'other';
	description: string;
	changes: Record<string, unknown>;
	reason: string;
}

export interface UpdateContractRequest {
	terms?: string;
	monthlyRent?: number;
	status?: 'draft' | 'active' | 'expired' | 'terminated';
}

export interface ContractListResponse {
	data: Contract[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

// Rental type is re-exported from rental.types.ts (see top of file)

// Payment Types
export interface Payment {
	id: string;
	contractId?: string;
	rentalId?: string;
	payerId: string;
	receiverId: string;
	amount: number;
	paymentType: 'rent' | 'deposit' | 'utility' | 'maintenance' | 'penalty' | 'refund' | 'other';
	paymentMethod: 'bank_transfer' | 'cash' | 'credit_card' | 'e_wallet' | 'qr_code' | 'other';
	status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
	description?: string;
	dueDate?: string;
	paidDate?: string;
	currency: string;
	transactionId?: string;
	receiptNumber?: string;
	receiptDate?: string;
	notes?: string;
	qrCodeUrl?: string;
	createdAt: string;
	updatedAt: string;
	payer?: UserProfile;
	receiver?: UserProfile;
	contract?: Contract;
	rental?: Rental;
}

export interface CreatePaymentRequest {
	contractId?: string;
	rentalId?: string;
	amount: number;
	paymentType: 'rent' | 'deposit' | 'utility' | 'maintenance' | 'penalty' | 'refund' | 'other';
	paymentMethod: 'bank_transfer' | 'cash' | 'credit_card' | 'e_wallet' | 'qr_code' | 'other';
	description?: string;
	dueDate?: string;
	currency: string;
}

export interface UpdatePaymentRequest {
	status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
	paidDate?: string;
	transactionId?: string;
	paymentMethod?: 'bank_transfer' | 'cash' | 'credit_card' | 'e_wallet' | 'qr_code' | 'other';
	notes?: string;
}

export interface CreatePaymentReceiptRequest {
	paymentId: string;
	receiptNumber: string;
	receiptDate: string;
	receivedAmount: number;
	notes?: string;
}

export interface ProcessRefundRequest {
	originalPaymentId: string;
	refundAmount: number;
	reason: string;
	refundMethod: 'bank_transfer' | 'cash' | 'credit_card' | 'e_wallet' | 'other';
}

export interface PaymentListResponse {
	data: Payment[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface PaymentStatistics {
	totalPaid: number;
	totalPending: number;
	totalOverdue: number;
	monthlyBreakdown: Array<{
		month: string;
		amount: number;
		count: number;
	}>;
	paymentTypeBreakdown: Array<{
		type: string;
		amount: number;
		count: number;
	}>;
}

// Landlord Management Types
export interface TenantInfo {
	tenantId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	room: {
		roomId: string;
		roomNumber: string;
		roomName?: string;
		buildingId?: string;
		buildingName?: string;
		occupancy?: number;
	};
	rentalId: string;
	rentalStatus: string;
	contractStartDate: string;
	contractEndDate?: string;
}

export interface RoomWithOccupants {
	id: string;
	roomNumber: string;
	roomName?: string;
	status: string;
	building: {
		id: string;
		name: string;
		address: string;
	};
	occupants: Array<{
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		avatarUrl?: string;
		rental: {
			id: string;
			startDate: string;
			endDate?: string;
			monthlyRent: number;
			status: string;
		};
	}>;
}

export interface TenantListResponse {
	data: TenantInfo[];
	page?: number;
	limit?: number;
	total?: number;
}

export interface RoomWithOccupantsListResponse {
	data: RoomWithOccupants[];
	page?: number;
	limit?: number;
	total?: number;
}

// User Address Types
export interface CreateAddressRequest {
	streetAddress: string;
	wardId: number;
	districtId: number;
	provinceId: number;
	isDefault?: boolean;
}

export interface UpdateAddressRequest {
	streetAddress?: string;
	wardId?: number;
	districtId?: number;
	provinceId?: number;
	isDefault?: boolean;
}

// User Verification Types
export interface VerifyPhoneRequest {
	phone: string;
	verificationCode: string;
}

export interface VerifyEmailRequest {
	email: string;
	verificationCode: string;
}

export interface VerifyIdentityRequest {
	idCardNumber: string;
	idCardType: 'cmnd' | 'cccd' | 'passport';
	fullName: string;
	dateOfBirth: string;
	placeOfOrigin: string;
	placeOfResidence: string;
	frontImageUrl: string;
	backImageUrl: string;
}

// Rating & Review System Types
export type RatingTargetType = 'tenant' | 'landlord' | 'room';

export interface ReviewerInfo {
	id: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string | null;
	isVerified: boolean;
}

export interface RatingResponseDto {
	id: string;
	targetType: RatingTargetType;
	targetId: string;
	reviewerId: string;
	rentalId?: string | null;
	rating: number; // 1-5
	content?: string | null;
	images?: string[];
	createdAt: string;
	updatedAt: string;
	reviewer: ReviewerInfo;
	isCurrentUser: boolean;
}

export interface CreateRatingRequest {
	targetType: RatingTargetType;
	targetId: string;
	rating: number; // 1-5
	content?: string;
	images?: string[];
	rentalId?: string;
}

export interface UpdateRatingRequest {
	rating?: number; // 1-5
	content?: string;
	images?: string[];
}

export interface RatingDistribution {
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
}

export interface RatingStatistics {
	totalRatings: number;
	averageRating: number;
	distribution: RatingDistribution;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface PaginatedRatingsResponse {
	data: RatingResponseDto[];
	meta: PaginationMeta;
	stats: RatingStatistics;
}

export interface GetRatingsQueryParams {
	// Filters
	targetType?: RatingTargetType;
	targetId?: string;
	reviewerId?: string;
	rentalId?: string;
	minRating?: number; // 1-5
	maxRating?: number; // 1-5

	// Pagination
	page?: number; // Default: 1
	limit?: number; // Default: 20

	// Sorting
	sortBy?: string; // Default: 'createdAt'
	sortOrder?: 'asc' | 'desc'; // Default: 'desc'
}

// Dashboard Types
export interface DashboardOverviewResponseDto {
	buildings: {
		total: number;
		active: number;
	};
	rooms: {
		totalInstances: number;
		occupiedInstances: number;
		availableInstances: number;
		reservedInstances: number;
		maintenanceInstances: number;
		occupancyRate: number;
	};
	pipeline: {
		pendingBookings: number;
		pendingInvitations: number;
		roommateApprovals: number;
		upcomingMoveIns: number;
	};
	tenants: {
		activeTenants: number;
		verifiedTenants: number;
		averageRating: number;
	};
	alerts: {
		expiringRentals: number;
		expiringContracts: number;
		openAlerts: number;
	};
}

export interface OperationItemDto {
	id: string;
	type: 'booking' | 'invitation' | 'roommate_application' | 'contract';
	title: string;
	buildingName: string;
	roomName: string;
	status: string;
	senderName: string;
	targetDate?: string;
}

export interface DashboardOperationsResponseDto {
	summary: {
		pendingBookings: number;
		pendingInvitations: number;
		roommateApplications: number;
		contractAlerts: number;
	};
	queues: {
		bookings: OperationItemDto[];
		invitations: OperationItemDto[];
		roommateApplications: OperationItemDto[];
		contracts: OperationItemDto[];
	};
}

export interface ChartDataPoint {
	label: string;
	value: number;
	secondaryValue?: number;
}

export interface ChartResponseDto {
	type: 'line' | 'bar' | 'pie';
	title: string;
	data: ChartDataPoint[];
}

// New Chart API Format
export interface ChartPoint {
	x: string;
	y: number;
}

export interface ChartDataset {
	label: string;
	points: ChartPoint[];
}

export interface ChartMeta {
	unit: string;
	period?: {
		start: string;
		end: string;
	};
	filters?: Record<string, unknown>;
}

export interface NewChartResponseDto {
	type: 'line' | 'bar' | 'pie';
	title: string;
	meta: ChartMeta;
	dataset: ChartDataset[];
}

export interface BillDetailDto {
	id: string;
	title: string;
	amount: number;
	dueDate: string;
	status: BillStatus;
	tenantName: string;
}

export interface PaymentDetailDto {
	id: string;
	amount: number;
	paidDate: string;
	description: string;
	paymentMethod: string;
}

export interface DashboardFinanceResponseDto {
	referencePeriod: {
		startDate: string;
		endDate: string;
	};
	revenue: {
		totalBilled: number;
		totalPaid: number;
		outstandingAmount: number;
	};
	bills: {
		overdueCount: number;
		dueSoonCount: number;
		overdueBills: BillDetailDto[];
		dueSoonBills: BillDetailDto[];
	};
	payments: {
		pendingPayments: number;
		latestPayments: PaymentDetailDto[];
	};
	charts: {
		revenueTrend: NewChartResponseDto;
		buildingPerformance: NewChartResponseDto;
		roomTypeDistribution: NewChartResponseDto;
	};
}

// ============= ROOM ISSUE TYPES =============
export type RoomIssueStatus = 'new' | 'in_progress' | 'resolved';
export type RoomIssueCategory =
	| 'facility'
	| 'utility'
	| 'neighbor'
	| 'noise'
	| 'security'
	| 'other';

export interface RoomIssueReporter {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	phone: string | null;
}

export interface RoomIssueRoom {
	id: string;
	name: string;
	slug: string;
	buildingId: string;
	buildingName: string;
	ownerId: string;
}

export interface RoomIssueRoomInstance {
	id: string;
	roomNumber: string;
	room: RoomIssueRoom;
}

export interface RoomIssue {
	id: string;
	title: string;
	category: RoomIssueCategory;
	status: RoomIssueStatus;
	imageUrls: string[];
	createdAt: string;
	updatedAt: string;
	reporter: RoomIssueReporter;
	roomInstance: RoomIssueRoomInstance;
}

export interface CreateRoomIssueRequest {
	roomInstanceId: string;
	title: string;
	category: RoomIssueCategory;
	imageUrls?: string[];
}

export interface UpdateRoomIssueRequest {
	title?: string;
	category?: RoomIssueCategory;
	status?: RoomIssueStatus;
	imageUrls?: string[];
}

export interface RoomIssueQueryParams {
	page?: number;
	limit?: number;
	roomInstanceId?: string;
	category?: RoomIssueCategory;
	status?: RoomIssueStatus;
}

export interface LandlordRoomIssueQueryParams extends RoomIssueQueryParams {
	reporterId?: string;
}

export interface PaginatedRoomIssuesResponse {
	data: RoomIssue[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// ============= ROOM INSTANCE SEARCH TYPES =============
export interface RoomInstanceSearchResult {
	id: string;
	roomNumber: string;
	roomId: string;
	roomName: string;
	buildingId: string;
	buildingName: string;
	ownerId: string;
	ownerName: string;
	status?: RoomStatus;
	floorNumber?: number;
	notes?: string;
}

export interface RoomInstanceSearchParams {
	buildingId?: string;
	search?: string;
	status?: RoomStatus;
}

export interface RoomInstanceSearchResponse {
	success: boolean;
	message: string;
	data: RoomInstanceSearchResult[];
	timestamp: string;
}
