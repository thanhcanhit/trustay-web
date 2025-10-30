import { ContractStatus, ContractType, RoomInstance, UserProfile } from './types';

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
	rentalId?: string;
	landlordId: string;
	tenantId: string;
	roomInstanceId: string;
	contractType: ContractType;
	startDate: string | Date;
	endDate?: string | Date;
	monthlyRent: number;
	depositAmount: number;
	status: ContractStatus;
	// Contract Data
	additionalTerms?: string;
	rules?: string[];
	amenities?: string[];
	terms?: string;
	contractCode?: string;
	contractData?: {
		monthlyRent?: number;
		depositAmount?: number;
		buildingName?: string;
		buildingAddress?: string;
	};
	// Signatures - can be string (simple) or full signature object
	landlordSignature?: string | ContractSignature;
	tenantSignature?: string | ContractSignature;
	signatures?: ContractSignature[];
	landlordSignedAt?: Date | string;
	tenantSignedAt?: Date | string;
	fullySignedAt?: Date | string;
	signedAt?: Date | string;
	// PDF
	pdfUrl?: string;
	pdfHash?: string;
	pdfSize?: number;
	lastVerified?: Date | string;
	// Timestamps
	createdAt: Date | string;
	updatedAt: Date | string;
	// Relations
	landlord?: UserProfile;
	tenant?: UserProfile;
	room?: RoomInstance;
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
