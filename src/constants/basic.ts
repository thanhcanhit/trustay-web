//import { RoomType} from '@/utils/room-types'
export const ROOM_TYPE_LABELS = {
	BOARDING_HOUSE: 'Nhà trọ',
	DORMITORY: 'Ký túc xá',
	SLEEPBOX: 'Sleepbox',
	APARTMENT: 'Căn hộ',
	WHOLE_HOUSE: 'Nhà nguyên căn',
} as const;

export const CONTRACT_SIGN = {
	daft: 'Bản nháp',
	pending_signatures: 'Chờ ký',
	partially_signed: 'Đã ký một phần',
	fully_signed: 'Đã ký đầy đủ',
	active: 'Đang hoạt động',
	expired: 'Hết hạn',
	terminated: 'Đã chấm dứt',
} as const;

export const STATUS_COLORS = {
	draft: 'bg-gray-100 text-gray-800',
	pending_signatures: 'bg-yellow-100 text-yellow-800',
	partially_signed: 'bg-orange-100 text-orange-800',
	fully_signed: 'bg-green-100 text-green-800',
	active: 'bg-green-100 text-green-800',
	expired: 'bg-red-100 text-red-800',
	terminated: 'bg-red-100 text-red-800',
	signed: 'bg-green-100 text-green-800',
	cancelled: 'bg-red-100 text-red-800',
} as const;

export const CONTRACT_TYPE_LABELS = {
	monthly_rental: 'Thuê theo tháng',
	fixed_term_rental: 'Thuê có thời hạn',
	short_term_rental: 'Thuê ngắn hạn',
} as const;
