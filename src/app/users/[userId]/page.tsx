'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingStars, RatingsList } from '@/components/rating';
import { getPublicUserProfile } from '@/actions';
import type { PublicUserProfile } from '@/types/types';

export default function PublicProfilePage() {
	const params = useParams();
	const userId = params.userId as string;

	const [profile, setProfile] = useState<PublicUserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchProfile = async () => {
		try {
			setIsLoading(true);
			const data = await getPublicUserProfile(userId);
			setProfile(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load profile');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (userId) {
			fetchProfile();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	const getInitials = (profile: PublicUserProfile) => {
		const name = profile.name || '';
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	};

	const getRoleLabel = (role: string) => {
		return role === 'landlord' ? 'Chủ trọ' : 'Người thuê';
	};

	const getRoleColor = (role: string) => {
		return role === 'landlord' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="container mx-auto px-4 max-w-6xl">
					<Card>
						<CardHeader>
							<Skeleton className="h-8 w-64" />
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-4">
								<Skeleton className="h-24 w-24 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-6 w-48" />
									<Skeleton className="h-4 w-32" />
								</div>
							</div>
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-48 w-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="container mx-auto px-4 max-w-6xl">
					<Card>
						<CardContent className="p-12 text-center">
							<User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
							<h2 className="text-2xl font-semibold text-gray-900 mb-2">
								User Not Found
							</h2>
							<p className="text-gray-600">{error || 'The user you are looking for does not exist.'}</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const targetType = profile.role === 'landlord' ? 'landlord' : 'tenant';

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4 max-w-6xl space-y-6">
				{/* Profile Header */}
				<Card>
					<CardContent className="p-8">
						<div className="flex flex-col md:flex-row gap-6">
							{/* Avatar */}
							<div>
								<Avatar className="h-32 w-32">
									<AvatarImage src={profile.avatarUrl || undefined} alt={profile.name} />
									<AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
										{getInitials(profile)}
									</AvatarFallback>
								</Avatar>
							</div>

							{/* Profile Info */}
							<div className="flex-1 space-y-4">
								<div>
									<div className="flex items-center gap-3 mb-2">
										<h1 className="text-3xl font-bold text-gray-900">
											{profile.name}
										</h1>
										{profile.isVerifiedEmail && (
											<Badge variant="secondary" className="gap-1">
												<CheckCircle2 className="w-4 h-4" />
												Verified
											</Badge>
										)}
									</div>
									<div className="flex items-center gap-2">
										<Badge className={getRoleColor(profile.role)}>
											{getRoleLabel(profile.role)}
										</Badge>
									</div>
								</div>

								{/* Rating Summary */}
								{profile.totalRatings > 0 && (
									<div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
										<div>
											<RatingStars
												rating={profile.overallRating}
												size="large"
												showValue={true}
											/>
										</div>
										<div className="text-sm text-gray-600">
											Based on {profile.totalRatings}{' '}
											{profile.totalRatings === 1 ? 'review' : 'reviews'}
										</div>
									</div>
								)}

								{/* Bio */}
								{profile.bio && (
									<div>
										<p className="text-gray-700 leading-relaxed">{profile.bio}</p>
									</div>
								)}

								{/* Verification Badges */}
								<div className="flex flex-wrap gap-2">
									{profile.isVerifiedEmail && (
										<Badge variant="outline" className="gap-1">
											<CheckCircle2 className="w-3 h-3 text-green-600" />
											Email Verified
										</Badge>
									)}
									{profile.isVerifiedPhone && (
										<Badge variant="outline" className="gap-1">
											<CheckCircle2 className="w-3 h-3 text-green-600" />
											Phone Verified
										</Badge>
									)}
									{profile.isVerifiedIdentity && (
										<Badge variant="outline" className="gap-1">
											<CheckCircle2 className="w-3 h-3 text-green-600" />
											Identity Verified
										</Badge>
									)}
									{profile.isVerifiedBank && (
										<Badge variant="outline" className="gap-1">
											<CheckCircle2 className="w-3 h-3 text-green-600" />
											Bank Verified
										</Badge>
									)}
								</div>

								{/* Member Since */}
								<div className="flex items-center gap-2 text-sm text-gray-500">
									<Calendar className="w-4 h-4" />
									<span>
										Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Reviews Section */}
				<div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Reviews {profile.totalRatings > 0 && `(${profile.totalRatings})`}
					</h2>
					<RatingsList
						targetType={targetType}
						targetId={profile.id}
						showStats={true}
						initialParams={{
							limit: 10,
							sortBy: 'createdAt',
							sortOrder: 'desc',
						}}
					/>
				</div>
			</div>
		</div>
	);
}
