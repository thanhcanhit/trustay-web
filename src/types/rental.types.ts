import { RentalStatus, RoomInstance, UserProfile } from './types';

// Re-export for convenience
export type { RentalStatus };

// ============= RENTAL TYPES =============

export interface RentalMember {
	tenantId: string;
	firstName: string;
	lastName: string;
	email: string;
	rentalId: string;
}

export interface Rental {
	id: string;
	roomBookingId?: string;
	bookingRequestId?: string;
	invitationId?: string;
	roomInstanceId: string;
	tenantId: string;
	ownerId: string;
	contractStartDate: Date | string | null;
	contractEndDate?: Date | string | null;
	monthlyRent: string;
	depositPaid: string;
	status: RentalStatus;
	contractDocumentUrl?: string;
	terminationNoticeDate?: Date | string;
	terminationReason?: string;
	createdAt: Date | string;
	updatedAt: Date | string;
	// Relations (optional)
	tenant?: UserProfile;
	owner?: UserProfile & {
		avatarUrl?: string;
	};
	roomInstance?: RoomInstanceWithRoom;
	roomBooking?: unknown;
	invitation?: unknown;
	bookingRequest?: {
		id: string;
		moveInDate: string;
		moveOutDate?: string | null;
	};
	members?: RentalMember[];

	// Deprecated/backward compatibility fields
	contract?: unknown;
	room?: {
		name?: string;
		buildingName?: string;
		roomType?: string;
	};
	landlord?: UserProfile & {
		avatarUrl?: string;
		phone?: string;
	};
	depositAmount?: number;
	startDate?: Date | string;
	endDate?: Date | string;
	notes?: string;
}

export interface RoomInstanceWithRoom extends RoomInstance {
	room?: {
		id: string;
		slug: string;
		buildingId: string;
		floorNumber: string;
		name: string;
		description?: string;
		roomType: string;
		areaSqm: string;
		maxOccupancy: string;
		totalRooms: string;
		viewCount: string;
		isActive: boolean;
		isVerified: boolean;
		overallRating: string;
		totalRatings: string;
		createdAt: Date | string;
		updatedAt: Date | string;
		building?: {
			id: string;
			name: string;
			ownerId?: string;
		};
	};
}

export interface CreateRentalRequest {
	bookingRequestId?: string;
	invitationId?: string;
	roomInstanceId: string;
	tenantId: string;
	contractStartDate: string;
	contractEndDate?: string;
	monthlyRent: string;
	depositPaid: string;
	contractDocumentUrl?: string;
}

export interface UpdateRentalRequest {
	contractEndDate?: string;
	monthlyRent?: string;
	status?: RentalStatus;
	contractDocumentUrl?: string;
}

export interface TerminateRentalRequest {
	terminationNoticeDate: string;
	terminationReason: string;
}

export interface RenewRentalRequest {
	newEndDate: string;
}

export interface RentalQueryParams {
	page?: number;
	limit?: number;
	status?: RentalStatus;
	search?: string;
}

export interface PaginatedRentalResponse {
	data: Rental[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}
