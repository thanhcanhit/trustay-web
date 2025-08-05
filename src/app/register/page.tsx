"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/stores/userStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
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
import {
  validatePassword,
  getPasswordValidationErrors,
  calculatePasswordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor
} from "@/utils/passwordValidation"
import { translateRegistrationError, translateVerificationError } from "@/utils/errorTranslation"

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

  // Password validation state
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [showPasteWarning, setShowPasteWarning] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Update password validation when password changes
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)

    // Get validation errors
    const errors = getPasswordValidationErrors(newPassword)
    setPasswordErrors(errors)
  }

  // Handle confirm password change with copy-paste prevention
  const handleConfirmPasswordChange = (newConfirmPassword: string) => {
    setConfirmPassword(newConfirmPassword)
  }

  // Prevent copy-paste in confirm password field
  const handleConfirmPasswordPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    // Show warning message
    setShowPasteWarning(true)
    // Hide warning after 3 seconds
    setTimeout(() => setShowPasteWarning(false), 3000)
  }

  // Prevent keyboard shortcuts for copy/paste/cut
  const handleConfirmPasswordKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Ctrl+V, Ctrl+C, Ctrl+X, Ctrl+A
    if (e.ctrlKey && (e.key === 'v' || e.key === 'c' || e.key === 'x' || e.key === 'a')) {
      e.preventDefault()
      setShowPasteWarning(true)
      setTimeout(() => setShowPasteWarning(false), 3000)
    }
  }

  // Prevent right-click context menu
  const handleConfirmPasswordContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const passwordStrength = calculatePasswordStrength(password)

  const router = useRouter()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      const errorMsg = "Mật khẩu không khớp!"
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!email || !password || !firstName || !lastName || !phone) {
      const errorMsg = "Vui lòng điền đầy đủ thông tin!"
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    // Validate password strength
    if (!validatePassword(password)) {
      const errors = getPasswordValidationErrors(password)
      const errorMsg = `Mật khẩu không đủ mạnh:\n${errors.join('\n')}`
      setError(errorMsg)
      toast.error(`Mật khẩu không đủ mạnh:\n\n${errors.join('\n')}`, {
        duration: 5000,
      })
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

        // Show success toast
        toast.success(`Đăng ký thành công! Chào mừng ${user.firstName} ${user.lastName} đến với Trustay`, {
          duration: 3000,
        })

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          if (role === 'tenant') {
            router.push("/dashboard/tenant")
          } else {
            router.push("/dashboard/landlord")
          }
        }, 1500)
      } else {
        // Send verification email
        await sendEmailVerification(email)
        toast.success(`Mã xác thực đã được gửi đến email: ${email}. Vui lòng kiểm tra hộp thư của bạn.`, {
          duration: 4000,
        })
        setCurrentStep('verification')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? translateRegistrationError(error.message) : 'Đăng ký thất bại';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!verificationCode) {
      const errorMsg = "Vui lòng nhập mã xác thực!"
      setError(errorMsg)
      toast.error(errorMsg)
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

        // Show success toast for email verification
        toast.success('Xác thực email thành công! Vui lòng hoàn thiện thông tin cá nhân.', {
          duration: 3000,
        })

        // Move to profile update step instead of redirecting directly
        setCurrentStep('profile-update')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? translateVerificationError(error.message) : 'Xác thực thất bại';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
      });
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

      // Show success toast
      toast.success('Cập nhật thông tin thành công! Chào mừng bạn đến với Trustay!', {
        duration: 3000,
      })

      // Use server action for navigation after a short delay
      setTimeout(async () => {
        const formData = new FormData()
        formData.append('role', role)
        await completeRegistration(formData)
      }, 1500)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? translateRegistrationError(error.message) : 'Cập nhật thông tin thất bại';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
      });
      setIsLoading(false)
    }
  }

  const handleSkipProfileUpdate = async () => {
    // Show confirmation toast
    const confirmed = confirm('Bạn có chắc muốn bỏ qua cập nhật thông tin? Bạn có thể cập nhật sau trong trang cá nhân.')

    if (confirmed) {
      toast.success('Đăng ký thành công! Chào mừng bạn đến với Trustay!', {
        duration: 3000,
      })
      // Use server action for navigation after a short delay
      setTimeout(async () => {
        await skipProfileUpdate()
      }, 1500)
    }
  }

  const resendVerification = async () => {
    setIsLoading(true)
    setError("")

    try {
      await sendEmailVerification(email)
      toast.success(`Mã xác thực mới đã được gửi đến email: ${email}. Vui lòng kiểm tra hộp thư của bạn.`, {
        duration: 4000,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? translateVerificationError(error.message) : 'Gửi lại mã thất bại';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex">
      <div className="flex w-full">
        {/* Left Side - Image */}
        <div className="w-2/5 px-6 hidden lg:flex overflow-hidden">
          <Image
            src="/goal.png"
            alt="Goal"
            width={1500}
            height={1500}
            className="object-cover h-full"
          />
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-3/5 bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <div className="text-center mb-4">
              {/* Logo */}
              <div className="mx-auto rounded-xl flex items-center justify-center mb-4">
                <Image
                  src="/logo.png"
                  alt="Trustay Logo"
                  width={200}
                  height={100}
                />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
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

          {currentStep === 'form' ? (
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center h-11 px-4 border rounded-lg cursor-pointer transition-colors ${
                  role === 'tenant'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300 bg-white'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="tenant"
                    checked={role === 'tenant'}
                    onChange={(e) => setRole(e.target.value as 'tenant' | 'landlord')}
                    className="mr-3 text-green-600 focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">Người thuê trọ</span>
                </label>
                <label className={`flex items-center h-11 px-4 border rounded-lg cursor-pointer transition-colors ${
                  role === 'landlord'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300 bg-white'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="landlord"
                    checked={role === 'landlord'}
                    onChange={(e) => setRole(e.target.value as 'tenant' | 'landlord')}
                    className="mr-3 text-green-600 focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">Chủ trọ</span>
                </label>
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
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
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
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              />

              {/* Phone and Gender */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                  disabled={isLoading}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 bg-white"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full h-11 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
                      <span className="text-xs font-medium text-gray-700">
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>

                    {/* Password Validation Errors */}
                    {passwordErrors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {passwordErrors.map((error, index) => (
                          <p key={index} className="text-xs text-red-600 flex items-center">
                            <span className="mr-1">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    onPaste={handleConfirmPasswordPaste}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onKeyDown={handleConfirmPasswordKeyDown}
                    onContextMenu={handleConfirmPasswordContextMenu}
                    required
                    disabled={isLoading}
                    className="w-full h-11 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Paste Warning */}
                {showPasteWarning && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Vui lòng nhập lại mật khẩu thay vì copy-paste để đảm bảo chính xác
                    </p>
                  </div>
                )}

                {/* Password Match Indicator */}
                {confirmPassword && password && (
                  <div className="mt-2">
                    {password === confirmPassword ? (
                      <p className="text-xs text-green-600 flex items-center">
                        <span className="mr-1">✓</span>
                        Mật khẩu khớp
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 flex items-center">
                        <span className="mr-1">✗</span>
                        Mật khẩu không khớp
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="developmentMode"
                  checked={isDevelopmentMode}
                  onChange={(e) => setIsDevelopmentMode(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                />
                <label htmlFor="developmentMode" className="text-sm text-gray-600">
                  Chế độ phát triển (bỏ qua xác thực email)
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
                </Button>
              </div>

              {/* OR Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Zalo Registration */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-3 px-4 border border-blue-500 text-blue-500 hover:bg-blue-50 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📱</span>
                  <span>Đăng ký bằng Zalo</span>
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
        </div>
      </div>
    </div>
  )
}
