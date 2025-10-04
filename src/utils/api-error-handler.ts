import { AxiosError } from 'axios';

// Helper to extract data message
function extractDataMessage(data: unknown): string | null {
	if (typeof data === 'string') {
		return data;
	}

	if (typeof data === 'object' && data !== null) {
		const errorObj = data as Record<string, unknown>;
		const errorMessage = errorObj.message || errorObj.error || errorObj.msg;

		if (typeof errorMessage === 'string') {
			return errorMessage;
		}

		if (typeof errorMessage === 'object' && errorMessage !== null) {
			const nestedMsg = (errorMessage as Record<string, unknown>).message;
			if (typeof nestedMsg === 'string') {
				return nestedMsg;
			}
		}
	}

	return null;
}

// Helper to get status-based message
function getStatusMessage(status?: number): string | null {
	switch (status) {
		case 400:
			return 'Dữ liệu gửi lên không hợp lệ';
		case 409:
			return 'Dữ liệu đã tồn tại';
		case 422:
			return 'Dữ liệu không hợp lệ';
		case 500:
			return 'Lỗi máy chủ. Vui lòng thử lại sau';
		default:
			return null;
	}
}

// Main error message extractor
export const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
	if (error instanceof AxiosError) {
		const status = error.response?.status;
		const data = error.response?.data;

		// Try to get message from response data
		const dataMessage = extractDataMessage(data);
		if (dataMessage) {
			return dataMessage;
		}

		// Try status-based message
		const statusMessage = getStatusMessage(status);
		if (statusMessage) {
			return statusMessage;
		}

		// Fallback to error message
		return error.message || defaultMessage;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return defaultMessage;
};
