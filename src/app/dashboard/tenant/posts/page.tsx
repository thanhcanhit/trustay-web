'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostList } from '@/components/posts/post-list';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useRoomSeekingStore } from '@/stores/roomSeekingStore';
import { useRoommateSeekingPostsStore } from '@/stores/roommate-seeking-posts.store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function ProfilePostsContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const tab = searchParams.get('tab') as 'room-seeking' | 'roommate' | null;
	
	const { 
		userPosts: roomSeekingPosts, 
		fetchMyPosts: fetchRoomSeekingPosts,
		deletePost: deleteRoomSeekingPost 
	} = useRoomSeekingStore();
	const { 
		myPosts: roommatePosts, 
		fetchMyPosts: fetchRoommatePosts,
		deletePost: deleteRoommatePost 
	} = useRoommateSeekingPostsStore();

	useEffect(() => {
		fetchRoomSeekingPosts({ limit: 50 });
		fetchRoommatePosts();
	}, [fetchRoomSeekingPosts, fetchRoommatePosts]);

	const handleEdit = (postId: string, type: 'room-seeking' | 'roommate' | 'rental') => {
		if (type === 'room-seeking') {
			router.push(`/profile/posts/room-seeking/${postId}/edit`);
		} else if (type === 'roommate') {
			router.push(`/profile/posts/roommate/${postId}/edit`);
		}
	};

	const handleDelete = async (postId: string, type: 'room-seeking' | 'roommate' | 'rental') => {
		if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
			return;
		}

		try {
			let success = false;
			if (type === 'room-seeking') {
				success = await deleteRoomSeekingPost(postId);
			} else if (type === 'roommate') {
				success = await deleteRoommatePost(postId);
			}

			if (success) {
				toast.success('Xóa bài đăng thành công!');
				// Refresh danh sách
				if (type === 'room-seeking') {
					fetchRoomSeekingPosts({ limit: 50 });
				} else if (type === 'roommate') {
					fetchRoommatePosts();
				}
			} else {
				toast.error('Không thể xóa bài đăng. Vui lòng thử lại!');
			}
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Có lỗi xảy ra khi xóa bài đăng!');
		}
	};

	const handleStatusChange = async (postId: string, type: 'room-seeking' | 'roommate' | 'rental', newStatus: string) => {
		try {
			let success = false;
			if (type === 'roommate') {
				const { updatePostStatus } = useRoommateSeekingPostsStore.getState();
				success = await updatePostStatus(postId, newStatus as 'active' | 'paused' | 'closed' | 'expired');
			}
			// Note: room-seeking status update cần được implement trong store

			if (success) {
				toast.success('Cập nhật trạng thái thành công!');
				// Refresh danh sách
				if (type === 'room-seeking') {
					fetchRoomSeekingPosts({ limit: 50 });
				} else if (type === 'roommate') {
					fetchRoommatePosts();
				}
			} else {
				toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại!');
			}
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error('Có lỗi xảy ra khi cập nhật trạng thái!');
		}
	};

	return (
		<DashboardLayout userType="tenant">
			<div className="px-6">
				<PostList
					showRoomSeeking={true}
					showRoommate={true}
					showRental={false}
					roomSeekingPosts={roomSeekingPosts}
					roommatePosts={roommatePosts}
					initialTab={tab || 'room-seeking'}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onStatusChange={handleStatusChange}
				/>
			</div>
		</DashboardLayout>
	);
}

export default function ProfilePostsPage() {
	return (
		<Suspense fallback={
			<DashboardLayout userType="tenant">
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</DashboardLayout>
		}>
			<ProfilePostsContent />
		</Suspense>
	);
}
