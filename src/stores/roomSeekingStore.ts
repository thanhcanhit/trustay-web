import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { listPublicRoomSeekingPosts } from '@/actions/listings.action';
import {
	createRoomSeekingPost,
	deleteRoomSeekingPost,
	getMyRoomSeekingPosts,
	getRoomSeekingPostById,
	incrementRoomSeekingPostContact,
	updateRoomSeekingPost,
	updateRoomSeekingPostStatus,
} from '@/actions/room-seeking.action';
import type {
	CreateRoomSeekingPostRequest,
	RoomSeekingPost,
	UpdateRoomSeekingPostRequest,
} from '@/types/room-seeking';

interface RoomSeekingState {
	// User's room seeking posts
	userPosts: RoomSeekingPost[];
	userPostsLoading: boolean;
	userPostsError: string | null;
	userPostsPagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	} | null;

	// Public room seeking posts (for browsing)
	publicPosts: RoomSeekingPost[];
	publicPostsLoading: boolean;
	publicPostsError: string | null;
	publicPostsPagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	} | null;

	// Current room seeking post detail
	currentPost: RoomSeekingPost | null;
	postLoading: boolean;
	postError: string | null;

	// Form state
	formLoading: boolean;
	formError: string | null;

	// Actions
	loadUserPosts: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
	fetchMyPosts: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
	loadPublicPosts: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
	loadPostDetail: (id: string) => Promise<void>;
	createPost: (data: CreateRoomSeekingPostRequest) => Promise<boolean>;
	updatePost: (id: string, data: UpdateRoomSeekingPostRequest) => Promise<boolean>;
	deletePost: (id: string) => Promise<boolean>;
	togglePostStatus: (id: string) => Promise<boolean>;
	incrementContact: (id: string) => Promise<boolean>;
	clearCurrentPost: () => void;
	clearErrors: () => void;
	clearFormErrors: () => void;
}

export const useRoomSeekingStore = create<RoomSeekingState>()(
	persist(
		(set, get) => ({
			// Initial state
			userPosts: [],
			userPostsLoading: false,
			userPostsError: null,
			userPostsPagination: null,

			publicPosts: [],
			publicPostsLoading: false,
			publicPostsError: null,
			publicPostsPagination: null,

			currentPost: null,
			postLoading: false,
			postError: null,

			formLoading: false,
			formError: null,

			// Load user's room seeking posts
			loadUserPosts: async (params = {}) => {
				set({ userPostsLoading: true, userPostsError: null });

				try {
					const response = await getMyRoomSeekingPosts(params);

					if (response.success) {
						set({
							userPosts: response.data.data,
							userPostsPagination: response.data.meta,
							userPostsLoading: false,
							userPostsError: null,
						});
					} else {
						set({
							userPostsLoading: false,
							userPostsError: response.error,
						});
					}
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : 'Failed to load user posts';
					set({
						userPostsLoading: false,
						userPostsError: errorMessage,
					});
					console.error('Failed to load user posts:', error);
				}
			},

			// Alias for loadUserPosts for better naming
			fetchMyPosts: async (params = {}) => {
				const { loadUserPosts } = get();
				await loadUserPosts(params);
			},

			// Load public room seeking posts
			loadPublicPosts: async (params = {}) => {
				set({ publicPostsLoading: true, publicPostsError: null });

				try {
					const response = await listPublicRoomSeekingPosts({
						...params,
						status: 'active', // Only show active posts publicly
						isPublic: true,
					});

					set({
						publicPosts: response.data ?? [],
						publicPostsPagination: response.meta ?? null,
						publicPostsLoading: false,
						publicPostsError: null,
					});
				} catch (error: unknown) {
					const errorMessage =
						error instanceof Error ? error.message : 'Failed to load public posts';
					set({
						publicPostsLoading: false,
						publicPostsError: errorMessage,
					});
					console.error('Failed to load public posts:', error);
				}
			},

			// Load room seeking post detail
			loadPostDetail: async (id: string) => {
				set({ postLoading: true, postError: null });

				try {
					const response = await getRoomSeekingPostById(id);

					if (response.success) {
						set({
							currentPost: response.data.data,
							postLoading: false,
							postError: null,
						});
					} else {
						set({
							postLoading: false,
							postError: response.error,
						});
					}
				} catch (error: unknown) {
					const errorMessage =
						error instanceof Error ? error.message : 'Failed to load post detail';
					set({
						postLoading: false,
						postError: errorMessage,
					});
					console.error('Failed to load post detail:', error);
				}
			},

			// Create new room seeking post
			createPost: async (data: CreateRoomSeekingPostRequest): Promise<boolean> => {
				set({ formLoading: true, formError: null });

				try {
					const response = await createRoomSeekingPost(data);

					if (response.success) {
						// Add the new post to user posts list
						const { userPosts } = get();
						set({
							userPosts: [response.data.data, ...userPosts],
							formLoading: false,
							formError: null,
						});
						return true;
					} else {
						set({
							formLoading: false,
							formError: response.error,
						});
						return false;
					}
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
					set({
						formLoading: false,
						formError: errorMessage,
					});
					console.error('Failed to create post:', error);
					return false;
				}
			},

			// Update room seeking post
			updatePost: async (id: string, data: UpdateRoomSeekingPostRequest): Promise<boolean> => {
				set({ formLoading: true, formError: null });

				try {
					const response = await updateRoomSeekingPost(id, data);

					if (response.success) {
						const { userPosts, currentPost } = get();
						const updatedPost = response.data.data;

						// Update in user posts list
						const updatedUserPosts = userPosts.map((post) => (post.id === id ? updatedPost : post));

						// Update current post if it's the same one
						const updatedCurrentPost = currentPost?.id === id ? updatedPost : currentPost;

						set({
							userPosts: updatedUserPosts,
							currentPost: updatedCurrentPost,
							formLoading: false,
							formError: null,
						});
						return true;
					} else {
						set({
							formLoading: false,
							formError: response.error,
						});
						return false;
					}
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
					set({
						formLoading: false,
						formError: errorMessage,
					});
					console.error('Failed to update post:', error);
					return false;
				}
			},

			// Delete room seeking post
			deletePost: async (id: string): Promise<boolean> => {
				try {
					const response = await deleteRoomSeekingPost(id);

					if (response.success) {
						const { userPosts, currentPost } = get();

						// Remove from user posts list
						const updatedUserPosts = userPosts.filter((post) => post.id !== id);

						// Clear current post if it's the deleted one
						const updatedCurrentPost = currentPost?.id === id ? null : currentPost;

						set({
							userPosts: updatedUserPosts,
							currentPost: updatedCurrentPost,
						});
						return true;
					} else {
						console.error('Failed to delete post:', response.error);
						return false;
					}
				} catch (error: unknown) {
					console.error('Failed to delete post:', error);
					return false;
				}
			},

			// Toggle post status (active/paused)
			togglePostStatus: async (id: string): Promise<boolean> => {
				try {
					const { userPosts, currentPost } = get();
					const target = userPosts.find((p) => p.id === id) || currentPost;
					const nextStatus: 'active' | 'paused' = target?.status === 'active' ? 'paused' : 'active';
					const response = await updateRoomSeekingPostStatus(id, nextStatus);

					if (response.success) {
						const { userPosts, currentPost } = get();
						const updatedPost = response.data.data;

						// Update in user posts list
						const updatedUserPosts = userPosts.map((post) => (post.id === id ? updatedPost : post));

						// Update current post if it's the same one
						const updatedCurrentPost = currentPost?.id === id ? updatedPost : currentPost;

						set({
							userPosts: updatedUserPosts,
							currentPost: updatedCurrentPost,
						});
						return true;
					} else {
						console.error('Failed to toggle post status:', response.error);
						return false;
					}
				} catch (error: unknown) {
					console.error('Failed to toggle post status:', error);
					return false;
				}
			},

			// Increment contact count
			incrementContact: async (id: string): Promise<boolean> => {
				try {
					const response = await incrementRoomSeekingPostContact(id);

					if (response.success) {
						const { currentPost } = get();

						// Update current post contact count if it's the same one
						if (currentPost?.id === id) {
							set({
								currentPost: {
									...currentPost,
									contactCount: currentPost.contactCount + 1,
								},
							});
						}
						return true;
					} else {
						console.error('Failed to increment contact:', response.error);
						return false;
					}
				} catch (error: unknown) {
					console.error('Failed to increment contact:', error);
					return false;
				}
			},

			// Clear current post
			clearCurrentPost: () => {
				set({
					currentPost: null,
					postError: null,
				});
			},

			// Clear all errors
			clearErrors: () => {
				set({
					userPostsError: null,
					publicPostsError: null,
					postError: null,
					formError: null,
				});
			},

			// Clear form errors
			clearFormErrors: () => {
				set({
					formError: null,
				});
			},
		}),
		{
			name: 'room-seeking-store',
			partialize: (state) => ({
				// Only persist user posts and current post
				userPosts: state.userPosts,
				currentPost: state.currentPost,
			}),
		},
	),
);
