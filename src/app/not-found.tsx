"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, ArrowLeft, Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Modern 404 Illustration */}
            <div className="relative">
              {/* Decorative background circles - responsive */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-60 h-60 sm:w-80 sm:h-80 bg-green-50 rounded-full opacity-30"></div>
                <div className="absolute w-44 h-44 sm:w-60 sm:h-60 bg-green-100 rounded-full opacity-40"></div>
                <div className="absolute w-28 h-28 sm:w-40 sm:h-40 bg-green-200 rounded-full opacity-50"></div>
              </div>

              {/* Main 404 number - responsive text sizes */}
              <div className="relative z-10 py-8 sm:py-12">
                <div className="text-6xl sm:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400 mb-4">
                  404
                </div>

                {/* Icon elements - responsive sizes */}
                <div className="relative flex justify-center items-center space-x-2 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Home className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Search className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message - responsive text */}
            <div className="space-y-3 sm:space-y-4 px-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Trang không tìm thấy
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Hãy kiểm tra lại đường dẫn hoặc quay về trang chủ.
              </p>
            </div>

            {/* Action Buttons - responsive layout */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 sm:pt-4 px-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Quay lại
              </Button>

              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Về trang chủ
                </Link>
              </Button>
            </div>

            {/* Quick Links Card - responsive grid and padding */}
            <div className="mt-12 sm:mt-16 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8 mx-4 sm:mx-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Các trang phổ biến</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Link
                  href="/rooms"
                  className="group p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-green-50 transition-colors text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Home className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Tìm phòng trọ</div>
                </Link>

                <Link
                  href="/room-seekings"
                  className="group p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-green-50 transition-colors text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Người tìm trọ</div>
                </Link>

                <Link
                  href="/roommate"
                  className="group p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-green-50 transition-colors text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Tìm bạn ở ghép</div>
                </Link>

                <Link
                  href="/profile"
                  className="group p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-green-50 transition-colors text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <div className="w-4 h-4 sm:w-6 sm:h-6 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Tài khoản</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}