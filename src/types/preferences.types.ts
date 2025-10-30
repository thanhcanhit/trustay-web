import { Gender, RoomType } from './types';

// ============= ROOM PREFERENCES =============

export interface RoomPreferences {
	id: string;
	tenantId: string;
	preferredProvinceIds?: number[];
	preferredDistrictIds?: number[];
	minBudget?: number;
	maxBudget: number;
	currency: string;
	preferredRoomTypes?: RoomType[];
	maxOccupancy?: number;
	requiresAmenityIds?: string[];
	availableFromDate?: string;
	minLeaseTerm?: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRoomPreferencesRequest {
	preferredProvinceIds?: number[];
	preferredDistrictIds?: number[];
	minBudget?: number;
	maxBudget: number;
	currency?: string;
	preferredRoomTypes?: RoomType[];
	maxOccupancy?: number;
	requiresAmenityIds?: string[];
	availableFromDate?: string;
	minLeaseTerm?: number;
	isActive?: boolean;
}

export interface UpdateRoomPreferencesRequest {
	preferredProvinceIds?: number[];
	preferredDistrictIds?: number[];
	minBudget?: number;
	maxBudget?: number;
	currency?: string;
	preferredRoomTypes?: RoomType[];
	maxOccupancy?: number;
	requiresAmenityIds?: string[];
	availableFromDate?: string;
	minLeaseTerm?: number;
	isActive?: boolean;
}

// ============= ROOMMATE PREFERENCES =============

export interface RoommatePreferences {
	id: string;
	tenantId: string;
	preferredGender?: Gender;
	preferredAgeMin?: number;
	preferredAgeMax?: number;
	allowsSmoking: boolean;
	allowsPets: boolean;
	allowsGuests: boolean;
	cleanlinessLevel?: number;
	socialInteractionLevel?: number;
	dealBreakers?: string[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRoommatePreferencesRequest {
	preferredGender?: Gender;
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

export interface UpdateRoommatePreferencesRequest {
	preferredGender?: Gender;
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

// ============= COMBINED RESPONSE =============

export interface AllPreferencesResponse {
	roomPreferences: RoomPreferences | null;
	roommatePreferences: RoommatePreferences | null;
}
