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
  sendPhoneVerification,
  verifyEmailCode,
  verifyPhoneCode,
  registerWithVerification,
  registerWithVerificationNoPhone,
  type RegisterRequest,
} from "@/actions"
import Image from "next/image"
import {
  calculatePasswordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor
} from "@/utils/passwordValidation"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, PhoneCall } from "lucide-react"
import { cleanEmail } from "@/utils/emailValidation"
import { RegistrationErrorHandler, type ValidationErrors } from "@/utils/registrationErrorHandler"

type RegistrationStep = 'contact' | 'verification' | 'personal-info'
type ContactType = 'email' | 'phone'

const errorHandler = new RegistrationErrorHandler()

export default function RegisterPage() {
  const router = useRouter()

  // Step 1: Contact information
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('contact')
  const [contactType, setContactType] = useState<ContactType>('email')
  const [contactValue, setContactValue] = useState("")

  // Step 2: OTP verification
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationToken, setVerificationToken] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)

  // Step 3: Personal information
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant')

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false)

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Helper functions
  const syncErrors = () => {
    setValidationErrors(errorHandler.getErrors())
  }

  const setValidationError = (field: keyof ValidationErrors, error: string) => {
    errorHandler.setError(field, error)
    syncErrors()
  }

  const clearAllValidationErrors = () => {
    errorHandler.clearAll()
    syncErrors()
  }

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

  // Calculate password strength
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

  // Detect contact type
  const detectContactType = (value: string): ContactType => {
    // If starts with digits, assume phone
    if (/^[0-9]/.test(value)) {
      return 'phone'
    }
    // Otherwise assume email
    return 'email'
  }

  // Handle contact value change
  const handleContactValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setContactValue(value)

    // Auto-detect contact type
    if (value) {
      const detectedType = detectContactType(value)
      setContactType(detectedType)
    }

    // Clear errors
    errorHandler.handleFieldChange('email', true)
    errorHandler.handleFieldChange('phone')
    syncErrors()
  }

  // Step 1: Send verification code
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearAllValidationErrors()

    if (!contactValue) {
      toast.error("Vui lòng nhập email hoặc số điện thoại!")
      return
    }

    setIsLoading(true)

    try {
      let result

      if (contactType === 'email') {
        const cleanedEmail = cleanEmail(contactValue)

        // Validate email
        const emailError = errorHandler.validateField('email', cleanedEmail)
        if (emailError) {
          setValidationError('email', emailError)
          toast.error(emailError)
          setIsLoading(false)
          return
        }

        result = await sendEmailVerification(cleanedEmail)

        if (!result.success) {
          const mockError = new Error(result.error)
          const { message } = errorHandler.handleServerError(mockError, 'registration')
          syncErrors()
          toast.error(message)
          setIsLoading(false)
          return
        }

        // Store email for later
        setEmail(cleanedEmail)
        toast.success(`Mã xác thực đã được gửi đến email: ${cleanedEmail}`)
      } else {
        // Validate phone
        const phoneError = errorHandler.validateField('phone', contactValue)
        if (phoneError) {
          setValidationError('phone', phoneError)
          toast.error(phoneError)
          setIsLoading(false)
          return
        }

        result = await sendPhoneVerification(contactValue)

        if (!result.success) {
          const mockError = new Error(result.error)
          const { message } = errorHandler.handleServerError(mockError, 'registration')
          syncErrors()
          toast.error(message)
          setIsLoading(false)
          return
        }

        // Store phone for later
        setPhone(contactValue)
        // Auto-fill OTP mặc định cho số điện thoại
        setVerificationCode("123456")
        toast.success(`Mã xác thực đã được gửi đến số điện thoại: ${contactValue} (OTP mặc định: 123456)`)
      }

      // Move to verification step
      setCurrentStep('verification')
      setCountdown(300) // 5 minutes
      setCanResend(false)
    } catch (error: unknown) {
      console.error('Send verification error:', error)
      const { message } = errorHandler.handleServerError(error, 'registration')
      syncErrors()
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearAllValidationErrors()

    if (!verificationCode) {
      toast.error("Vui lòng nhập mã xác thực!")
      return
    }

    setIsLoading(true)

    try {
      let verifyResult

      if (contactType === 'email') {
        verifyResult = await verifyEmailCode(email, verificationCode)
      } else {
        verifyResult = await verifyPhoneCode(phone, verificationCode)
      }

      if (!verifyResult.success) {
        const mockError = new Error(verifyResult.error)
        const { message } = errorHandler.handleServerError(mockError, 'verification')
        syncErrors()
        toast.error(message)
        setIsLoading(false)
        return
      }

      const verifyResponse = verifyResult.data
      if (verifyResponse.verificationToken) {
        setVerificationToken(verifyResponse.verificationToken)
        toast.success('Xác thực thành công!')

        // Move to personal info step
        setCurrentStep('personal-info')
      }
    } catch (error: unknown) {
      const { message } = errorHandler.handleServerError(error, 'verification')
      syncErrors()
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Resend verification code
  const resendVerification = async () => {
    if (!canResend || isLoading) return

    setIsLoading(true)
    clearAllValidationErrors()

    try {
      let result

      if (contactType === 'email') {
        result = await sendEmailVerification(email)
      } else {
        result = await sendPhoneVerification(phone)
      }

      if (!result.success) {
        const mockError = new Error(result.error)
        const { message } = errorHandler.handleServerError(mockError, 'verification')
        syncErrors()
        toast.error(message)
        setIsLoading(false)
        return
      }

      toast.success(`Mã xác thực mới đã được gửi!`)
      setCountdown(300)
      setCanResend(false)
      setVerificationCode("")
    } catch (error: unknown) {
      const { message } = errorHandler.handleServerError(error, 'verification')
      syncErrors()
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Complete registration
  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearAllValidationErrors()

    // Validate all fields
    const errors: Partial<ValidationErrors> = {}

    if (!firstName) errors.firstName = "Vui lòng nhập họ"
    if (!lastName) errors.lastName = "Vui lòng nhập tên"
    if (!password) errors.password = "Vui lòng nhập mật khẩu"
    if (!confirmPassword) errors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    if (password !== confirmPassword) errors.confirmPassword = "Mật khẩu không khớp"

    const passwordError = errorHandler.validateField('password', password)
    if (passwordError) errors.password = passwordError

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, error]) => {
        if (error) setValidationError(field as keyof ValidationErrors, error)
      })
      toast.error("Vui lòng điền đầy đủ thông tin!")
      return
    }

    setIsLoading(true)

    try {
      // Prepare user data based on contact type
      let authResult

      if (contactType === 'email') {
        // Register with email (phone is optional)
        authResult = await registerWithVerificationNoPhone({
          email,
          password,
          firstName,
          lastName,
          gender,
          role,
        }, verificationToken)
      } else {
        // Register with phone (email is optional)
        if (email) {
          // Register with both phone and email
          authResult = await registerWithVerification({
            email,
            phone,
            password,
            firstName,
            lastName,
            gender,
            role,
          }, verificationToken)
        } else {
          // Register with phone only (no email)
          authResult = await registerWithVerificationNoPhone({
            phone,
            password,
            firstName,
            lastName,
            gender,
            role,
          } as RegisterRequest, verificationToken)
        }
      }

      if (!authResult.success) {
        const mockError = new Error(authResult.error)
        const { message } = errorHandler.handleServerError(mockError, 'registration')
        syncErrors()
        toast.error(message)
        setIsLoading(false)
        return
      }

      // Success - set authentication state
      const authResponse = authResult.data
      useUserStore.getState().setAuthFromResponse(authResponse)

      toast.success('Đăng ký thành công! Chào mừng bạn đến với Trustay!', {
        duration: 3000,
      })

      // Redirect to appropriate dashboard based on role
      setTimeout(() => {
        if (role === 'tenant') {
          router.push('/dashboard/tenant')
        } else if (role === 'landlord') {
          router.push('/dashboard/landlord')
        } else {
          router.push('/profile')
        }
      }, 1500)
    } catch (error: unknown) {
      const { message } = errorHandler.handleServerError(error, 'registration')
      syncErrors()
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Format seconds as MM:SS
  const formatTime = (remainingTime: number): string => {
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
        <div className="w-full lg:w-3/5 bg-white flex items-center justify-center p-8">
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
                {currentStep === 'contact' && 'ĐĂNG KÝ'}
                {currentStep === 'verification' && 'XÁC THỰC'}
                {currentStep === 'personal-info' && 'THÔNG TIN CÁ NHÂN'}
              </h2>
              <p className="text-gray-600 text-sm">
                {currentStep === 'contact' && 'Nhập email hoặc số điện thoại để bắt đầu'}
                {currentStep === 'verification' && `Nhập mã xác thực đã gửi đến ${contactType === 'email' ? email : phone}`}
                {currentStep === 'personal-info' && 'Hoàn tất thông tin để hoàn thành đăng ký'}
              </p>
            </div>

            {/* Step 1: Contact Information */}
            {currentStep === 'contact' && (
              <form className="space-y-4" onSubmit={handleContactSubmit}>
                <div>
                  <Input
                    id="contact"
                    name="contact"
                    type="text"
                    placeholder="Email hoặc số điện thoại"
                    value={contactValue}
                    onChange={handleContactValueChange}
                    required
                    disabled={isLoading}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                      validationErrors.email || validationErrors.phone ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
                  )}
                  {validationErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.phone}</p>
                  )}
                  {contactValue && !validationErrors.email && !validationErrors.phone && (
                    <p className="text-xs text-gray-600 mt-1">
                      Đã phát hiện: {contactType === 'email' ? 'Email' : 'Số điện thoại'}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || !contactValue}
                    className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? "ĐANG GỬI..." : "TIẾP TỤC"}
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
                    className="w-full h-11 py-3 px-4 bg-blue-400 text-white hover:text-white hover:bg-blue-500 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Đăng ký bằng Zalo</span>
                  </Button>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-sm">
                    Đã có tài khoản?  &nbsp;
                    <a href="/login" className="text-green-600 hover:text-green-500">
                      Đăng nhập
                    </a>
                  </p>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 'verification' && (
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
                    className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? "ĐANG XÁC THỰC..." : "XÁC THỰC"}
                  </Button>
                </div>

                <div className="text-center space-y-2 pt-4">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setCurrentStep('contact')
                      setVerificationCode("")
                    }}
                    disabled={isLoading}
                    className="text-sm text-gray-600 hover:text-gray-500 disabled:opacity-50 h-auto p-0"
                  >
                    ← Quay lại
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Personal Information */}
            {currentStep === 'personal-info' && (
              <form className="space-y-4" onSubmit={handlePersonalInfoSubmit}>
                {/* Role Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Vai trò</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value: string) => setRole(value as 'tenant' | 'landlord')}
                    className="grid grid-cols-2 gap-3"
                    disabled={isLoading}
                  >
                    <div className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                      role === 'tenant'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                    }`}>
                      <RadioGroupItem
                        value="tenant"
                        id="tenant"
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 data-[state=checked]:border-green-500"
                      />
                      <Label htmlFor="tenant" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                        Người thuê trọ
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                      role === 'landlord'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                    }`}>
                      <RadioGroupItem
                        value="landlord"
                        id="landlord"
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 data-[state=checked]:border-green-500"
                      />
                      <Label htmlFor="landlord" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                        Chủ trọ
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Tên"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isLoading}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                        validationErrors.lastName ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.lastName && (
                      <p className="text-xs text-red-600 mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Họ"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isLoading}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                        validationErrors.firstName ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.firstName && (
                      <p className="text-xs text-red-600 mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                </div>

                {/* Email field (if registered with phone) */}
                {contactType === 'phone' && (
                  <div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email (tùy chọn)"
                      value={email}
                      onChange={(e) => setEmail(cleanEmail(e.target.value))}
                      disabled={isLoading}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                        validationErrors.email ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                )}

                {/* Gender */}
                <Select
                  value={gender}
                  onValueChange={(value: string) => setGender(value as 'male' | 'female' | 'other')}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full !h-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>

                {/* Password */}
                <div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      required
                      disabled={isLoading}
                      className={`w-full h-11 px-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                        validationErrors.password ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (isPasswordFocused || passwordStrength < 85) && (
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

                  {validationErrors.password && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.password}</p>
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
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setIsConfirmPasswordFocused(true)}
                      onBlur={() => setIsConfirmPasswordFocused(false)}
                      required
                      disabled={isLoading}
                      className={`w-full h-11 px-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                        validationErrors.confirmPassword ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Password Match Indicator */}
                  {confirmPassword && password && (isConfirmPasswordFocused || password !== confirmPassword) && (
                    <div className="mt-2">
                      {password === confirmPassword ? (
                        <p className="text-xs text-green-600 flex items-center">
                          Mật khẩu khớp
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 flex items-center">
                          Mật khẩu không khớp
                        </p>
                      )}
                    </div>
                  )}

                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? "ĐANG XỬ LÝ..." : "HOÀN TẤT ĐĂNG KÝ"}
                  </Button>
                </div>

                <div className="text-center space-y-2 pt-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setCurrentStep('verification')}
                    disabled={isLoading}
                    className="text-sm text-gray-600 hover:text-gray-500 disabled:opacity-50 h-auto p-0"
                  >
                    ← Quay lại
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
