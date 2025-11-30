import { create } from 'zustand';
import {
	createRoomIssue,
	getLandlordRoomIssues,
	getMyRoomIssues,
	getRoomIssueById,
	updateRoomIssue,
} from '@/actions/room-issue.action';
import { TokenManager } from '@/lib/api-client';
import type {
	CreateRoomIssueRequest,
	LandlordRoomIssueQueryParams,
	PaginatedRoomIssuesResponse,
	RoomIssue,
	RoomIssueQueryParams,
	UpdateRoomIssueRequest,
} from '@/types/types';

interface RoomIssueState {
	// Data
	issues: RoomIssue[];
	current: RoomIssue | null;

	// Loading states
	loading: boolean;
	loadingCurrent: boolean;
	submitting: boolean;
	updating: boolean;

	// Error states
	error: string | null;
	errorCurrent: string | null;
	submitError: string | null;
	updateError: string | null;

	// Metadata
	meta: PaginatedRoomIssuesResponse['meta'] | null;

	// Actions
	loadMyIssues: (params?: RoomIssueQueryParams) => Promise<void>;
	loadLandlordIssues: (params?: LandlordRoomIssueQueryParams) => Promise<void>;
	loadById: (issueId: string) => Promise<void>;
	loadIssueById: (issueId: string) => Promise<RoomIssue | null>;
	create: (data: CreateRoomIssueRequest) => Promise<boolean>;
	update: (issueId: string, data: UpdateRoomIssueRequest) => Promise<boolean>;
	updateStatus: (issueId: string, status: 'new' | 'in_progress' | 'resolved') => Promise<boolean>;
	clearCurrent: () => void;
	clearErrors: () => void;
	clearIssues: () => void;
}

export const useRoomIssueStore = create<RoomIssueState>((set, get) => ({
	// Initial state
	issues: [],
	current: null,

	loading: false,
	loadingCurrent: false,
	submitting: false,
	updating: false,

	error: null,
	errorCurrent: null,
	submitError: null,
	updateError: null,

	meta: null,

	// Load tenant's room issues
	loadMyIssues: async (params?: RoomIssueQueryParams) => {
		set({ loading: true, error: null });

		try {
			const token = TokenManager.getAccessToken();
			const response = await getMyRoomIssues(params, token);

			if (!response.success) {
				throw new Error(response.error || 'Failed to load issues');
			}

			set({
				issues: response.data.data,
				meta: response.data.meta,
				loading: false,
				error: null,
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to load room issues';
			set({
				loading: false,
				error: errorMessage,
			});
			console.error('Failed to load my room issues:', error);
		}
	},

	// Load landlord's room issues
	loadLandlordIssues: async (params?: LandlordRoomIssueQueryParams) => {
		set({ loading: true, error: null });

		try {
			const token = TokenManager.getAccessToken();
			const response = await getLandlordRoomIssues(params, token);

			if (!response.success) {
				throw new Error(response.error || 'Failed to load issues');
			}

			set({
				issues: response.data.data,
				meta: response.data.meta,
				loading: false,
				error: null,
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to load room issues';
			set({
				loading: false,
				error: errorMessage,
			});
			console.error('Failed to load landlord room issues:', error);
		}
	},

	// Load issue by ID (set as current)
	loadById: async (issueId: string) => {
		set({ loadingCurrent: true, errorCurrent: null });

		try {
			const token = TokenManager.getAccessToken();
			const response = await getRoomIssueById(issueId, token);

			if (!response.success) {
				throw new Error(response.error || 'Failed to load issue');
			}

			set({
				current: response.data.data,
				loadingCurrent: false,
				errorCurrent: null,
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to load room issue';
			set({
				loadingCurrent: false,
				errorCurrent: errorMessage,
			});
			console.error('Failed to load room issue by ID:', error);
		}
	},

	// Load issue by ID (return value)
	loadIssueById: async (issueId: string): Promise<RoomIssue | null> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await getRoomIssueById(issueId, token);

			if (!response.success) {
				console.error('Failed to load issue:', response.error);
				return null;
			}

			return response.data.data;
		} catch (error: unknown) {
			console.error('Failed to load room issue:', error);
			return null;
		}
	},

	// Create new room issue (Tenant only)
	create: async (data: CreateRoomIssueRequest): Promise<boolean> => {
		set({ submitting: true, submitError: null });

		try {
			const token = TokenManager.getAccessToken();
			const response = await createRoomIssue(data, token);

			if (!response.success) {
				throw new Error(response.error || 'Failed to create issue');
			}

			// Add new issue to the list
			const { issues } = get();
			set({
				issues: [response.data.data, ...issues],
				submitting: false,
				submitError: null,
			});

			return true;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create room issue';
			set({
				submitting: false,
				submitError: errorMessage,
			});
			console.error('Failed to create room issue:', error);
			return false;
		}
	},

	// Update room issue
	update: async (issueId: string, data: UpdateRoomIssueRequest): Promise<boolean> => {
		set({ updating: true, updateError: null });

		try {
			const token = TokenManager.getAccessToken();
			const response = await updateRoomIssue(issueId, data, token);

			if (!response.success) {
				throw new Error(response.error || 'Failed to update issue');
			}

			// Update issue in the list
			const { issues, current } = get();
			set({
				issues: issues.map((issue) => (issue.id === issueId ? response.data.data : issue)),
				current: current?.id === issueId ? response.data.data : current,
				updating: false,
				updateError: null,
			});

			return true;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update room issue';
			set({
				updating: false,
				updateError: errorMessage,
			});
			console.error('Failed to update room issue:', error);
			return false;
		}
	},

	// Update issue status (Landlord action: new -> in_progress -> resolved)
	updateStatus: async (
		issueId: string,
		status: 'new' | 'in_progress' | 'resolved',
	): Promise<boolean> => {
		return get().update(issueId, { status });
	},

	// Clear current issue
	clearCurrent: () => {
		set({
			current: null,
			errorCurrent: null,
		});
	},

	// Clear errors
	clearErrors: () => {
		set({
			error: null,
			errorCurrent: null,
			submitError: null,
			updateError: null,
		});
	},

	// Clear issues list
	clearIssues: () => {
		set({
			issues: [],
			meta: null,
			error: null,
		});
	},
}));
