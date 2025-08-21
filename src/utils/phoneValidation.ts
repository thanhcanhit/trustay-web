/**
 * Vietnamese phone number validation utilities
 */

// Vietnamese phone number patterns:
// - 03x, 05x, 07x, 08x, 09x (mobile)
// - 02x (landline - Hanoi)
// - 08x (landline - HCMC)
// - 04x (landline - other provinces)
// - 06x (landline - other provinces)
// - 05x (landline - other provinces)
// - 07x (landline - other provinces)
// - 08x (landline - other provinces)
// - 09x (landline - other provinces)
export const VIETNAMESE_PHONE_REGEX = /^(0(3|5|7|8|9)[0-9]{8}|0[2-9][0-9]{7})$/;

/**
 * Validates if a phone number is a valid Vietnamese phone number
 * @param phone - The phone number to validate
 * @returns boolean - True if phone number is valid
 */
export const isValidVietnamesePhone = (phone: string): boolean => {
	if (!phone || typeof phone !== 'string') return false;

	// Remove all non-digit characters
	const cleanPhone = phone.replace(/\D/g, '');

	// Check if it matches Vietnamese phone pattern
	return VIETNAMESE_PHONE_REGEX.test(cleanPhone);
};

/**
 * Formats a Vietnamese phone number for display
 * @param phone - The phone number to format
 * @returns string - Formatted phone number
 */
export const formatVietnamesePhone = (phone: string): string => {
	if (!phone || typeof phone !== 'string') return phone;

	// Remove all non-digit characters
	const cleanPhone = phone.replace(/\D/g, '');

	// Format based on length
	if (cleanPhone.length === 10) {
		return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
	} else if (cleanPhone.length === 11) {
		return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
	}

	return phone;
};

/**
 * Gets validation error message for phone number
 * @param phone - The phone number to validate
 * @returns string - Error message or empty string if valid
 */
export const getPhoneValidationError = (phone: string): string => {
	if (!phone || phone.trim() === '') {
		return 'Số điện thoại là bắt buộc';
	}

	if (!isValidVietnamesePhone(phone)) {
		return 'Số điện thoại phải là số điện thoại Việt Nam hợp lệ';
	}

	return '';
};

/**
 * Cleans phone number by removing non-digit characters
 * @param phone - The phone number to clean
 * @returns string - Cleaned phone number
 */
export const cleanPhoneNumber = (phone: string): string => {
	if (!phone || typeof phone !== 'string') return '';
	return phone.replace(/\D/g, '');
};
