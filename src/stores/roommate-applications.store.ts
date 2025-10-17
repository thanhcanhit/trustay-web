import { create } from 'zustand';
import {
	ApplicationStatistics,
	bulkRespondToApplications,
	CreateRoommateApplicationRequest,
	cancelRoommateApplication,
	confirmRoommateApplication,
	createRoommateApplication,
	getApplicationStatisticsForMyPosts,
	getApplicationsForMyPosts,
	getMyApplicationStatistics,
	getMyRoommateApplications,
	getRoommateApplicationById,
	RespondToApplicationRequest,
	RoommateApplication,
	respondToRoommateApplication,
	UpdateRoommateApplicationRequest,
	updateRoommateApplication,
} from '../actions/roommate-applications.action';
import { TokenManager } from '../lib/api-client';

interface RoommateApplicationsState {
	// State
	applications: Record<string, RoommateApplication>;
	myApplications: RoommateApplication[];
	applicationsForMyPosts: RoommateApplication[];
	currentApplication: RoommateApplication | null;
	myStatistics: ApplicationStatistics | null;
	myPostsStatistics: ApplicationStatistics | null;
	isLoading: boolean;
	error: string | null;
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	} | null;

	// Actions
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setCurrentApplication: (application: RoommateApplication | null) => void;

	// API Actions
	fetchApplicationById: (id: string) => Promise<void>;

	fetchMyApplications: (params?: {
		page?: number;
		limit?: number;
		status?:
			| 'pending'
			| 'approved_by_tenant'
			| 'rejected_by_tenant'
			| 'approved_by_landlord'
			| 'rejected_by_landlord'
			| 'cancelled'
			| 'expired';
	}) => Promise<void>;

	fetchApplicationsForMyPosts: (params?: { page?: number; limit?: number }) => Promise<void>;

	createApplication: (data: CreateRoommateApplicationRequest) => Promise<boolean>;

	updateApplication: (id: string, data: UpdateRoommateApplicationRequest) => Promise<boolean>;

	respondToApplication: (id: string, data: RespondToApplicationRequest) => Promise<boolean>;

	confirmApplication: (id: string) => Promise<boolean>;

	cancelApplication: (id: string) => Promise<boolean>;

	bulkRespond: (data: {
		applicationIds: string[];
		approve: boolean;
		message?: string;
	}) => Promise<boolean>;

	fetchMyStatistics: () => Promise<void>;

	fetchMyPostsStatistics: () => Promise<void>;

	// Helpers
	getApplicationById: (id: string) => RoommateApplication | null;
	getApplicationsByPostId: (postId: string) => RoommateApplication[];
	clearError: () => void;
}

export const useRoommateApplicationsStore = create<RoommateApplicationsState>((set, get) => ({
	// Initial state
	applications: {},
	myApplications: [],
	applicationsForMyPosts: [],
	currentApplication: null,
	myStatistics: null,
	myPostsStatistics: null,
	isLoading: false,
	error: null,
	pagination: null,

	// Simple setters
	setLoading: (loading) => set({ isLoading: loading }),
	setError: (error) => set({ error }),
	setCurrentApplication: (application) => set({ currentApplication: application }),

	// Fetch application by ID
	fetchApplicationById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getRoommateApplicationById(id, token);

			if (result.success) {
				set((state) => ({
					applications: { ...state.applications, [result.data.id]: result.data },
					currentApplication: result.data,
					isLoading: false,
				}));
			} else {
				set({ error: result.error, isLoading: false });
			}
		} catch (error) {
			console.error('Failed to fetch application:', error);
			set({ error: 'Không thể tải thông tin đơn ứng tuyển', isLoading: false });
		}
	},

	// Fetch my applications
	fetchMyApplications: async (params) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getMyRoommateApplications(params, token);

			if (result.success) {
				const applicationsObj = result.data.data.reduce(
					(acc, app) => {
						acc[app.id] = app;
						return acc;
					},
					{} as Record<string, RoommateApplication>,
				);

				set({
					applications: { ...get().applications, ...applicationsObj },
					myApplications: result.data.data,
					pagination: {
						page: result.data.page,
						limit: result.data.limit,
						total: result.data.total,
						totalPages: result.data.totalPages,
					},
					isLoading: false,
				});
			} else {
				set({ error: result.error, isLoading: false });
			}
		} catch (error) {
			console.error('Failed to fetch my applications:', error);
			set({ error: 'Không thể tải danh sách đơn ứng tuyển của bạn', isLoading: false });
		}
	},

	// Fetch applications for my posts
	fetchApplicationsForMyPosts: async (params) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getApplicationsForMyPosts(params, token);

			if (result.success) {
				const applicationsObj = result.data.data.reduce(
					(acc, app) => {
						acc[app.id] = app;
						return acc;
					},
					{} as Record<string, RoommateApplication>,
				);

				set({
					applications: { ...get().applications, ...applicationsObj },
					applicationsForMyPosts: result.data.data,
					pagination: {
						page: result.data.page,
						limit: result.data.limit,
						total: result.data.total,
						totalPages: result.data.totalPages,
					},
					isLoading: false,
				});
			} else {
				set({ error: result.error, isLoading: false });
			}
		} catch (error) {
			console.error('Failed to fetch applications for my posts:', error);
			set({
				error: 'Không thể tải danh sách đơn ứng tuyển cho bài đăng của bạn',
				isLoading: false,
			});
		}
	},

	// Create application
	createApplication: async (data) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createRoommateApplication(data, token);

			if (result.success) {
				set((state) => ({
					applications: { ...state.applications, [result.data.id]: result.data },
					myApplications: [result.data, ...state.myApplications],
					isLoading: false,
				}));
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to create application:', error);
			set({ error: 'Không thể tạo đơn ứng tuyển', isLoading: false });
			return false;
		}
	},

	// Update application
	updateApplication: async (id, data) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updateRoommateApplication(id, data, token);

			if (result.success) {
				set((state) => {
					const updatedApplications = {
						...state.applications,
						[result.data.id]: result.data,
					};
					const updatedMyApplications = state.myApplications.map((app) =>
						app.id === id ? result.data : app,
					);

					return {
						applications: updatedApplications,
						myApplications: updatedMyApplications,
						currentApplication:
							state.currentApplication?.id === id ? result.data : state.currentApplication,
						isLoading: false,
					};
				});
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to update application:', error);
			set({ error: 'Không thể cập nhật đơn ứng tuyển', isLoading: false });
			return false;
		}
	},

	// Respond to application
	respondToApplication: async (id, data) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await respondToRoommateApplication(id, data, token);

			if (result.success) {
				set((state) => {
					const updatedApplications = {
						...state.applications,
						[result.data.id]: result.data,
					};
					const updatedApplicationsForMyPosts = state.applicationsForMyPosts.map((app) =>
						app.id === id ? result.data : app,
					);

					return {
						applications: updatedApplications,
						applicationsForMyPosts: updatedApplicationsForMyPosts,
						currentApplication:
							state.currentApplication?.id === id ? result.data : state.currentApplication,
						isLoading: false,
					};
				});
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to respond to application:', error);
			set({ error: 'Không thể phản hồi đơn ứng tuyển', isLoading: false });
			return false;
		}
	},

	// Confirm application
	confirmApplication: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await confirmRoommateApplication(id, token);

			if (result.success) {
				set((state) => {
					const updatedApplications = {
						...state.applications,
						[result.data.id]: result.data,
					};
					const updatedMyApplications = state.myApplications.map((app) =>
						app.id === id ? result.data : app,
					);

					return {
						applications: updatedApplications,
						myApplications: updatedMyApplications,
						currentApplication:
							state.currentApplication?.id === id ? result.data : state.currentApplication,
						isLoading: false,
					};
				});
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to confirm application:', error);
			set({ error: 'Không thể xác nhận đơn ứng tuyển', isLoading: false });
			return false;
		}
	},

	// Cancel application
	cancelApplication: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await cancelRoommateApplication(id, token);

			if (result.success) {
				set((state) => {
					const updatedApplications = {
						...state.applications,
						[result.data.id]: result.data,
					};
					const updatedMyApplications = state.myApplications.map((app) =>
						app.id === id ? result.data : app,
					);

					return {
						applications: updatedApplications,
						myApplications: updatedMyApplications,
						currentApplication:
							state.currentApplication?.id === id ? result.data : state.currentApplication,
						isLoading: false,
					};
				});
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to cancel application:', error);
			set({ error: 'Không thể hủy đơn ứng tuyển', isLoading: false });
			return false;
		}
	},

	// Bulk respond to applications
	bulkRespond: async (data) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await bulkRespondToApplications(data, token);

			if (result.success) {
				// Refresh applications after bulk operation
				await get().fetchApplicationsForMyPosts();
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to bulk respond:', error);
			set({ error: 'Không thể phản hồi hàng loạt đơn ứng tuyển', isLoading: false });
			return false;
		}
	},

	// Fetch my statistics
	fetchMyStatistics: async () => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getMyApplicationStatistics(token);

			if (result.success) {
				set({ myStatistics: result.data, isLoading: false });
			} else {
				set({ error: result.error, isLoading: false });
			}
		} catch (error) {
			console.error('Failed to fetch my statistics:', error);
			set({ error: 'Không thể tải thống kê đơn ứng tuyển của bạn', isLoading: false });
		}
	},

	// Fetch my posts statistics
	fetchMyPostsStatistics: async () => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getApplicationStatisticsForMyPosts(token);

			if (result.success) {
				set({ myPostsStatistics: result.data, isLoading: false });
			} else {
				set({ error: result.error, isLoading: false });
			}
		} catch (error) {
			console.error('Failed to fetch my posts statistics:', error);
			set({
				error: 'Không thể tải thống kê đơn ứng tuyển cho bài đăng của bạn',
				isLoading: false,
			});
		}
	},

	// Helpers
	getApplicationById: (id) => {
		return get().applications[id] || null;
	},

	getApplicationsByPostId: (postId) => {
		return Object.values(get().applications).filter((app) => app.roommateSeekingPostId === postId);
	},

	clearError: () => set({ error: null }),
}));
