'use client'

import { PostList } from '@/components/posts/post-list'

// Mock data for demonstration
const mockRoomSeekingPosts = [
	{
		id: '1',
		title: 'Tìm phòng trọ gần trường ĐH Bách Khoa, giá 3-5 triệu',
		description: 'Sinh viên năm 3 tìm phòng trọ gần trường ĐH Bách Khoa, ưu tiên khu vực Quận 1, Quận 3. Cần phòng có điều hòa, wifi, gần chợ và bến xe buýt.',
		slug: 'tim-phong-tro-gan-truong-dh-bach-khoa-gia-3-5-trieu',
		preferredDistrictId: 1,
		preferredWardId: 1,
		preferredProvinceId: 1,
		minBudget: 3000000,
		maxBudget: 5000000,
		currency: 'VND' as const,
		preferredRoomType: 'boarding_house' as const,
		occupancy: 1,
		moveInDate: '2024-02-01',
		isPublic: true,
		expiresAt: '2024-03-01',
		amenityIds: ['wifi', 'ac', 'kitchen'],
		contactCount: 5,
		status: 'active' as const,
		createdAt: '2024-01-15',
		updatedAt: '2024-01-15',
		userId: 'user1',
	},
]

const mockRoommatePosts = [
	{
		id: '1',
		title: 'Tìm bạn cùng trọ gần trường ĐH Bách Khoa, sinh viên ưu tiên',
		description: 'Sinh viên năm 2 tìm bạn cùng trọ để chia sẻ chi phí. Mình thích yên tĩnh, sạch sẽ, không hút thuốc. Có thể nấu ăn chung.',
		authorId: 'user1',
		authorName: 'Nguyễn Văn A',
		authorAvatar: '',
		authorGender: 'male' as const,
		authorAge: 20,
		budget: 3000000,
		preferredGender: 'mixed' as const,
		preferredAgeRange: { min: 18, max: 25 },
		moveInDate: '2024-02-01',
		duration: 12,
		location: 'Gần trường ĐH Bách Khoa, Quận 1',
		address: {
			street: '123 Đường ABC',
			ward: 'Phường 1',
			district: 'Quận 1',
			city: 'TP.HCM',
		},
		requirements: ['Sinh viên', 'Không hút thuốc', 'Sạch sẽ'],
		lifestyle: ['Thích yên tĩnh', 'Nấu ăn thường xuyên'],
		contactInfo: {
			phone: '0123456789',
			email: 'example@email.com',
			facebook: 'facebook.com/example',
			zalo: '0123456789',
		},
		status: 'active' as const,
		views: 25,
		responses: 3,
		createdAt: '2024-01-10',
		updatedAt: '2024-01-10',
	},
]

const mockRentalPosts = [
	{
		id: '1',
		title: 'Cho thuê phòng trọ gần trường ĐH Bách Khoa, đầy đủ tiện nghi',
		description: 'Phòng trọ mới sửa chữa, đầy đủ tiện nghi: điều hòa, wifi, tủ lạnh, máy giặt. Gần chợ, bến xe buýt, thuận tiện đi lại.',
		images: [],
		price: 4500000,
		deposit: 4500000,
		area: 25,
		address: {
			street: '456 Đường XYZ',
			ward: 'Phường 2',
			district: 'Quận 1',
			city: 'TP.HCM',
		},
		amenities: ['wifi', 'ac', 'kitchen', 'washing-machine'],
		rules: [],
		contactInfo: {
			phone: '0987654321',
			email: 'landlord@email.com',
			facebook: 'facebook.com/landlord',
			zalo: '0987654321',
		},
		roomType: 'boarding_house' as const,
		availableFrom: '2024-02-01',
		gender: 'mixed' as const,
		maxOccupants: 2,
		electricityCost: 3500,
		waterCost: 15000,
		internetCost: 200000,
		cleaningCost: 100000,
		parkingCost: 50000,
		isHot: true,
		isPriority: false,
		views: 150,
		likes: 12,
		status: 'active' as const,
		createdAt: '2024-01-05',
		updatedAt: '2024-01-05',
		userId: 'user1',
	},
]

export default function PostsPage() {
	const handleEdit = (postId: string, type: 'room-seeking' | 'roommate' | 'rental') => {
		console.log('Edit post:', postId, type)
		// TODO: Navigate to edit page
	}

	const handleDelete = (postId: string, type: 'room-seeking' | 'roommate' | 'rental') => {
		console.log('Delete post:', postId, type)
		// TODO: Show confirmation dialog and delete
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<PostList
				roomSeekingPosts={mockRoomSeekingPosts}
				roommatePosts={mockRoommatePosts}
				rentalPosts={mockRentalPosts}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	)
}
