"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/stores/user-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useUserStore()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Demo login - trong thực tế sẽ gọi API
    if (phone && password) {
      const demoUser = {
        id: "1",
        name: "Demo User",
        email: phone,
        avatar: undefined
      }

      login(demoUser)
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2">
      <div className="flex justify-between max-w-4xl w-full">
        {/* Left Card - Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-96">
          <div className="text-center mb-8">
            {/* Logo - thay thế biểu tượng map bằng logo-slogan-white.png */}
            <div className="mx-auto h-16 w-30 rounded-xl flex items-center justify-center mb-1">
              
              <Image
                src="/logo.png"
                alt="Trustay Logo"
                width={200}
                height={100}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">ĐĂNG NHẬP</h2>
            <p className="text-gray-600 text-sm">Chào mừng bạn quay trở lại Trustay</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
              >
                ĐĂNG NHẬP
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

        {/* Right Card - Branding */}
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