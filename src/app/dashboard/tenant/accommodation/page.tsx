"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Home, MapPin, Calendar, DollarSign, Phone, User } from "lucide-react"
import { mockBookings, mockProperties, mockRooms } from "@/data/mock-data"

export default function TenantAccommodation() {
  // Get current tenant's booking
  const currentBooking = mockBookings.find(booking => booking.tenantId === 'tenant-1' && booking.status === 'active')
  const currentProperty = currentBooking ? mockProperties.find(prop => prop.id === currentBooking.propertyId) : null
  const currentRoom = currentBooking ? mockRooms.find(room => room.id === currentBooking.roomId) : null

  return (
    <DashboardLayout userType="tenant">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin lưu trú</h1>
          <p className="text-gray-600">Thông tin về nơi ở hiện tại của bạn</p>
        </div>

        {/* Current accommodation or no accommodation message */}
        {currentBooking && currentProperty && currentRoom ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{currentProperty.name}</h2>
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {currentProperty.address}, {currentProperty.district}, {currentProperty.city}
                </p>
                <p className="text-sm text-gray-500 mt-1">Phòng {currentRoom.roomNumber}</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Đang thuê
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Giá thuê</p>
                  <p className="font-medium">{(currentBooking.monthlyRent / 1000000).toFixed(1)} triệu VNĐ/tháng</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                  <p className="font-medium">{currentBooking.checkIn}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Home className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Diện tích</p>
                  <p className="font-medium">{currentRoom.area}m²</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Tiền cọc</p>
                  <p className="font-medium">{(currentBooking.deposit / 1000000).toFixed(1)} triệu VNĐ</p>
                </div>
              </div>
            </div>

            {/* Room amenities */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Tiện nghi phòng</h3>
              <div className="flex flex-wrap gap-2">
                {currentRoom.amenities.map((amenity, index) => (
                  <span key={index} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Property amenities */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Tiện ích chung</h3>
              <div className="flex flex-wrap gap-2">
                {currentProperty.amenities.map((amenity, index) => (
                  <span key={index} className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Thông tin liên hệ</h3>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Chủ trọ</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Liên hệ qua hệ thống
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Home className="h-12 w-12 text-blue-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Chưa có thông tin lưu trú
              </h2>

              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Hiện tại bạn chưa có thông tin lưu trú nào được liên kết với tài khoản.
                Vui lòng liên hệ chủ trọ để cập nhật thông tin hợp đồng.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-lg mx-auto">
                <h3 className="font-medium text-yellow-800 mb-2">Hướng dẫn liên kết thông tin lưu trú:</h3>
                <ul className="text-sm text-yellow-700 text-left space-y-1">
                  <li>• Đảm bảo chủ trọ đã tạo hợp đồng trên hệ thống</li>
                  <li>• Cập nhật đầy đủ số căn cước công dân trong hồ sơ</li>
                  <li>• Thông tin phải khớp với hợp đồng do chủ trọ tạo</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-green-500 hover:bg-green-600">
                  Cập nhật hồ sơ
                </Button>
                <Button variant="outline">
                  Liên hệ hỗ trợ
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sample accommodation info (hidden by default) */}
        <div className="hidden bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Phòng trọ ABC</h2>
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                123 Đường ABC, Quận 1, TP.HCM
              </p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Đang thuê
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Giá thuê</p>
                <p className="font-medium">2.500.000 VNĐ/tháng</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                <p className="font-medium">01/01/2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Ngày kết thúc</p>
                <p className="font-medium">31/12/2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Home className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Loại phòng</p>
                <p className="font-medium">Phòng đơn</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-4">Thông tin chủ trọ</h3>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Nguyễn Văn A</p>
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  0123 456 789
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
