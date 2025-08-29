/**
 * Utility functions for room type handling
 */

export type RoomType = 'boarding_house' | 'dormitory' | 'sleepbox' | 'apartment' | 'whole_house';

export const ROOM_TYPE_TRANSLATIONS: Record<RoomType, string> = {
	boarding_house: 'Nhà trọ',
	dormitory: 'Ký túc xá',
	sleepbox: 'Sleepbox',
	apartment: 'Căn hộ',
	whole_house: 'Nhà nguyên căn',
};

/**
 * Convert English room type to Vietnamese display name
 */
export function getRoomTypeDisplayName(roomType: string): string {
	const normalizedType = roomType.toLowerCase() as RoomType;
	return ROOM_TYPE_TRANSLATIONS[normalizedType] || roomType;
}

/**
 * Get all room types with Vietnamese labels for use in forms/filters
 */
export function getRoomTypeOptions() {
	return Object.entries(ROOM_TYPE_TRANSLATIONS).map(([value, label]) => ({
		value,
		label,
	}));
}
