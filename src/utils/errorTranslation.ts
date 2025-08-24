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

// Error pattern mappings
type ErrorPattern = {
	patterns: string[];
	message: string;
	subPatterns?: string[];
};

const ERROR_PATTERNS: Record<string, ErrorPattern> = {
	// Authentication errors
	auth: {
		patterns: [
			'invalid credentials',
			'unauthorized',
			'wrong password',
			'incorrect password',
			'bad credentials',
			'login failed',
			'authentication failed',
		],
		message: 'Email hoặc mật khẩu không chính xác',
	},
	userNotFound: {
		patterns: ['user not found', 'email not found', 'account not found', 'no user found'],
		message: 'Tài khoản không tồn tại',
	},
	accountLocked: {
		patterns: [
			'account locked',
			'account disabled',
			'account suspended',
			'account blocked',
			'account inactive',
		],
		message: 'Tài khoản đã bị khóa',
	},
	rateLimit: {
		patterns: [
			'too many attempts',
			'rate limit',
			'too many requests',
			'request limit exceeded',
			'too many verification attempts',
			'verification limit',
			'email verification limit',
			'too many emails sent',
			'email limit exceeded',
			'verification attempts exceeded',
			'cooldown',
			'wait',
			'delay',
			'try again later',
			'please wait',
			'retry after',
			'temporary block',
		],
		message: 'Hãy thử lại sau ít phút với email hiện tại hoặc dùng email khác',
	},
	network: {
		patterns: [
			'network',
			'connection',
			'timeout',
			'connection timeout',
			'network error',
			'connection failed',
			'no internet',
			'offline',
		],
		message: 'Lỗi kết nối mạng. Vui lòng thử lại',
	},
	server: {
		patterns: [
			'server error',
			'internal error',
			'500',
			'service unavailable',
			'server down',
			'maintenance',
			'temporary error',
			'lỗi máy chủ',
			'internal server error',
			'http error 500',
			'status code 500',
		],
		message: 'Lỗi máy chủ. Vui lòng thử lại sau',
	},
	emailFormat: {
		patterns: ['email format', 'invalid email', 'malformed email', 'email syntax error'],
		message: 'Định dạng email không hợp lệ',
	},
	passwordRequired: {
		patterns: ['password'],
		subPatterns: ['required', 'missing'],
		message: 'Mật khẩu là bắt buộc',
	},
	emailRequired: {
		patterns: ['email'],
		subPatterns: ['required', 'missing'],
		message: 'Email là bắt buộc',
	},
	phoneRequired: {
		patterns: ['phone'],
		subPatterns: ['required', 'missing'],
		message: 'Số điện thoại là bắt buộc',
	},
	firstNameRequired: {
		patterns: ['first name'],
		subPatterns: ['required', 'missing'],
		message: 'Tên là bắt buộc',
	},
	lastNameRequired: {
		patterns: ['last name'],
		subPatterns: ['required', 'missing'],
		message: 'Họ là bắt buộc',
	},
	phoneFormat: {
		patterns: ['invalid phone', 'phone format', 'malformed phone'],
		message: 'Định dạng số điện thoại không hợp lệ',
	},
	vietnamesePhoneInvalid: {
		patterns: [
			'phone number must be a valid vietnamese phone number',
			'vietnamese phone number',
			'phone must be valid vietnamese',
			'valid vietnamese phone',
			'phone number must be valid vietnamese',
		],
		message: 'Số điện thoại phải là số điện thoại Việt Nam hợp lệ (VD: 0123456789, 0987654321)',
	},
	passwordLength: {
		patterns: ['password too short', 'password length', 'minimum length'],
		message: 'Mật khẩu quá ngắn. Vui lòng nhập ít nhất 8 ký tự',
	},
	passwordStrength: {
		patterns: ['password too weak', 'weak password', 'password strength'],
		message: 'Mật khẩu quá yếu. Vui lòng sử dụng chữ hoa, chữ thường, số và ký tự đặc biệt',
	},
	emailExists: {
		patterns: [
			'email already exists',
			'user already exists',
			'email taken',
			'duplicate email',
			'email in use',
			'Email is already registered',
			'email is already registered',
			'email already registered',
			'email is registered',
			'email was already registered',
			'email has already been registered',
		],
		subPatterns: [
			'already registered',
			'already exists',
			'already in use',
			'already taken',
			'is registered',
			'is already registered',
			'was already registered',
			'has already been registered',
		],
		message: 'Email đã được sử dụng',
	},
	emailAlreadyRegistered: {
		patterns: [
			'Email is already registered',
			'email is already registered',
			'Email is already registered.',
			'email is already registered.',
		],
		message: 'Email đã được sử dụng',
	},
	emailVerified: {
		patterns: [
			'email has already been verified',
			'email already verified',
			'email is already verified',
			'email was already verified',
			'this email has already been verified',
			'email verification already completed',
			'email is verified',
			'email verification done',
			'please use a different email',
			'use a different email',
			'proceed to registration',
		],
		message: 'Email này đã được xác thực. Vui lòng sử dụng email khác hoặc tiến hành đăng ký',
	},
	emailVerificationNotNeeded: {
		patterns: [
			'cannot verify already verified email',
			'email verification not needed',
			'verification not required',
			'email already confirmed',
			'email confirmation already done',
			'no need to verify this email',
			'email verification unnecessary',
		],
		message: 'Email này đã được xác thực. Không cần xác thực lại',
	},
	phoneExists: {
		patterns: [
			'phone already exists',
			'phone taken',
			'duplicate phone',
			'phone in use',
			'phone number already exists',
			'phone number taken',
			'duplicate phone number',
			'phone number already in use',
			'phone number in use',
			'phone number exists',
			'phone number conflict',
			'phone is already in use',
			'phone was already in use',
			'phone has been used',
			'phone is used',
			'phone is taken',
		],
		message: 'Số điện thoại đã được sử dụng',
	},
	usernameExists: {
		patterns: ['username already exists', 'username taken', 'duplicate username'],
		message: 'Tên đăng nhập đã được sử dụng',
	},
	registrationFailed: {
		patterns: [
			'registration failed',
			'registration error',
			'failed to create account',
			'account creation failed',
			'user creation failed',
			'failed to register user',
			'verification successful but registration failed',
			'otp verified but registration failed',
			'code verified but account creation failed',
		],
		message: 'Đăng ký thất bại. Vui lòng thử lại sau',
	},
	verificationCodeInvalid: {
		patterns: ['verification code'],
		subPatterns: ['invalid', 'wrong'],
		message: 'Mã xác thực không hợp lệ',
	},
	verificationCodeExpired: {
		patterns: ['verification code'],
		subPatterns: ['expired', 'timeout'],
		message: 'Mã xác thực đã hết hạn',
	},
	verificationFailed: {
		patterns: ['verification failed', 'verification error', 'code verification failed'],
		message: 'Xác thực mã thất bại',
	},
	otpInvalid: {
		patterns: ['otp'],
		subPatterns: ['invalid', 'wrong'],
		message: 'Mã OTP không hợp lệ',
	},
	otpExpired: {
		patterns: ['otp'],
		subPatterns: ['expired', 'timeout'],
		message: 'Mã OTP đã hết hạn',
	},
	otpUsed: {
		patterns: [
			'otp already used',
			'otp already consumed',
			'otp already verified',
			'otp already validated',
			'otp has been used',
			'otp was already used',
			'verification code already used',
			'verification code already consumed',
			'verification code already verified',
			'code already used',
			'code already consumed',
			'code already verified',
		],
		message: 'Mã OTP đã được sử dụng. Vui lòng yêu cầu mã mới',
	},
	otpError: {
		patterns: [
			'otp error',
			'otp failure',
			'otp verification failed',
			'otp verification error',
			'verification code error',
			'verification code failure',
			'cannot resend otp',
			'otp resend failed',
			'failed to resend otp',
			'otp resend error',
			'cannot resend verification code',
			'verification code resend failed',
			'failed to resend verification code',
			'otp generation failed',
			'failed to generate otp',
			'otp generation error',
			'verification code generation failed',
			'failed to generate verification code',
		],
		message: 'Lỗi xác thực OTP. Vui lòng thử lại hoặc yêu cầu mã mới',
	},
	otpNotFound: {
		patterns: [
			'no valid verification code found',
			'no valid code found',
			'verification code not found',
			'code not found',
			'otp not found',
			'verification code missing',
			'code missing',
			'please request a new code',
			'request a new code',
			'get a new code',
		],
		message: 'Không tìm thấy mã xác thực hợp lệ. Vui lòng yêu cầu mã mới',
	},
	permission: {
		patterns: [
			'forbidden',
			'403',
			'access denied',
			'permission denied',
			'insufficient permissions',
		],
		message: 'Bạn không có quyền thực hiện hành động này',
	},
	notFound: {
		patterns: ['not found', '404', 'resource not found', 'page not found'],
		message: 'Không tìm thấy dữ liệu',
	},
	tokenExpired: {
		patterns: ['token expired', 'session expired', 'jwt expired', 'access token expired'],
		message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
	},
	tokenInvalid: {
		patterns: [
			'invalid token',
			'malformed token',
			'token error',
			'jwt invalid',
			'refresh token',
			'token refresh',
		],
		message: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại',
	},
	verificationTokenInvalid: {
		patterns: [
			'invalid or expired verification token',
			'verification token expired',
			'verification token invalid',
			'expired verification token',
			'invalid verification token',
		],
		message: 'Mã xác thực đã hết hạn hoặc không hợp lệ. Vui lòng xác thực email lại',
	},
	fileUpload: {
		patterns: [
			'file too large',
			'file size exceeded',
			'upload limit',
			'invalid file type',
			'unsupported file',
			'file format',
			'upload failed',
			'upload error',
		],
		message: 'Lỗi tải file. Vui lòng kiểm tra kích thước và định dạng file',
	},
	database: {
		patterns: ['database error', 'db error', 'connection failed', 'query failed'],
		message: 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau',
	},
	generic: {
		patterns: [
			'something went wrong',
			'unexpected error',
			'unknown error',
			'error occurred',
			'bad request',
			'400',
			'invalid request',
			'conflict',
			'409',
			'duplicate',
			'unprocessable',
			'422',
			'validation failed',
		],
		message: 'Đã xảy ra lỗi. Vui lòng thử lại sau',
	},
};

/**
 * Check if message matches any pattern
 */
const matchesPattern = (message: string, pattern: string): boolean => {
	return message.toLowerCase().includes(pattern.toLowerCase());
};

/**
 * Check if message matches pattern with sub-patterns
 */
const matchesPatternWithSub = (
	message: string,
	patterns: string[],
	subPatterns?: string[],
): boolean => {
	const hasMainPattern = patterns.some((pattern) =>
		message.toLowerCase().includes(pattern.toLowerCase()),
	);
	if (!subPatterns) return hasMainPattern;
	return (
		hasMainPattern &&
		subPatterns.some((subPattern) => message.toLowerCase().includes(subPattern.toLowerCase()))
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

	const lowerMessage = errorMessage.toLowerCase();

	// Check each error pattern
	for (const config of Object.values(ERROR_PATTERNS)) {
		if (config.subPatterns) {
			if (matchesPatternWithSub(lowerMessage, config.patterns, config.subPatterns)) {
				return config.message;
			}
		} else {
			if (config.patterns.some((pattern) => matchesPattern(lowerMessage, pattern))) {
				return config.message;
			}
		}
	}

	// Special case for exact matches (case-insensitive)
	for (const config of Object.values(ERROR_PATTERNS)) {
		if (
			config.patterns.some(
				(pattern) =>
					errorMessage.toLowerCase() === pattern.toLowerCase() ||
					errorMessage.toLowerCase().includes(pattern.toLowerCase()),
			)
		) {
			return config.message;
		}
	}

	// Special case for "Email is already registered" exact match
	if (
		errorMessage.toLowerCase().includes('email') &&
		errorMessage.toLowerCase().includes('already') &&
		errorMessage.toLowerCase().includes('registered')
	) {
		return 'Email đã được sử dụng';
	}

	// Special case for email already exists variations
	if (
		errorMessage.toLowerCase().includes('email') &&
		(errorMessage.toLowerCase().includes('already') ||
			errorMessage.toLowerCase().includes('exists') ||
			errorMessage.toLowerCase().includes('taken') ||
			errorMessage.toLowerCase().includes('duplicate'))
	) {
		return 'Email đã được sử dụng';
	}

	// Special case for exact match with "Email is already registered"
	if (
		errorMessage === 'Email is already registered' ||
		errorMessage === 'email is already registered' ||
		errorMessage === 'Email is already registered.' ||
		errorMessage === 'email is already registered.'
	) {
		return 'Email đã được sử dụng';
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
