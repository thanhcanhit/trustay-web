"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useUserStore } from "@/stores/userStore"

function NotificationsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Thông báo</span>
        </CardTitle>
        <CardDescription>
          Tất cả thông báo và cập nhật
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quản lý thông báo</h3>
          <p className="text-gray-600 mb-4">
            Xem tất cả thông báo và cập nhật từ hệ thống
          </p>
          <Link href="/profile/notifications">
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Xem thông báo
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationsPageContent() {
  const { user } = useUserStore()

  return (
    <DashboardLayout userType={user?.role === 'tenant' ? 'tenant' : 'landlord'}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">Tất cả thông báo và cập nhật từ hệ thống</p>
        </div>

        <div className="space-y-6">
          <NotificationsContent />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <NotificationsPageContent />
    </Suspense>
  )
}