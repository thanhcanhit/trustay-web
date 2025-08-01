"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import {
  Home,
  Search,
  Heart,
  FileText,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react"
import { getSavedPropertiesByTenant, getReviewsByTenant } from "@/data/mock-data"
import Image from "next/image"

export default function TenantDashboard() {
  // Get mock data for current tenant
  const savedProperties = getSavedPropertiesByTenant('tenant-1')
  const reviews = getReviewsByTenant('tenant-1')

  return (
    <DashboardLayout userType="tenant">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QUẢN LÝ LƯU TRÚ</h1>
          <p className="text-gray-600">Quản lý thông tin lưu trú trên Trọ Mới.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Phòng đã lưu"
            value={savedProperties.length}
            icon={Heart}
          />
          <StatCard
            title="Đánh giá đã viết"
            value={reviews.length}
            icon={FileText}
          />
          <StatCard
            title="Lượt xem hồ sơ"
            value="12"
            icon={Search}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Accommodation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin lưu trú hiện tại</h2>
            
            <div className="text-center py-8">
              <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Home className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bạn không có lưu trú nào?</h3>
              <p className="text-gray-600 mb-6">
                Nếu bạn chưa thấy thông tin lưu trú trên Trọ Mới, vui lòng thực hiện các bước sau:
              </p>
              
              <div className="text-left space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-sm font-medium">1</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Đảm bảo chủ trọ của bạn đang sử dụng hệ thống Trọ Mới Host để quản lý hợp đồng.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-sm font-medium">2</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Cập nhật số Căn cước công dân của bạn trên hệ thống để có thể tra cứu và tự động liên kết hợp đồng.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-sm font-medium">3</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Số Căn cước công dân bạn cung cấp cần trùng khớp với số mà chủ trọ đã sử dụng khi tạo hợp đồng.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Cập nhật số Căn cước công dân
                </Button>
                <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  Tìm trọ
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Search Properties */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tìm kiếm phòng trọ</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Khu vực</p>
                    <p className="text-xs text-gray-600">Chọn khu vực bạn muốn tìm</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Giá thuê</p>
                    <p className="text-xs text-gray-600">1.5 - 3 triệu/tháng</p>
                  </div>
                </div>
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm ngay
                </Button>
              </div>
            </div>

            {/* Saved Properties */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Phòng đã lưu ({savedProperties.length})</h2>
              <div className="space-y-3">
                {savedProperties.map((property) => (
                  <div key={property.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Home className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{property.name}</p>
                      <p className="text-xs text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.district}, {property.city}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        {(property.monthlyRevenue / property.totalRooms / 1000000).toFixed(1)} triệu/tháng (ước tính)
                      </p>
                    </div>
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </div>
                ))}
                {savedProperties.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Chưa có phòng nào được lưu</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Tìm thêm phòng trọ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
