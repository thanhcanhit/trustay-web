import { Rental } from './rental.types';
import { BillStatus } from './types';

// ============= BILL TYPES =============

export type BillItemType = 'rent' | 'electric' | 'water' | 'service';

export interface BillItem {
	id: string;
	billId: string;
	itemType: BillItemType;
	itemName: string;
	description?: string;
	quantity?: number;
	unitPrice?: number;
	amount: number;
	currency: string;
	notes?: string;
	createdAt: Date | string;
	updatedAt?: Date | string;
}

export interface Bill {
	id: string;
	rentalId: string;
	roomInstanceId: string;
	billingPeriod: string; // "2025-01" (YYYY-MM)
	billingMonth: number; // 1-12
	billingYear: number; // 2025
	periodStart: Date | string; // "2025-01-01"
	periodEnd: Date | string; // "2025-01-31"
	subtotal: number;
	discountAmount: number;
	taxAmount: number;
	totalAmount: number;
	paidAmount: number;
	remainingAmount: number;
	status: BillStatus;
	dueDate: Date | string;
	paidDate?: Date | string;
	notes?: string;
	createdAt: Date | string;
	updatedAt: Date | string;
	// Relations
	billItems?: BillItem[];
	rental?: Rental;
}

export interface MeterReading {
	roomCostId: string;
	currentReading: number;
	lastReading: number;
}

export interface CreateBillRequest {
	roomInstanceId: string;
	billingPeriod: string; // "2025-01" (YYYY-MM)
	billingMonth: number; // 1-12
	billingYear: number; // 2025
	periodStart: string; // "2025-01-01"
	periodEnd: string; // "2025-01-31"
	occupancyCount: number; // số người ở
	meterReadings: MeterReading[];
	notes?: string;
}

export interface PreviewBillForBuildingRequest {
	buildingId: string;
	billingPeriod: string;
	billingMonth: number;
	billingYear: number;
	periodStart: string;
	periodEnd: string;
	occupancyCount: number;
	meterReadings: MeterReading[];
	notes?: string;
}

export interface UpdateBillRequest {
	dueDate?: string;
	notes?: string;
	status?: BillStatus;
}

export interface UpdateMeterDataRequest {
	meterData: MeterReading[];
}

export interface BillQueryParams {
	page?: number;
	limit?: number;
	status?: BillStatus;
	search?: string;
	billingMonth?: number;
	billingYear?: number;
}

export interface PaginatedBillResponse {
	data: Bill[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}
