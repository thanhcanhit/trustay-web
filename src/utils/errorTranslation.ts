/**
 * Utility functions for translating error messages to Vietnamese
 */

/**
 * Check if a string contains Vietnamese characters
 */
export const containsVietnamese = (text: string): boolean => {
	return /[\u00C0-\u024F\u1E00-\u1EFF\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01A0\u01A1\u01AF\u01B0]/.test(
		text,
	);
};

/**
 * Translate common API error messages to Vietnamese
 */
export const translateErrorMessage = (
	errorMessage: string,
	defaultMessage: string = 'Có lỗi xảy ra',
): string => {
	if (!errorMessage) return defaultMessage;

	// If message is already in Vietnamese, use it directly
	if (containsVietnamese(errorMessage)) {
		return errorMessage;
	}

	// Translate common English error messages to Vietnamese
	const lowerMessage = errorMessage.toLowerCase();

	// Authentication errors
	if (
		lowerMessage.includes('invalid credentials') ||
		lowerMessage.includes('unauthorized') ||
		lowerMessage.includes('wrong password') ||
		lowerMessage.includes('incorrect password')
	) {
		return 'Email hoặc mật khẩu không chính xác';
	}

	if (lowerMessage.includes('user not found') || lowerMessage.includes('email not found')) {
		return 'Tài khoản không tồn tại';
	}

	if (
		lowerMessage.includes('account locked') ||
		lowerMessage.includes('account disabled') ||
		lowerMessage.includes('account suspended')
	) {
		return 'Tài khoản đã bị khóa';
	}

	// Rate limiting
	if (lowerMessage.includes('too many attempts') || lowerMessage.includes('rate limit')) {
		return 'Quá nhiều lần thử. Vui lòng thử lại sau';
	}

	// Network errors
	if (
		lowerMessage.includes('network') ||
		lowerMessage.includes('connection') ||
		lowerMessage.includes('timeout')
	) {
		return 'Lỗi kết nối mạng. Vui lòng thử lại';
	}

	// Server errors
	if (
		lowerMessage.includes('server error') ||
		lowerMessage.includes('internal error') ||
		lowerMessage.includes('500')
	) {
		return 'Lỗi máy chủ. Vui lòng thử lại sau';
	}

	// Validation errors
	if (lowerMessage.includes('email format') || lowerMessage.includes('invalid email')) {
		return 'Định dạng email không hợp lệ';
	}

	if (lowerMessage.includes('password') && lowerMessage.includes('required')) {
		return 'Mật khẩu là bắt buộc';
	}

	if (lowerMessage.includes('email') && lowerMessage.includes('required')) {
		return 'Email là bắt buộc';
	}

	// Registration errors
	if (
		lowerMessage.includes('email already exists') ||
		lowerMessage.includes('user already exists')
	) {
		return 'Email đã được sử dụng';
	}

	if (lowerMessage.includes('phone already exists')) {
		return 'Số điện thoại đã được sử dụng';
	}

	// Verification errors
	if (lowerMessage.includes('verification code') && lowerMessage.includes('invalid')) {
		return 'Mã xác thực không hợp lệ';
	}

	if (lowerMessage.includes('verification code') && lowerMessage.includes('expired')) {
		return 'Mã xác thực đã hết hạn';
	}

	// Permission errors
	if (lowerMessage.includes('forbidden') || lowerMessage.includes('403')) {
		return 'Bạn không có quyền thực hiện hành động này';
	}

	if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
		return 'Không tìm thấy dữ liệu';
	}

	// Token errors
	if (lowerMessage.includes('token expired') || lowerMessage.includes('session expired')) {
		return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
	}

	if (lowerMessage.includes('invalid token')) {
		return 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại';
	}

	// If no translation found, return the original message or default
	return errorMessage || defaultMessage;
};

/**
 * Translate authentication-specific error messages
 */
export const translateAuthError = (errorMessage: string): string => {
	return translateErrorMessage(errorMessage, 'Đăng nhập thất bại');
};

/**
 * Translate registration-specific error messages
 */
export const translateRegistrationError = (errorMessage: string): string => {
	return translateErrorMessage(errorMessage, 'Đăng ký thất bại');
};

/**
 * Translate verification-specific error messages
 */
export const translateVerificationError = (errorMessage: string): string => {
	return translateErrorMessage(errorMessage, 'Xác thực thất bại');
};
