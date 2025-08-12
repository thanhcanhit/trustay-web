// API Types for Trustay backend integration

// Authentication Types
export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone: string;
	gender: 'male' | 'female' | 'other';
	role: 'tenant' | 'landlord';
}

export type RegisterDirectRequest = RegisterRequest & {
	// Direct registration without email verification
	skipVerification?: boolean;
};

export interface VerificationRequest {
	type: 'email' | 'phone';
	email?: string;
	phone?: string;
	code?: string;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

// Authentication Responses
export interface AuthResponse {
	access_token: string;
	refresh_token: string;
	user: UserProfile;
}

export interface VerificationResponse {
	verificationId?: string;
	verificationToken?: string;
	message: string;
}

export interface PasswordStrengthResponse {
	score: number;
	feedback: string[];
	isStrong: boolean;
}

export interface GeneratePasswordResponse {
	password: string;
	strength: number;
}

// User Types
export interface UserProfile {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	gender: 'male' | 'female' | 'other';
	role: 'tenant' | 'landlord';
	bio?: string;
	dateOfBirth?: string;
	avatar?: string;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateProfileRequest {
	firstName?: string;
	lastName?: string;
	phone?: string;
	gender?: 'male' | 'female' | 'other';
	bio?: string;
	dateOfBirth?: string;
}

// Location Types
export interface Province {
	id: number;
	name: string;
	nameEn: string | null;
	code: string;
}

export interface District {
	id: number;
	name: string;
	nameEn: string | null;
	code: string;
	provinceId: number;
}

export interface Ward {
	id: number;
	name: string;
	nameEn: string | null;
	code: string;
	level: string;
	districtId: number;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

// Error types
export interface ApiErrorResponse {
	message: string;
	code?: string;
	details?: Record<string, unknown>;
}

// Utility types
export type UserRole = 'tenant' | 'landlord';
export type Gender = 'male' | 'female' | 'other';
export type VerificationType = 'email' | 'phone';
