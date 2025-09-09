'use client'

import { PostList } from '@/components/posts/post-list'
import { ProfileLayout } from '@/components/profile/profile-layout'

export default function ProfileRoommatePostsPage() {
	return (
		<ProfileLayout>
			<div className="px-6">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý bài đăng</h1>
					<p className="text-gray-600">Tìm người ở ghép</p>
				</div>
				<PostList showRental={false} showRoomSeeking={false} showRoommate={true} initialTab={'roommate'} />
			</div>
		</ProfileLayout>
	)
}


