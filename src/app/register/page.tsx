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
  registerWithVerificationNoPhone,
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
import { RegistrationErrorHandler, type ValidationErrors, type FormData } from "@/utils/registrationErrorHandler"

type RegistrationStep = 'form' | 'verification' | 'edit-phone'

// Use centralized error handler
const errorHandler = new RegistrationErrorHandler()

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

  // Password validation state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false)

  // Phone number error handling state
  const [showPhoneErrorDialog, setShowPhoneErrorDialog] = useState(false)
  const [verificationToken, setVerificationToken] = useState("")
  
  // Edit phone form state
  const [newPhone, setNewPhone] = useState("")

  // Validation errors state - simplified with centralized handler
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Sync errors with centralized handler
  const syncErrors = () => {
    setValidationErrors(errorHandler.getErrors())
  }

  // Helper functions using centralized handler
  const setValidationError = (field: keyof ValidationErrors, error: string) => {
    errorHandler.setError(field, error)
    syncErrors()
  }

  const clearAllValidationErrors = () => {
    errorHandler.clearAll()
    syncErrors()
  }

  // Check if form is valid and can be submitted
  const isFormValid = (): boolean => {
    const formData: FormData = { email, password, confirmPassword, firstName, lastName, phone }
    
    // Check required fields (phone is now optional)
    if (!email || !password || !firstName || !lastName) {
      return false
    }
    // Check if passwords match
    if (password !== confirmPassword) {
      return false
    }
    // Check if there are any validation errors
    if (errorHandler.hasErrors()) {
      return false
    }
    // Quick validation check (but phone can be empty)
    const tempErrors = errorHandler.validateForm(formData)
    // Filter out phone errors if phone is empty (optional)
    const filteredErrors = Object.keys(tempErrors).filter(key => {
      if (key === 'phone' && !phone) return false // ignore phone error if phone is empty
      return true
    })
    return filteredErrors.length === 0
  }

  // Update password validation when password changes
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)
    // Clear password validation error when user starts typing
    errorHandler.handleFieldChange('password')
    syncErrors()
  }

  // Clear errors when user starts typing
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value
    setPhone(newPhone)
    
    // Clear phone validation error when user starts typing
    errorHandler.handleFieldChange('phone')
    syncErrors()
    
    // Real-time validation for better UX
    if (newPhone && newPhone.length >= 10) {
      // Only validate if user has typed enough characters
      setTimeout(() => {
        if (newPhone === phone) { // Only validate if phone hasn't changed
          const phoneError = errorHandler.validateField('phone', newPhone)
          if (phoneError) {
            setValidationError('phone', phoneError)
          }
        }
      }, 300) // Reduced delay for better responsiveness
    }
  }

  // Validate phone number in real-time when user finishes typing
  const handlePhoneBlur = () => {
    if (phone) {
      const phoneError = errorHandler.validateField('phone', phone)
      if (phoneError) {
        setValidationError('phone', phoneError)
      }
    }
  }

  // Validate phone number on Enter key press
  const handlePhoneKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && phone) {
      const phoneError = errorHandler.validateField('phone', phone)
      if (phoneError) {
        setValidationError('phone', phoneError)
      }
    }
  }

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawEmail = e.target.value
    const cleanedEmail = cleanEmail(rawEmail)
    setEmail(cleanedEmail)
    
    // Clear email validation errors when user starts typing
    errorHandler.handleFieldChange('email', true)
    syncErrors()
  }

  // Validate email on blur
  const handleEmailBlur = () => {
    if (email) {
      const emailError = errorHandler.validateField('email', email)
      if (emailError) {
        setValidationError('email', emailError)
      }
    }
  }

  // Clear errors when user starts typing in other fields
  const handleFieldChange = (field: string, value: string) => {
    // Clear validation errors when user starts typing
    errorHandler.handleFieldChange(field as keyof ValidationErrors, field === 'email')
    syncErrors()
    
    // Update the specific field
    switch (field) {
      case 'email':
        const cleanedEmail = cleanEmail(value)
        setEmail(cleanedEmail)
        break
      case 'firstName':
        setFirstName(value)
        break
      case 'lastName':
        setLastName(value)
        break
      case 'password':
        handlePasswordChange(value)
        break
      case 'confirmPassword':
        setConfirmPassword(value)
        break
    }
  }

  // Handle new phone change with validation
  const handleNewPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneValue = e.target.value
    setNewPhone(newPhoneValue)
    
    // Clear phone validation error when user starts typing
    errorHandler.handleFieldChange('phone')
    syncErrors()
    
    // Real-time validation for better UX
    if (newPhoneValue && newPhoneValue.length >= 10) {
      // Only validate if user has typed enough characters
      setTimeout(() => {
        if (newPhoneValue === newPhone) { // Only validate if phone hasn't changed
          const phoneError = errorHandler.validateField('phone', newPhoneValue)
          if (phoneError) {
            setValidationError('phone', phoneError)
          }
        }
      }, 300)
    }
  }

  // Debug effect for phone error dialog
  useEffect(() => {
    console.log('showPhoneErrorDialog changed:', showPhoneErrorDialog);
    if (showPhoneErrorDialog) {
      console.log('Phone error dialog should be visible now');
    }
  }, [showPhoneErrorDialog]);

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
    clearAllValidationErrors()

    // Validate all fields and collect all errors using centralized handler
    const formData: FormData = { email, password, confirmPassword, firstName, lastName, phone }
    const errors = errorHandler.validateForm(formData)

    // Remove phone error if phone is empty (phone is optional)
    if (!phone && errors.phone) {
      errorHandler.clearField('phone')
    }

    // If there are any errors, display them all and return
    if (errorHandler.hasErrors()) {
      syncErrors()
      
      // Show toast for the first error
      const firstError = errorHandler.getFirstError()
      if (firstError) {
        toast.error(firstError, {
          duration: 4000,
        })
      }
      return
    }

    // If we have a verification token, try to register directly
    if (verificationToken) {
      await handleFormResubmit()
      return
    }

    setIsLoading(true)

    try {
      // Send verification email
      const emailResult = await sendEmailVerification(email)
      
      if (!emailResult.success) {
        // Handle API error with specific message
        console.error('Send email verification failed:', emailResult.error)
        const mockError = new Error(emailResult.error)
        const { message } = errorHandler.handleServerError(mockError, 'registration')
        syncErrors()
        toast.error(message, {
          duration: 4000,
        })
        return
      }

      toast.success(`Mã xác thực đã được gửi đến email: ${email}. Vui lòng kiểm tra hộp thư của bạn.`, {
        duration: 4000,
      })
      setCurrentStep('verification')
    } catch (error: unknown) {
      console.error('Registration form submit error:', error)
      const { message } = errorHandler.handleServerError(error, 'registration')
      syncErrors()
      toast.error(message, {
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearAllValidationErrors()

    if (!verificationCode) {
      const errorMsg = "Vui lòng nhập mã xác thực!"
      setValidationError('general', errorMsg)
      toast.error(errorMsg, {
        duration: 4000,
      })
      return
    }

    setIsLoading(true)

    try {
      // Verify email code
      const verifyResult = await verifyEmailCode(email, verificationCode)

      if (!verifyResult.success) {
        // Handle API error with specific message
        console.error('Email verification failed:', verifyResult.error)
        const mockError = new Error(verifyResult.error)
        const { message } = errorHandler.handleServerError(mockError, 'verification')
        syncErrors()
        toast.error(message, {
          duration: 4000,
        })
        return
      }

      const verifyResponse = verifyResult.data
      if (verifyResponse.verificationToken) {
        // Store verification token for potential retry
        setVerificationToken(verifyResponse.verificationToken)
        
        try {
          // Register with verification token - use appropriate function based on phone
          const authResult = phone 
            ? await registerWithVerification({
                email,
                password,
                firstName,
                lastName,
                phone,
                gender,
                role,
              }, verifyResponse.verificationToken)
            : await registerWithVerificationNoPhone({
                email,
                password,
                firstName,
                lastName,
                gender,
                role,
              }, verifyResponse.verificationToken)

          if (!authResult.success) {
            // Handle API error with specific message
            console.error('Registration failed:', authResult.error)
            const mockError = new Error(authResult.error)
            const { errorType, message } = errorHandler.handleServerError(mockError, 'verification')
            syncErrors()
            
            if (errorType === 'phone_conflict') {
              console.log('Phone number conflict detected, showing dialog')
              setShowPhoneErrorDialog(true)
              // DON'T go back to form - stay in current state and show dialog
              return // Exit early to prevent showing other error messages
            } else {
              console.log('Registration error:', message)
              toast.error(message, {
                duration: 4000,
              })
            }
            return
          }

          // Success - set authentication state using store method
          const authResponse = authResult.data
          useUserStore.getState().setAuthFromResponse(authResponse)

          // Show success toast for email verification
          toast.success('Xác thực email thành công! Chào mừng bạn đến với Trustay!', {
            duration: 3000,
          })

          // Redirect to profile page after a short delay
          setTimeout(() => {
            router.push('/profile')
          }, 1500)
        } catch (registerError: unknown) {
          console.error('Registration with verification error:', registerError)
          const { errorType, message } = errorHandler.handleServerError(registerError, 'verification')
          syncErrors()
          
          if (errorType === 'phone_conflict') {
            console.log('Phone number conflict detected, showing dialog')
            setShowPhoneErrorDialog(true)
            // DON'T go back to form - stay in current state and show dialog
            return // Exit early to prevent showing other error messages
          } else {
            console.log('Not a phone number conflict, showing regular error')
            toast.error(message, {
              duration: 4000,
            })
          }
        }
      }
    } catch (error: unknown) {
      const { message } = errorHandler.handleServerError(error, 'verification')
      syncErrors()
      toast.error(message, {
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async () => {
    if (!canResend || isLoading) return
    
    setIsLoading(true)
    clearAllValidationErrors()

    try {
      const emailResult = await sendEmailVerification(email)
      
      if (!emailResult.success) {
        // Handle API error with specific message
        console.error('Resend email verification failed:', emailResult.error)
        const mockError = new Error(emailResult.error)
        const { message } = errorHandler.handleServerError(mockError, 'verification')
        syncErrors()
        toast.error(message, {
          duration: 4000,
        })
        return
      }

      toast.success(`Mã xác thực mới đã được gửi đến email: ${email}. Vui lòng kiểm tra hộp thư của bạn.`, {
        duration: 4000,
      })
      // Reset countdown
      setCountdown(300) // 5 minutes
      setCanResend(false)
      setVerificationCode("") // Clear previous code
    } catch (error: unknown) {
      const { message } = errorHandler.handleServerError(error, 'verification')
      syncErrors()
      toast.error(message, {
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle skip phone number option - directly register and login
  const handleSkipPhone = async () => {
    if (!verificationToken) {
      toast.error('Không có token xác thực. Vui lòng thử lại');
      return;
    }

    setIsLoading(true)
    // Close dialog immediately to show loading state
    setShowPhoneErrorDialog(false)

    try {
      // Register without phone number - use specialized function
      const authResult = await registerWithVerificationNoPhone({
        email,
        password,
        firstName,
        lastName,
        gender,
        role,
      }, verificationToken)

      if (!authResult.success) {
        // Handle API error with specific message
        console.error('Skip phone registration failed:', authResult.error)
        const mockError = new Error(authResult.error)
        const { message } = errorHandler.handleServerError(mockError, 'verification')
        syncErrors()
        toast.error(message, {
          duration: 4000,
        })
        // On error, show dialog again
        setShowPhoneErrorDialog(true)
        return
      }

      // Success - set authentication state using store method
      const authResponse = authResult.data
      useUserStore.getState().setAuthFromResponse(authResponse)

      toast.success('Đăng ký thành công! Chào mừng bạn đến với Trustay!', {
        duration: 3000,
      })

      // Redirect immediately without delay for better UX
      router.push('/profile')
    } catch (error: unknown) {
      const { message } = errorHandler.handleServerError(error, 'verification')
      syncErrors()
      toast.error(message, {
        duration: 4000,
      })
      // On error, show dialog again
      setShowPhoneErrorDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle edit phone number option
  const handleEditPhone = () => {
    setShowPhoneErrorDialog(false)
    // Initialize new phone with current phone value
    setNewPhone(phone)
    // Clear phone error to show clean form
    errorHandler.clearField('phone')
    syncErrors()
    // Switch to edit phone form
    setCurrentStep('edit-phone')
  }

  // Handle edit phone form submission
  const handleEditPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearAllValidationErrors()

    // Validate new phone number
    if (newPhone) {
      const phoneError = errorHandler.validateField('phone', newPhone)
      if (phoneError) {
        setValidationError('phone', phoneError)
        toast.error(phoneError, {
          duration: 4000,
        })
        return
      }
    }

    // Update the main phone state and proceed with registration
    setPhone(newPhone)
    setIsLoading(true)

    try {
      // Register with new phone number (or without phone if empty)
      const authResult = newPhone 
        ? await registerWithVerification({
            email,
            password,
            firstName,
            lastName,
            phone: newPhone,
            gender,
            role,
          }, verificationToken)
        : await registerWithVerificationNoPhone({
            email,
            password,
            firstName,
            lastName,
            gender,
            role,
          }, verificationToken)

      if (!authResult.success) {
        // Handle API error with specific message
        console.error('Edit phone registration failed:', authResult.error)
        const mockError = new Error(authResult.error)
        const { errorType, message } = errorHandler.handleServerError(mockError, 'verification')
        syncErrors()
        
        if (errorType === 'phone_conflict') {
          // Show phone conflict dialog again
          setShowPhoneErrorDialog(true)
          setCurrentStep('verification') // Go back to verification step
          return
        }
        
        // Other errors
        toast.error(message, {
          duration: 4000,
        })
        return
      }

      // Success - convert to user store format and login
      const authResponse = authResult.data
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

      toast.success('Đăng ký thành công! Chào mừng bạn đến với Trustay!', {
        duration: 3000,
      })

      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (error: unknown) {
      const { errorType, message } = errorHandler.handleServerError(error, 'verification')
      syncErrors()
      
      if (errorType === 'phone_conflict') {
        setShowPhoneErrorDialog(true)
        setCurrentStep('verification') // Go back to verification step
        return
      }
      
      // Other errors
      toast.error(message, {
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form resubmission with new phone number
  const handleFormResubmit = async () => {
    if (!verificationToken) {
      toast.error('Không có token xác thực. Vui lòng thử lại');
      return;
    }

    setIsLoading(true)

    try {
      // Register with new phone number (or without phone if empty)
      const authResult = phone 
        ? await registerWithVerification({
            email,
            password,
            firstName,
            lastName,
            phone,
            gender,
            role,
          }, verificationToken)
        : await registerWithVerificationNoPhone({
            email,
            password,
            firstName,
            lastName,
            gender,
            role,
          }, verificationToken)

      if (!authResult.success) {
        // Handle API error with specific message
        console.error('Form resubmit registration failed:', authResult.error)
        const mockError = new Error(authResult.error)
        const { errorType, message } = errorHandler.handleServerError(mockError, 'verification')
        syncErrors()
        
        if (errorType === 'validation') {
          toast.error(message, {
            duration: 5000,
          })
          return // Stay on form to let user fix the phone number
        }
        
        if (errorType === 'phone_conflict') {
          setShowPhoneErrorDialog(true)
          return // Show phone conflict dialog
        }
        
        // Other errors
        toast.error(message, {
          duration: 4000,
        })
        return
      }

      // Success - set authentication state using store method
      const authResponse = authResult.data
      useUserStore.getState().setAuthFromResponse(authResponse)

      toast.success('Đăng ký thành công! Chào mừng bạn đến với Trustay!', {
        duration: 3000,
      })

      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (error: unknown) {
      const { errorType, message } = errorHandler.handleServerError(error, 'verification')
      syncErrors()
      
      if (errorType === 'validation') {
        toast.error(message, {
          duration: 5000,
        })
        return // Stay on form to let user fix the phone number
      }
      
      if (errorType === 'phone_conflict') {
        setShowPhoneErrorDialog(true)
        return // Show phone conflict dialog
      }
      
      // Other errors
      toast.error(message, {
        duration: 4000,
      })
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
                  : currentStep === 'edit-phone'
                    ? 'CHỈNH SỬA SỐ ĐIỆN THOẠI'
                    : verificationToken
                      ? 'HOÀN TẤT ĐĂNG KÝ'
                      : 'ĐĂNG KÝ'
                }
              </h2>
              <p className="text-gray-600 text-sm">
                {currentStep === 'verification'
                  ? `Nhập mã xác thực đã gửi đến ${email}`
                  : currentStep === 'edit-phone'
                    ? 'Vui lòng nhập số điện thoại mới để hoàn tất đăng ký'
                    : verificationToken
                      ? 'Email đã được xác thực. Vui lòng kiểm tra và hoàn tất thông tin đăng ký'
                      : 'Tạo tài khoản mới để bắt đầu'
                }
              </p>
              
              {/* Show success message when returning from verification with token */}
              {verificationToken && !validationErrors.phone && !validationErrors.general && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Email đã được xác thực!</strong>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Vui lòng kiểm tra thông tin và hoàn tất đăng ký
                  </p>
                </div>
              )}
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

              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Tên"
                    value={firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    required
                    disabled={isLoading}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                      validationErrors.firstName ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.firstName && (
                    <p className="text-xs text-red-600 mt-1">
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Họ"
                    value={lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    required
                    disabled={isLoading}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                      validationErrors.lastName ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.lastName && (
                    <p className="text-xs text-red-600 mt-1">
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  required
                  disabled={isLoading}
                  className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                    validationErrors.email || validationErrors.general ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.email}
                  </p>
                )}
                {validationErrors.general && !validationErrors.email && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.general}
                  </p>
                )}
              </div>

              {/* Phone and Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Số điện thoại (không bắt buộc)"
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    onKeyPress={handlePhoneKeyPress}
                    required={false} // Phone is now optional
                    disabled={isLoading}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                      validationErrors.phone ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {/* Show phone validation error */}
                  {validationErrors.phone && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      {validationErrors.phone}
                    </p>
                  )}
                  {!validationErrors.phone && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Số điện thoại giúp chúng tôi liên hệ với bạn dễ dàng hơn
                    </p>
                  )}
                </div>
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
                    onChange={(e) => handleFieldChange('password', e.target.value)}
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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

                {/* Password validation error */}
                {validationErrors.password && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.password}
                  </p>
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
                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                    onContextMenu={handleConfirmPasswordContextMenu}
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
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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

                {/* Confirm password validation error */}
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading 
                    ? "ĐANG XỬ LÝ..." 
                    : verificationToken 
                      ? "HOÀN TẤT ĐĂNG KÝ" 
                      : "ĐĂNG KÝ"
                  }
                </Button>
                {verificationToken && (
                  <p className="text-xs text-gray-600 text-center mt-2">
                    Nhấn để hoàn tất quá trình đăng ký với email đã xác thực
                  </p>
                )}
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
                  className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? "ĐANG XÁC THỰC..." : "XÁC THỰC"}
                </Button>
              </div>

              <div className="text-center space-y-2 pt-4">
                {countdown === 0 && (
                  <>
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
                  </>
                )}
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
          ) : currentStep === 'edit-phone' ? (
            <form className="space-y-4" onSubmit={handleEditPhoneSubmit}>
              {/* Show user information summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">Thông tin đăng ký:</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><span className="font-medium">Email:</span> {email}</p>
                  <p><span className="font-medium">Họ tên:</span> {firstName} {lastName}</p>
                  <p><span className="font-medium">Vai trò:</span> {role === 'tenant' ? 'Người thuê trọ' : 'Chủ trọ'}</p>
                  <p><span className="font-medium">Giới tính:</span> {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}</p>
                </div>
              </div>

              {/* New phone input */}
              <div>
                <label htmlFor="newPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại mới
                </label>
                <Input
                  id="newPhone"
                  name="newPhone"
                  type="tel"
                  placeholder="Nhập số điện thoại mới (không bắt buộc)"
                  value={newPhone}
                  onChange={handleNewPhoneChange}
                  onBlur={() => {
                    if (newPhone) {
                      const phoneError = errorHandler.validateField('phone', newPhone)
                      if (phoneError) {
                        setValidationError('phone', phoneError)
                      }
                    }
                  }}
                  disabled={isLoading}
                  className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 ${
                    validationErrors.phone ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.phone}
                  </p>
                )}
                {!validationErrors.phone && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Bỏ trống nếu bạn không muốn cung cấp số điện thoại
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? "ĐANG XỬ LÝ..." : "HOÀN TẤT ĐĂNG KÝ"}
                </Button>
              </div>
            </form>
          ) : null}
          </div>
        </div>
      </div>

      {/* Phone Number Error Dialog */}
      {showPhoneErrorDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Số điện thoại đã được sử dụng
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Số điện thoại <strong>{phone}</strong> đã được sử dụng bởi tài khoản khác. 
                Email của bạn đã được xác thực thành công, vui lòng chọn một trong hai lựa chọn sau:
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={handleSkipPhone}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Đang xử lý..." : "Bỏ qua số điện thoại và hoàn tất đăng ký"}
                </Button>
                
                <Button
                  onClick={handleEditPhone}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Dùng số điện thoại khác
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                <strong>Lưu ý:</strong> Nếu chọn &quot;Bỏ qua số điện thoại&quot;, bạn sẽ được đăng ký và đăng nhập ngay lập tức. Bạn có thể thêm số điện thoại sau trong phần cài đặt tài khoản.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
