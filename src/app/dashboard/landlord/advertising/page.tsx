"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Eye, Plus, TrendingUp, Users } from "lucide-react"

export default function LandlordAdvertising() {
  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quảng cáo Trọ</h1>
            <p className="text-gray-600">Quản lý các quảng cáo và tin đăng của bạn</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Tạo quảng cáo mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng quảng cáo</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Liên hệ</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* No Ads Message */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Eye className="h-12 w-12 text-orange-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Chưa có quảng cáo nào
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Tạo quảng cáo để thu hút khách thuê tiềm năng. Quảng cáo giúp tăng khả năng hiển thị 
              và tiếp cận nhiều khách hàng hơn trên nền tảng Trọ Mới.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-lg mx-auto">
              <h3 className="font-medium text-blue-800 mb-3">Lợi ích của quảng cáo:</h3>
              <ul className="text-sm text-blue-700 text-left space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Tăng khả năng hiển thị trên trang tìm kiếm
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Tiếp cận khách hàng mục tiêu phù hợp
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Tăng tỷ lệ liên hệ và đặt phòng
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Báo cáo chi tiết về hiệu quả quảng cáo
                </li>
              </ul>
            </div>

            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
              <Plus className="h-5 w-5 mr-2" />
              Tạo quảng cáo đầu tiên
            </Button>
          </div>
        </div>

        {/* Sample Ad List (hidden by default) */}
        <div className="hidden space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phòng trọ cao cấp Q1</h3>
                  <p className="text-gray-600 text-sm">Quảng cáo từ 15/01/2024</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded">Đang chạy</span>
                    <span className="text-gray-500">1,234 lượt xem</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">45 liên hệ</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Xem báo cáo
                </Button>
                <Button size="sm">
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
