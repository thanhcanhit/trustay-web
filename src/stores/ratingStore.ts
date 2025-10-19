import { create } from 'zustand';
import {
	createRating as createRatingApi,
	deleteRating as deleteRatingApi,
	getRatingById as getRatingByIdApi,
	getRatingStats as getRatingStatsApi,
	getRatings as getRatingsApi,
	getUserCreatedRatings as getUserCreatedRatingsApi,
	hasUserRatedTarget as hasUserRatedTargetApi,
	updateRating as updateRatingApi,
} from '@/actions/rating.action';
import { TokenManager } from '@/lib/api-client';
import type {
	CreateRatingRequest,
	GetRatingsQueryParams,
	PaginatedRatingsResponse,
	RatingResponseDto,
	RatingStatistics,
	UpdateRatingRequest,
} from '@/types/types';

interface RatingState {
	// State
	ratings: RatingResponseDto[];
	currentRating: RatingResponseDto | null;
	statistics: RatingStatistics | null;
	isLoading: boolean;
	error: string | null;
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	} | null;

	// Actions
	createRating: (data: CreateRatingRequest) => Promise<RatingResponseDto>;
	getRatings: (params?: GetRatingsQueryParams) => Promise<void>;
	getRatingById: (ratingId: string) => Promise<void>;
	updateRating: (ratingId: string, data: UpdateRatingRequest) => Promise<RatingResponseDto>;
	deleteRating: (ratingId: string) => Promise<void>;
	getUserCreatedRatings: (
		userId: string,
		params?: Omit<GetRatingsQueryParams, 'reviewerId'>,
	) => Promise<void>;
	hasUserRatedTarget: (
		targetType: 'tenant' | 'landlord' | 'room',
		targetId: string,
	) => Promise<{ hasRated: boolean; rating?: RatingResponseDto }>;
	getRatingStats: (targetType: 'tenant' | 'landlord' | 'room', targetId: string) => Promise<void>;

	// Utility actions
	clearError: () => void;
	clearCurrentRating: () => void;
	clearRatings: () => void;
	setLoading: (loading: boolean) => void;
}

export const useRatingStore = create<RatingState>((set) => ({
	// Initial state
	ratings: [],
	currentRating: null,
	statistics: null,
	isLoading: false,
	error: null,
	pagination: null,

	// Create rating
	createRating: async (data: CreateRatingRequest) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const rating = await createRatingApi(data, token);
			set((state) => ({
				ratings: [rating, ...state.ratings],
				isLoading: false,
			}));
			return rating;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create rating';
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Get ratings with filters
	getRatings: async (params?: GetRatingsQueryParams) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const response: PaginatedRatingsResponse = await getRatingsApi(params, token);
			set({
				ratings: response.data,
				statistics: response.stats,
				pagination: response.meta,
				isLoading: false,
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get ratings';
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Get single rating by ID
	getRatingById: async (ratingId: string) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const rating = await getRatingByIdApi(ratingId, token);
			set({
				currentRating: rating,
				isLoading: false,
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get rating';
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Update rating
	updateRating: async (ratingId: string, data: UpdateRatingRequest) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const updatedRating = await updateRatingApi(ratingId, data, token);
			set((state) => ({
				ratings: state.ratings.map((rating) => (rating.id === ratingId ? updatedRating : rating)),
				currentRating: state.currentRating?.id === ratingId ? updatedRating : state.currentRating,
				isLoading: false,
			}));
			return updatedRating;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update rating';
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Delete rating
	deleteRating: async (ratingId: string) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			await deleteRatingApi(ratingId, token);
			set((state) => ({
				ratings: state.ratings.filter((rating) => rating.id !== ratingId),
				currentRating: state.currentRating?.id === ratingId ? null : state.currentRating,
				isLoading: false,
			}));
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete rating';
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Get ratings created by a user
	getUserCreatedRatings: async (
		userId: string,
		params?: Omit<GetRatingsQueryParams, 'reviewerId'>,
	) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const response: PaginatedRatingsResponse = await getUserCreatedRatingsApi(
				userId,
				params,
				token,
			);
			set({
				ratings: response.data,
				statistics: response.stats,
				pagination: response.meta,
				isLoading: false,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to get user created ratings';
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Check if user has rated target
	hasUserRatedTarget: async (targetType: 'tenant' | 'landlord' | 'room', targetId: string) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await hasUserRatedTargetApi(targetType, targetId, token);
			set({ isLoading: false });
			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to check rating';
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Get rating statistics
	getRatingStats: async (targetType: 'tenant' | 'landlord' | 'room', targetId: string) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const stats = await getRatingStatsApi(targetType, targetId, token);
			set({
				statistics: stats,
				isLoading: false,
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get rating stats';
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Utility actions
	clearError: () => set({ error: null }),
	clearCurrentRating: () => set({ currentRating: null }),
	clearRatings: () => set({ ratings: [], statistics: null, pagination: null }),
	setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
