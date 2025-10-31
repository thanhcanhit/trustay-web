// Export all types for easy importing

// Export bill types
export * from './bill.types';
export type { ContractSignature } from './contract.types';
// Export contract types
export * from './contract.types';
// Export preferences types
export * from './preferences.types';
// Export property types (excluding Room to avoid conflict)
export type {
	CreateRentalPostData,
	CreateRoomData,
	CreateRoommatePostData,
	RentalPost,
	RoommatePost,
} from './property';
// Re-export rental types
export type {
	CreateRentalRequest,
	PaginatedRentalResponse as RentalListResponse,
	RenewRentalRequest,
	Rental,
	TerminateRentalRequest,
	UpdateRentalRequest,
} from './rental.types';
// Export rental types
export * from './rental.types';
export * from './report';
// Export room seeking types
export * from './room-seeking';
// Export existing types (excluding conflicting Room interface)
export type {
	// Authentication Responses
	AuthResponse,
	// Building Types
	Building,
	BuildingsListResponse,
	BulkUpdateRoomInstancesRequest,
	ChangePasswordRequest,
	CheckPassword,
	CreateBuildingRequest,
	CreateRoomRequest,
	GeneratePasswordResponse,
	// Authentication Types
	LoginRequest,
	PasswordStrengthResponse,
	PublicUserProfile,
	RatingStats,
	RefreshTokenRequest,
	RegisterDirectRequest,
	RegisterRequest,
	// Room Types (from types.ts)
	RoomAmenity,
	RoomCost,
	RoomInstance,
	RoomInstancesResponse,
	RoomPricing,
	RoomRule,
	RoomStatus,
	RoomsListResponse,
	RoomType,
	UpdateBuildingRequest,
	UpdateProfileRequest,
	UpdateRoomInstanceStatusRequest,
	UpdateRoomRequest,
	// User Types
	UserProfile,
	UserRating,
	VerificationRequest,
	VerificationResponse,
} from './types';
