// Base interfaces for property management system

export interface Address {
	street: string;
	ward: string;
	district: string;
	city: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
}

export interface ContactInfo {
	phone: string;
	email?: string;
	facebook?: string;
	zalo?: string;
}

export interface Amenity {
	id: string;
	name: string;
	icon?: string;
	category: 'basic' | 'furniture' | 'appliance' | 'service' | 'security';
}

export interface PropertyRule {
	id: string;
	title: string;
	description: string;
	type: 'allowed' | 'forbidden' | 'required';
}

export interface PropertyImage {
	id: string;
	url: string;
	alt?: string;
	isPrimary?: boolean;
	order: number;
}

// Block (Nhà trọ) - Một chủ có thể có nhiều nhà trọ
export interface Block {
	id: string;
	name: string;
	address: Address;
	description?: string;
	images: PropertyImage[];
	amenities: string[]; // Amenity IDs
	rules: PropertyRule[];
	contactInfo: ContactInfo;
	landlordId: string;
	totalFloors: number;
	totalRooms: number;
	occupiedRooms: number;
	monthlyRevenue: number;
	status: 'active' | 'inactive' | 'maintenance';
	createdAt: string;
	updatedAt: string;
}

// Floor (Tầng) - Mỗi nhà có nhiều tầng
export interface Floor {
	id: string;
	blockId: string;
	floorNumber: number;
	name?: string; // VD: "Tầng 1", "Tầng trệt"
	totalRooms: number;
	occupiedRooms: number;
	amenities?: string[]; // Amenities riêng của tầng (VD: máy giặt chung)
	description?: string;
	status: 'active' | 'inactive' | 'maintenance';
	createdAt: string;
	updatedAt: string;
}

// Room (Phòng) - Mỗi tầng có nhiều phòng
export interface Room {
	id: string;
	blockId: string;
	floorId: string;
	roomNumber: string;
	name?: string;
	area: number; // m²
	price: number; // VNĐ/tháng
	deposit: number; // Tiền cọc
	electricityCost?: number; // Tiền điện/kWh
	waterCost?: number; // Tiền nước/m³
	internetCost?: number; // Tiền internet/tháng
	cleaningCost?: number; // Phí vệ sinh/tháng
	parkingCost?: number; // Phí gửi xe/tháng
	maxOccupants: number;
	currentOccupants: number;
	images: PropertyImage[];
	amenities: string[]; // Amenity IDs
	description: string; // Rich text content
	status: 'available' | 'occupied' | 'maintenance' | 'reserved';
	availableFrom?: string; // Ngày có thể vào ở
	gender?: 'male' | 'female' | 'mixed'; // Giới tính ưu tiên
	createdAt: string;
	updatedAt: string;
}

// Property Post (Bài đăng cho thuê) - Để đăng lên website
export interface PropertyPost {
	id: string;
	roomId: string;
	title: string;
	description: string; // Rich text content
	images: PropertyImage[];
	price: number;
	deposit: number;
	area: number;
	address: Address;
	amenities: string[];
	rules: PropertyRule[];
	contactInfo: ContactInfo;
	isHot?: boolean;
	isPriority?: boolean;
	views: number;
	likes: number;
	status: 'active' | 'inactive' | 'expired' | 'rented';
	expiresAt?: string;
	createdAt: string;
	updatedAt: string;
}

// Roommate Post (Bài đăng tìm người ở cùng)
export interface RoommatePost {
	id: string;
	roomId?: string; // Link đến phòng cụ thể (nếu có)
	blockId?: string; // Hoặc link đến nhà trọ
	title: string;
	description: string; // Rich text content
	authorId: string;
	authorName: string;
	authorAvatar?: string;
	authorGender: 'male' | 'female';
	authorAge?: number;
	budget: number;
	preferredGender?: 'male' | 'female' | 'mixed';
	preferredAgeRange?: {
		min: number;
		max: number;
	};
	moveInDate: string;
	duration?: number; // Số tháng muốn ở
	location: string;
	address: Address;
	requirements: string[]; // VD: ["Không hút thuốc", "Sạch sẽ", "Sinh viên"]
	lifestyle: string[]; // VD: ["Thích yên tĩnh", "Hay về muộn", "Nấu ăn thường xuyên"]
	contactInfo: ContactInfo;
	images?: PropertyImage[];
	status: 'active' | 'inactive' | 'expired' | 'found';
	isHot?: boolean;
	views: number;
	responses: number;
	expiresAt?: string;
	createdAt: string;
	updatedAt: string;
}

// Form data types for creating/editing
export interface CreateBlockData {
	name: string;
	address: Address;
	description?: string;
	images: File[];
	amenities: string[];
	rules: Omit<PropertyRule, 'id'>[];
	contactInfo: ContactInfo;
}

export interface CreateRoomData {
	blockId: string;
	floorId: string;
	roomNumber: string;
	name?: string;
	area: number;
	price: number;
	deposit: number;
	electricityCost?: number;
	waterCost?: number;
	internetCost?: number;
	cleaningCost?: number;
	parkingCost?: number;
	maxOccupants: number;
	images: File[];
	amenities: string[];
	description: string;
	availableFrom?: string;
	gender?: 'male' | 'female' | 'mixed';
}

export interface CreatePropertyPostData {
	roomId: string;
	title: string;
	description: string;
	images: File[];
	isPriority?: boolean;
	expiresAt?: string;
}

export interface CreateRoommatePostData {
	roomId?: string;
	blockId?: string;
	title: string;
	description: string;
	authorGender: 'male' | 'female';
	authorAge?: number;
	budget: number;
	preferredGender?: 'male' | 'female' | 'mixed';
	preferredAgeRange?: {
		min: number;
		max: number;
	};
	moveInDate: string;
	duration?: number;
	location: string;
	address: Address;
	requirements: string[];
	lifestyle: string[];
	contactInfo: ContactInfo;
	images?: File[];
	expiresAt?: string;
}
