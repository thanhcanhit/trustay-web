"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Building, Plus, Search, Filter, MapPin, Users, DollarSign } from "lucide-react"
import { mockProperties } from "@/data/mock-data"
import Link from "next/link"

export default function LandlordProperties() {
  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Trọ</h1>
            <p className="text-gray-600">Quản lý tất cả các nhà trọ của bạn</p>
          </div>
          <Link href="/dashboard/landlord/properties/add">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Thêm trọ mới
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên nhà trọ..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </div>
        </div>

        {/* Properties List */}
        <div className="space-y-4">
          {mockProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm flex items-center mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address}, {property.district}, {property.city}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Tổng phòng</p>
                          <p className="font-medium">{property.totalRooms}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Đã thuê</p>
                          <p className="font-medium">{property.occupiedRooms}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Doanh thu</p>
                          <p className="font-medium">{(property.monthlyRevenue / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-gray-600">Tỷ lệ lấp đầy</p>
                          <p className="font-medium">{Math.round((property.occupiedRooms / property.totalRooms) * 100)}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="text-xs text-gray-500">+{property.amenities.length - 3} khác</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" size="sm">
                    Xem chi tiết
                  </Button>
                  <Button size="sm">
                    Chỉnh sửa
                  </Button>
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                    Quảng cáo
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sample Property List (hidden by default) */}
        <div className="hidden space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Nhà trọ ABC</h3>
                  <p className="text-gray-600 text-sm">123 Đường ABC, Quận 1, TP.HCM</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>10 phòng</span>
                    <span>•</span>
                    <span>8 đã thuê</span>
                    <span>•</span>
                    <span>Tỷ lệ: 80%</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Xem chi tiết
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
