// Export all actions for easy importing

// Export API client utilities
export {
	API_CONFIG,
	ApiError,
	apiClient,
	createServerApiCall,
	TokenManager,
} from '../lib/api-client';

// Export types (prefer types.ts for ApiResponse)
export * from '../types/types';

// Export auth actions (excluding conflicting ApiError and updateUserProfile)
export {
	completeRegistration,
	getCurrentUser,
	login,
	logout,
	refreshToken,
	registerDirect,
	registerWithVerification,
	registerWithVerificationNoPhone,
	sendEmailVerification,
	skipProfileUpdate,
	verifyEmailCode,
} from './auth.action';
// Export building actions
export {
	createBuilding,
	deleteBuilding,
	getBuildingById,
	getBuildings,
	getMyBuildings,
	updateBuilding,
} from './building.action';
// Export listings actions
export {
	getAllRoomListings,
	getFeaturedRoomListings,
	//getRoomBySlug,
	type RoomDetail,
	type RoomListing,
	type RoomListingsResponse,
	type RoomSearchParams,
	searchRoomListings,
} from './listings.action';
// Export location actions (excluding ApiError)
export {
	getDistrictsByProvince,
	getProvinces,
	getWardsByDistrict,
} from './location.action';
// Export reference data actions
export {
	getAmenities,
	getAppEnums,
	getCostTypes,
	getRules,
} from './reference.action';
// Export room actions
export {
	bulkUpdateRoomInstancesStatus,
	createRoom,
	deleteRoom,
	getMyRooms,
	getRoomById,
	getRoomBySlug,
	getRoomInstancesByStatus,
	getRoomsByBuilding,
	updateRoom,
	updateRoomInstanceStatus,
} from './room.action';
// Export room seeking actions
export {
	createRoomSeekingPost,
	deleteRoomSeekingPost,
	getMyRoomSeekingPosts,
	getRoomSeekingPostById,
	getRoomSeekingPosts,
	incrementRoomSeekingPostContact,
	updateRoomSeekingPost,
	updateRoomSeekingPostStatus,
} from './room-seeking.action';
// Export upload actions
export {
	getImageUrl,
	uploadBulkImages,
	uploadSingleImage,
} from './upload.action';
// Export user actions (prefer user-actions updateUserProfile, exclude ApiError)
export {
	getUserProfile,
	updateUserProfile,
} from './user.action';
