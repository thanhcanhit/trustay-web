"use client"

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications"

function NotificationsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Thông báo</span>
        </CardTitle>
        <CardDescription>
          Tất cả thông báo về yêu cầu đặt phòng và lời mời
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DashboardNotifications />
      </CardContent>
    </Card>
  )
}

function NotificationsPageContent() {
  return (
    <DashboardLayout userType="landlord">
      <div className="space-y-6">
        <NotificationsContent />
      </div>
    </DashboardLayout>
  )
}

export default function LandlordNotificationsPage() {
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