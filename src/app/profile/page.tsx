"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserStore, type User as UserType } from "@/stores/userStore"
import {
  User,
  Home,
  Edit,
  Key,
  Receipt,
  Send,
  Heart,
  Bell,
  LogOut
} from "lucide-react"
import Link from "next/link"

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
          <div>
            <label className="text-sm font-medium text-gray-700">Vai trò</label>
            <p className="text-gray-900">
              {user?.role === 'tenant' ? 'Người thuê trọ' : 'Chủ nhà trọ'}
            </p>
          </div>
          <Button className="w-full">
            <Edit className="h-4 w-4 mr-2" />
            Cập nhật thông tin
          </Button>
        </CardContent>
      </Card>

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
            <span>Thông tin lưu trú</span>
          </CardTitle>
          <CardDescription>
            Thông tin về nơi ở hiện tại (dành cho người thuê trọ)
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
          <Link href="/dashboard/tenant/requests">
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
          <Link href="/dashboard/tenant/notifications">
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

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useUserStore()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("profile")

  // Get tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, isLoading])

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
      case 'security':
        return <ProfileContent user={user} />
      case 'accommodation':
        return <AccommodationContent />
      case 'bills':
        return <BillsContent />
      case 'requests':
        return <RequestsContent />
      case 'saved':
        return <SavedContent />
      case 'notifications':
        return <NotificationsContent />
      default:
        return <ProfileContent user={user} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'tenant' ? 'Người thuê trọ' : 'Chủ nhà trọ'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
              activeTab === 'profile' || activeTab === 'security'
                ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('accommodation')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
              activeTab === 'accommodation'
                ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Quản lý lưu trú</span>
          </button>

          <button
            onClick={() => setActiveTab('bills')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
              activeTab === 'bills'
                ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Receipt className="h-5 w-5" />
            <span>Hóa đơn</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
              activeTab === 'requests'
                ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Send className="h-5 w-5" />
            <span>Yêu cầu thuê</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
              activeTab === 'saved'
                ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Heart className="h-5 w-5" />
            <span>Trọ đã lưu</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
              activeTab === 'notifications'
                ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Bell className="h-5 w-5" />
            <span>Thông báo</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              const { logout } = useUserStore.getState()
              logout()
            }}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
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
      </main>
    </div>
  )
}
