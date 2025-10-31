"use client"

import { Suspense } from "react"
import { Heart } from "lucide-react"
import { ProfileLayout } from "@/components/profile/profile-layout"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
//import { useUserStore } from "@/stores/userStore"

function SavedContent() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Heart />
        </EmptyMedia>
        <EmptyTitle>Chưa có trọ đã lưu</EmptyTitle>
        <EmptyDescription>
          Bạn chưa lưu phòng trọ nào. Hãy tìm và lưu các phòng trọ yêu thích để xem lại sau.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function SavedPageContent() {
  //const { user } = useUserStore()

  return (
    <ProfileLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trọ đã lưu</h1>
          <p className="text-gray-600">Danh sách các bài viết trọ bạn đã lưu</p>
        </div>

        <div className="space-y-6">
          <SavedContent />
        </div>
      </div>
    </ProfileLayout>
  )
}

export default function SavedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <SavedPageContent />
    </Suspense>
  )
}