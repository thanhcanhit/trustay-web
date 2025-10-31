'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProfileLayout } from '@/components/profile/profile-layout';
import { RoommatePostForm } from '@/components/forms/roommate-post-form';
import { useRoommateSeekingPostsStore } from '@/stores/roommate-seeking-posts.store';
import { Loader2 } from 'lucide-react';

export default function EditRoommatePostPage() {
	const params = useParams();
	const postId = params.id as string;
	const { posts, fetchPostById, isLoading } = useRoommateSeekingPostsStore();
	const [isFetching, setIsFetching] = useState(true);

	useEffect(() => {
		const loadPost = async () => {
			if (!posts[postId]) {
				await fetchPostById(postId);
			}
			setIsFetching(false);
		};
		loadPost();
	}, [postId, posts, fetchPostById]);

	if (isFetching || isLoading) {
		return (
			<ProfileLayout>
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</ProfileLayout>
		);
	}

	const post = posts[postId];

	if (!post) {
		return (
			<ProfileLayout>
				<div className="flex items-center justify-center min-h-[400px]">
					<p className="text-muted-foreground">Không tìm thấy bài đăng</p>
				</div>
			</ProfileLayout>
		);
	}

	// Transform RoommateSeekingPost to FormData format
	const formData = {
		title: post.title,
		description: post.description,
		roomInstanceId: post.roomInstanceId,
		rentalId: post.rentalId,
		externalAddress: post.externalAddress,
		externalProvinceId: post.externalProvinceId?.toString(),
		externalDistrictId: post.externalDistrictId?.toString(),
		externalWardId: post.externalWardId?.toString(),
		monthlyRent: post.monthlyRent?.toString(),
		currency: post.currency as 'VND' | 'USD',
		depositAmount: post.depositAmount?.toString(),
		utilityCostPerPerson: post.utilityCostPerPerson?.toString(),
		seekingCount: post.seekingCount?.toString(),
		maxOccupancy: post.maxOccupancy?.toString(),
		currentOccupancy: post.currentOccupancy?.toString(),
		preferredGender: post.preferredGender,
		additionalRequirements: post.additionalRequirements,
		availableFromDate: post.availableFromDate,
		minimumStayMonths: post.minimumStayMonths?.toString(),
		maximumStayMonths: post.maximumStayMonths?.toString(),
		requiresLandlordApproval: post.requiresLandlordApproval,
		expiresAt: post.expiresAt,
		isExternalRoom: !post.roomInstanceId, // If no roomInstanceId, it's an external room
	};

	return (
		<ProfileLayout>
			<RoommatePostForm mode="edit" initialData={formData} postId={postId} />
		</ProfileLayout>
	);
}
