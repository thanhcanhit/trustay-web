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
	sendEmailVerification,
	skipProfileUpdate,
	verifyEmailCode,
} from './auth.action';
// Export listings actions
export {
	getFeaturedRoomListings,
	getRoomBySlug,
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
