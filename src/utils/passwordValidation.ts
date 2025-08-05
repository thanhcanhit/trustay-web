/**
 * Password validation utilities
 */

// Regex pattern for password validation
// At least 6 characters, must contain:
// - At least one lowercase letter
// - At least one uppercase letter
// - At least one digit
// - At least one special character
export const PASSWORD_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

/**
 * Validates password against the regex pattern
 * @param password - The password to validate
 * @returns boolean - True if password meets all requirements
 */
export const validatePassword = (password: string): boolean => {
	return PASSWORD_REGEX.test(password);
};

/**
 * Gets detailed password validation errors
 * @param password - The password to validate
 * @returns array of error messages
 */
export const getPasswordValidationErrors = (password: string): string[] => {
	const errors: string[] = [];

	if (password.length < 6) {
		errors.push('Mật khẩu phải có ít nhất 6 ký tự');
	}

	if (!/[a-z]/.test(password)) {
		errors.push('Mật khẩu phải có ít nhất 1 chữ cái thường');
	}

	if (!/[A-Z]/.test(password)) {
		errors.push('Mật khẩu phải có ít nhất 1 chữ cái in hoa');
	}

	if (!/\d/.test(password)) {
		errors.push('Mật khẩu phải có ít nhất 1 chữ số');
	}

	if (!/[@$!%*?&]/.test(password)) {
		errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)');
	}

	return errors;
};

/**
 * Enhanced password strength calculation
 * @param password - The password to evaluate
 * @returns number - Strength score from 0 to 100
 */
export const calculatePasswordStrength = (password: string): number => {
	let strength = 0;

	// Length check (more points for longer passwords)
	if (password.length >= 6) strength += 20;
	if (password.length >= 8) strength += 10;
	if (password.length >= 12) strength += 10;

	// Character type checks
	if (/[a-z]/.test(password)) strength += 15;
	if (/[A-Z]/.test(password)) strength += 15;
	if (/[0-9]/.test(password)) strength += 15;
	if (/[@$!%*?&]/.test(password)) strength += 15;

	return Math.min(strength, 100);
};

/**
 * Gets password strength text description
 * @param strength - Strength score from 0 to 100
 * @returns string - Text description of strength
 */
export const getPasswordStrengthText = (strength: number): string => {
	if (strength < 30) return 'Rất yếu';
	if (strength < 50) return 'Yếu';
	if (strength < 70) return 'Trung bình';
	if (strength < 90) return 'Mạnh';
	return 'Rất mạnh';
};

/**
 * Gets password strength color class
 * @param strength - Strength score from 0 to 100
 * @returns string - CSS color class
 */
export const getPasswordStrengthColor = (strength: number): string => {
	if (strength < 30) return 'bg-red-500';
	if (strength < 50) return 'bg-orange-500';
	if (strength < 70) return 'bg-yellow-500';
	if (strength < 90) return 'bg-blue-500';
	return 'bg-green-500';
};
