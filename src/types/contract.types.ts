import { ContractStatus, ContractType } from './types';

// ============= CONTRACT TYPES =============

export interface ContractSignature {
	signatureData: string;
	signedAt: string;
	signedBy: string;
	signerRole?: 'landlord' | 'tenant';
	ipAddress?: string;
	deviceInfo?: string;
	signatureMethod: 'canvas' | 'upload';
	isValid: boolean;
}

export interface Contract {
	id: string;
	contractCode?: string;
	status: ContractStatus;
	contractType: ContractType;
	// User Relations
	landlord?: {
		id: string;
		fullName?: string;
		email: string;
		phone?: string | null;
		firstName?: string;
		lastName?: string;
		avatarUrl?: string;
	};
	tenant?: {
		id: string;
		fullName?: string;
		email: string;
		phone?: string | null;
		firstName?: string;
		lastName?: string;
		avatarUrl?: string;
	};
	// Room Relations
	room?: {
		roomNumber: string;
		roomName: string;
		buildingName: string;
		name?: string; // Alias for roomName for backwards compatibility
		areaSqm?: number;
		roomType?: string;
	};
	// Contract Data with full structure from API
	contractData?: {
		terms?: {
			rules?: string[];
			utilities?: string[];
			restrictions?: string[];
			responsibilities?: {
				tenant?: string[];
				landlord?: string[];
			};
			tenantResponsibilities?: string[];
			landlordResponsibilities?: string[];
		};
		roomName?: string;
		financial?: {
			deposit?: number;
			waterPrice?: number;
			monthlyRent?: number;
			depositMonths?: number;
			internetPrice?: number;
			paymentMethod?: string;
			paymentDueDate?: number;
			electricityPrice?: number;
		};
		roomNumber?: string;
		monthlyRent?: number;
		buildingName?: string;
		depositAmount?: number;
		buildingAddress?: string;
	};
	// Date fields
	startDate: string | Date;
	endDate?: string | Date | null;
	signedAt?: Date | string | null;
	// PDF
	pdfUrl?: string | null;
	// Signatures
	signatures?: ContractSignature[];
	landlordSignature?: string | ContractSignature;
	tenantSignature?: string | ContractSignature;
	landlordSignedAt?: Date | string;
	tenantSignedAt?: Date | string;
	fullySignedAt?: Date | string;
	// Timestamps
	createdAt: Date | string;
	updatedAt: Date | string;
	// Legacy fields for backwards compatibility
	rentalId?: string;
	landlordId?: string;
	tenantId?: string;
	roomInstanceId?: string;
	monthlyRent?: number;
	depositAmount?: number;
	additionalTerms?: string;
	rules?: string[];
	amenities?: string[];
	terms?: string;
	pdfHash?: string;
	pdfSize?: number;
	lastVerified?: Date | string;
}

export interface ContractData {
	monthlyRent: number;
	depositAmount: number;
	additionalTerms?: string;
	rules?: string[];
	amenities?: string[];
}

export interface CreateContractRequest {
	rentalId?: string;
	landlordId: string;
	tenantId: string;
	roomInstanceId: string;
	contractType?: ContractType;
	startDate: string;
	endDate?: string;
	contractData: ContractData;
}

export interface SignContractRequest {
	signatureImage: string; // Base64 PNG from canvas
	otpCode: string; // 6-digit OTP
}

export interface ContractStatusResponse {
	contractId: string;
	status: ContractStatus;
	landlordSigned: boolean;
	tenantSigned: boolean;
	landlordSignedAt?: Date | string;
	tenantSignedAt?: Date | string;
}

export interface GeneratePDFRequest {
	contractId: string;
	includeSignatures?: boolean;
	options?: {
		format?: 'A4' | 'A3' | 'Letter';
		margin?: {
			top: string;
			bottom: string;
			left: string;
			right: string;
		};
		printBackground?: boolean;
	};
}

export interface GeneratePDFResponse {
	success: boolean;
	pdfUrl?: string;
	hash?: string;
	size?: number;
	downloadUrl?: string;
	expiresAt?: Date | string;
	error?: string;
}

export interface VerifyPDFResponse {
	valid: boolean;
	hash: string;
	lastVerified: Date | string;
}

export interface ContractQueryParams {
	status?: ContractStatus;
}

export interface PaginatedContractResponse {
	data: Contract[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}
