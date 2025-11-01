'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
	Search,
	Users,
	Home,
	Eye,
	ExternalLink,
	Edit,
	Trash2,
	Calendar,
	MapPin,
	DollarSign,
	//User,
	Plus,
	MoreVertical
} from 'lucide-react'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { RoomSeekingPost, RentalPost } from '@/types'
import { RoommateSeekingPost } from '@/actions/roommate-seeking-posts.action'
import { getRoomTypeDisplayName } from '@/utils/room-types'
import { stripHtmlTags } from '@/utils/textProcessing'

interface PostListProps {
	roomSeekingPosts?: RoomSeekingPost[]
	roommatePosts?: RoommateSeekingPost[]
	rentalPosts?: RentalPost[]
	showRental?: boolean
	showRoomSeeking?: boolean
	showRoommate?: boolean
	initialTab?: 'room-seeking' | 'roommate' | 'rental'
	onEdit?: (postId: string, type: 'room-seeking' | 'roommate' | 'rental') => void
	onDelete?: (postId: string, type: 'room-seeking' | 'roommate' | 'rental') => void
	onStatusChange?: (postId: string, type: 'room-seeking' | 'roommate' | 'rental', newStatus: string) => void
}

const POST_STATUSES = {
	draft: { label: 'Bản nháp', color: 'bg-gray-400' },
	active: { label: 'Đang hoạt động', color: 'bg-green-500' },
	paused: { label: 'Tạm dừng', color: 'bg-yellow-500' },
	closed: { label: 'Đã đóng', color: 'bg-gray-500' },
	inactive: { label: 'Tạm dừng', color: 'bg-yellow-500' },
	expired: { label: 'Hết hạn', color: 'bg-red-500' },
	rented: { label: 'Đã cho thuê', color: 'bg-blue-500' },
	found: { label: 'Đã tìm thấy', color: 'bg-purple-500' },
}

export function PostList({ 
	roomSeekingPosts = [], 
	roommatePosts = [], 
	rentalPosts = [],
	showRental = true,
	showRoomSeeking = true,
	showRoommate = true,
	initialTab = 'room-seeking',
	onEdit,
	onDelete,
	onStatusChange
}: PostListProps) {
	const [activeTab, setActiveTab] = useState(initialTab)

	const RoommateAuthorAvatar = ({ name, src }: { name: string; src?: string }) => {
		const [isError, setIsError] = useState(false)
		const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
		const showImage = !!src && src.trim() !== '' && !isError
		return (
			<Avatar className="h-8 w-8">
				{showImage ? (
					<AvatarImage src={src} alt={name} onError={() => setIsError(true)} />
				) : (
					<AvatarFallback>
						{initials}
					</AvatarFallback>
				)}
			</Avatar>
		)
	}

	const visibleTabsCount = [showRoomSeeking, showRoommate, showRental].filter(Boolean).length

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(price)
	}

	const formatDate = (dateString: string) => {
		return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
	}

	const getStatusBadge = (status: string) => {
		const statusInfo = POST_STATUSES[status as keyof typeof POST_STATUSES] || { 
			label: status, 
			color: 'bg-gray-500' 
		}
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
								{post.preferredWard?.name ? `${post.preferredWard.name}, ` : ''}
								{post.preferredDistrict?.name ? `${post.preferredDistrict.name}, ` : ''}
								{post.preferredProvince?.name || 'Khu vực linh hoạt'}
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
					{stripHtmlTags(post.description)}
				</p>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Badge variant="outline">{getRoomTypeDisplayName(post.preferredRoomType)}</Badge>
						<Badge variant="outline">{post.occupancy} người</Badge>
					</div>
					<div className="flex items-center gap-2">
						<Link href={`/room-seekings/${post.id}`}>
							<Button variant="outline" size="sm">
								<ExternalLink className="h-4 w-4 mr-1" />
								Xem
							</Button>
						</Link>
						{/* {onEdit && (
							<Button variant="outline" size="sm" onClick={() => onEdit(post.id, 'room-seeking')}>
								<Edit className="h-4 w-4 mr-1" />
								Sửa
							</Button>
						)} */}
						{onStatusChange && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<MoreVertical className="h-4 w-4" />
										Thay đổi trạng thái
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Thay đổi trạng thái</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => onStatusChange(post.id, 'room-seeking', 'active')}>
										Đang hoạt động
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onStatusChange(post.id, 'room-seeking', 'paused')}>
										Tạm dừng
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onStatusChange(post.id, 'room-seeking', 'inactive')}>
										Tạm dừng (Inactive)
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onStatusChange(post.id, 'room-seeking', 'found')}>
										Đã tìm thấy
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
						{onDelete && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="sm">
										<Trash2 className="h-4 w-4 mr-1" />
										Xóa
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Xác nhận xóa bài đăng</AlertDialogTitle>
										<AlertDialogDescription>
											Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Hủy</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => onDelete(post.id, 'room-seeking')}
											className="bg-red-600 hover:bg-red-700"
										>
											Xóa
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)

	const renderRoommatePost = (post: RoommateSeekingPost) => {
		// Get location display text
		const getLocationText = () => {
			if (post.roomInstance?.room?.building) {
				return `${post.roomInstance.room.building.name} - Phòng ${post.roomInstance.roomNumber}`;
			}
			if (post.externalAddress) {
				return post.externalAddress;
			}
			return 'Chưa xác định';
		};

		// Get tenant display info
		const tenantName = post.tenant 
			? `${post.tenant.firstName || ''} ${post.tenant.lastName || ''}`.trim() || 'Ẩn danh'
			: 'Ẩn danh';
		const tenantAvatar = post.tenant?.avatarUrl;

		return (
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
									{getLocationText()}
								</div>
								<div className="flex items-center gap-1">
									<DollarSign className="h-4 w-4" />
									{formatPrice(post.monthlyRent)}/tháng
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{getStatusBadge(post.status)}
							<div className="flex items-center gap-1 text-sm text-muted-foreground">
								<Eye className="h-4 w-4" />
								{post.viewCount || 0}
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3 mb-3">
						<RoommateAuthorAvatar name={tenantName} src={tenantAvatar} />
						<div>
							<p className="text-sm font-medium">{tenantName}</p>
							<p className="text-xs text-muted-foreground">
								{post.preferredGender === 'male' ? 'Tìm Nam' : post.preferredGender === 'female' ? 'Tìm Nữ' : 'Không phân biệt'}
							</p>
						</div>
					</div>
					<p className="text-sm text-muted-foreground mb-4 line-clamp-2">
						{stripHtmlTags(post.description)}
					</p>
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Badge variant="outline">
								Tìm {post.seekingCount} người
							</Badge>
							<Badge variant="outline">
								{post.remainingSlots}/{post.seekingCount} còn trống
							</Badge>
							{post.depositAmount > 0 && (
								<Badge variant="outline">
									Đặt cọc: {formatPrice(post.depositAmount)}
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Link href={`/roommate/${post.id}`}>
								<Button variant="outline" size="sm">
									<ExternalLink className="h-4 w-4 mr-1" />
									Xem
								</Button>
							</Link>
							{onEdit && (
								<Button variant="outline" size="sm" onClick={() => onEdit(post.id, 'roommate')}>
									<Edit className="h-4 w-4 mr-1" />
									Sửa
								</Button>
							)}
							{onStatusChange && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm">
											<MoreVertical className="h-4 w-4" />
											Thay đổi trạng thái
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Thay đổi trạng thái</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => onStatusChange(post.id, 'roommate', 'active')}>
											Đang hoạt động
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => onStatusChange(post.id, 'roommate', 'paused')}>
											Tạm dừng
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => onStatusChange(post.id, 'roommate', 'closed')}>
											Đã đóng
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
							{onDelete && (
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="destructive" size="sm">
											<Trash2 className="h-4 w-4 mr-1" />
											Xóa
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Xác nhận xóa bài đăng</AlertDialogTitle>
											<AlertDialogDescription>
												Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Hủy</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => onDelete(post.id, 'roommate')}
												className="bg-red-600 hover:bg-red-700"
											>
												Xóa
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	};

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
					{stripHtmlTags(post.description)}
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
							<Button variant="outline" size="sm" onClick={() => onEdit(post.id, 'roommate')}>
								<Edit className="h-4 w-4 mr-1" />
								Sửa
							</Button>
						)}
						{onStatusChange && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Thay đổi trạng thái</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => onStatusChange(post.id, 'roommate', 'active')}>
										Đang hoạt động
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onStatusChange(post.id, 'roommate', 'paused')}>
										Tạm dừng
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onStatusChange(post.id, 'roommate', 'closed')}>
										Đã đóng
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
						{onDelete && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="sm">
										<Trash2 className="h-4 w-4 mr-1" />
										Xóa
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Xác nhận xóa bài đăng</AlertDialogTitle>
										<AlertDialogDescription>
											Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Hủy</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => onDelete(post.id, 'roommate')}
											className="bg-red-600 hover:bg-red-700"
										>
											Xóa
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
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
				{activeTab === 'room-seeking' && (
					<Link href="/profile/posts/room-seeking/add">
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Tạo bài tìm trọ
						</Button>
					</Link>
				)}
				{activeTab === 'roommate' && (
					<Link href="/profile/posts/roommate/add">
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Tạo bài tìm bạn cùng trọ
						</Button>
					</Link>
				)}
			</div>

			<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'room-seeking' | 'roommate' | 'rental')}>
				<TabsList className={`grid w-full ${visibleTabsCount === 3 ? 'grid-cols-3' : visibleTabsCount === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
					{showRoomSeeking && (
						<TabsTrigger value="room-seeking" className="flex items-center gap-2">
							<Search className="h-4 w-4" />
							Tìm trọ ({roomSeekingPosts.length})
						</TabsTrigger>
					)}
					{showRoommate && (
						<TabsTrigger value="roommate" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Tìm bạn cùng trọ ({roommatePosts.length})
						</TabsTrigger>
					)}
					{showRental && (
						<TabsTrigger value="rental" className="flex items-center gap-2">
							<Home className="h-4 w-4" />
							Cho thuê ({rentalPosts.length})
						</TabsTrigger>
					)}
				</TabsList>

				{showRoomSeeking && (
				<TabsContent value="room-seeking" className="space-y-4">
					{roomSeekingPosts.length === 0 ? (
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<Search />
								</EmptyMedia>
								<EmptyTitle>Chưa có bài đăng tìm trọ</EmptyTitle>
								<EmptyDescription>
									Tạo bài đăng đầu tiên để tìm phòng trọ phù hợp với nhu cầu của bạn.
								</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<Link href="/profile/posts/room-seeking/add">
									<Button>
										<Plus className="h-4 w-4 mr-2" />
										Tạo bài đăng tìm trọ
									</Button>
								</Link>
							</EmptyContent>
						</Empty>
					) : (
						<div className="grid gap-4">
							{roomSeekingPosts.map(renderRoomSeekingPost)}
						</div>
					)}
				</TabsContent>
				)}

			{showRoommate && (
			<TabsContent value="roommate" className="space-y-4">
				{roommatePosts.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Users />
							</EmptyMedia>
							<EmptyTitle>Chưa có bài đăng tìm bạn cùng trọ</EmptyTitle>
							<EmptyDescription>
								Tạo bài đăng đầu tiên để tìm người ở cùng phù hợp với bạn.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Link href="/profile/posts/roommate/add">
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									Tạo bài đăng tìm bạn cùng trọ
								</Button>
							</Link>
						</EmptyContent>
					</Empty>
				) : (
					<div className="grid gap-4">
						{roommatePosts.map(renderRoommatePost)}
					</div>
				)}
			</TabsContent>
			)}				{showRental && (
					<TabsContent value="rental" className="space-y-4">
						{rentalPosts.length === 0 ? (
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Home />
									</EmptyMedia>
									<EmptyTitle>Chưa có bài đăng cho thuê</EmptyTitle>
									<EmptyDescription>
										Tạo bài đăng đầu tiên để cho thuê phòng trọ của bạn.
									</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
									<Button>
										<Plus className="h-4 w-4 mr-2" />
										Tạo bài đăng cho thuê
									</Button>
								</EmptyContent>
							</Empty>
						) : (
							<div className="grid gap-4">
								{rentalPosts.map(renderRentalPost)}
							</div>
						)}
					</TabsContent>
				)}
			</Tabs>
		</div>
	)
}
