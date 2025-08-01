import { Amenity } from '@/types/property';

// Danh sách tiện nghi có sẵn
export const AMENITIES: Amenity[] = [
	// Basic amenities
	{
		id: 'wifi',
		name: 'WiFi miễn phí',
		icon: '📶',
		category: 'basic',
	},
	{
		id: 'parking',
		name: 'Chỗ để xe',
		icon: '🏍️',
		category: 'basic',
	},
	{
		id: 'elevator',
		name: 'Thang máy',
		icon: '🛗',
		category: 'basic',
	},
	{
		id: 'security',
		name: 'Bảo vệ 24/7',
		icon: '🛡️',
		category: 'security',
	},
	{
		id: 'cctv',
		name: 'Camera an ninh',
		icon: '📹',
		category: 'security',
	},
	{
		id: 'fingerprint',
		name: 'Khóa vân tay',
		icon: '👆',
		category: 'security',
	},

	// Furniture
	{
		id: 'bed',
		name: 'Giường',
		icon: '🛏️',
		category: 'furniture',
	},
	{
		id: 'wardrobe',
		name: 'Tủ quần áo',
		icon: '👔',
		category: 'furniture',
	},
	{
		id: 'desk',
		name: 'Bàn làm việc',
		icon: '🪑',
		category: 'furniture',
	},
	{
		id: 'chair',
		name: 'Ghế',
		icon: '🪑',
		category: 'furniture',
	},
	{
		id: 'sofa',
		name: 'Sofa',
		icon: '🛋️',
		category: 'furniture',
	},
	{
		id: 'dining_table',
		name: 'Bàn ăn',
		icon: '🍽️',
		category: 'furniture',
	},

	// Appliances
	{
		id: 'air_conditioner',
		name: 'Điều hòa',
		icon: '❄️',
		category: 'appliance',
	},
	{
		id: 'fan',
		name: 'Quạt',
		icon: '🌀',
		category: 'appliance',
	},
	{
		id: 'refrigerator',
		name: 'Tủ lạnh',
		icon: '🧊',
		category: 'appliance',
	},
	{
		id: 'washing_machine',
		name: 'Máy giặt',
		icon: '🧺',
		category: 'appliance',
	},
	{
		id: 'water_heater',
		name: 'Bình nóng lạnh',
		icon: '🚿',
		category: 'appliance',
	},
	{
		id: 'tv',
		name: 'TV',
		icon: '📺',
		category: 'appliance',
	},
	{
		id: 'microwave',
		name: 'Lò vi sóng',
		icon: '📱',
		category: 'appliance',
	},
	{
		id: 'rice_cooker',
		name: 'Nồi cơm điện',
		icon: '🍚',
		category: 'appliance',
	},
	{
		id: 'induction_cooker',
		name: 'Bếp từ',
		icon: '🔥',
		category: 'appliance',
	},

	// Services
	{
		id: 'cleaning',
		name: 'Dọn dẹp định kỳ',
		icon: '🧹',
		category: 'service',
	},
	{
		id: 'laundry',
		name: 'Giặt ủi',
		icon: '👕',
		category: 'service',
	},
	{
		id: 'food_delivery',
		name: 'Giao đồ ăn',
		icon: '🍕',
		category: 'service',
	},
	{
		id: 'maintenance',
		name: 'Bảo trì sửa chữa',
		icon: '🔧',
		category: 'service',
	},
	{
		id: 'reception',
		name: 'Lễ tân',
		icon: '🏨',
		category: 'service',
	},
];

// Group amenities by category
export const AMENITIES_BY_CATEGORY = {
	basic: AMENITIES.filter((a) => a.category === 'basic'),
	furniture: AMENITIES.filter((a) => a.category === 'furniture'),
	appliance: AMENITIES.filter((a) => a.category === 'appliance'),
	service: AMENITIES.filter((a) => a.category === 'service'),
	security: AMENITIES.filter((a) => a.category === 'security'),
};

// Helper function to get amenity by id
export function getAmenityById(id: string): Amenity | undefined {
	return AMENITIES.find((amenity) => amenity.id === id);
}

// Helper function to get amenities by ids
export function getAmenitiesByIds(ids: string[]): Amenity[] {
	return ids.map((id) => getAmenityById(id)).filter(Boolean) as Amenity[];
}
