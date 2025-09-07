'use client'
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import {
  Building as BuildingIcon,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  MapPin,
  Calendar,
  Loader2
} from "lucide-react"
import { mockBookings } from "@/data/mock-data"
import Link from "next/link"
import { useEffect } from "react"
import { useBuildingStore } from "@/stores/buildingStore"

// Client Component for Dashboard Content
function DashboardContent() {
  const { dashboardData, isLoading, error, hasFetched, fetchDashboardData, forceRefresh } = useBuildingStore()
  
  useEffect(() => {
    // Only fetch if we haven't fetched yet and not currently loading
    if (!hasFetched && !isLoading) {
      fetchDashboardData()
    }
  }, [hasFetched, isLoading, fetchDashboardData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi: {error}</p>
          <Button onClick={forceRefresh} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không có dữ liệu dashboard</p>
          <Button onClick={forceRefresh} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  const { buildings, buildingRooms, stats } = dashboardData

  // Helper function to calculate building stats
  const getBuildingStats = (buildingId: string) => {
    const rooms = buildingRooms.get(buildingId) || []
    let totalRooms = 0
    let occupiedRooms = 0
    let totalRevenue = 0

    for (const room of rooms) {
      if (room.roomInstances && Array.isArray(room.roomInstances)) {
        totalRooms += room.roomInstances.length
        
        const occupiedInstances = room.roomInstances.filter(
          instance => instance.status === 'occupied'
        )
        occupiedRooms += occupiedInstances.length
        
        if (room.pricing && occupiedInstances.length > 0) {
          const monthlyRevenue = parseFloat(room.pricing.basePriceMonthly) || 0
          totalRevenue += monthlyRevenue * occupiedInstances.length
        }
      }
    }

    return { totalRooms, occupiedRooms, totalRevenue }
  }

  return (
    <div className="px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tổng quan</h1>
          <p className="text-gray-600">Quản lý thông tin kinh doanh trên Trọ Mới</p>
          <p className="text-sm text-gray-500 mt-1">
            Hiển thị 3 nhà trọ gần đây nhất • 
            <Link href="/dashboard/landlord/properties" className="text-blue-600 hover:text-blue-800 ml-1">
              Xem tất cả nhà trọ
            </Link>
          </p>
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
          title="Phòng (3 trọ gần đây)"
          value={stats.totalRooms}
          icon={BuildingIcon}
        />
        <StatCard
          title="Phòng đã thuê"
          value={stats.occupiedRooms}
          icon={Users}
        />
        <StatCard
          title="Doanh thu tháng"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M VNĐ`}
          icon={DollarSign}
        />
        <StatCard
          title="Tỷ lệ lấp đầy"
          value={`${stats.occupancyRate}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Nhà trọ gần đây</h2>
                <p className="text-sm text-gray-500">3 nhà trọ được cập nhật gần đây nhất</p>
              </div>
              <div className="flex space-x-2">
                <Link href="/dashboard/landlord/properties">
                  <Button variant="outline">
                    Xem tất cả
                  </Button>
                </Link>
                <Link href="/dashboard/landlord/properties/add">
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm trọ mới
                  </Button>
                </Link>
              </div>
            </div>

            {buildings.length === 0 ? (
              <div className="text-center py-8">
                <BuildingIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có nhà trọ nào</h3>
                <p className="text-gray-600 mb-4">Bắt đầu bằng cách thêm nhà trọ đầu tiên của bạn</p>
                <Link href="/dashboard/landlord/properties/add">
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm trọ mới
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {buildings.length < 3 && buildings.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Lưu ý:</strong> Bạn có {buildings.length} nhà trọ. 
                      <Link href="/dashboard/landlord/properties/add" className="text-blue-600 hover:text-blue-800 ml-1">
                        Thêm nhà trọ mới
                      </Link> để quản lý nhiều hơn.
                    </p>
                  </div>
                )}
                {buildings.map((building) => {
                  const buildingStats = getBuildingStats(building.id)
                  const occupancyRate = buildingStats.totalRooms > 0 
                    ? Math.round((buildingStats.occupiedRooms / buildingStats.totalRooms) * 100) 
                    : 0

                  return (
                    <div key={building.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <BuildingIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{building.name}</h3>
                            <p className="text-gray-600 text-sm flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {building.addressLine1}
                              {building.location && (
                                <span>, {building.location.wardName}, {building.location.districtName}, {building.location.provinceName}</span>
                              )}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>{buildingStats.totalRooms} phòng</span>
                              <span>•</span>
                              <span>{buildingStats.occupiedRooms} đã thuê</span>
                              <span>•</span>
                              <span>Tỷ lệ: {occupancyRate}%</span>
                              <span>•</span>
                              <span>{buildingStats.totalRevenue > 0 ? `${(buildingStats.totalRevenue / 1000000).toFixed(1)}M VNĐ/tháng` : 'Chưa có doanh thu'}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                building.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {building.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                              </span>
                              {building.isVerified && (
                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                  Đã xác thực
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/landlord/properties/${building.id}`}>
                            <Button variant="outline" size="sm">
                              Xem chi tiết
                            </Button>
                          </Link>
                          <Link href={`/dashboard/landlord/properties/${building.id}/edit`}>
                            <Button size="sm">
                              Chỉnh sửa
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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
  )
}

export default function LandlordDashboard() {
  return (
    <DashboardLayout userType="landlord">
      <DashboardContent />
    </DashboardLayout>
  )
}
