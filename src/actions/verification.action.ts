'use server';

import { apiClient } from '@/lib/api-client';
import { extractErrorMessage } from '@/utils/api-error-handler';

interface SendVerificationRequest {
	type: 'email' | 'phone';
	email?: string;
	phone?: string;
}

interface SendVerificationResponse {
	message: string;
	verificationId: string;
	expiresInMinutes: number;
	remainingAttempts: number;
}

interface VerifyCodeRequest {
	type: 'email' | 'phone';
	email?: string;
	phone?: string;
	code: string;
}

interface VerifyCodeResponse {
	message: string;
}

interface ApiErrorResult {
	success: false;
	error: string;
}

interface ApiSuccessResult<T> {
	success: true;
	data: T;
}

type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult;

// Send verification code
export async function sendVerificationCode(
	request: SendVerificationRequest,
	token: string,
): Promise<ApiResult<SendVerificationResponse>> {
	try {
		const response = await apiClient.post<SendVerificationResponse>(
			'/api/verification/send',
			request,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		return {
			success: true,
			data: response.data,
		};
	} catch (error: unknown) {
		const errorMessage = extractErrorMessage(error, 'Có lỗi xảy ra khi gửi mã xác thực');
		return {
			success: false,
			error: errorMessage,
		};
	}
}

// Verify code
export async function verifyCode(
	request: VerifyCodeRequest,
	token: string,
): Promise<ApiResult<VerifyCodeResponse>> {
	try {
		const response = await apiClient.post<VerifyCodeResponse>('/api/verification/verify', request, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return {
			success: true,
			data: response.data,
		};
	} catch (error: unknown) {
		const errorMessage = extractErrorMessage(error, 'Mã xác thực không chính xác');
		return {
			success: false,
			error: errorMessage,
		};
	}
}
