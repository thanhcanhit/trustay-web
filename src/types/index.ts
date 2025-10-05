// Export all types for easy importing

// Export property types (excluding Room to avoid conflict)
export type {
	CreateRentalPostData,
	CreateRoomData,
	CreateRoommatePostData,
	RentalPost,
	RoommatePost,
} from './property';
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
	CreateRentalRequest,
	CreateRoomRequest,
	GeneratePasswordResponse,
	// Authentication Types
	LoginRequest,
	PasswordStrengthResponse,
	RefreshTokenRequest,
	RegisterDirectRequest,
	RegisterRequest,
	RenewRentalRequest,
	// Rental Types
	Rental,
	RentalListResponse,
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
	TerminateRentalRequest,
	UpdateBuildingRequest,
	UpdateProfileRequest,
	UpdateRentalRequest,
	UpdateRoomInstanceStatusRequest,
	UpdateRoomRequest,
	// User Types
	UserProfile,
	VerificationRequest,
	VerificationResponse,
} from './types';
