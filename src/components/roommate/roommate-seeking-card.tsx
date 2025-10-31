import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, DollarSign, Users, Eye } from 'lucide-react';
import type { RoommateSeekingListingItem } from '@/actions/roommate-seeking-posts.action';

interface RoommateSeekingCardProps {
	listing: RoommateSeekingListingItem;
}

export function RoommateSeekingCard({ listing }: RoommateSeekingCardProps) {
	const formatPrice = (price: number, currency: string) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: currency || 'VND',
		}).format(price);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN');
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'active':
				return <Badge className="bg-green-500">Đang hoạt động</Badge>;
			case 'paused':
				return <Badge variant="secondary">Tạm dừng</Badge>;
			case 'closed':
				return <Badge variant="outline">Đã đóng</Badge>;
			case 'expired':
				return <Badge variant="destructive">Hết hạn</Badge>;
			default:
				return null;
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<Link href={`/roommate/${listing.id}`}>
			<Card className="hover:shadow-lg transition-shadow h-full">
				<CardHeader>
					<div className="flex justify-between items-start mb-2">
						<CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
						{getStatusBadge(listing.status)}
					</div>
					<div className="flex items-center gap-1 text-sm text-muted-foreground">
						<Eye className="h-3 w-3" />
						{listing.viewCount || 0} lượt xem
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{/* Requester */}
						<div className="flex items-center gap-2">
							<Avatar className="h-8 w-8">
								<AvatarImage src={listing.requester.avatarUrl || undefined} alt={listing.requester.name} />
								<AvatarFallback>{getInitials(listing.requester.name)}</AvatarFallback>
							</Avatar>
							<span className="text-sm text-gray-600">{listing.requester.name}</span>
						</div>

						{/* Description */}
						{listing.description && (
							<p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
						)}

						{/* Max Budget */}
						<div className="flex items-center">
							<DollarSign className="h-4 w-4 mr-2 text-green-500" />
							<span className="font-semibold text-green-600">
								{formatPrice(listing.maxBudget, listing.currency)}/tháng
							</span>
						</div>

						{/* Occupancy */}
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-blue-500" />
							<Badge variant="outline">{listing.occupancy} người</Badge>
						</div>

						{/* Move-in Date */}
						<div className="flex items-center text-sm">
							<Calendar className="h-4 w-4 mr-2 text-gray-500" />
							<span className="text-gray-600">Chuyển vào: {formatDate(listing.moveInDate)}</span>
						</div>

						{/* Contact Count */}
						{listing.contactCount > 0 && (
							<div className="text-sm text-gray-500">
								{listing.contactCount} lượt liên hệ
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
