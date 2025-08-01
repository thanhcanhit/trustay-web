// Mock data for properties, rooms, and bookings

export interface Property {
	id: string;
	name: string;
	address: string;
	district: string;
	city: string;
	totalRooms: number;
	occupiedRooms: number;
	monthlyRevenue: number;
	images: string[];
	description: string;
	amenities: string[];
	createdAt: string;
	status: 'active' | 'inactive';
	isHot?: boolean; // Đánh dấu phòng nổi bật
	rating?: number; // Đánh giá trung bình
	reviewCount?: number; // Số lượng đánh giá
}

// Interface cho bài đăng tìm bạn cùng phòng
export interface RoommatePost {
	id: string;
	title: string;
	description: string;
	authorId: string;
	authorName: string;
	authorAvatar?: string;
	location: string;
	district: string;
	city: string;
	budget: number;
	preferredGender: 'male' | 'female' | 'any';
	moveInDate: string;
	contactInfo: {
		phone?: string;
		email?: string;
		facebook?: string;
	};
	requirements: string[];
	images: string[];
	createdAt: string;
	status: 'active' | 'inactive';
	isHot?: boolean;
}

export interface Room {
	id: string;
	propertyId: string;
	roomNumber: string;
	price: number;
	area: number;
	status: 'available' | 'occupied' | 'maintenance';
	tenantId?: string;
	tenantName?: string;
	tenantPhone?: string;
	contractStart?: string;
	contractEnd?: string;
	images: string[];
	amenities: string[];
}

export interface Booking {
	id: string;
	propertyId: string;
	roomId: string;
	tenantId: string;
	tenantName: string;
	tenantPhone: string;
	tenantEmail: string;
	checkIn: string;
	checkOut?: string;
	monthlyRent: number;
	deposit: number;
	status: 'active' | 'pending' | 'expired' | 'cancelled';
	contractSigned: boolean;
}

export interface SavedProperty {
	id: string;
	propertyId: string;
	tenantId: string;
	savedAt: string;
}

export interface Review {
	id: string;
	propertyId: string;
	tenantId: string;
	tenantName: string;
	rating: number;
	comment: string;
	createdAt: string;
	images?: string[];
}

// Mock Properties
export const mockProperties: Property[] = [
	{
		id: 'prop-1',
		name: 'Cho thuê phòng đầy đủ tiện nghi hòa hòn...',
		address: '123 Đường Nguyễn Văn Cừ',
		district: 'Cẩm Lệ',
		city: 'Thành phố Đà Nẵng',
		totalRooms: 12,
		occupiedRooms: 10,
		monthlyRevenue: 25000000,
		images: ['/images/room1.jpg', '/images/room1-2.jpg'],
		description: 'Nhà trọ, phòng trọ',
		amenities: ['WiFi miễn phí', 'Điều hòa', 'Thang máy', 'Bảo vệ 24/7'],
		createdAt: '2024-01-15',
		status: 'active',
		isHot: true,
		rating: 4.8,
		reviewCount: 25,
	},
	{
		id: 'prop-2',
		name: 'Cho thuê căn hộ Nguyễn Văn Đậu ...',
		address: '456 Đường Lê Văn Sỹ',
		district: 'Bình Thạnh',
		city: 'Thành phố Hồ Chí Minh',
		totalRooms: 8,
		occupiedRooms: 6,
		monthlyRevenue: 18000000,
		images: ['/images/room2.jpg'],
		description: 'Căn hộ',
		amenities: ['WiFi', 'Máy giặt chung', 'Bếp chung', 'Gửi xe miễn phí'],
		createdAt: '2024-02-01',
		status: 'active',
		isHot: true,
		rating: 4.5,
		reviewCount: 35,
	},
	{
		id: 'prop-3',
		name: '27 Lâm Hạ, Bố Đề, Long Biên, Hà Nội',
		address: '27 Lâm Hạ, Bố Đề',
		district: 'Long Biên',
		city: 'Thành phố Hà Nội',
		totalRooms: 20,
		occupiedRooms: 15,
		monthlyRevenue: 35000000,
		images: ['/images/room3.jpg'],
		description: 'Nhà trọ, phòng trọ',
		amenities: ['WiFi tốc độ cao', 'Gym', 'Sân thượng', 'Căng tin'],
		createdAt: '2024-01-10',
		status: 'active',
		isHot: true,
		rating: 4.7,
		reviewCount: 20,
	},
	{
		id: 'prop-4',
		name: 'Cho thuê phòng trọ thoáng mát nhà...',
		address: '789 Đường Võ Văn Tần',
		district: 'Quận 12',
		city: 'Thành phố Hồ Chí Minh',
		totalRooms: 15,
		occupiedRooms: 12,
		monthlyRevenue: 28000000,
		images: ['/images/room4.jpg'],
		description: 'Nhà trọ, phòng trọ',
		amenities: ['WiFi miễn phí', 'Điều hòa', 'Máy giặt', 'Bảo vệ'],
		createdAt: '2024-01-20',
		status: 'active',
		isHot: true,
		rating: 4.6,
		reviewCount: 20,
	},
];

// Mock Rooms
export const mockRooms: Room[] = [
	{
		id: 'room-1',
		propertyId: 'prop-1',
		roomNumber: 'A101',
		price: 2500000,
		area: 25,
		status: 'available',
		images: ['/images/room1.jpg'],
		amenities: ['Điều hòa', 'Tủ lạnh', 'Giường', 'Tủ quần áo'],
	},
	{
		id: 'room-2',
		propertyId: 'prop-2',
		roomNumber: 'A102',
		price: 7500000,
		area: 35,
		status: 'available',
		images: ['/images/room2.jpg'],
		amenities: ['Điều hòa', 'Tủ lạnh', 'Giường', 'Tủ quần áo', 'Ban công'],
	},
	{
		id: 'room-3',
		propertyId: 'prop-3',
		roomNumber: 'B201',
		price: 3700000,
		area: 20,
		status: 'available',
		images: ['/images/room3.jpg'],
		amenities: ['Điều hòa', 'Giường', 'Tủ quần áo'],
	},
	{
		id: 'room-4',
		propertyId: 'prop-4',
		roomNumber: 'C301',
		price: 2000000,
		area: 20,
		status: 'available',
		images: ['/images/room4.jpg'],
		amenities: ['Điều hòa', 'Giường', 'Tủ quần áo', 'WiFi'],
	},
];

// Mock Roommate Posts
export const mockRoommatePosts: RoommatePost[] = [
	{
		id: 'roommate-1',
		title: 'Tìm bạn nữ ở ghép quận 1, gần trường ĐH Kinh tế',
		description:
			'Mình là nữ, 22 tuổi, sinh viên năm 3. Tìm bạn nữ cùng ở ghép, sạch sẽ, không hút thuốc.',
		authorId: 'user-1',
		authorName: 'Nguyễn Thị Mai',
		authorAvatar: '/avatars/user1.jpg',
		location: 'Gần trường ĐH Kinh tế',
		district: 'Quận 1',
		city: 'TP.HCM',
		budget: 2500000,
		preferredGender: 'female',
		moveInDate: '2024-03-01',
		contactInfo: {
			phone: '0123456789',
			facebook: 'mai.nguyen',
		},
		requirements: ['Không hút thuốc', 'Sạch sẽ', 'Sinh viên'],
		images: ['/images/roommate1.jpg'],
		createdAt: '2024-02-15',
		status: 'active',
		isHot: true,
	},
	{
		id: 'roommate-2',
		title: 'Nam sinh viên tìm bạn cùng phòng quận 7',
		description: 'Mình là nam, 21 tuổi, học IT. Tìm bạn nam ở ghép, chia sẻ chi phí sinh hoạt.',
		authorId: 'user-2',
		authorName: 'Trần Văn Nam',
		location: 'Quận 7, gần Lotte Mart',
		district: 'Quận 7',
		city: 'TP.HCM',
		budget: 3000000,
		preferredGender: 'male',
		moveInDate: '2024-03-15',
		contactInfo: {
			phone: '0987654321',
			email: 'nam.tran@email.com',
		},
		requirements: ['Sinh viên', 'Không ồn ào', 'Chia sẻ chi phí'],
		images: ['/images/roommate2.jpg'],
		createdAt: '2024-02-20',
		status: 'active',
		isHot: true,
	},
	{
		id: 'roommate-3',
		title: 'Tìm bạn ở ghép Hà Nội, khu vực Cầu Giấy',
		description: 'Mình làm việc tại khu vực Cầu Giấy, tìm bạn ở ghép để tiết kiệm chi phí.',
		authorId: 'user-3',
		authorName: 'Lê Thị Hoa',
		location: 'Cầu Giấy, Hà Nội',
		district: 'Cầu Giấy',
		city: 'Hà Nội',
		budget: 4000000,
		preferredGender: 'any',
		moveInDate: '2024-04-01',
		contactInfo: {
			phone: '0369852147',
		},
		requirements: ['Đi làm', 'Chia sẻ việc nhà', 'Thân thiện'],
		images: ['/images/roommate3.jpg'],
		createdAt: '2024-02-25',
		status: 'active',
		isHot: true,
	},
	{
		id: 'roommate-4',
		title: 'Tìm bạn nữ ở ghép Đà Nẵng, gần biển',
		description: 'Mình làm việc tại Đà Nẵng, muốn tìm bạn nữ ở ghép gần biển, yên tĩnh.',
		authorId: 'user-4',
		authorName: 'Phạm Thị Lan',
		location: 'Gần biển Mỹ Khê',
		district: 'Sơn Trà',
		city: 'Đà Nẵng',
		budget: 3500000,
		preferredGender: 'female',
		moveInDate: '2024-03-20',
		contactInfo: {
			phone: '0147258369',
			email: 'lan.pham@email.com',
		},
		requirements: ['Yên tĩnh', 'Không mang bạn về', 'Chia sẻ chi phí'],
		images: ['/images/roommate4.jpg'],
		createdAt: '2024-02-28',
		status: 'active',
		isHot: true,
	},
];

// Mock Bookings
export const mockBookings: Booking[] = [
	{
		id: 'booking-1',
		propertyId: 'prop-1',
		roomId: 'room-1',
		tenantId: 'tenant-1',
		tenantName: 'Nguyễn Văn An',
		tenantPhone: '0123456789',
		tenantEmail: 'tenant@demo.com',
		checkIn: '2024-01-01',
		monthlyRent: 2500000,
		deposit: 5000000,
		status: 'active',
		contractSigned: true,
	},
	{
		id: 'booking-2',
		propertyId: 'prop-2',
		roomId: 'room-3',
		tenantId: 'tenant-2',
		tenantName: 'Trần Thị Bình',
		tenantPhone: '0987654321',
		tenantEmail: 'tenant2@demo.com',
		checkIn: '2024-02-01',
		monthlyRent: 2200000,
		deposit: 4400000,
		status: 'active',
		contractSigned: true,
	},
];

// Mock Saved Properties
export const mockSavedProperties: SavedProperty[] = [
	{
		id: 'saved-1',
		propertyId: 'prop-2',
		tenantId: 'tenant-1',
		savedAt: '2024-01-20',
	},
	{
		id: 'saved-2',
		propertyId: 'prop-3',
		tenantId: 'tenant-1',
		savedAt: '2024-01-25',
	},
];

// Mock Reviews
export const mockReviews: Review[] = [
	{
		id: 'review-1',
		propertyId: 'prop-1',
		tenantId: 'tenant-1',
		tenantName: 'Nguyễn Văn An',
		rating: 5,
		comment: 'Phòng trọ rất tốt, sạch sẽ, chủ trọ thân thiện. Rất hài lòng!',
		createdAt: '2024-01-15',
		images: ['/images/review1.jpg'],
	},
	{
		id: 'review-2',
		propertyId: 'prop-2',
		tenantId: 'tenant-2',
		tenantName: 'Trần Thị Bình',
		rating: 4,
		comment: 'Vị trí thuận tiện, giá cả hợp lý. Chỉ có điều hơi ồn vào buổi tối.',
		createdAt: '2024-02-10',
	},
];

// Helper functions
export const getPropertiesByOwner = (ownerId: string): Property[] => {
	// In real app, filter by ownerId
	return mockProperties;
};

export const getRoomsByProperty = (propertyId: string): Room[] => {
	return mockRooms.filter((room) => room.propertyId === propertyId);
};

export const getBookingsByProperty = (propertyId: string): Booking[] => {
	return mockBookings.filter((booking) => booking.propertyId === propertyId);
};

export const getSavedPropertiesByTenant = (tenantId: string): Property[] => {
	const savedPropertyIds = mockSavedProperties
		.filter((saved) => saved.tenantId === tenantId)
		.map((saved) => saved.propertyId);

	return mockProperties.filter((property) => savedPropertyIds.includes(property.id));
};

// Get hot properties for homepage
export const getHotProperties = (): Property[] => {
	return mockProperties.filter((property) => property.isHot);
};

// Get hot roommate posts for homepage
export const getHotRoommatePosts = (): RoommatePost[] => {
	return mockRoommatePosts.filter((post) => post.isHot);
};

// Get property with room details
export const getPropertyWithRoom = (propertyId: string): (Property & { room: Room }) | null => {
	const property = mockProperties.find((p) => p.id === propertyId);
	const room = mockRooms.find((r) => r.propertyId === propertyId);

	if (property && room) {
		return { ...property, room };
	}

	return null;
};

export const getReviewsByTenant = (tenantId: string): Review[] => {
	return mockReviews.filter((review) => review.tenantId === tenantId);
};
