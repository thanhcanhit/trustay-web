import type { BillStatus, ContractStatus, RentalStatus, RoomStatus } from '@/types/types';

// Contract Status Translation
const contractStatusMap: Record<ContractStatus, string> = {
	draft: 'Bản nháp',
	pending_signatures: 'Chờ ký',
	partially_signed: 'Đã ký một phần',
	fully_signed: 'Đã ký đầy đủ',
	signed: 'Đã ký',
	active: 'Đang hoạt động',
	expired: 'Hết hạn',
	terminated: 'Đã chấm dứt',
	cancelled: 'Đã hủy',
};

// Rental Status Translation
const rentalStatusMap: Record<RentalStatus, string> = {
	active: 'Đang hoạt động',
	pending: 'Chờ xử lý',
	expired: 'Hết hạn',
	terminated: 'Đã chấm dứt',
};

// Bill Status Translation
const billStatusMap: Record<BillStatus, string> = {
	draft: 'Bản nháp',
	pending: 'Chờ thanh toán',
	paid: 'Đã thanh toán',
	overdue: 'Quá hạn',
	cancelled: 'Đã hủy',
};

// Room Status Translation
const roomStatusMap: Record<RoomStatus, string> = {
	available: 'Còn trống',
	occupied: 'Đã cho thuê',
	maintenance: 'Bảo trì',
	reserved: 'Đã đặt trước',
	unavailable: 'Không khả dụng',
};

/**
 * Chuyển đổi contract status từ tiếng Anh sang tiếng Việt
 * @param status - Contract status cần chuyển đổi
 * @returns Tên trạng thái bằng tiếng Việt
 */
export function translateContractStatus(status: ContractStatus): string {
	return contractStatusMap[status] || status;
}

/**
 * Chuyển đổi rental status từ tiếng Anh sang tiếng Việt
 * @param status - Rental status cần chuyển đổi
 * @returns Tên trạng thái bằng tiếng Việt
 */
export function translateRentalStatus(status: RentalStatus): string {
	return rentalStatusMap[status] || status;
}

/**
 * Chuyển đổi bill status từ tiếng Anh sang tiếng Việt
 * @param status - Bill status cần chuyển đổi
 * @returns Tên trạng thái bằng tiếng Việt
 */
export function translateBillStatus(status: BillStatus): string {
	return billStatusMap[status] || status;
}

/**
 * Chuyển đổi room status từ tiếng Anh sang tiếng Việt
 * @param status - Room status cần chuyển đổi
 * @returns Tên trạng thái bằng tiếng Việt
 */
export function translateRoomStatus(status: RoomStatus): string {
	return roomStatusMap[status] || status;
}

/**
 * Lấy màu sắc tương ứng với contract status để hiển thị
 * @param status - Contract status
 * @returns Class name cho màu sắc (Tailwind CSS)
 */
export function getContractStatusColor(status: ContractStatus): string {
	const colorMap: Record<ContractStatus, string> = {
		draft: 'bg-gray-100 text-gray-800',
		pending_signatures: 'bg-yellow-100 text-yellow-800',
		partially_signed: 'bg-blue-100 text-blue-800',
		fully_signed: 'bg-green-100 text-green-800',
		signed: 'bg-green-100 text-green-800',
		active: 'bg-green-100 text-green-800',
		expired: 'bg-red-100 text-red-800',
		terminated: 'bg-red-100 text-red-800',
		cancelled: 'bg-gray-100 text-gray-800',
	};
	return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Lấy màu sắc tương ứng với rental status để hiển thị
 * @param status - Rental status
 * @returns Class name cho màu sắc (Tailwind CSS)
 */
export function getRentalStatusColor(status: RentalStatus): string {
	const colorMap: Record<RentalStatus, string> = {
		active: 'bg-green-100 text-green-800',
		pending: 'bg-yellow-100 text-yellow-800',
		expired: 'bg-red-100 text-red-800',
		terminated: 'bg-red-100 text-red-800',
	};
	return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Lấy màu sắc tương ứng với bill status để hiển thị
 * @param status - Bill status
 * @returns Class name cho màu sắc (Tailwind CSS)
 */
export function getBillStatusColor(status: BillStatus): string {
	const colorMap: Record<BillStatus, string> = {
		draft: 'bg-gray-100 text-gray-800',
		pending: 'bg-yellow-100 text-yellow-800',
		paid: 'bg-green-100 text-green-800',
		overdue: 'bg-red-100 text-red-800',
		cancelled: 'bg-gray-100 text-gray-800',
	};
	return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Lấy màu sắc tương ứng với room status để hiển thị
 * @param status - Room status
 * @returns Class name cho màu sắc (Tailwind CSS)
 */
export function getRoomStatusColor(status: RoomStatus): string {
	const colorMap: Record<RoomStatus, string> = {
		available: 'bg-green-100 text-green-800',
		occupied: 'bg-blue-100 text-blue-800',
		maintenance: 'bg-yellow-100 text-yellow-800',
		reserved: 'bg-purple-100 text-purple-800',
		unavailable: 'bg-gray-100 text-gray-800',
	};
	return colorMap[status] || 'bg-gray-100 text-gray-800';
}
