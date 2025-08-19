"use client"

import { useState, useEffect } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/stores/userStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  sendEmailVerification,
  verifyEmailCode,
  registerWithVerification,
} from "@/actions"
import Image from "next/image"
import {
  validatePassword,
  calculatePasswordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor,
  getPasswordValidationErrors
} from "@/utils/passwordValidation"
import { translateRegistrationError, translateVerificationError } from "@/utils/errorTranslation"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"

type RegistrationStep = 'form' | 'verification'

export default function RegisterPage() {
  const router = useRouter()
  
  // Form data
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant')


  // UI state
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('form')
  const [verificationCode, setVerificationCode] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  
  // OTP countdown state
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("")

  // Password validation state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Update password validation when password changes
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
  }

  // Handle confirm password change with copy-paste prevention
  const handleConfirmPasswordChange = (newConfirmPassword: string) => {
    setConfirmPassword(newConfirmPassword)
  }

  // Prevent right-click context menu
  const handleConfirmPasswordContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  // Calculate password strength when password changes
  useEffect(() => {
    const calculateStrength = async () => {
      if (password) {
        try {
          const strength = await calculatePasswordStrength(password)
          setPasswordStrength(strength)
        } catch (error) {
          console.error('Error calculating password strength:', error)
          setPasswordStrength(0)
        }
      } else {
        setPasswordStrength(0)
      }
    }
    
    calculateStrength()
  }, [password])

  // OTP countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [countdown])

  // Start countdown when moving to verification step
  useEffect(() => {
    if (currentStep === 'verification') {
      setCountdown(300) // 5 minutes countdown (300 seconds)
      setCanResend(false)
    }
  }, [currentStep])

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
      // Send verification email
      await sendEmailVerification(email)
      toast.success(`Mã xác thực đã được gửi đến email: ${email}. Vui lòng kiểm tra hộp thư của bạn.`, {
        duration: 4000,
      })
      setCurrentStep('verification')
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
          avatarUrl: authResponse.user.avatarUrl,
          createdAt: authResponse.user.createdAt,
          updatedAt: authResponse.user.updatedAt,
        }

        useUserStore.setState({ user, isAuthenticated: true })

        // Show success toast for email verification
        toast.success('Xác thực email thành công! Chào mừng bạn đến với Trustay!', {
          duration: 3000,
        })

        // Redirect to profile page after a short delay
        setTimeout(() => {
          router.push('/profile')
        }, 1500)
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


  const resendVerification = async () => {
    if (!canResend || isLoading) return
    
    setIsLoading(true)
    setError("")

    try {
      await sendEmailVerification(email)
      toast.success(`Mã xác thực mới đã được gửi đến email: ${email}. Vui lòng kiểm tra hộp thư của bạn.`, {
        duration: 4000,
      })
      // Reset countdown
      setCountdown(300) // 5 minutes
      setCanResend(false)
      setVerificationCode("") // Clear previous code
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



  // Format seconds as MM:SS
  function formatTime(remainingTime: number): React.ReactNode {
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
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
                  : 'ĐĂNG KÝ'
                }
              </h2>
              <p className="text-gray-600 text-sm">
                {currentStep === 'verification'
                  ? `Nhập mã xác thực đã gửi đến ${email}`
                  : 'Tạo tài khoản mới để bắt đầu'
                }
              </p>
            </div>

          {currentStep === 'form' ? (
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              {/* Role Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Vai trò</Label>
                <RadioGroup 
                  value={role} 
                  onValueChange={(value: string) => setRole(value as 'tenant' | 'landlord')}
                  className="grid grid-cols-2 gap-3"
                    disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tenant" id="tenant" />
                    <Label htmlFor="tenant" className="text-sm text-gray-700 cursor-pointer">Người thuê trọ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="landlord" id="landlord" />
                    <Label htmlFor="landlord" className="text-sm text-gray-700 cursor-pointer">Chủ trọ</Label>
                  </div>
                </RadioGroup>
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
                <Select
                  value={gender}
                  onValueChange={(value: string) => setGender(value as 'male' | 'female' | 'other')}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
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
                    onContextMenu={handleConfirmPasswordContextMenu}
                    required
                    disabled={isLoading}
                    className="w-full h-11 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

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
              <div className="flex justify-center">
                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={verificationCode} onChange={setVerificationCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="border border-gray-300 focus:border-green-500 mr-1" />
                    <InputOTPSlot index={1} className="border border-gray-300 focus:border-green-500 mr-1" />
                    <InputOTPSlot index={2} className="border border-gray-300 focus:border-green-500" />
                    <InputOTPSeparator/>
                    <InputOTPSlot index={3} className="border border-gray-300 focus:border-green-500 mr-1" />
                    <InputOTPSlot index={4} className="border border-gray-300 focus:border-green-500 mr-1" />
                    <InputOTPSlot index={5} className="border border-gray-300 focus:border-green-500 mr-1" />
                  </InputOTPGroup>
                 </InputOTP>
              </div>
              <div className="text-center space-y-2">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-600">
                    Thời gian còn lại: <span className="font-semibold text-red-500">{formatTime(countdown)}</span>
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    onClick={resendVerification}
                    disabled={isLoading}
                    className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50 font-medium h-auto p-0"
                  >
                    Gửi lại mã?
                  </Button>
                )}
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
                <Button
                  type="button"
                  variant="link"
                  onClick={resendVerification}
                  disabled={isLoading}
                  className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50 h-auto p-0"
                >
                  Gửi lại mã xác thực
                </Button>
                <br />
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setCurrentStep('form')}
                  disabled={isLoading}
                  className="text-sm text-gray-600 hover:text-gray-500 disabled:opacity-50 h-auto p-0"
                >
                  ← Quay lại form đăng ký
                </Button>
              </div>
            </form>
          ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
