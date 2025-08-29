"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import {
  Building,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  MapPin,
  Calendar
} from "lucide-react"
import { mockProperties, mockBookings } from "@/data/mock-data"
import Link from "next/link"

export default function LandlordDashboard() {
  // Calculate stats from mock data
  const totalRooms = mockProperties.reduce((sum, prop) => sum + prop.totalRooms, 0)
  const occupiedRooms = mockProperties.reduce((sum, prop) => sum + prop.occupiedRooms, 0)
  const totalRevenue = mockProperties.reduce((sum, prop) => sum + prop.monthlyRevenue, 0)
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tổng quan</h1>
            <p className="text-gray-600">Quản lý thông tin kinh doanh trên Trọ Mới</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/landlord/properties/add">
              <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Thêm trọ mới
              </Button>
            </Link>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Eye className="h-4 w-4 mr-2" />
              Tạo quảng cáo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng số phòng"
            value={totalRooms}
            icon={Building}
          />
          <StatCard
            title="Phòng đã thuê"
            value={occupiedRooms}
            icon={Users}
          />
          <StatCard
            title="Doanh thu tháng"
            value={`${(totalRevenue / 1000000).toFixed(1)}M VNĐ`}
            icon={DollarSign}
          />
          <StatCard
            title="Tỷ lệ lấp đầy"
            value={`${occupancyRate}%`}
            icon={TrendingUp}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Properties List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Danh sách nhà trọ</h2>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm trọ mới
                </Button>
              </div>

              <div className="space-y-4">
                {mockProperties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{property.name}</h3>
                          <p className="text-gray-600 text-sm flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.address}, {property.district}, {property.city}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{property.totalRooms} phòng</span>
                            <span>•</span>
                            <span>{property.occupiedRooms} đã thuê</span>
                            <span>•</span>
                            <span>Tỷ lệ: {Math.round((property.occupiedRooms / property.totalRooms) * 100)}%</span>
                            <span>•</span>
                            <span>{(property.monthlyRevenue / 1000000).toFixed(1)}M VNĐ/tháng</span>
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
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Hợp đồng gần đây</h3>
            <div className="space-y-3">
              {mockBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{booking.tenantName}</p>
                    <p className="text-xs text-gray-600">
                      {(booking.monthlyRent / 1000000).toFixed(1)}M VNĐ/tháng •
                      <Calendar className="h-3 w-3 inline ml-1 mr-1" />
                      {booking.checkIn}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    booking.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status === 'active' ? 'Đang thuê' : 'Chờ xử lý'}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Xem tất cả hợp đồng
            </Button>
          </div>

          {/* Support Contact */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* <h3 className="font-semibold text-gray-900 mb-4">Hỗ trợ khách hàng</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Nhân viên hỗ trợ</h4>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Nguyễn Thị Mỹ Duyên</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      033.266.1579
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Hotline hỗ trợ</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">033.266.1579</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">035.866.1579</span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
