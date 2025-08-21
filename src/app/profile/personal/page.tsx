"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useUserStore } from "@/stores/userStore"
import { UserProfile } from "@/actions"
import { uploadAvatar, updateUserProfile } from "@/actions/user.action"
import { toast } from "sonner"
import { User, ChevronDownIcon } from "lucide-react"
import Image from "next/image"
import { SizingImage } from "@/components/sizing-image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

function ProfileContent({ user }: { user: UserProfile | null }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    role: user?.role || 'tenant',
    bio: user?.bio || '',
    idCardNumber: user?.idCardNumber || '',
    bankAccount: user?.bankAccount || '',
    bankName: user?.bankName || '',
  })
  const [originalData, setOriginalData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    role: user?.role || 'tenant',
    bio: user?.bio || '',
    idCardNumber: user?.idCardNumber || '',
    bankAccount: user?.bankAccount || '',
    bankName: user?.bankName || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const hasChanges = () => {
    if (pendingAvatarFile) return true
    return Object.keys(profileData).some(key => 
      profileData[key as keyof typeof profileData] !== originalData[key as keyof typeof originalData]
    )
  }

  const handleAvatarFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB!')
      return
    }

    if (pendingAvatarPreview) {
      URL.revokeObjectURL(pendingAvatarPreview)
    }

    const previewUrl = URL.createObjectURL(file)
    setPendingAvatarFile(file)
    setPendingAvatarPreview(previewUrl)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let finalAvatarUrl = profileData.avatarUrl
      if (pendingAvatarFile && pendingAvatarFile instanceof File && pendingAvatarFile.size > 0) {
        try {
          const response = await uploadAvatar(pendingAvatarFile)
          finalAvatarUrl = response.avatarUrl
        } catch (avatarError) {
          toast.error("Lỗi upload avatar: " + (avatarError instanceof Error ? avatarError.message : "Unknown error"))
          return
        }
      }

      const updateData: Record<string, unknown> = {}
      
      if (profileData.firstName !== originalData.firstName) {
        updateData.firstName = profileData.firstName
      }
      if (profileData.lastName !== originalData.lastName) {
        updateData.lastName = profileData.lastName
      }
      if (profileData.email !== originalData.email) {
        updateData.email = profileData.email
      }
      if (profileData.phone !== originalData.phone) {
        updateData.phone = profileData.phone
      }
      if (finalAvatarUrl !== originalData.avatarUrl) {
        updateData.avatarUrl = finalAvatarUrl
      }
      if (profileData.dateOfBirth !== originalData.dateOfBirth) {
        updateData.dateOfBirth = profileData.dateOfBirth
      }
      if (profileData.gender !== originalData.gender) {
        updateData.gender = profileData.gender as 'male' | 'female' | 'other'
      }
      if (profileData.bio !== originalData.bio) {
        updateData.bio = profileData.bio
      }
      if (profileData.idCardNumber !== originalData.idCardNumber) {
        updateData.idCardNumber = profileData.idCardNumber
      }
      if (profileData.bankAccount !== originalData.bankAccount) {
        updateData.bankAccount = profileData.bankAccount
      }
      if (profileData.bankName !== originalData.bankName) {
        updateData.bankName = profileData.bankName
      }

      let updatedUser = null
      if (Object.keys(updateData).length > 0) {
        updatedUser = await updateUserProfile(updateData)
      }

      if (updatedUser) {
        const convertedUser = {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          gender: updatedUser.gender,
          role: updatedUser.role,
          bio: updatedUser.bio,
          dateOfBirth: updatedUser.dateOfBirth,
          avatarUrl: updatedUser.avatarUrl,
          idCardNumber: updatedUser.idCardNumber,
          bankAccount: updatedUser.bankAccount,
          bankName: updatedUser.bankName,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        }
        
        const storeState = useUserStore.getState()
        useUserStore.setState({
          ...storeState,
          user: convertedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        setProfileData({
          firstName: convertedUser.firstName,
          lastName: convertedUser.lastName,
          email: convertedUser.email || '',
          phone: convertedUser.phone || '',
          avatarUrl: convertedUser.avatarUrl || '',
          dateOfBirth: convertedUser.dateOfBirth || '',
          gender: convertedUser.gender || '',
          role: convertedUser.role || 'tenant',
          bio: convertedUser.bio || '',
          idCardNumber: convertedUser.idCardNumber || '',
          bankAccount: convertedUser.bankAccount || '',
          bankName: convertedUser.bankName || '',
        })
        setOriginalData({
          firstName: convertedUser.firstName,
          lastName: convertedUser.lastName,
          email: convertedUser.email || '',
          phone: convertedUser.phone || '',
          avatarUrl: convertedUser.avatarUrl || '',
          dateOfBirth: convertedUser.dateOfBirth || '',
          gender: convertedUser.gender || '',
          role: convertedUser.role || 'tenant',
          bio: convertedUser.bio || '',
          idCardNumber: convertedUser.idCardNumber || '',
          bankAccount: convertedUser.bankAccount || '',
          bankName: convertedUser.bankName || '',
        })
      }

      if (pendingAvatarPreview) {
        URL.revokeObjectURL(pendingAvatarPreview)
        setPendingAvatarPreview(null)
      }
      setPendingAvatarFile(null)
      toast.success("Cập nhật thông tin thành công!")
      setIsEditing(false)
    } catch (error) {
      toast.error("Lỗi cập nhật profile: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <Card className="p-8 space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 relative">
            {user?.avatarUrl ? (
              <SizingImage 
                src={user.avatarUrl.replace(/^\/images\//, '').replace(/^\//, '')} 
                srcSize="256x256" 
                alt="Avatar" 
                className="object-cover" 
                fill
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Avatar</div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-gray-600">{user?.phone}</p>
            {profileData.bio && (
              <div className="mt-3">
                <p className="text-gray-700 text-sm leading-relaxed">{profileData.bio}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
            <p className="text-gray-900">{profileData.firstName || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
            <p className="text-gray-900">{profileData.lastName || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-gray-900">{profileData.email || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <p className="text-gray-900">{profileData.phone || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <p className="text-gray-900">
              {profileData.gender === ''
                ? 'Chưa cập nhật'
                : profileData.gender === 'female'
                  ? 'Nữ'
                  : profileData.gender === 'male'
                    ? 'Nam'
                    : 'Khác'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
            <p className="text-gray-900">{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <p className="text-gray-900">{profileData.role === 'tenant' ? 'Người thuê trọ' : 'Chủ nhà trọ'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CCCD</label>
            <p className="text-gray-900">{profileData.idCardNumber || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản ngân hàng</label>
            <p className="text-gray-900">{profileData.bankAccount || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên ngân hàng</label>
            <p className="text-gray-900">{profileData.bankName || 'Chưa cập nhật'}</p>
          </div>
        </div>

        <Button onClick={() => {
          setIsEditing(true)
          setOriginalData({...profileData})
        }} variant="outline">
          Chỉnh sửa thông tin
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <h2>Cập nhật thông tin cá nhân</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 relative">
              {pendingAvatarPreview ? (
                <Image src={pendingAvatarPreview} alt="Avatar preview" fill className="object-cover" unoptimized />
              ) : profileData.avatarUrl ? (
                <SizingImage 
                  src={profileData.avatarUrl.replace(/^\/images\//, '').replace(/^\//, '')} 
                  srcSize="256x256" 
                  alt="Avatar preview" 
                  className="object-cover" 
                  fill
                />
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
                  if (file) handleAvatarFileSelect(file)
                  e.target.value = ''
                }}
                disabled={isLoading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg 
                           file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {pendingAvatarFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Đã chọn: {pendingAvatarFile.name}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Chấp nhận: JPG, PNG, GIF. Tối đa 5MB.
              </p>
            </div>
          </div>
        </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <Input
              value={profileData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Nhập email"
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
            <Input
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Nhập số điện thoại"
              type="tel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính *</label>
            <Select
              value={profileData.gender}
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline" 
                  className="w-48 justify-between font-normal"
                >
                  {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('vi-VN') : "Chọn ngày sinh"}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined}
                  onSelect={(date) => handleInputChange('dateOfBirth', date?.toISOString() || '')}
                  disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò *</label>
            <Select
              value={profileData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">Người thuê trọ</SelectItem>
                <SelectItem value="landlord">Chủ nhà trọ</SelectItem>
              </SelectContent>
            </Select>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu bản thân</label>
          <Textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Viết vài dòng giới thiệu về bản thân..."
            rows={4}
          />
        </div>

        <div className="flex space-x-4">
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700"
            disabled={!hasChanges() || isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu thông tin"}
          </Button>
          <Button onClick={() => {
            setProfileData({...originalData})
            if (pendingAvatarPreview) {
              URL.revokeObjectURL(pendingAvatarPreview)
              setPendingAvatarPreview(null)
            }
            setPendingAvatarFile(null)
            setIsEditing(false)
          }} variant="outline">Hủy</Button>
        </div>
      </div>
    </Card>
  )
}

function PersonalProfileContent() {
  const { user } = useUserStore()

  return (
    <DashboardLayout userType={user?.role === 'tenant' ? 'tenant' : 'landlord'}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
        </div>

        <div className="space-y-6">
          <ProfileContent user={user} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function PersonalProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <PersonalProfileContent />
    </Suspense>
  )
}