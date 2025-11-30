/**
 * Password validation utilities
 */

import { checkPasswordStrength } from '@/actions/auth.action';

// Regex pattern for password validation
// At least 6 characters, must contain:
// - At least one lowercase letter
// - At least one uppercase letter
// - At least one digit
// - At least one special character
export const PASSWORD_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{6,}$/;

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

	if (!/[@$!%*?&.]/.test(password)) {
		errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)');
	}

	return errors;
};

/**
 * Enhanced password strength calculation using backend endpoint
 * @param password - The password to evaluate
 * @returns Promise<number> - Strength score from 0 to 100
 */
export const calculatePasswordStrength = async (password: string): Promise<number> => {
	if (!password) return 0;

	try {
		const score = await checkPasswordStrength(password);
		return Math.min(score, 100);
	} catch (error) {
		console.error('Error calculating password strength:', error);
		// Fallback to simple calculation if backend fails
		let strength = 0;
		if (password.length >= 6) strength += 20;
		if (password.length >= 8) strength += 10;
		if (password.length >= 12) strength += 10;
		if (/[a-z]/.test(password)) strength += 15;
		if (/[A-Z]/.test(password)) strength += 15;
		if (/\d/.test(password)) strength += 15;
		if (/[@$!%*?&]/.test(password)) strength += 15;
		return Math.min(strength, 100);
	}
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
