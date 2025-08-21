"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useUserStore } from "@/stores/userStore"

function SavedContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5" />
          <span>Trọ đã lưu</span>
        </CardTitle>
        <CardDescription>
          Danh sách các bài viết trọ bạn đã lưu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quản lý trọ đã lưu</h3>
          <p className="text-gray-600 mb-4">
            Xem và quản lý tất cả bài viết trọ bạn đã lưu
          </p>
          <Link href="/dashboard/tenant/saved">
            <Button>
              <Heart className="h-4 w-4 mr-2" />
              Xem trọ đã lưu
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function SavedPageContent() {
  const { user } = useUserStore()

  return (
    <DashboardLayout userType={user?.role === 'tenant' ? 'tenant' : 'landlord'}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trọ đã lưu</h1>
          <p className="text-gray-600">Danh sách các bài viết trọ bạn đã lưu</p>
        </div>

        <div className="space-y-6">
          <SavedContent />
        </div>
      </div>
    </DashboardLayout>
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