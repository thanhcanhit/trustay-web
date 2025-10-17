import { create } from 'zustand';
import {
	CreateRoommateSeekingPostRequest,
	createRoommateSeekingPost,
	deleteRoommateSeekingPost,
	getAllRoommateSeekingPosts,
	getMyRoommateSeekingPosts,
	getRoommateSeekingPostById,
	RoommateSeekingPost,
	SearchRoommateSeekingPostsParams,
	searchRoommateSeekingPosts,
	UpdateRoommateSeekingPostRequest,
	updateRoommateSeekingPost,
	updateRoommateSeekingPostStatus,
} from '../actions/roommate-seeking-posts.action';
import { TokenManager } from '../lib/api-client';

interface RoommateSeekingPostsState {
	// State
	posts: Record<string, RoommateSeekingPost>;
	myPosts: RoommateSeekingPost[];
	searchResults: RoommateSeekingPost[];
	currentPost: RoommateSeekingPost | null;
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
	setCurrentPost: (post: RoommateSeekingPost | null) => void;

	// API Actions
	fetchAllPosts: (params?: {
		page?: number;
		limit?: number;
		sortBy?: 'createdAt' | 'monthlyRent' | 'updatedAt';
		sortOrder?: 'asc' | 'desc';
	}) => Promise<void>;

	fetchMyPosts: (params?: { page?: number; limit?: number }) => Promise<void>;

	fetchPostById: (id: string) => Promise<void>;

	searchPosts: (params: SearchRoommateSeekingPostsParams) => Promise<void>;

	createPost: (data: CreateRoommateSeekingPostRequest) => Promise<boolean>;

	updatePost: (id: string, data: UpdateRoommateSeekingPostRequest) => Promise<boolean>;

	updatePostStatus: (
		id: string,
		status: 'active' | 'inactive' | 'closed' | 'expired',
	) => Promise<boolean>;

	deletePost: (id: string) => Promise<boolean>;

	// Helpers
	getPostById: (id: string) => RoommateSeekingPost | null;
	clearSearchResults: () => void;
	clearError: () => void;
}

export const useRoommateSeekingPostsStore = create<RoommateSeekingPostsState>((set, get) => ({
	// Initial state
	posts: {},
	myPosts: [],
	searchResults: [],
	currentPost: null,
	isLoading: false,
	error: null,
	pagination: null,

	// Simple setters
	setLoading: (loading) => set({ isLoading: loading }),
	setError: (error) => set({ error }),
	setCurrentPost: (post) => set({ currentPost: post }),

	// Fetch all posts (public)
	fetchAllPosts: async (params) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getAllRoommateSeekingPosts(params, token);

			if (result.success) {
				const postsObj = result.data.data.reduce(
					(acc, post) => {
						acc[post.id] = post;
						return acc;
					},
					{} as Record<string, RoommateSeekingPost>,
				);

				set({
					posts: { ...get().posts, ...postsObj },
					searchResults: result.data.data,
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
			console.error('Failed to fetch posts:', error);
			set({ error: 'Không thể tải danh sách bài đăng', isLoading: false });
		}
	},

	// Fetch my posts
	fetchMyPosts: async (params) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getMyRoommateSeekingPosts(params, token);

			if (result.success) {
				const postsObj = result.data.data.reduce(
					(acc, post) => {
						acc[post.id] = post;
						return acc;
					},
					{} as Record<string, RoommateSeekingPost>,
				);

				set({
					posts: { ...get().posts, ...postsObj },
					myPosts: result.data.data,
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
			console.error('Failed to fetch my posts:', error);
			set({ error: 'Không thể tải danh sách bài đăng của bạn', isLoading: false });
		}
	},

	// Fetch post by ID
	fetchPostById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getRoommateSeekingPostById(id, token);

			if (result.success) {
				set((state) => ({
					posts: { ...state.posts, [result.data.id]: result.data },
					currentPost: result.data,
					isLoading: false,
				}));
			} else {
				set({ error: result.error, isLoading: false });
			}
		} catch (error) {
			console.error('Failed to fetch post:', error);
			set({ error: 'Không thể tải thông tin bài đăng', isLoading: false });
		}
	},

	// Search posts
	searchPosts: async (params) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await searchRoommateSeekingPosts(params, token);

			if (result.success) {
				const postsObj = result.data.data.reduce(
					(acc, post) => {
						acc[post.id] = post;
						return acc;
					},
					{} as Record<string, RoommateSeekingPost>,
				);

				set({
					posts: { ...get().posts, ...postsObj },
					searchResults: result.data.data,
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
			console.error('Failed to search posts:', error);
			set({ error: 'Không thể tìm kiếm bài đăng', isLoading: false });
		}
	},

	// Create post
	createPost: async (data) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createRoommateSeekingPost(data, token);

			if (result.success) {
				set((state) => ({
					posts: { ...state.posts, [result.data.id]: result.data },
					myPosts: [result.data, ...state.myPosts],
					isLoading: false,
				}));
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to create post:', error);
			set({ error: 'Không thể tạo bài đăng', isLoading: false });
			return false;
		}
	},

	// Update post
	updatePost: async (id, data) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updateRoommateSeekingPost(id, data, token);

			if (result.success) {
				set((state) => {
					const updatedPosts = { ...state.posts, [result.data.id]: result.data };
					const updatedMyPosts = state.myPosts.map((post) => (post.id === id ? result.data : post));

					return {
						posts: updatedPosts,
						myPosts: updatedMyPosts,
						currentPost: state.currentPost?.id === id ? result.data : state.currentPost,
						isLoading: false,
					};
				});
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to update post:', error);
			set({ error: 'Không thể cập nhật bài đăng', isLoading: false });
			return false;
		}
	},

	// Update post status
	updatePostStatus: async (id, status) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updateRoommateSeekingPostStatus(id, status, token);

			if (result.success) {
				set((state) => {
					const updatedPosts = { ...state.posts, [result.data.id]: result.data };
					const updatedMyPosts = state.myPosts.map((post) => (post.id === id ? result.data : post));

					return {
						posts: updatedPosts,
						myPosts: updatedMyPosts,
						currentPost: state.currentPost?.id === id ? result.data : state.currentPost,
						isLoading: false,
					};
				});
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to update post status:', error);
			set({ error: 'Không thể cập nhật trạng thái bài đăng', isLoading: false });
			return false;
		}
	},

	// Delete post
	deletePost: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await deleteRoommateSeekingPost(id, token);

			if (result.success) {
				set((state) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { [id]: _deleted, ...remainingPosts } = state.posts;
					const updatedMyPosts = state.myPosts.filter((post) => post.id !== id);

					return {
						posts: remainingPosts,
						myPosts: updatedMyPosts,
						currentPost: state.currentPost?.id === id ? null : state.currentPost,
						isLoading: false,
					};
				});
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to delete post:', error);
			set({ error: 'Không thể xóa bài đăng', isLoading: false });
			return false;
		}
	},

	// Helpers
	getPostById: (id) => {
		return get().posts[id] || null;
	},

	clearSearchResults: () => set({ searchResults: [], pagination: null }),

	clearError: () => set({ error: null }),
}));
