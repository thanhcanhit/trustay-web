'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
	Eye, 
	MessageCircle, 
	Heart, 
	Share2, 
	Phone, 
	Mail, 
	Facebook, 
	Zap,
	MapPin,
	Calendar,
	DollarSign,
	User,
	Info
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { RoomSeekingPost, RoommatePost, RentalPost } from '@/types'
import { getRoomTypeDisplayName } from '@/utils/room-types'
import { Decimal } from '@/types/room-seeking'

interface PostDetailProps {
	post: RoomSeekingPost | RoommatePost | RentalPost
	type: 'room-seeking' | 'roommate' | 'rental'
	onContact?: () => void
	onLike?: () => void
	onShare?: () => void
}

const POST_STATUSES = {
	active: { label: 'Đang hoạt động', color: 'bg-green-500' },
	paused: { label: 'Tạm dừng', color: 'bg-yellow-500' },
	closed: { label: 'Đã đóng', color: 'bg-gray-500' },
	inactive: { label: 'Tạm dừng', color: 'bg-yellow-500' },
	expired: { label: 'Hết hạn', color: 'bg-red-500' },
	rented: { label: 'Đã cho thuê', color: 'bg-blue-500' },
	found: { label: 'Đã tìm thấy', color: 'bg-purple-500' },
}

export function PostDetail({ post, type, onContact, onLike, onShare }: PostDetailProps) {
	const [isLiked, setIsLiked] = useState(false)

	// Helper function to convert Decimal to number
	const toNumber = (value: number | Decimal): number => {
		if (typeof value === 'number') {
			return value
		}
		// Convert Decimal object to number
		// Decimal structure: { s: sign, e: exponent, d: digits }
		const sign = value.s || 1
		const exp = value.e || 0
		const digits = value.d || []
		
		// Reconstruct the number from Decimal parts
		let result = 0
		for (let i = 0; i < digits.length; i++) {
			result = result * 10 + digits[i]
		}
		
		// Apply exponent and sign
		result = result * Math.pow(10, exp - digits.length + 1) * sign
		return result
	}

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(price)
	}

	const formatDate = (dateString: string) => {
		return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
	}

	const getStatusBadge = (status: keyof typeof POST_STATUSES) => {
		const statusInfo = POST_STATUSES[status]
		return (
			<Badge className={`${statusInfo.color} text-white`}>
				{statusInfo.label}
			</Badge>
		)
	}

	const handleLike = () => {
		setIsLiked(!isLiked)
		onLike?.()
	}

	const renderRoomSeekingDetail = (post: RoomSeekingPost) => (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h1 className="text-3xl font-bold mb-2">{post.title}</h1>
					<div className="flex items-center gap-4 text-muted-foreground mb-4">
						<div className="flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							Đăng ngày {formatDate(post.createdAt)}
						</div>
						<div className="flex items-center gap-1">
							<MapPin className="h-4 w-4" />
							{(() => {
								const wardName = (post as RoomSeekingPost).preferredWard?.name
								const districtName = (post as RoomSeekingPost).preferredDistrict?.name
								const provinceName = (post as RoomSeekingPost).preferredProvince?.name
								return (
									<>
										{wardName ? `${wardName}, ` : ''}
										{districtName ? `${districtName}, ` : ''}
										{provinceName || 'Khu vực linh hoạt'}
									</>
								)
							})()}
						</div>
						<div className="flex items-center gap-1">
							<DollarSign className="h-4 w-4" />
							{formatPrice(toNumber(post.minBudget))} - {formatPrice(toNumber(post.maxBudget))}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{getStatusBadge(post.status)}
					<div className="flex items-center gap-1 text-muted-foreground">
						<Eye className="h-4 w-4" />
						{post.contactCount} lượt xem
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						Thông tin chi tiết
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<strong>Loại phòng mong muốn:</strong>
							<p className="text-muted-foreground">
								{getRoomTypeDisplayName((post as RoomSeekingPost).preferredRoomType)}
							</p>
						</div>
						<div>
							<strong>Số người sẽ ở:</strong>
							<p className="text-muted-foreground">{post.occupancy} người</p>
						</div>
						<div>
							<strong>Ngày dự định vào ở:</strong>
							<p className="text-muted-foreground">{formatDate(post.moveInDate)}</p>
						</div>
						<div>
							<strong>Ngày hết hạn:</strong>
							<p className="text-muted-foreground">{formatDate(post.expiresAt)}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Mô tả</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground whitespace-pre-wrap">{post.description}</p>
				</CardContent>
			</Card>
		</div>
	)

	const renderRoommateDetail = (post: RoommatePost) => (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h1 className="text-3xl font-bold mb-2">{post.title}</h1>
					<div className="flex items-center gap-4 text-muted-foreground mb-4">
						<div className="flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							Đăng ngày {formatDate(post.createdAt)}
						</div>
						<div className="flex items-center gap-1">
							<MapPin className="h-4 w-4" />
							{post.location}
						</div>
						<div className="flex items-center gap-1">
							<DollarSign className="h-4 w-4" />
							{formatPrice(post.budget)}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{getStatusBadge(post.status)}
					<div className="flex items-center gap-1 text-muted-foreground">
						<MessageCircle className="h-4 w-4" />
						{post.responses} phản hồi
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Thông tin người đăng
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<Avatar className="h-16 w-16">
							<AvatarImage src={post.authorAvatar} />
							<AvatarFallback>
								<User className="h-8 w-8" />
							</AvatarFallback>
						</Avatar>
						<div>
							<h3 className="text-lg font-semibold">{post.authorName}</h3>
							<p className="text-muted-foreground">
								{post.authorGender === 'male' ? 'Nam' : 'Nữ'} • {post.authorAge} tuổi
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						Thông tin chi tiết
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<strong>Giới tính mong muốn:</strong>
							<p className="text-muted-foreground">
								{post.preferredGender === 'male' ? 'Nam' : post.preferredGender === 'female' ? 'Nữ' : 'Không phân biệt'}
							</p>
						</div>
						<div>
							<strong>Độ tuổi mong muốn:</strong>
							<p className="text-muted-foreground">{post.preferredAgeRange?.min}-{post.preferredAgeRange?.max} tuổi</p>
						</div>
						<div>
							<strong>Ngày dự định vào ở:</strong>
							<p className="text-muted-foreground">{formatDate(post.moveInDate)}</p>
						</div>
						<div>
							<strong>Thời gian thuê:</strong>
							<p className="text-muted-foreground">{post.duration} tháng</p>
						</div>
					</div>

					{post.requirements.length > 0 && (
						<div>
							<strong>Yêu cầu:</strong>
							<div className="flex flex-wrap gap-2 mt-2">
								{post.requirements.map((req) => (
									<Badge key={req} variant="outline">{req}</Badge>
								))}
							</div>
						</div>
					)}

					{post.lifestyle.length > 0 && (
						<div>
							<strong>Lối sống:</strong>
							<div className="flex flex-wrap gap-2 mt-2">
								{post.lifestyle.map((life) => (
									<Badge key={life} variant="outline">{life}</Badge>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Mô tả</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground whitespace-pre-wrap">{post.description}</p>
				</CardContent>
			</Card>
		</div>
	)

	const renderRentalDetail = (post: RentalPost) => (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h1 className="text-3xl font-bold mb-2">{post.title}</h1>
					<div className="flex items-center gap-4 text-muted-foreground mb-4">
						<div className="flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							Đăng ngày {formatDate(post.createdAt)}
						</div>
						<div className="flex items-center gap-1">
							<MapPin className="h-4 w-4" />
							{post.address.district}
						</div>
						<div className="flex items-center gap-1">
							<DollarSign className="h-4 w-4" />
							{formatPrice(post.price)}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{getStatusBadge(post.status)}
					<div className="flex items-center gap-1 text-muted-foreground">
						<Eye className="h-4 w-4" />
						{post.views} lượt xem
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						Thông tin phòng
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<strong>Loại phòng:</strong>
							<p className="text-muted-foreground">{post.roomType}</p>
						</div>
						<div>
							<strong>Diện tích:</strong>
							<p className="text-muted-foreground">{post.area}m²</p>
						</div>
						<div>
							<strong>Số người tối đa:</strong>
							<p className="text-muted-foreground">{post.maxOccupants} người</p>
						</div>
						<div>
							<strong>Giới tính ưu tiên:</strong>
							<p className="text-muted-foreground">
								{post.gender === 'male' ? 'Nam' : post.gender === 'female' ? 'Nữ' : 'Không phân biệt'}
							</p>
						</div>
						<div>
							<strong>Ngày có thể vào ở:</strong>
							<p className="text-muted-foreground">{formatDate(post.availableFrom)}</p>
						</div>
						<div>
							<strong>Tiền cọc:</strong>
							<p className="text-muted-foreground">{formatPrice(post.deposit)}</p>
						</div>
					</div>

					{post.electricityCost && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
							<div>
								<strong>Tiền điện:</strong>
								<p className="text-muted-foreground">{formatPrice(post.electricityCost)}/kWh</p>
							</div>
							{post.waterCost && (
								<div>
									<strong>Tiền nước:</strong>
									<p className="text-muted-foreground">{formatPrice(post.waterCost)}/m³</p>
								</div>
							)}
							{post.internetCost && (
								<div>
									<strong>Tiền internet:</strong>
									<p className="text-muted-foreground">{formatPrice(post.internetCost)}/tháng</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Địa chỉ</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						{post.address.street}, {post.address.ward}, {post.address.district}, {post.address.city}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Mô tả</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground whitespace-pre-wrap">{post.description}</p>
				</CardContent>
			</Card>
		</div>
	)

	const renderContactInfo = () => {
		let contactInfo
		if (type === 'roommate') {
			contactInfo = (post as RoommatePost).contactInfo
		} else if (type === 'rental') {
			contactInfo = (post as RentalPost).contactInfo
		}

		if (!contactInfo) return null

		return (
			<Card>
				<CardHeader>
					<CardTitle>Thông tin liên hệ</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center gap-2">
						<Phone className="h-4 w-4" />
						<span>{contactInfo.phone}</span>
					</div>
					{contactInfo.email && (
						<div className="flex items-center gap-2">
							<Mail className="h-4 w-4" />
							<span>{contactInfo.email}</span>
						</div>
					)}
					{contactInfo.facebook && (
						<div className="flex items-center gap-2">
							<Facebook className="h-4 w-4" />
							<span>{contactInfo.facebook}</span>
						</div>
					)}
					{contactInfo.zalo && (
						<div className="flex items-center gap-2">
							<Zap className="h-4 w-4" />
							<span>{contactInfo.zalo}</span>
						</div>
					)}
				</CardContent>
			</Card>
		)
	}

	const renderContent = () => {
		switch (type) {
			case 'room-seeking':
				return renderRoomSeekingDetail(post as RoomSeekingPost)
			case 'roommate':
				return renderRoommateDetail(post as RoommatePost)
			case 'rental':
				return renderRentalDetail(post as RentalPost)
			default:
				return null
		}
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					{renderContent()}
				</div>
				
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Hành động</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button className="w-full" onClick={onContact}>
								<Phone className="h-4 w-4 mr-2" />
								Liên hệ ngay
							</Button>
							<Button variant="outline" className="w-full" onClick={handleLike}>
								<Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
								{isLiked ? 'Đã thích' : 'Thích'}
							</Button>
							<Button variant="outline" className="w-full" onClick={onShare}>
								<Share2 className="h-4 w-4 mr-2" />
								Chia sẻ
							</Button>
						</CardContent>
					</Card>

					{renderContactInfo()}
				</div>
			</div>
		</div>
	)
}
