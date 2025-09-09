'use client'

import { useEffect } from 'react'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { RoomSeekingManager } from '@/components/posts/room-seeking-manager'
import { useRoomSeekingStore } from '@/stores/roomSeekingStore'

export default function ProfileRoomSeekingPostsPage() {
    const { userPosts, userPostsLoading, fetchMyPosts } = useRoomSeekingStore()

    useEffect(() => {
        fetchMyPosts({ limit: 50 })
    }, [fetchMyPosts])

    return (
        <ProfileLayout>
            <div className="px-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý bài đăng</h1>
                    <p className="text-gray-600">Tìm trọ</p>
                </div>
                {userPostsLoading ? (
                    <div className="text-center py-8">Đang tải...</div>
                ) : (
                    <RoomSeekingManager posts={userPosts} />
                )}
            </div>
        </ProfileLayout>
    )
}


