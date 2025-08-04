"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/stores/userStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  sendEmailVerification,
  verifyEmailCode,
  registerWithVerification,
  registerDirect,
  updateUserProfile,
  completeRegistration,
  skipProfileUpdate
} from "@/actions"
import Image from "next/image"

type RegistrationStep = 'form' | 'verification' | 'profile-update'

export default function RegisterPage() {
  // Form data
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant')

  // Profile update data
  const [bio, setBio] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")

  // UI state
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('form')
  const [verificationCode, setVerificationCode] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false)


  const router = useRouter()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!")
      return
    }

    if (!email || !password || !firstName || !lastName || !phone) {
      setError("Vui lòng điền đầy đủ thông tin!")
      return
    }

    setIsLoading(true)

    try {
      if (isDevelopmentMode) {
        // Direct registration for development
        const authResponse = await registerDirect({
          email,
          password,
          firstName,
          lastName,
          phone,
          gender,
          role,
        })

        // Convert to user store format and login
        const user = {
          id: authResponse.user.id,
          firstName: authResponse.user.firstName,
          lastName: authResponse.user.lastName,
          email: authResponse.user.email,
          phone: authResponse.user.phone,
          gender: authResponse.user.gender,
          role: authResponse.user.role,
          bio: authResponse.user.bio,
          dateOfBirth: authResponse.user.dateOfBirth,
          avatar: authResponse.user.avatar,
          createdAt: authResponse.user.createdAt,
          updatedAt: authResponse.user.updatedAt,
        }

        useUserStore.setState({ user, isAuthenticated: true })

        // Redirect to dashboard
        if (role === 'tenant') {
          router.push("/dashboard/tenant")
        } else {
          router.push("/dashboard/landlord")
        }
      } else {
        // Send verification email
        await sendEmailVerification(email)
        setCurrentStep('verification')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng ký thất bại';
      setError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!verificationCode) {
      setError("Vui lòng nhập mã xác thực!")
      return
    }

    setIsLoading(true)

    try {
      // Verify email code
      const verifyResponse = await verifyEmailCode(email, verificationCode)

      if (verifyResponse.verificationToken) {
        // Register with verification token
        const authResponse = await registerWithVerification({
          email,
          password,
          firstName,
          lastName,
          phone,
          gender,
          role,
        }, verifyResponse.verificationToken)

        // Convert to user store format and login
        const user = {
          id: authResponse.user.id,
          firstName: authResponse.user.firstName,
          lastName: authResponse.user.lastName,
          email: authResponse.user.email,
          phone: authResponse.user.phone,
          gender: authResponse.user.gender,
          role: authResponse.user.role,
          bio: authResponse.user.bio,
          dateOfBirth: authResponse.user.dateOfBirth,
          avatar: authResponse.user.avatar,
          createdAt: authResponse.user.createdAt,
          updatedAt: authResponse.user.updatedAt,
        }

        useUserStore.setState({ user, isAuthenticated: true })

        // Move to profile update step instead of redirecting directly
        setCurrentStep('profile-update')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Xác thực thất bại';
      setError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update profile with additional information
      await updateUserProfile({
        firstName,
        lastName,
        phone,
        gender,
        bio,
        dateOfBirth,
      })

      // Use server action for navigation
      const formData = new FormData()
      formData.append('role', role)
      await completeRegistration(formData)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Cập nhật thông tin thất bại';
      setError(errorMessage);
      setIsLoading(false)
    }
  }

  const handleSkipProfileUpdate = async () => {
    // Use server action for navigation
    await skipProfileUpdate()
  }

  const resendVerification = async () => {
    setIsLoading(true)
    setError("")

    try {
      await sendEmailVerification(email)
      // You might want to show a success message here
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gửi lại mã thất bại';
      setError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2">
      <div className="flex justify-between max-w-4xl w-full">
        {/* Left Card - Register Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-96">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="mx-auto h-16 w-30 rounded-xl flex items-center justify-center mb-1">
              <Image
                src="/logo.png"
                alt="Trustay Logo"
                width={200}
                height={100}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStep === 'verification'
                ? 'XÁC THỰC EMAIL'
                : currentStep === 'profile-update'
                ? 'CẬP NHẬT THÔNG TIN'
                : 'ĐĂNG KÝ'
              }
            </h2>
            <p className="text-gray-600 text-sm">
              {currentStep === 'verification'
                ? `Nhập mã xác thực đã gửi đến ${email}`
                : currentStep === 'profile-update'
                ? 'Hoàn thiện thông tin cá nhân của bạn'
                : 'Tạo tài khoản mới để bắt đầu'
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {currentStep === 'form' ? (
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vai trò
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="tenant"
                      checked={role === 'tenant'}
                      onChange={(e) => setRole(e.target.value as 'tenant' | 'landlord')}
                      className="mr-2 text-green-600 focus:ring-green-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">Người thuê trọ</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="landlord"
                      checked={role === 'landlord'}
                      onChange={(e) => setRole(e.target.value as 'tenant' | 'landlord')}
                      className="mr-2 text-green-600 focus:ring-green-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">Chủ trọ</span>
                  </label>
                </div>
              </div>

              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Tên"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Họ"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
              </div>

              {/* Phone */}
              <div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="developmentMode"
                  checked={isDevelopmentMode}
                  onChange={(e) => setIsDevelopmentMode(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="developmentMode" className="text-sm text-gray-600">
                  Chế độ phát triển (bỏ qua xác thực email)
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
                </Button>
              </div>

              <div className="text-center space-y-1 pt-4">
                <p className="text-sm">
                  Đã có tài khoản?  &nbsp;
                  <a href="/login" className="text-green-600 hover:text-green-500">
                     Đăng nhập
                  </a>
                </p>
              </div>
            </form>
          ) : currentStep === 'verification' ? (
            <form className="space-y-4" onSubmit={handleVerificationSubmit}>
              <div>
                <Input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  placeholder="Nhập mã xác thực 6 số"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 text-center text-lg tracking-widest"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "ĐANG XÁC THỰC..." : "XÁC THỰC"}
                </Button>
              </div>

              <div className="text-center space-y-2 pt-4">
                <p className="text-sm text-gray-600">
                  Không nhận được mã?
                </p>
                <button
                  type="button"
                  onClick={resendVerification}
                  disabled={isLoading}
                  className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50"
                >
                  Gửi lại mã xác thực
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setCurrentStep('form')}
                  disabled={isLoading}
                  className="text-sm text-gray-600 hover:text-gray-500 disabled:opacity-50"
                >
                  ← Quay lại form đăng ký
                </button>
              </div>
            </form>
          ) : (
            /* Profile Update Form */
            <form className="space-y-4" onSubmit={handleProfileUpdate}>
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới thiệu bản thân
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Viết vài dòng giới thiệu về bản thân..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 resize-none"
                />
              </div>

              {/* Date of Birth and Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={isLoading}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkipProfileUpdate}
                  disabled={isLoading}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Bỏ qua, cập nhật sau
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Right Card - Branding (giống y hệt trang login) */}
        <div className="flex flex-col justify-center items-center w-70">
          {/* Logo với biểu tượng map trắng */}
          <div className="rounded-2xl shadow-lg bg-green-500 bg-opacity-20 flex items-center justify-center mb-6 h-80 px-4">
            <Image
              src="/logo-slogan-white.png"
              alt="Trustay Logo"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
          <div className="space-y-3 text-sm text-center">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500"></div>
              <span>Tìm kiếm nhà trọ dễ dàng</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500"></div>
              <span>Kết nối với người cùng phòng</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500"></div>
              <span>Quản lý tài chính minh bạch</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500"></div>
              <span>Liên hệ qua Zalo tiện lợi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
