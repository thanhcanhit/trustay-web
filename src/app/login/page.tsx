"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/stores/userStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Image from "next/image"
import { validatePassword, getPasswordValidationErrors } from "@/utils/passwordValidation"
import { translateAuthError } from "@/utils/errorTranslation"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { login, isLoading, error, clearError } = useUserStore()
  const router = useRouter()

  // Handle password change with validation
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)

    // Only show validation errors if password is not empty
    if (newPassword.trim()) {
      const errors = getPasswordValidationErrors(newPassword)
      setPasswordErrors(errors)
    } else {
      setPasswordErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu")
      return
    }

    // Validate password format before attempting login
    if (!validatePassword(password)) {
      const errors = getPasswordValidationErrors(password)
      // You can choose to show this as a warning or just proceed with login
      // For now, we'll just proceed since this is login, not registration
      console.warn('Password format validation failed:', errors)
    }

    console.log('Attempting login with:', { email, apiUrl: process.env.NEXT_PUBLIC_API_URL })

    try {
      await login({ email, password })

      // Get updated user data to determine redirect
      const { user } = useUserStore.getState()

      if (user) {
        console.log('Login successful, user:', user)

        // Show success toast
        toast.success(`Đăng nhập thành công! Chào mừng ${user.firstName} ${user.lastName}`, {
          duration: 3000,
        })

        // Điều hướng đến dashboard phù hợp sau 1.5 giây
        setTimeout(() => {
          if (user.role === 'tenant') {
            router.push("/dashboard/tenant")
          } else {
            router.push("/dashboard/landlord")
          }
        }, 1500)
      }
    } catch (error) {
      // Error is already handled in the store
      console.error('Login failed:', error)

      // Show error toast with specific message
      let errorMessage = 'Đăng nhập thất bại'
      if (error instanceof Error) {
        errorMessage = translateAuthError(error.message)

        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
      }

      toast.error(errorMessage, {
        duration: 4000,
      })
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
          />
        </div>

        {/* Right Side - Login Form */}
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

              <h2 className="text-3xl font-bold text-gray-900 mb-2">ĐĂNG NHẬP</h2>
              <p className="text-gray-600 text-sm">Chào mừng bạn quay trở lại Trustay</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
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

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
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

              {/* Zalo Login */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-3 px-4 border border-blue-500 text-blue-500 hover:bg-blue-50 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📱</span>
                  <span>Đăng nhập bằng Zalo</span>
                </Button>
              </div>

              <div className="text-center space-y-1 pt-4">
                <p className="text-sm">
                  Chưa có tài khoản?  &nbsp;
                  <a href="/register" className="text-green-600 hover:text-green-500">
                     Đăng ký ngay
                  </a>
                </p>
                <p className="text-sm">
                  <a href="#" className="text-gray-600 hover:text-gray-500">
                    Quên mật khẩu?
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}