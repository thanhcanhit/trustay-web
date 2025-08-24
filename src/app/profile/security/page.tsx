"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { changePassword } from "@/actions/user.action"
import { toast } from "sonner"
import { Key, Eye, EyeOff } from "lucide-react"
import { ProfileLayout } from "@/components/profile/profile-layout"
//import { useUserStore } from "@/stores/userStore"

function ChangePasswordCard() {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
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
            <div className="relative">
              <Input
                type={showPasswords.currentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => togglePasswordVisibility('currentPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.currentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới *</label>
            <div className="relative">
              <Input
                type={showPasswords.newPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => togglePasswordVisibility('newPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.newPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới *</label>
            <div className="relative">
              <Input
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
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

function SecurityContent() {
  //const { user } = useUserStore()

  return (
    <ProfileLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bảo mật</h1>
          <p className="text-gray-600">Quản lý mật khẩu và bảo mật tài khoản</p>
        </div>

        <div className="space-y-6">
          <ChangePasswordCard />
        </div>
      </div>
    </ProfileLayout>
  )
}

export default function SecurityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <SecurityContent />
    </Suspense>
  )
}