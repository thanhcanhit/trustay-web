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
// Export booking request actions
export {
	approveBookingRequestAndCreateRental,
	cancelMyBookingRequest,
	createBookingRequest,
	getBookingRequestById,
	getMyBookingRequests,
	getMyBookingRequestsMe,
	getReceivedBookingRequests,
	updateBookingRequestAsOwner,
} from './booking-request.action';
// Export building actions
export {
	createBuilding,
	deleteBuilding,
	getBuildingById,
	getBuildings,
	getMyBuildings,
	updateBuilding,
} from './building.action';
// Export contract actions
export {
	autoGenerateContract,
	createContract,
	downloadContractPDF,
	generateContractPDF,
	getContractById,
	getContractPreview,
	getContractStatus,
	getLandlordContracts,
	getMyContracts,
	getTenantContracts,
	requestSigningOTP,
	signContract,
	verifyPDFIntegrity,
} from './contract.action';
// Export invitation actions
export {
	createRoomInvitation,
	getInvitationById,
	getMyInvitations,
	getReceivedInvitations,
	getSentInvitations,
	respondToInvitation,
	withdrawInvitation,
} from './invitation.action';
// Export listings actions
export {
	getAllRoomListings,
	getFeaturedRoomListings,
	listPublicRoomSeekingPosts,
	//getRoomBySlug,
	searchRoomListings,
} from './listings.action';
// Export location actions (excluding ApiError)
export {
	getDistrictsByProvince,
	getProvinces,
	getWardsByDistrict,
} from './location.action';
// Export payment actions
export {
	createPayment,
	createPaymentReceipt,
	generatePaymentQRCode,
	getPaymentById,
	getPaymentHistory,
	getPaymentStatistics,
	getPayments,
	processRefund,
	updatePayment,
} from './payment.action';
// Export reference data actions
export {
	getAmenities,
	getAppEnums,
	getCostTypes,
	getRules,
} from './reference.action';
// Export rental actions
export {
	createRental,
	getLandlordRentals,
	getMyRentals,
	getRentalById,
	getTenantRentals,
	renewRental,
	terminateRental,
	updateRental,
} from './rental.action';
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
	getPublicUserProfile,
	getUserProfile,
	updateUserProfile,
} from './user.action';
