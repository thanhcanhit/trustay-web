/**
 * Email validation utilities for Vietnamese localized applications
 */

// Email regex pattern - more comprehensive
const EMAIL_REGEX =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates if the email format is correct
 * @param email - The email string to validate
 * @returns boolean - true if valid, false if invalid
 */
export const isValidEmail = (email: string): boolean => {
	if (!email || typeof email !== 'string') {
		return false;
	}

	const trimmedEmail = email.trim();

	// Check if email is not empty after trimming
	if (!trimmedEmail) {
		return false;
	}

	// Check length constraints
	if (trimmedEmail.length > 254) {
		return false;
	}

	// Check regex pattern
	if (!EMAIL_REGEX.test(trimmedEmail)) {
		return false;
	}

	// Additional checks
	const parts = trimmedEmail.split('@');
	if (parts.length !== 2) {
		return false;
	}

	const [localPart, domain] = parts;

	// Local part cannot be longer than 64 characters
	if (localPart.length > 64) {
		return false;
	}

	// Domain part checks
	if (domain.length > 253) {
		return false;
	}

	// Check for consecutive dots
	if (trimmedEmail.includes('..')) {
		return false;
	}

	// Check for leading/trailing dots in local part
	if (localPart.startsWith('.') || localPart.endsWith('.')) {
		return false;
	}

	return true;
};

/**
 * Gets email validation error message in Vietnamese
 * @param email - The email string to validate
 * @returns string - Empty string if valid, error message if invalid
 */
export const getEmailValidationError = (email: string): string => {
	if (!email || typeof email !== 'string') {
		return 'Email là bắt buộc';
	}

	const trimmedEmail = email.trim();

	if (!trimmedEmail) {
		return 'Email là bắt buộc';
	}

	if (trimmedEmail.length > 254) {
		return 'Email quá dài (tối đa 254 ký tự)';
	}

	if (!EMAIL_REGEX.test(trimmedEmail)) {
		return 'Email không đúng định dạng (VD: example@domain.com)';
	}

	const parts = trimmedEmail.split('@');
	if (parts.length !== 2) {
		return 'Email phải chứa đúng một ký tự @';
	}

	const [localPart, domain] = parts;

	if (localPart.length > 64) {
		return 'Phần tên email quá dài (tối đa 64 ký tự trước @)';
	}

	if (domain.length > 253) {
		return 'Tên miền email quá dài';
	}

	if (trimmedEmail.includes('..')) {
		return 'Email không được chứa hai dấu chấm liên tiếp';
	}

	if (localPart.startsWith('.') || localPart.endsWith('.')) {
		return 'Email không được bắt đầu hoặc kết thúc bằng dấu chấm';
	}

	// If we reach here, the email is valid
	return '';
};

/**
 * Cleans and formats email input
 * @param email - The raw email input
 * @returns string - Cleaned email
 */
export const cleanEmail = (email: string): string => {
	if (!email || typeof email !== 'string') {
		return '';
	}

	return email.trim().toLowerCase();
};
