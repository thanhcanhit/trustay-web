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
		lowerMessage.includes('incorrect password') ||
		lowerMessage.includes('bad credentials') ||
		lowerMessage.includes('login failed') ||
		lowerMessage.includes('authentication failed')
	) {
		return 'Email hoặc mật khẩu không chính xác';
	}

	if (
		lowerMessage.includes('user not found') ||
		lowerMessage.includes('email not found') ||
		lowerMessage.includes('account not found') ||
		lowerMessage.includes('no user found')
	) {
		return 'Tài khoản không tồn tại';
	}

	if (
		lowerMessage.includes('account locked') ||
		lowerMessage.includes('account disabled') ||
		lowerMessage.includes('account suspended') ||
		lowerMessage.includes('account blocked') ||
		lowerMessage.includes('account inactive')
	) {
		return 'Tài khoản đã bị khóa';
	}

	// Rate limiting
	if (
		lowerMessage.includes('too many attempts') ||
		lowerMessage.includes('rate limit') ||
		lowerMessage.includes('too many requests') ||
		lowerMessage.includes('request limit exceeded')
	) {
		return 'Hãy thử lại sau ít phút với email hiện tại hoặc dùng email khác';
	}

	// Email verification rate limiting
	if (
		lowerMessage.includes('too many verification attempts') ||
		lowerMessage.includes('verification limit') ||
		lowerMessage.includes('email verification limit') ||
		lowerMessage.includes('too many emails sent') ||
		lowerMessage.includes('email limit exceeded') ||
		lowerMessage.includes('verification attempts exceeded')
	) {
		return 'Hãy thử lại sau ít phút với email hiện tại hoặc dùng email khác';
	}

	// Additional rate limiting patterns
	if (
		lowerMessage.includes('cooldown') ||
		lowerMessage.includes('wait') ||
		lowerMessage.includes('delay') ||
		lowerMessage.includes('try again later') ||
		lowerMessage.includes('please wait') ||
		lowerMessage.includes('retry after') ||
		lowerMessage.includes('temporary block')
	) {
		return 'Hãy thử lại sau ít phút với email hiện tại hoặc dùng email khác';
	}

	// Network errors
	if (
		lowerMessage.includes('network') ||
		lowerMessage.includes('connection') ||
		lowerMessage.includes('timeout') ||
		lowerMessage.includes('connection timeout') ||
		lowerMessage.includes('network error') ||
		lowerMessage.includes('connection failed') ||
		lowerMessage.includes('no internet') ||
		lowerMessage.includes('offline')
	) {
		return 'Lỗi kết nối mạng. Vui lòng thử lại';
	}

	// Server errors
	if (
		lowerMessage.includes('server error') ||
		lowerMessage.includes('internal error') ||
		lowerMessage.includes('500') ||
		lowerMessage.includes('service unavailable') ||
		lowerMessage.includes('server down') ||
		lowerMessage.includes('maintenance') ||
		lowerMessage.includes('temporary error')
	) {
		return 'Lỗi máy chủ. Vui lòng thử lại sau';
	}

	// Validation errors
	if (
		lowerMessage.includes('email format') ||
		lowerMessage.includes('invalid email') ||
		lowerMessage.includes('malformed email') ||
		lowerMessage.includes('email syntax error')
	) {
		return 'Định dạng email không hợp lệ';
	}

	if (
		lowerMessage.includes('password') &&
		(lowerMessage.includes('required') || lowerMessage.includes('missing'))
	) {
		return 'Mật khẩu là bắt buộc';
	}

	if (
		lowerMessage.includes('email') &&
		(lowerMessage.includes('required') || lowerMessage.includes('missing'))
	) {
		return 'Email là bắt buộc';
	}

	if (
		lowerMessage.includes('phone') &&
		(lowerMessage.includes('required') || lowerMessage.includes('missing'))
	) {
		return 'Số điện thoại là bắt buộc';
	}

	if (
		lowerMessage.includes('first name') &&
		(lowerMessage.includes('required') || lowerMessage.includes('missing'))
	) {
		return 'Tên là bắt buộc';
	}

	if (
		lowerMessage.includes('last name') &&
		(lowerMessage.includes('required') || lowerMessage.includes('missing'))
	) {
		return 'Họ là bắt buộc';
	}

	if (
		lowerMessage.includes('invalid phone') ||
		lowerMessage.includes('phone format') ||
		lowerMessage.includes('malformed phone')
	) {
		return 'Định dạng số điện thoại không hợp lệ';
	}

	if (
		lowerMessage.includes('password too short') ||
		lowerMessage.includes('password length') ||
		lowerMessage.includes('minimum length')
	) {
		return 'Mật khẩu quá ngắn. Vui lòng nhập ít nhất 8 ký tự';
	}

	if (
		lowerMessage.includes('password too weak') ||
		lowerMessage.includes('weak password') ||
		lowerMessage.includes('password strength')
	) {
		return 'Mật khẩu quá yếu. Vui lòng sử dụng chữ hoa, chữ thường, số và ký tự đặc biệt';
	}

	// Registration errors
	if (
		lowerMessage.includes('email already exists') ||
		lowerMessage.includes('user already exists') ||
		lowerMessage.includes('email taken') ||
		lowerMessage.includes('duplicate email') ||
		lowerMessage.includes('email in use')
	) {
		return 'Email đã được sử dụng';
	}

	// Email already verified
	if (
		lowerMessage.includes('email has already been verified') ||
		lowerMessage.includes('email already verified') ||
		lowerMessage.includes('email is already verified') ||
		lowerMessage.includes('email was already verified') ||
		lowerMessage.includes('this email has already been verified') ||
		lowerMessage.includes('email verification already completed') ||
		lowerMessage.includes('email is verified') ||
		lowerMessage.includes('email verification done') ||
		lowerMessage.includes('please use a different email') ||
		lowerMessage.includes('use a different email') ||
		lowerMessage.includes('proceed to registration')
	) {
		return 'Email này đã được xác thực. Vui lòng sử dụng email khác hoặc tiến hành đăng ký';
	}

	// Cannot verify already verified email
	if (
		lowerMessage.includes('cannot verify already verified email') ||
		lowerMessage.includes('email verification not needed') ||
		lowerMessage.includes('verification not required') ||
		lowerMessage.includes('email already confirmed') ||
		lowerMessage.includes('email confirmation already done') ||
		lowerMessage.includes('no need to verify this email') ||
		lowerMessage.includes('email verification unnecessary')
	) {
		return 'Email này đã được xác thực. Không cần xác thực lại';
	}

	if (
		lowerMessage.includes('phone already exists') ||
		lowerMessage.includes('phone taken') ||
		lowerMessage.includes('duplicate phone') ||
		lowerMessage.includes('phone in use') ||
		lowerMessage.includes('phone number already exists') ||
		lowerMessage.includes('phone number taken') ||
		lowerMessage.includes('duplicate phone number') ||
		lowerMessage.includes('phone number is already in use') ||
		lowerMessage.includes('phone number already in use') ||
		lowerMessage.includes('phone number in use') ||
		lowerMessage.includes('phone number exists') ||
		lowerMessage.includes('phone number taken') ||
		lowerMessage.includes('phone number conflict') ||
		lowerMessage.includes('phone is already in use') ||
		lowerMessage.includes('phone was already in use') ||
		lowerMessage.includes('phone has been used') ||
		lowerMessage.includes('phone is used') ||
		lowerMessage.includes('phone is taken')
	) {
		return 'Số điện thoại đã được sử dụng';
	}

	if (
		lowerMessage.includes('username already exists') ||
		lowerMessage.includes('username taken') ||
		lowerMessage.includes('duplicate username')
	) {
		return 'Tên đăng nhập đã được sử dụng';
	}

	// Registration failed after verification
	if (
		lowerMessage.includes('registration failed') ||
		lowerMessage.includes('registration error') ||
		lowerMessage.includes('failed to create account') ||
		lowerMessage.includes('account creation failed') ||
		lowerMessage.includes('user creation failed') ||
		lowerMessage.includes('failed to register user')
	) {
		return 'Đăng ký thất bại. Vui lòng thử lại sau';
	}

	// Verification succeeded but registration failed
	if (
		lowerMessage.includes('verification successful but registration failed') ||
		lowerMessage.includes('otp verified but registration failed') ||
		lowerMessage.includes('code verified but account creation failed')
	) {
		return 'Xác thực thành công nhưng đăng ký thất bại. Vui lòng thử lại sau';
	}

	// Verification errors
	if (
		lowerMessage.includes('verification code') &&
		(lowerMessage.includes('invalid') || lowerMessage.includes('wrong'))
	) {
		return 'Mã xác thực không hợp lệ';
	}

	if (
		lowerMessage.includes('verification code') &&
		(lowerMessage.includes('expired') || lowerMessage.includes('timeout'))
	) {
		return 'Mã xác thực đã hết hạn';
	}

	if (
		lowerMessage.includes('verification failed') ||
		lowerMessage.includes('verification error') ||
		lowerMessage.includes('code verification failed')
	) {
		return 'Xác thực mã thất bại';
	}

	if (
		lowerMessage.includes('otp') &&
		(lowerMessage.includes('invalid') || lowerMessage.includes('wrong'))
	) {
		return 'Mã OTP không hợp lệ';
	}

	if (
		lowerMessage.includes('otp') &&
		(lowerMessage.includes('expired') || lowerMessage.includes('timeout'))
	) {
		return 'Mã OTP đã hết hạn';
	}

	// OTP already used or consumed errors
	if (
		lowerMessage.includes('otp already used') ||
		lowerMessage.includes('otp already consumed') ||
		lowerMessage.includes('otp already verified') ||
		lowerMessage.includes('otp already validated') ||
		lowerMessage.includes('otp has been used') ||
		lowerMessage.includes('otp was already used') ||
		lowerMessage.includes('verification code already used') ||
		lowerMessage.includes('verification code already consumed') ||
		lowerMessage.includes('verification code already verified') ||
		lowerMessage.includes('code already used') ||
		lowerMessage.includes('code already consumed') ||
		lowerMessage.includes('code already verified')
	) {
		return 'Mã OTP đã được sử dụng. Vui lòng yêu cầu mã mới';
	}

	// OTP invalid or expired after use
	if (
		lowerMessage.includes('otp invalid') ||
		lowerMessage.includes('otp is invalid') ||
		lowerMessage.includes('invalid otp') ||
		lowerMessage.includes('otp expired') ||
		lowerMessage.includes('otp is expired') ||
		lowerMessage.includes('expired otp')
	) {
		return 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới';
	}

	// Generic OTP/verification errors
	if (
		lowerMessage.includes('otp error') ||
		lowerMessage.includes('otp failure') ||
		lowerMessage.includes('otp verification failed') ||
		lowerMessage.includes('otp verification error') ||
		lowerMessage.includes('verification code error') ||
		lowerMessage.includes('verification code failure')
	) {
		return 'Lỗi xác thực OTP. Vui lòng thử lại hoặc yêu cầu mã mới';
	}

	// Resend OTP errors
	if (
		lowerMessage.includes('cannot resend otp') ||
		lowerMessage.includes('otp resend failed') ||
		lowerMessage.includes('failed to resend otp') ||
		lowerMessage.includes('otp resend error') ||
		lowerMessage.includes('cannot resend verification code') ||
		lowerMessage.includes('verification code resend failed') ||
		lowerMessage.includes('failed to resend verification code')
	) {
		return 'Không thể gửi lại mã OTP. Vui lòng thử lại sau';
	}

	// OTP generation errors
	if (
		lowerMessage.includes('otp generation failed') ||
		lowerMessage.includes('failed to generate otp') ||
		lowerMessage.includes('otp generation error') ||
		lowerMessage.includes('verification code generation failed') ||
		lowerMessage.includes('failed to generate verification code')
	) {
		return 'Không thể tạo mã OTP. Vui lòng thử lại sau';
	}

	// No valid verification code found
	if (
		lowerMessage.includes('no valid verification code found') ||
		lowerMessage.includes('no valid code found') ||
		lowerMessage.includes('verification code not found') ||
		lowerMessage.includes('code not found') ||
		lowerMessage.includes('otp not found') ||
		lowerMessage.includes('verification code missing') ||
		lowerMessage.includes('code missing') ||
		lowerMessage.includes('please request a new code') ||
		lowerMessage.includes('request a new code') ||
		lowerMessage.includes('get a new code')
	) {
		return 'Không tìm thấy mã xác thực hợp lệ. Vui lòng yêu cầu mã mới';
	}

	// Invalid or expired verification code
	if (
		lowerMessage.includes('invalid verification code') ||
		lowerMessage.includes('invalid code') ||
		lowerMessage.includes('verification code is invalid') ||
		lowerMessage.includes('code is invalid') ||
		lowerMessage.includes('expired verification code') ||
		lowerMessage.includes('expired code') ||
		lowerMessage.includes('verification code has expired') ||
		lowerMessage.includes('code has expired')
	) {
		return 'Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới';
	}

	// Permission errors
	if (
		lowerMessage.includes('forbidden') ||
		lowerMessage.includes('403') ||
		lowerMessage.includes('access denied') ||
		lowerMessage.includes('permission denied') ||
		lowerMessage.includes('insufficient permissions')
	) {
		return 'Bạn không có quyền thực hiện hành động này';
	}

	if (
		lowerMessage.includes('not found') ||
		lowerMessage.includes('404') ||
		lowerMessage.includes('resource not found') ||
		lowerMessage.includes('page not found')
	) {
		return 'Không tìm thấy dữ liệu';
	}

	// Token errors
	if (
		lowerMessage.includes('token expired') ||
		lowerMessage.includes('session expired') ||
		lowerMessage.includes('jwt expired') ||
		lowerMessage.includes('access token expired')
	) {
		return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
	}

	if (
		lowerMessage.includes('invalid token') ||
		lowerMessage.includes('malformed token') ||
		lowerMessage.includes('token error') ||
		lowerMessage.includes('jwt invalid')
	) {
		return 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại';
	}

	if (lowerMessage.includes('refresh token') || lowerMessage.includes('token refresh')) {
		return 'Phiên đăng nhập cần được làm mới. Vui lòng đăng nhập lại';
	}

	// File upload errors
	if (
		lowerMessage.includes('file too large') ||
		lowerMessage.includes('file size exceeded') ||
		lowerMessage.includes('upload limit')
	) {
		return 'File quá lớn. Vui lòng chọn file nhỏ hơn';
	}

	if (
		lowerMessage.includes('invalid file type') ||
		lowerMessage.includes('unsupported file') ||
		lowerMessage.includes('file format')
	) {
		return 'Loại file không được hỗ trợ';
	}

	if (lowerMessage.includes('upload failed') || lowerMessage.includes('upload error')) {
		return 'Tải file lên thất bại. Vui lòng thử lại';
	}

	// Database errors
	if (
		lowerMessage.includes('database error') ||
		lowerMessage.includes('db error') ||
		lowerMessage.includes('connection failed') ||
		lowerMessage.includes('query failed')
	) {
		return 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau';
	}

	// Generic error patterns
	if (
		lowerMessage.includes('something went wrong') ||
		lowerMessage.includes('unexpected error') ||
		lowerMessage.includes('unknown error') ||
		lowerMessage.includes('error occurred')
	) {
		return 'Đã xảy ra lỗi. Vui lòng thử lại sau';
	}

	if (
		lowerMessage.includes('bad request') ||
		lowerMessage.includes('400') ||
		lowerMessage.includes('invalid request')
	) {
		return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin';
	}

	if (
		lowerMessage.includes('conflict') ||
		lowerMessage.includes('409') ||
		lowerMessage.includes('duplicate')
	) {
		return 'Dữ liệu đã tồn tại. Vui lòng kiểm tra lại';
	}

	if (
		lowerMessage.includes('unprocessable') ||
		lowerMessage.includes('422') ||
		lowerMessage.includes('validation failed')
	) {
		return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin';
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
