// Export all actions for easy importing

// Export API client utilities
export {
	API_CONFIG,
	ApiError,
	apiClient,
	createServerApiCall,
	TokenManager,
} from '../lib/api-client';

// Export client-side API utilities
export { clientApi } from '../lib/client-api';

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
// Export location actions (excluding ApiError)
export {
	getDistrictsByProvince,
	getProvinces,
	getWardsByDistrict,
} from './location.action';
// Export user actions (prefer user-actions updateUserProfile, exclude ApiError)
export {
	getUserProfile,
	updateUserProfile,
} from './user.action';
