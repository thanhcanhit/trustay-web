import { create } from 'zustand';
import { getAmenities, getAppEnums, getCostTypes, getRules } from '@/actions/reference.action';

// Types for reference data
export interface Amenity {
	id: string;
	name: string;
	category: string;
	description?: string;
	icon?: string;
	isActive?: boolean;
}

export interface CostType {
	id: string;
	name: string;
	category: string;
	unit?: string;
	isActive?: boolean;
}

export interface Rule {
	id: string;
	name: string;
	category: string;
	ruleType: string;
	description?: string;
	isActive?: boolean;
}

export interface AppEnums {
	gender: string[];
	userRole: string[];
	roomType: string[];
	bookingStatus: string[];
	rentalStatus: string[];
	invitationStatus: string[];
	billStatus: string[];
	paymentType: string[];
	paymentMethod: string[];
	paymentStatus: string[];
	reviewerType: string[];
	amenityCategory: string[];
	costCategory: string[];
	ruleCategory: string[];
	ruleType: string[];
	costType: string[];
	billingCycle: string[];
	visibility: string[];
	searchPostStatus: string[];
	verificationType: string[];
	verificationStatus: string[];
}

// Vietnamese translations for enums
export const enumTranslations: Record<string, Record<string, string>> = {
	gender: {
		MALE: 'Nam',
		FEMALE: 'Nữ',
		OTHER: 'Khác',
	},
	userRole: {
		TENANT: 'Người thuê',
		LANDLORD: 'Chủ trọ',
	},
	roomType: {
		BOARDING_HOUSE: 'Nhà trọ',
		DORMITORY: 'Ký túc xá',
		SLEEPBOX: 'Sleepbox',
		APARTMENT: 'Căn hộ',
		WHOLE_HOUSE: 'Nhà nguyên căn',
	},
	bookingStatus: {
		PENDING: 'Chờ xử lý',
		APPROVED: 'Đã duyệt',
		REJECTED: 'Bị từ chối',
		CANCELLED: 'Đã hủy',
	},
	rentalStatus: {
		ACTIVE: 'Đang hoạt động',
		TERMINATED: 'Đã chấm dứt',
		EXPIRED: 'Đã hết hạn',
		PENDING_RENEWAL: 'Chờ gia hạn',
	},
	invitationStatus: {
		PENDING: 'Chờ xử lý',
		ACCEPTED: 'Đã chấp nhận',
		DECLINED: 'Đã từ chối',
		EXPIRED: 'Đã hết hạn',
	},
	billStatus: {
		DRAFT: 'Bản nháp',
		PENDING: 'Chờ thanh toán',
		PAID: 'Đã thanh toán',
		OVERDUE: 'Quá hạn',
		CANCELLED: 'Đã hủy',
	},
	paymentType: {
		RENT: 'Tiền thuê',
		DEPOSIT: 'Tiền cọc',
		UTILITY: 'Tiền điện nước',
		FEE: 'Phí dịch vụ',
		REFUND: 'Hoàn tiền',
	},
	paymentMethod: {
		BANK_TRANSFER: 'Chuyển khoản',
		CASH: 'Tiền mặt',
		E_WALLET: 'Ví điện tử',
		CARD: 'Thẻ',
	},
	paymentStatus: {
		PENDING: 'Chờ xử lý',
		COMPLETED: 'Hoàn thành',
		FAILED: 'Thất bại',
		REFUNDED: 'Đã hoàn tiền',
	},
	reviewerType: {
		TENANT: 'Người thuê',
		OWNER: 'Chủ sở hữu',
	},
	amenityCategory: {
		BASIC: 'Cơ bản',
		KITCHEN: 'Nhà bếp',
		BATHROOM: 'Phòng tắm',
		ENTERTAINMENT: 'Giải trí',
		SAFETY: 'An toàn',
		CONNECTIVITY: 'Kết nối',
		BUILDING: 'Tòa nhà',
	},
	costCategory: {
		UTILITY: 'Tiện ích',
		SERVICE: 'Dịch vụ',
		PARKING: 'Gửi xe',
		MAINTENANCE: 'Bảo trì',
	},
	ruleCategory: {
		SMOKING: 'Hút thuốc',
		PETS: 'Thú cưng',
		VISITORS: 'Khách',
		NOISE: 'Tiếng ồn',
		CLEANLINESS: 'Vệ sinh',
		SECURITY: 'An ninh',
		USAGE: 'Sử dụng',
		OTHER: 'Khác',
	},
	ruleType: {
		ALLOWED: 'Được phép',
		FORBIDDEN: 'Cấm',
		REQUIRED: 'Bắt buộc',
		CONDITIONAL: 'Có điều kiện',
	},
	costType: {
		FIXED: 'Cố định',
		PER_UNIT: 'Theo đơn vị',
		METERED: 'Theo đồng hồ',
		PERCENTAGE: 'Theo phần trăm',
		TIERED: 'Theo bậc',
	},
	billingCycle: {
		DAILY: 'Hàng ngày',
		WEEKLY: 'Hàng tuần',
		MONTHLY: 'Hàng tháng',
		QUARTERLY: 'Hàng quý',
		YEARLY: 'Hàng năm',
		PER_USE: 'Theo lần sử dụng',
	},
	visibility: {
		ANYONECANFIND: 'Ai cũng có thể tìm thấy',
		ANYONEWITHLINK: 'Ai có link đều xem được',
		DOMAINCANFIND: 'Domain có thể tìm thấy',
		DOMAINWITHLINK: 'Domain với link',
		LIMITED: 'Hạn chế',
	},
	searchPostStatus: {
		ACTIVE: 'Đang hoạt động',
		PAUSED: 'Tạm dừng',
		CLOSED: 'Đã đóng',
		EXPIRED: 'Đã hết hạn',
	},
	verificationType: {
		EMAIL: 'Email',
		PHONE: 'Điện thoại',
		PASSWORD_RESET: 'Đặt lại mật khẩu',
	},
	verificationStatus: {
		PENDING: 'Chờ xử lý',
		VERIFIED: 'Đã xác minh',
		EXPIRED: 'Đã hết hạn',
		FAILED: 'Thất bại',
	},
};

interface ReferenceState {
	// Data
	amenities: Amenity[];
	costTypes: CostType[];
	rules: Rule[];
	enums: AppEnums | null;

	// Loading states
	isLoading: boolean;
	isLoaded: boolean;
	error: string | null;

	// Actions
	loadReferenceData: (force?: boolean) => Promise<void>;
	getAmenitiesByCategory: (category?: string) => Amenity[];
	getCostTypesByCategory: (category?: string) => CostType[];
	getRulesByCategory: (category?: string) => Rule[];
	translateEnum: (enumType: string, value: string) => string;
	clearError: () => void;
	clearCache: () => void;
}

export const useReferenceStore = create<ReferenceState>()((set, get) => ({
	// Initial state
	amenities: [],
	costTypes: [],
	rules: [],
	enums: null,
	isLoading: false,
	isLoaded: false,
	error: null,

	// Load all reference data
	loadReferenceData: async (force = false) => {
		const state = get();
		if (!force && (state.isLoaded || state.isLoading)) return;

		set({ isLoading: true, error: null });

		try {
			// Load all reference data in parallel using server actions
			const [amenities, costTypes, rules, enums] = await Promise.all([
				getAmenities(),
				getCostTypes(),
				getRules(),
				getAppEnums(),
			]);

			set({
				amenities: amenities || [],
				costTypes: costTypes || [],
				rules: rules || [],
				enums: enums || null,
				isLoading: false,
				isLoaded: true,
				error: null,
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to load reference data';
			set({
				isLoading: false,
				error: errorMessage,
			});
			console.error('Failed to load reference data:', error);
		}
	},

	// Get amenities by category
	getAmenitiesByCategory: (category?: string) => {
		const { amenities } = get();
		if (!category) return amenities;
		// Normalize category to match API response (lowercase)
		const normalizedCategory = category.toLowerCase();
		return amenities.filter((amenity) => amenity.category.toLowerCase() === normalizedCategory);
	},

	// Get cost types by category
	getCostTypesByCategory: (category?: string) => {
		const { costTypes } = get();
		if (!category) return costTypes;
		return costTypes.filter((costType) => costType.category === category);
	},

	// Get rules by category
	getRulesByCategory: (category?: string) => {
		const { rules } = get();
		if (!category) return rules;
		return rules.filter((rule) => rule.category === category);
	},

	// Translate enum value to Vietnamese
	translateEnum: (enumType: string, value: string) => {
		const translations = enumTranslations[enumType];
		return translations?.[value] || value;
	},

	// Clear error
	clearError: () => set({ error: null }),

	// Clear cache
	clearCache: () =>
		set({
			amenities: [],
			costTypes: [],
			rules: [],
			enums: null,
			isLoaded: false,
			error: null,
		}),
}));
