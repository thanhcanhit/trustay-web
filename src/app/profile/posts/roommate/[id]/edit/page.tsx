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

	return (
		<ProfileLayout>
			<RoommatePostForm mode="edit" initialData={post} postId={postId} />
		</ProfileLayout>
	);
}
