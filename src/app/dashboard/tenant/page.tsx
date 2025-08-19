"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserStore, type User as UserType } from "@/stores/userStore"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import {
  User,
  Home,
  Edit,
  Key,
  Receipt
} from "lucide-react"

// Content Components
function ProfileContent({ user }: { user: UserType | null }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Thông tin cơ bản */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Thông tin cơ bản</span>
          </CardTitle>
          <CardDescription>
            Thông tin cá nhân và liên hệ của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Họ</label>
              <p className="text-gray-900">{user?.firstName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tên</label>
              <p className="text-gray-900">{user?.lastName}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
            <p className="text-gray-900">{user?.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Giới tính</label>
            <p className="text-gray-900">
              {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Khác'}
            </p>
          </div>
          <Button className="w-full">
            <Edit className="h-4 w-4 mr-2" />
            Cập nhật thông tin
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SecurityContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Đổi mật khẩu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Bảo mật</span>
          </CardTitle>
          <CardDescription>
            Quản lý mật khẩu và bảo mật tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
            <p className="text-gray-500">••••••••</p>
          </div>
          <Button variant="outline" className="w-full">
            <Key className="h-4 w-4 mr-2" />
            Đổi mật khẩu
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AccommodationContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trọ của tôi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>Trọ của tôi</span>
          </CardTitle>
          <CardDescription>
            Thông tin về nơi ở hiện tại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thông tin lưu trú</h3>
            <p className="text-gray-600 mb-4">
              Bạn chưa có thông tin lưu trú nào được liên kết
            </p>
            <Button>
              Liên kết thông tin lưu trú
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BillsContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hóa đơn */}
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

function TenantPersonalManagementContent() {
  const { user } = useUserStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")

  // Redirect to profile page when accessing tenant dashboard
  useEffect(() => {
    router.push('/profile')
  }, [router])

  // Get tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileContent user={user} />
      case 'security':
        return <SecurityContent />
      case 'accommodation':
        return <AccommodationContent />
      case 'bills':
        return <BillsContent />
      default:
        return <ProfileContent user={user} />
    }
  }

  return (
    <DashboardLayout userType="tenant">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý cá nhân</h1>
          <p className="text-gray-600">Xin chào, {user?.firstName} {user?.lastName}</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function TenantPersonalManagement() {
  return (
    <Suspense fallback={
      <DashboardLayout userType="tenant">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <TenantPersonalManagementContent />
    </Suspense>
  )
}

