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
	//changePassword,
	completeRegistration,
	getCurrentUser,
	login,
	logout,
	refreshToken,
	registerDirect,
	registerWithVerification,
	registerWithVerificationNoPhone,
	sendEmailVerification,
	sendPhoneVerification,
	skipProfileUpdate,
	//updateUserProfile as updateAuthUserProfile,
	verifyEmailCode,
	verifyPhoneCode,
} from './auth.action';
// Export booking request actions
export {
	approveBookingRequestAndCreateRental,
	cancelMyBookingRequest,
	confirmBookingRequest,
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
// Export chat actions
export {
	getConversations,
	getMessages,
	getOrCreateConversation,
	markAllMessagesAsRead,
	sendMessage,
	uploadChatAttachments,
} from './chat.action';
// Export contract actions
export {
	activateContract,
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
	confirmInvitation,
	createRoomInvitation,
	getInvitationById,
	getMyInvitations,
	getReceivedInvitations,
	getSentInvitations,
	respondToInvitation,
	withdrawInvitation,
} from './invitation.action';
// Export landlord actions
export {
	listMyRoomsWithOccupants,
	listMyTenants,
} from './landlord.action';
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
// Export notification actions
export {
	createNotification,
	deleteAllNotifications,
	deleteNotification,
	getNotifications,
	getUnreadNotificationCount,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from './notification.action';
// Export payment actions
export {
	createPayment,
	createPaymentReceipt,
	deletePayment,
	generatePaymentQRCode,
	getPaymentById,
	getPaymentHistory,
	getPaymentStatistics,
	getPayments,
	processRefund,
	updatePayment,
} from './payment.action';
// Export rating actions
export {
	createRating,
	deleteRating,
	getRatingById,
	getRatingStats,
	getRatings,
	getUserCreatedRatings,
	hasUserRatedTarget,
	updateRating,
} from './rating.action';
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
// Export roommate applications actions
export {
	bulkRespondToApplications,
	cancelRoommateApplication,
	confirmRoommateApplication,
	createRoommateApplication,
	getApplicationStatisticsForMyPosts,
	getApplicationsForMyPosts,
	getMyApplicationStatistics,
	getMyRoommateApplications,
	getRoommateApplicationById,
	respondToRoommateApplication,
	updateRoommateApplication,
} from './roommate-applications.action';
// Export roommate seeking posts actions
export {
	createRoommateSeekingPost,
	deleteRoommateSeekingPost,
	getAllRoommateSeekingPosts,
	getMyRoommateSeekingPosts,
	getRoommateSeekingListings,
	getRoommateSeekingPostById,
	searchRoommateSeekingPosts,
	updateRoommateSeekingPost,
	updateRoommateSeekingPostStatus,
} from './roommate-seeking-posts.action';
// Export tenant preferences actions
export {
	createOrUpdateRoommatePreferences,
	createOrUpdateRoomPreferences,
	deleteRoommatePreferences,
	deleteRoomPreferences,
	getAllPreferences,
	getRoommatePreferences,
	getRoomPreferences,
	updateRoommatePreferences,
	updateRoomPreferences,
} from './tenant-preferences.action';
// Export upload actions
export {
	getImageUrl,
	uploadBulkImages,
	uploadSingleImage,
} from './upload.action';
// Export user actions (prefer user-actions updateUserProfile, exclude ApiError)
export {
	createAddress,
	deleteAddress,
	getPublicUserProfile,
	getUserProfile,
	updateAddress,
	updateUserProfile,
	uploadAvatar,
	verifyEmail,
	verifyIdentity,
	verifyPhone,
} from './user.action';
