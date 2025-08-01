"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUserStore } from "@/stores/user-store"
import { User, Phone, Mail, MapPin, Calendar } from "lucide-react"

export default function TenantProfile() {
  const { user } = useUserStore()

  return (
    <DashboardLayout userType="tenant">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600">Người thuê trọ</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Thay đổi ảnh
                </Button>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <Input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <Input
                    type="tel"
                    defaultValue={user?.email}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số căn cước công dân
                </label>
                <Input
                  type="text"
                  placeholder="Nhập số căn cước công dân"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ hiện tại
                </label>
                <Input
                  type="text"
                  placeholder="Nhập địa chỉ hiện tại"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <Input
                    type="date"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button variant="outline">
                  Hủy
                </Button>
                <Button className="bg-green-500 hover:bg-green-600">
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
