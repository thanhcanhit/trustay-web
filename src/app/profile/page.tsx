"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserStore, type User as UserType } from "@/stores/userStore"
import { updateUserProfile } from "@/actions/auth.action"
import { changePassword, uploadAvatar } from "@/actions/user.action"
import { toast } from "sonner"
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
function ChangePasswordCard() {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!")
      return
    }

    setIsLoading(true)
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success("Đổi mật khẩu thành công!")
      setIsChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error("Lỗi: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5" />
          <h3 className="text-lg font-medium">Đổi mật khẩu</h3>
        </div>
        {!isChangingPassword && (
          <Button onClick={() => setIsChangingPassword(true)} variant="outline">
            Đổi mật khẩu
          </Button>
        )}
      </div>

      {!isChangingPassword ? (
        <p className="text-gray-600">Đảm bảo tài khoản của bạn an toàn bằng cách sử dụng mật khẩu mạnh</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại *</label>
            <Input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới *</label>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới *</label>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleChangePassword}
              className="bg-green-600 hover:bg-green-700"
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || isLoading}
            >
              {isLoading ? "Đang đổi..." : "Đổi mật khẩu"}
            </Button>
            <Button 
              onClick={() => {
                setIsChangingPassword(false)
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
              }} 
              variant="outline"
            >
              Hủy
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

function ProfileContent({ user }: { user: UserType | null }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatarUrl: user?.avatar || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    role: user?.role || 'tenant',
    bio: user?.bio || '',
    idCardNumber: user?.idCardNumber || '',
    bankAccount: user?.bankAccount || '',
    bankName: user?.bankName || '',
    idCardFront: user?.idCardFront || '',
    idCardBack: user?.idCardBack || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const response = await uploadAvatar(file)
      setProfileData(prev => ({ ...prev, avatarUrl: response.avatarUrl }))
      toast.success("Tải ảnh đại diện thành công!")
      
      // Update user store with new avatar
      const { fetchUser } = useUserStore.getState()
      await fetchUser()
    } catch (error) {
      toast.error("Lỗi khi tải ảnh: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleFileUpload = (field: keyof typeof profileData, file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setProfileData(prev => ({ ...prev, [field]: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateUserProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatarUrl: profileData.avatarUrl,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        role: profileData.role as 'tenant' | 'landlord',
        bio: profileData.bio,
        idCardNumber: profileData.idCardNumber,
        bankAccount: profileData.bankAccount,
        bankName: profileData.bankName,
      })
      const { fetchUser } = useUserStore.getState()
      await fetchUser()
      toast.success("Cập nhật thông tin thành công!")
      setIsEditing(false)
    } catch (error) {
      toast.error("Lỗi: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <Card className="p-8 space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Avatar</div>
            )}
          </div>
          <div>
            <h2>{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-600">{user?.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
            <p>{profileData.firstName || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
            <p>{profileData.lastName || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <p>{profileData.gender || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
            <p>{profileData.dateOfBirth || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <p>{profileData.role === 'tenant' ? 'Người thuê trọ' : 'Chủ nhà trọ'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CCCD</label>
            <p>{profileData.idCardNumber || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản ngân hàng</label>
            <p>{profileData.bankAccount || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên ngân hàng</label>
            <p>{profileData.bankName || 'Chưa cập nhật'}</p>
          </div>
        </div>

        {profileData.bio && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu</label>
            <p>{profileData.bio}</p>
          </div>
        )}

        <Button onClick={() => setIsEditing(true)} variant="outline">
          Chỉnh sửa thông tin
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <h2>Cập nhật thông tin cá nhân</h2>

        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
              {profileData.avatarUrl ? (
                <img src={profileData.avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  <User className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleAvatarUpload(file)
                }}
                disabled={isUploadingAvatar}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg 
                           file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isUploadingAvatar && (
                <p className="text-sm text-gray-500 mt-1">Đang tải ảnh lên...</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Chấp nhận: JPG, PNG, GIF. Tối đa 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ *</label>
            <Input
              value={profileData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Nhập họ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên *</label>
            <Input
              value={profileData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Nhập tên"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính *</label>
            <select
              value={profileData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh *</label>
            <Input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò *</label>
            <select
              value={profileData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="tenant">Người thuê trọ</option>
              <option value="landlord">Chủ nhà trọ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Căn cước công dân *</label>
            <Input
              value={profileData.idCardNumber}
              onChange={(e) => handleInputChange('idCardNumber', e.target.value)}
              placeholder="Nhập số CCCD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản ngân hàng *</label>
            <Input
              value={profileData.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              placeholder="1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên ngân hàng *</label>
            <Input
              value={profileData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              placeholder="Vietcombank"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu bản thân</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Viết vài dòng giới thiệu về bản thân..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            rows={4}
          />
        </div>

        {/* CCCD Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">Ảnh căn cước công dân *</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mặt trước */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Mặt trước</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {profileData.idCardFront ? (
                  <div className="space-y-2">
                    <img src={profileData.idCardFront} alt="CCCD mặt trước" className="w-full h-32 object-cover rounded border mx-auto" />
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('idCardFront', file)
                    }} />
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">Tải lên ảnh CCCD mặt trước</p>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('idCardFront', file)
                    }} />
                  </div>
                )}
              </div>
            </div>
            {/* Mặt sau */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Mặt sau</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {profileData.idCardBack ? (
                  <div className="space-y-2">
                    <img src={profileData.idCardBack} alt="CCCD mặt sau" className="w-full h-32 object-cover rounded border mx-auto" />
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('idCardBack', file)
                    }} />
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">Tải lên ảnh CCCD mặt sau</p>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('idCardBack', file)
                    }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700"
            disabled={!profileData.firstName || !profileData.lastName || !profileData.gender || !profileData.dateOfBirth || !profileData.idCardNumber || !profileData.bankAccount || !profileData.bankName || isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu thông tin"}
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="outline">Hủy</Button>
        </div>
      </div>
    </Card>
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

function ProfilePageContent() {
  const { user, isAuthenticated, isLoading } = useUserStore()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("profile")
  const [showModal, setShowModal] = useState(false)

  // Get tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Show modal from URL params
  useEffect(() => {
    const shouldShowModal = searchParams.get('showModal')
    if (shouldShowModal === 'true') {
      setShowModal(true)
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
        return <ProfileContent user={user}/>
      case 'security':
        return <ChangePasswordCard />
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
        return <ProfileContent user={user}/>
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
    <>      
      <div className="min-h-screen bg-gray-50 flex pt-16">
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
              activeTab === 'profile'
                ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
              activeTab === 'security'
                ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Key className="h-5 w-5" />
            <span>Bảo mật</span>
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
    </>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}
