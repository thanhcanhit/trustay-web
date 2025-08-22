"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt } from "lucide-react"
import { ProfileLayout } from "@/components/profile/profile-layout"
//import { useUserStore } from "@/stores/userStore"

function BillsContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Hóa đơn</span>
          </CardTitle>
          <CardDescription>
            Lịch sử thanh toán và hóa đơn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hóa đơn</h3>
            <p className="text-gray-600 mb-4">
              Chưa có hóa đơn nào được tạo
            </p>
            <Button variant="outline">
              Xem lịch sử thanh toán
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BillsPageContent() {
  //const { user } = useUserStore()

  return (
    <ProfileLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hóa đơn</h1>
          <p className="text-gray-600">Lịch sử thanh toán và hóa đơn</p>
        </div>

        <div className="space-y-6">
          <BillsContent />
        </div>
      </div>
    </ProfileLayout>
  )
}

export default function BillsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <BillsPageContent />
    </Suspense>
  )
}