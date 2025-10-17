'use server';

import { AxiosError } from 'axios';
import { createServerApiCall } from '../lib/api-client';
import { extractErrorMessage } from '../utils/api-error-handler';

// Types for error handling
interface ApiErrorResult {
	success: false;
	error: string;
	status?: number;
}

interface ApiSuccessResult<T> {
	success: true;
	data: T;
}

type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult;

const apiCall = createServerApiCall();

// Types for Room Preferences
export interface RoomPreferences {
	id: string;
	userId: string;
	preferredRoomType: 'single' | 'shared' | 'studio' | 'apartment';
	minPrice: number;
	maxPrice: number;
	preferredProvinceIds: number[];
	preferredDistrictIds: number[];
	preferredAmenities: string[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRoomPreferencesRequest {
	preferredRoomType: 'single' | 'shared' | 'studio' | 'apartment';
	minPrice: number;
	maxPrice: number;
	preferredProvinceIds: number[];
	preferredDistrictIds: number[];
	preferredAmenities: string[];
	isActive?: boolean;
}

export interface UpdateRoomPreferencesRequest {
	preferredRoomType?: 'single' | 'shared' | 'studio' | 'apartment';
	minPrice?: number;
	maxPrice?: number;
	preferredProvinceIds?: number[];
	preferredDistrictIds?: number[];
	preferredAmenities?: string[];
	isActive?: boolean;
}

// Types for Roommate Preferences
export interface RoommatePreferences {
	id: string;
	userId: string;
	preferredGender: 'any' | 'male' | 'female';
	preferredAgeMin: number;
	preferredAgeMax: number;
	allowsSmoking: boolean;
	allowsPets: boolean;
	allowsGuests: boolean;
	cleanlinessLevel: number; // 1-5
	socialInteractionLevel: number; // 1-5
	dealBreakers: string[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRoommatePreferencesRequest {
	preferredGender: 'any' | 'male' | 'female';
	preferredAgeMin: number;
	preferredAgeMax: number;
	allowsSmoking: boolean;
	allowsPets: boolean;
	allowsGuests: boolean;
	cleanlinessLevel: number;
	socialInteractionLevel: number;
	dealBreakers: string[];
	isActive?: boolean;
}

export interface UpdateRoommatePreferencesRequest {
	preferredGender?: 'any' | 'male' | 'female';
	preferredAgeMin?: number;
	preferredAgeMax?: number;
	allowsSmoking?: boolean;
	allowsPets?: boolean;
	allowsGuests?: boolean;
	cleanlinessLevel?: number;
	socialInteractionLevel?: number;
	dealBreakers?: string[];
	isActive?: boolean;
}

export interface AllPreferencesResponse {
	roomPreferences: RoomPreferences | null;
	roommatePreferences: RoommatePreferences | null;
}

// ============= ROOM PREFERENCES =============

// Create or update room preferences
export const createOrUpdateRoomPreferences = async (
	data: CreateRoomPreferencesRequest,
	token?: string,
): Promise<ApiResult<RoomPreferences>> => {
	try {
		const response = await apiCall<RoomPreferences>(
			'/api/tenant-preferences/room',
			{
				method: 'POST',
				data,
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tạo hoặc cập nhật sở thích về phòng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get room preferences
export const getRoomPreferences = async (token?: string): Promise<ApiResult<RoomPreferences>> => {
	try {
		const response = await apiCall<RoomPreferences>(
			'/api/tenant-preferences/room',
			{
				method: 'GET',
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải sở thích về phòng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Update room preferences
export const updateRoomPreferences = async (
	data: UpdateRoomPreferencesRequest,
	token?: string,
): Promise<ApiResult<RoomPreferences>> => {
	try {
		const response = await apiCall<RoomPreferences>(
			'/api/tenant-preferences/room',
			{
				method: 'PUT',
				data,
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật sở thích về phòng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Delete room preferences
export const deleteRoomPreferences = async (
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			'/api/tenant-preferences/room',
			{
				method: 'DELETE',
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể xóa sở thích về phòng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// ============= ROOMMATE PREFERENCES =============

// Create or update roommate preferences
export const createOrUpdateRoommatePreferences = async (
	data: CreateRoommatePreferencesRequest,
	token?: string,
): Promise<ApiResult<RoommatePreferences>> => {
	try {
		const response = await apiCall<RoommatePreferences>(
			'/api/tenant-preferences/roommate',
			{
				method: 'POST',
				data,
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tạo hoặc cập nhật sở thích về bạn cùng phòng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get roommate preferences
export const getRoommatePreferences = async (
	token?: string,
): Promise<ApiResult<RoommatePreferences>> => {
	try {
		const response = await apiCall<RoommatePreferences>(
			'/api/tenant-preferences/roommate',
			{
				method: 'GET',
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải sở thích về bạn cùng phòng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Update roommate preferences
export const updateRoommatePreferences = async (
	data: UpdateRoommatePreferencesRequest,
	token?: string,
): Promise<ApiResult<RoommatePreferences>> => {
	try {
		const response = await apiCall<RoommatePreferences>(
			'/api/tenant-preferences/roommate',
			{
				method: 'PUT',
				data,
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật sở thích về bạn cùng phòng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Delete roommate preferences
export const deleteRoommatePreferences = async (
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			'/api/tenant-preferences/roommate',
			{
				method: 'DELETE',
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể xóa sở thích về bạn cùng phòng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// ============= ALL PREFERENCES =============

// Get all preferences (both room and roommate)
export const getAllPreferences = async (
	token?: string,
): Promise<ApiResult<AllPreferencesResponse>> => {
	try {
		const response = await apiCall<AllPreferencesResponse>(
			'/api/tenant-preferences/all',
			{
				method: 'GET',
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải tất cả sở thích'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};
