"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Key, Eye, EyeOff, Mail } from "lucide-react"
import { ProfileLayout } from "@/components/profile/profile-layout"
import { useUserStore } from "@/stores/userStore"
import { translateErrorMessage } from "@/utils/errorTranslation"

function ChangePasswordCard() {
  const { changePassword } = useUserStore()
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const translatedError = translateErrorMessage(errorMessage, "Đổi mật khẩu thất bại")
      toast.error(translatedError)
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

function ChangeEmailCard() {
  const { user, requestChangeEmail, confirmChangeEmail } = useUserStore()
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
    verificationCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const handleRequestChangeEmail = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!emailData.newEmail || !emailData.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin!")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailData.newEmail)) {
      toast.error("Email không hợp lệ!")
      return
    }

    setIsLoading(true)
    try {
      await requestChangeEmail({
        newEmail: emailData.newEmail,
        password: emailData.password
      })
      
      setOtpSent(true)
      toast.success("Mã OTP đã được gửi đến email mới!")

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const translatedError = translateErrorMessage(errorMessage, "Gửi mã OTP thất bại")
      toast.error(translatedError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmChangeEmail = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    
    if (!emailData.verificationCode) {
      toast.error("Vui lòng nhập mã OTP!")
      return
    }

    setIsLoading(true)
    try {
      await confirmChangeEmail({
        newEmail: emailData.newEmail,
        verificationCode: emailData.verificationCode
      })
      toast.success("Đổi email thành công!")
      setIsChangingEmail(false)
      setOtpSent(false)
      setEmailData({ newEmail: '', password: '', verificationCode: '' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const translatedError = translateErrorMessage(errorMessage, "Xác thực mã OTP thất bại")
      toast.error(translatedError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsChangingEmail(false)
    setOtpSent(false)
    setEmailData({ newEmail: '', password: '', verificationCode: '' })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <h3 className="text-lg font-medium">Đổi email</h3>
        </div>
        {!isChangingEmail && (
          <Button onClick={() => setIsChangingEmail(true)} variant="outline">
            Đổi email
          </Button>
        )}
      </div>

      {!isChangingEmail ? (
        <div>
          <p className="text-gray-600 mb-2">Email hiện tại: <span className="font-medium">{user?.email}</span></p>
          <p className="text-gray-600 text-sm">Đảm bảo email của bạn luôn cập nhật để nhận thông báo quan trọng</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Email mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email mới *</label>
            <Input
              type="email"
              value={emailData.newEmail}
              onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
              placeholder="Nhập email mới"
              disabled={otpSent}
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại *</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={emailData.password}
                onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Nhập mật khẩu để xác thực"
                className="pr-12"
                disabled={otpSent}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
                disabled={otpSent}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Nút gửi OTP */}
          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={handleRequestChangeEmail}
              className="bg-green-600 hover:bg-green-700"
              disabled={!emailData.newEmail || !emailData.password || isLoading || otpSent}
            >
              {isLoading ? "Đang gửi..." : otpSent ? "Đã gửi mã OTP" : "Gửi mã OTP"}
            </Button>
            {!otpSent && (
              <Button type="button" onClick={handleCancel} variant="outline">
                Hủy
              </Button>
            )}
          </div>

          {/* Phần OTP - Hiện sau khi gửi */}
          {otpSent && (
            <>
              <div className="border-t pt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Mã OTP đã được gửi đến <span className="font-medium">{emailData.newEmail}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã OTP *</label>
                  <Input
                    type="text"
                    value={emailData.verificationCode}
                    onChange={(e) => setEmailData(prev => ({ ...prev, verificationCode: e.target.value }))}
                    placeholder="Nhập mã OTP (6 số)"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <div className="flex space-x-3 mt-4">
                  <Button
                    type="button"
                    onClick={handleConfirmChangeEmail}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!emailData.verificationCode || isLoading}
                  >
                    {isLoading ? "Đang xác thực..." : "Xác nhận"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setOtpSent(false)
                      setEmailData(prev => ({ ...prev, verificationCode: '' }))
                    }} 
                    variant="outline"
                  >
                    Gửi lại mã
                  </Button>
                  <Button type="button" onClick={handleCancel} variant="outline">
                    Hủy
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  )
}

function SecurityContent() {
  //const { user } = useUserStore()

  return (
    <ProfileLayout>
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bảo mật</h1>
          <p className="text-gray-600">Quản lý mật khẩu và bảo mật tài khoản</p>
        </div>

        <div className="space-y-6">
          <ChangePasswordCard />
          <ChangeEmailCard />
        </div>
      </div>
    </ProfileLayout>
  )
}

export default function SecurityPage() {
  return <SecurityContent />
}