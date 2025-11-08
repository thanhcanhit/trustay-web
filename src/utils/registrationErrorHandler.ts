/**
 * Centralized error handling utilities for registration form
 */

import { getEmailValidationError } from './emailValidation';
import { translateRegistrationError, translateVerificationError } from './errorTranslation';
import { getPasswordValidationErrors, validatePassword } from './passwordValidation';
import { getPhoneValidationError, isValidVietnamesePhone } from './phoneValidation';

// Types
export type ValidationErrors = {
	email?: string;
	password?: string;
	confirmPassword?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	general?: string;
};

export type FormData = {
	email: string;
	password: string;
	confirmPassword: string;
	firstName: string;
	lastName: string;
	phone: string;
};

// Error handler class for registration
export class RegistrationErrorHandler {
	private errors: ValidationErrors = {};

	// Clear all errors
	clearAll(): void {
		this.errors = {};
	}

	// Clear specific field error
	clearField(field: keyof ValidationErrors): void {
		delete this.errors[field];
	}

	// Set error for specific field
	setError(field: keyof ValidationErrors, message: string): void {
		this.errors[field] = message;
	}

	// Get all errors
	getErrors(): ValidationErrors {
		return { ...this.errors };
	}

	// Check if has any errors
	hasErrors(): boolean {
		return Object.keys(this.errors).length > 0;
	}

	// Get first error message
	getFirstError(): string | null {
		const errorValues = Object.values(this.errors);
		return errorValues.length > 0 ? errorValues[0] : null;
	}

	// Validate all form fields and collect errors
	validateForm(formData: FormData): ValidationErrors {
		const errors: ValidationErrors = {};

		// Required field validation
		if (!formData.email) {
			errors.email = 'Email là bắt buộc!';
		} else {
			const emailError = getEmailValidationError(formData.email);
			if (emailError) {
				errors.email = emailError;
			}
		}

		if (!formData.password) {
			errors.password = 'Mật khẩu là bắt buộc!';
		} else if (!validatePassword(formData.password)) {
			const passwordErrors = getPasswordValidationErrors(formData.password);
			errors.password = `Mật khẩu không đủ mạnh:\n${passwordErrors.join('\n')}`;
		}

		if (!formData.confirmPassword) {
			errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc!';
		} else if (
			formData.password &&
			formData.confirmPassword &&
			formData.password !== formData.confirmPassword
		) {
			errors.confirmPassword = 'Mật khẩu không khớp!';
		}

		if (!formData.firstName) {
			errors.firstName = 'Tên là bắt buộc!';
		}

		if (!formData.lastName) {
			errors.lastName = 'Họ là bắt buộc!';
		}

		// Phone is now optional - only validate if provided
		if (formData.phone && !isValidVietnamesePhone(formData.phone)) {
			errors.phone = getPhoneValidationError(formData.phone);
		}

		this.errors = errors;
		return errors;
	}

	// Handle field change and clear related errors
	handleFieldChange(field: keyof ValidationErrors, clearGeneral = false): void {
		this.clearField(field);
		if (clearGeneral) {
			this.clearField('general');
		}
	}

	// Handle server errors with smart categorization
	handleServerError(
		error: unknown,
		context: 'registration' | 'verification' = 'registration',
	): {
		errorType: 'phone_conflict' | 'email_conflict' | 'validation' | 'general';
		message: string;
		field?: keyof ValidationErrors;
	} {
		console.error('RegistrationErrorHandler - Processing error:', error);

		const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
		const lowerErrorMessage = errorMessage.toLowerCase();

		console.error('Error message details:', {
			original: errorMessage,
			lowercase: lowerErrorMessage,
			context,
		});

		// Phone number conflict detection
		if (this.isPhoneConflictError(lowerErrorMessage)) {
			const translatedMessage = translateRegistrationError(errorMessage);
			this.setError('phone', translatedMessage);
			return {
				errorType: 'phone_conflict',
				message: translatedMessage,
				field: 'phone',
			};
		}

		// Email conflict detection
		if (this.isEmailConflictError(lowerErrorMessage)) {
			const translatedMessage = translateRegistrationError(errorMessage);
			this.setError('email', translatedMessage);
			return {
				errorType: 'email_conflict',
				message: translatedMessage,
				field: 'email',
			};
		}

		// Phone validation error
		if (this.isPhoneValidationError(lowerErrorMessage)) {
			const phoneError = 'Số điện thoại phải là số điện thoại Việt Nam hợp lệ';
			this.setError('phone', phoneError);
			return {
				errorType: 'validation',
				message: phoneError,
				field: 'phone',
			};
		}

		// Enhanced error translation with fallback
		let translatedError: string;

		if (context === 'verification') {
			translatedError = translateVerificationError(errorMessage);
		} else {
			translatedError = translateRegistrationError(errorMessage);
		}

		// Additional fallback for generic server errors
		if (
			translatedError === errorMessage &&
			(lowerErrorMessage.includes('server error') ||
				lowerErrorMessage.includes('internal error') ||
				lowerErrorMessage.includes('500') ||
				errorMessage === 'Có lỗi xảy ra' ||
				errorMessage === 'Đã xảy ra lỗi')
		) {
			translatedError =
				context === 'verification'
					? 'Lỗi xác thực. Vui lòng thử lại hoặc yêu cầu mã mới'
					: 'Lỗi đăng ký. Vui lòng kiểm tra thông tin và thử lại';
		}

		this.setError('general', translatedError);
		return {
			errorType: 'general',
			message: translatedError,
			field: 'general',
		};
	}

	// Private helper methods for error detection
	private isPhoneConflictError(message: string): boolean {
		return (
			(message.includes('phone') || message.includes('số điện thoại')) &&
			(message.includes('already exists') ||
				message.includes('already used') ||
				message.includes('already in use') ||
				message.includes('is already in use') ||
				message.includes('already registered') ||
				message.includes('taken') ||
				message.includes('in use') ||
				message.includes('duplicate') ||
				message.includes('exists') ||
				message.includes('conflict') ||
				message.includes('registered'))
		);
	}

	private isEmailConflictError(message: string): boolean {
		return (
			(message.includes('email') || message.includes('đã được sử dụng')) &&
			(message.includes('already exists') ||
				message.includes('already used') ||
				message.includes('taken') ||
				message.includes('in use') ||
				message.includes('duplicate') ||
				message.includes('exists') ||
				message.includes('conflict'))
		);
	}

	private isPhoneValidationError(message: string): boolean {
		return (
			message.includes('vietnamese phone number') || message.includes('phone number must be valid')
		);
	}

	// Real-time field validation
	validateField(
		field: keyof ValidationErrors,
		value: string,
		allFormData?: Partial<FormData>,
	): string {
		switch (field) {
			case 'email':
				return value ? getEmailValidationError(value) : 'Email là bắt buộc';

			case 'phone':
				if (!value) return ''; // Phone is optional, so empty is valid
				return isValidVietnamesePhone(value) ? '' : getPhoneValidationError(value);

			case 'password':
				if (!value) return 'Mật khẩu là bắt buộc';
				if (!validatePassword(value)) {
					const passwordErrors = getPasswordValidationErrors(value);
					return `Mật khẩu không đủ mạnh:\n${passwordErrors.join('\n')}`;
				}
				return '';

			case 'confirmPassword':
				if (!value) return 'Xác nhận mật khẩu là bắt buộc';
				if (allFormData?.password && value !== allFormData.password) {
					return 'Mật khẩu không khớp';
				}
				return '';

			case 'firstName':
				return value ? '' : 'Tên là bắt buộc';

			case 'lastName':
				return value ? '' : 'Họ là bắt buộc';

			default:
				return '';
		}
	}
}

// Create singleton instance
export const registrationErrorHandler = new RegistrationErrorHandler();

// Convenience functions
export const clearAllErrors = () => registrationErrorHandler.clearAll();
export const clearFieldError = (field: keyof ValidationErrors) =>
	registrationErrorHandler.clearField(field);
export const setFieldError = (field: keyof ValidationErrors, message: string) =>
	registrationErrorHandler.setError(field, message);
export const getAllErrors = () => registrationErrorHandler.getErrors();
export const hasAnyErrors = () => registrationErrorHandler.hasErrors();
export const getFirstError = () => registrationErrorHandler.getFirstError();
