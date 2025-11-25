//import { RoomType} from '@/utils/room-types'
export const ROOM_TYPE_LABELS = {
	BOARDING_HOUSE: 'Nhà trọ',
	DORMITORY: 'Ký túc xá',
	SLEEPBOX: 'Sleepbox',
	APARTMENT: 'Căn hộ',
	WHOLE_HOUSE: 'Nhà nguyên căn',
} as const;

// Contract Status Labels - Sử dụng translateContractStatus từ utils để có đầy đủ và nhất quán
export const CONTRACT_SIGN = {
	draft: 'Bản nháp',
	pending_signature: 'Chờ ký',
	partially_signed: 'Đã ký một phần',
	fully_signed: 'Đã ký đầy đủ',
	signed: 'Đã ký',
	active: 'Đang hoạt động',
	expired: 'Hết hạn',
	terminated: 'Đã chấm dứt',
	cancelled: 'Đã hủy',
} as const;

// Contract Status Colors - Sử dụng getContractStatusColor từ utils để có đầy đủ và nhất quán
export const STATUS_COLORS = {
	draft: 'bg-gray-100 text-gray-800',
	pending_signature: 'bg-yellow-100 text-yellow-800',
	partially_signed: 'bg-blue-100 text-blue-800',
	fully_signed: 'bg-green-100 text-green-800',
	signed: 'bg-green-100 text-green-800',
	active: 'bg-green-100 text-green-800',
	expired: 'bg-red-100 text-red-800',
	terminated: 'bg-red-100 text-red-800',
	cancelled: 'bg-gray-100 text-gray-800',
} as const;

export const CONTRACT_TYPE_LABELS = {
	monthly_rental: 'Thuê theo tháng',
	fixed_term_rental: 'Thuê có thời hạn',
	short_term_rental: 'Thuê ngắn hạn',
} as const;
