'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
	Search, 
	Users, 
	Home, 
	Eye, 
	MessageCircle, 
 
	Edit, 
	Trash2, 
	Calendar,
	MapPin,
	DollarSign,
	User
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { RoomSeekingPost, RoommatePost, RentalPost } from '@/types'

interface PostListProps {
	roomSeekingPosts?: RoomSeekingPost[]
	roommatePosts?: RoommatePost[]
	rentalPosts?: RentalPost[]
	onEdit?: (postId: string, type: 'room-seeking' | 'roommate' | 'rental') => void
	onDelete?: (postId: string, type: 'room-seeking' | 'roommate' | 'rental') => void
}

const POST_STATUSES = {
	active: { label: 'Đang hoạt động', color: 'bg-green-500' },
	inactive: { label: 'Tạm dừng', color: 'bg-yellow-500' },
	expired: { label: 'Hết hạn', color: 'bg-red-500' },
	rented: { label: 'Đã cho thuê', color: 'bg-blue-500' },
	found: { label: 'Đã tìm thấy', color: 'bg-purple-500' },
}

export function PostList({ 
	roomSeekingPosts = [], 
	roommatePosts = [], 
	rentalPosts = [],
	onEdit,
	onDelete 
}: PostListProps) {
	const [activeTab, setActiveTab] = useState('room-seeking')

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

	const renderRoomSeekingPost = (post: RoomSeekingPost) => (
		<Card key={post.id} className="hover:shadow-md transition-shadow">
			<CardHeader>
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<CardTitle className="text-lg mb-2">{post.title}</CardTitle>
						<div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								{formatDate(post.createdAt)}
							</div>
							<div className="flex items-center gap-1">
								<MapPin className="h-4 w-4" />
								Quận {post.preferredDistrictId}
							</div>
							<div className="flex items-center gap-1">
								<DollarSign className="h-4 w-4" />
								{formatPrice(post.minBudget)} - {formatPrice(post.maxBudget)}
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{getStatusBadge(post.status)}
						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<Eye className="h-4 w-4" />
							{post.contactCount}
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-4 line-clamp-2">
					{post.description}
				</p>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Badge variant="outline">{post.preferredRoomType}</Badge>
						<Badge variant="outline">{post.occupancy} người</Badge>
					</div>
					<div className="flex items-center gap-2">
						{onEdit && (
							<Button variant="outline" size="sm" onClick={() => onEdit(post.id, 'room-seeking')}>
								<Edit className="h-4 w-4" />
							</Button>
						)}
						{onDelete && (
							<Button variant="outline" size="sm" onClick={() => onDelete(post.id, 'room-seeking')}>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)

	const renderRoommatePost = (post: RoommatePost) => (
		<Card key={post.id} className="hover:shadow-md transition-shadow">
			<CardHeader>
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<CardTitle className="text-lg mb-2">{post.title}</CardTitle>
						<div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								{formatDate(post.createdAt)}
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
						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<MessageCircle className="h-4 w-4" />
							{post.responses}
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-3 mb-3">
					<Avatar className="h-8 w-8">
						<AvatarImage src={post.authorAvatar} />
						<AvatarFallback>
							<User className="h-4 w-4" />
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="text-sm font-medium">{post.authorName}</p>
						<p className="text-xs text-muted-foreground">
							{post.authorGender === 'male' ? 'Nam' : 'Nữ'} • {post.authorAge} tuổi
						</p>
					</div>
				</div>
				<p className="text-sm text-muted-foreground mb-4 line-clamp-2">
					{post.description}
				</p>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Badge variant="outline">
							{post.preferredGender === 'male' ? 'Nam' : post.preferredGender === 'female' ? 'Nữ' : 'Không phân biệt'}
						</Badge>
						<Badge variant="outline">{post.preferredAgeRange?.min}-{post.preferredAgeRange?.max} tuổi</Badge>
					</div>
					<div className="flex items-center gap-2">
						{onEdit && (
							<Button variant="outline" size="sm" onClick={() => onEdit(post.id, 'roommate')}>
								<Edit className="h-4 w-4" />
							</Button>
						)}
						{onDelete && (
							<Button variant="outline" size="sm" onClick={() => onDelete(post.id, 'roommate')}>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)

	const renderRentalPost = (post: RentalPost) => (
		<Card key={post.id} className="hover:shadow-md transition-shadow">
			<CardHeader>
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<CardTitle className="text-lg mb-2">{post.title}</CardTitle>
						<div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								{formatDate(post.createdAt)}
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
						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<Eye className="h-4 w-4" />
							{post.views}
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-4 line-clamp-2">
					{post.description}
				</p>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Badge variant="outline">{post.roomType}</Badge>
						<Badge variant="outline">{post.area}m²</Badge>
						<Badge variant="outline">{post.maxOccupants} người</Badge>
						{post.isHot && <Badge variant="destructive">Hot</Badge>}
					</div>
					<div className="flex items-center gap-2">
						{onEdit && (
							<Button variant="outline" size="sm" onClick={() => onEdit(post.id, 'rental')}>
								<Edit className="h-4 w-4" />
							</Button>
						)}
						{onDelete && (
							<Button variant="outline" size="sm" onClick={() => onDelete(post.id, 'rental')}>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Bài đăng của tôi</h2>
				<Button>
					<Search className="h-4 w-4 mr-2" />
					Tạo bài đăng mới
				</Button>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="room-seeking" className="flex items-center gap-2">
						<Search className="h-4 w-4" />
						Tìm trọ ({roomSeekingPosts.length})
					</TabsTrigger>
					<TabsTrigger value="roommate" className="flex items-center gap-2">
						<Users className="h-4 w-4" />
						Tìm bạn cùng trọ ({roommatePosts.length})
					</TabsTrigger>
					<TabsTrigger value="rental" className="flex items-center gap-2">
						<Home className="h-4 w-4" />
						Cho thuê ({rentalPosts.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="room-seeking" className="space-y-4">
					{roomSeekingPosts.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Search className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-medium mb-2">Chưa có bài đăng tìm trọ</h3>
								<p className="text-muted-foreground text-center mb-4">
									Tạo bài đăng đầu tiên để tìm phòng trọ phù hợp
								</p>
								<Button>
									<Search className="h-4 w-4 mr-2" />
									Tạo bài đăng tìm trọ
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4">
							{roomSeekingPosts.map(renderRoomSeekingPost)}
						</div>
					)}
				</TabsContent>

				<TabsContent value="roommate" className="space-y-4">
					{roommatePosts.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Users className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-medium mb-2">Chưa có bài đăng tìm bạn cùng trọ</h3>
								<p className="text-muted-foreground text-center mb-4">
									Tạo bài đăng đầu tiên để tìm người ở cùng
								</p>
								<Button>
									<Users className="h-4 w-4 mr-2" />
									Tạo bài đăng tìm bạn cùng trọ
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4">
							{roommatePosts.map(renderRoommatePost)}
						</div>
					)}
				</TabsContent>

				<TabsContent value="rental" className="space-y-4">
					{rentalPosts.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Home className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-medium mb-2">Chưa có bài đăng cho thuê</h3>
								<p className="text-muted-foreground text-center mb-4">
									Tạo bài đăng đầu tiên để cho thuê phòng trọ
								</p>
								<Button>
									<Home className="h-4 w-4 mr-2" />
									Tạo bài đăng cho thuê
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4">
							{rentalPosts.map(renderRentalPost)}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	)
}
