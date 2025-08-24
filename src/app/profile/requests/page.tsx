"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Send } from "lucide-react"
import Link from "next/link"
import { ProfileLayout } from "@/components/profile/profile-layout"
//import { useUserStore } from "@/stores/userStore"

function RequestsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Yêu cầu thuê của tôi</span>
        </CardTitle>
        <CardDescription>
          Quản lý các yêu cầu thuê trọ đã gửi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Send className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quản lý yêu cầu thuê</h3>
          <p className="text-gray-600 mb-4">
            Xem và quản lý tất cả yêu cầu thuê trọ của bạn
          </p>
          <Link href="/profile/requests">
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Xem yêu cầu thuê
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function RequestsPageContent() {
  //const { user } = useUserStore()

  return (
    <ProfileLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu thuê</h1>
          <p className="text-gray-600">Quản lý các yêu cầu thuê trọ đã gửi</p>
        </div>

        <div className="space-y-6">
          <RequestsContent />
        </div>
      </div>
    </ProfileLayout>
  )
}

export default function RequestsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <RequestsPageContent />
    </Suspense>
  )
}