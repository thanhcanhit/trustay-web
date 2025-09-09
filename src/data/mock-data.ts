// Mock data for roommate functionality only
// Room-related mock data has been removed and replaced with real API calls

export interface RoommatePost {
	id: string;
	title: string;
	description: string;
	authorName: string;
	authorAvatar?: string;
	budget: number;
	location: string;
	district: string;
	city: string;
	moveInDate: string;
	preferredGender: 'male' | 'female' | 'any';
	requirements: string[];
	preferences: string[];
	images: string[];
	contactInfo: {
		phone?: string;
		email?: string;
		facebook?: string;
	};
	isHot: boolean;
	status: 'active' | 'expired' | 'found' | 'paused';
	views: number;
	responses: number;
	createdAt: string;
}

// Mock roommate posts
export const mockRoommatePosts: RoommatePost[] = [
	{
		id: 'rm-1',
		title: 'Tìm bạn nữ ở ghép phòng 2 người - Quận 1',
		description:
			'Mình là nữ, 23 tuổi, làm việc tại quận 1. Tìm bạn nữ cùng ở ghép, sạch sẽ, thân thiện. Phòng có đầy đủ tiện nghi, gần chợ và trường học.',
		authorName: 'Nguyễn Thị B',
		authorAvatar: '/placeholder-avatar.png',
		budget: 2500000,
		location: 'Đường Nguyễn Huệ',
		district: 'Quận 1',
		city: 'TP.HCM',
		moveInDate: '2024-02-01',
		preferredGender: 'female',
		requirements: ['Không hút thuốc', 'Sạch sẽ', 'Không về muộn'],
		preferences: ['Yên tĩnh', 'Học tập', 'Nấu ăn'],
		images: ['/images/error-image.jpg'],
		contactInfo: {
			phone: '0987654321',
			email: 'nguyenthib@email.com',
		},
		isHot: true,
		status: 'active',
		views: 125,
		responses: 8,
		createdAt: '2024-01-15T10:00:00Z',
	},
	{
		id: 'rm-2',
		title: 'Nam sinh viên tìm bạn cùng phòng - Quận Thủ Đức',
		description:
			'Sinh viên năm 3 ĐH Bách Khoa, tìm bạn nam cùng ở ghép. Mình học IT, thích công nghệ và thể thao.',
		authorName: 'Trần Văn C',
		budget: 1800000,
		location: 'Khu phố 6',
		district: 'Quận Thủ Đức',
		city: 'TP.HCM',
		moveInDate: '2024-02-15',
		preferredGender: 'male',
		requirements: ['Sinh viên', 'Không hút thuốc', 'Chia sẻ chi phí'],
		preferences: ['Học tập', 'Thể thao', 'Game'],
		images: ['/images/error-image.jpg'],
		contactInfo: {
			phone: '0123456789',
		},
		isHot: false,
		status: 'expired',
		views: 89,
		responses: 3,
		createdAt: '2024-01-12T14:30:00Z',
	},
	{
		id: 'rm-3',
		title: 'Tìm bạn ở ghép - Không phân biệt giới tính - Quận 7',
		description:
			'Đi làm ổn định, tìm bạn cùng ở để chia sẻ chi phí. Mình rất dễ tính và thân thiện.',
		authorName: 'Lê Thị D',
		budget: 3000000,
		location: 'Đường Nguyễn Thị Thập',
		district: 'Quận 7',
		city: 'TP.HCM',
		moveInDate: '2024-01-25',
		preferredGender: 'any',
		requirements: ['Đi làm ổn định', 'Chia sẻ chi phí'],
		preferences: ['Du lịch', 'Ẩm thực', 'Phim ảnh'],
		images: ['/images/error-image.jpg'],
		contactInfo: {
			phone: '0909123456',
			email: 'lethid@email.com',
		},
		isHot: false,
		status: 'found',
		views: 67,
		responses: 12,
		createdAt: '2024-01-10T09:15:00Z',
	},
];

// Get hot roommate posts
export function getHotRoommatePosts(limit: number = 6): RoommatePost[] {
	return mockRoommatePosts
		.filter((post) => post.isHot)
		.concat(mockRoommatePosts.filter((post) => !post.isHot))
		.slice(0, limit);
}

// Get roommate post by ID
export function getRoommatePostById(id: string): RoommatePost | undefined {
	return mockRoommatePosts.find((post) => post.id === id);
}

// Mock data for dashboard (keeping existing structure)
export const mockProperties = [
	{
		id: 'prop-1',
		name: 'Nhà trọ ABC',
		address: '123 Đường XYZ',
		district: 'Quận 1',
		city: 'TP.HCM',
		totalRooms: 10,
		occupiedRooms: 8,
		monthlyRevenue: 35000000,
		images: ['/images/error-image.jpg'],
		status: 'active',
		amenities: ['Wifi', 'Điều hòa', 'Máy giặt', 'Bảo vệ 24/7'],
	},
	{
		id: 'prop-2',
		name: 'Chung cư mini DEF',
		address: '456 Đường ABC',
		district: 'Quận 3',
		city: 'TP.HCM',
		totalRooms: 15,
		occupiedRooms: 12,
		monthlyRevenue: 63000000,
		images: ['/images/error-image.jpg'],
		status: 'active',
		amenities: ['Wifi', 'Điều hòa', 'Thang máy', 'Bảo vệ 24/7', 'Gửi xe'],
	},
];

// Mock rooms for dashboard only
export const mockRooms = [
	{
		id: 'room-1',
		propertyId: 'prop-1',
		number: '101',
		area: 25,
		price: 3500000,
		status: 'occupied',
		tenantId: 'tenant-1',
		amenities: ['Wifi', 'Điều hòa', 'Tủ lạnh', 'Máy giặt'],
	},
	{
		id: 'room-2',
		propertyId: 'prop-1',
		number: '102',
		area: 25,
		price: 3500000,
		status: 'available',
		tenantId: null,
		amenities: ['Wifi', 'Điều hòa', 'Giường', 'Tủ quần áo'],
	},
];

export const mockBookings = [
	{
		id: 'booking-1',
		propertyId: 'prop-1',
		roomId: 'room-1',
		tenantId: 'tenant-1',
		propertyName: 'Nhà trọ ABC',
		roomNumber: 'Phòng 101',
		tenantName: 'Nguyễn Văn A',
		checkIn: '2024-01-01',
		checkOut: '2024-12-31',
		monthlyRent: 3500000,
		deposit: 7000000,
		status: 'active',
	},
	{
		id: 'booking-2',
		propertyId: 'prop-2',
		roomId: 'room-2',
		tenantId: 'tenant-2',
		propertyName: 'Chung cư mini DEF',
		roomNumber: 'Phòng 205',
		tenantName: 'Trần Thị B',
		checkIn: '2024-01-15',
		checkOut: '2024-07-15',
		monthlyRent: 4200000,
		deposit: 8400000,
		status: 'active',
	},
];
