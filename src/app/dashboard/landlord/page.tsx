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
  Loader2,
  Star,
  FileText
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useBuildingStore } from "@/stores/buildingStore"
import { useUserStore } from "@/stores/userStore"
import { useRatingStore } from "@/stores/ratingStore"
import { useContractStore } from "@/stores/contractStore"
import { RatingStats } from "@/components/rating"

// Client Component for Dashboard Content
function DashboardContent() {
  const { dashboardData, isLoading, error, hasFetched, fetchDashboardData, forceRefresh } = useBuildingStore()
  const { user } = useUserStore()
  const { getRatingStats, statistics } = useRatingStore()
  const { contracts, loading: loadingContracts, loadContracts } = useContractStore()
  const [loadingStats, setLoadingStats] = useState(true)
  
  useEffect(() => {
    // Only fetch if we haven't fetched yet and not currently loading
    if (!hasFetched && !isLoading) {
      fetchDashboardData()
    }
  }, [hasFetched, isLoading, fetchDashboardData])

  // Fetch landlord rating stats
  useEffect(() => {
    const loadStats = async () => {
      if (user?.id) {
        setLoadingStats(true)
        await getRatingStats('landlord', user.id)
        setLoadingStats(false)
      }
    }
    loadStats()
  }, [user?.id, getRatingStats])

  // Fetch recent contracts
  useEffect(() => {
    loadContracts({ page: 1, limit: 3, status: 'active' })
  }, [loadContracts])

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
    <div>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Tổng quan</h1>
        <p className="text-sm md:text-base text-gray-600">Quản lý thông tin kinh doanh trên Trọ Mới</p>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Hiển thị 3 nhà trọ gần đây nhất •
          <Link href="/dashboard/landlord/properties" className="text-blue-600 hover:text-blue-800 ml-1">
            Xem tất cả
          </Link>
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
          <Link href="/dashboard/landlord/properties/add" className="flex-1 sm:flex-initial">
            <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Thêm trọ mới
            </Button>
          </Link>
          <Button className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
            <Eye className="h-4 w-4 mr-2" />
            Tạo quảng cáo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
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
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Nhà trọ gần đây</h2>
                <p className="text-xs md:text-sm text-gray-500">3 nhà trọ được cập nhật gần đây nhất</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/dashboard/landlord/properties" className="flex-1 sm:flex-initial">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Xem tất cả
                  </Button>
                </Link>
                <Link href="/dashboard/landlord/properties/add" className="flex-1 sm:flex-initial">
                  <Button className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto">
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
                    <div key={building.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BuildingIcon className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">{building.name}</h3>
                            <p className="text-gray-600 text-xs md:text-sm flex items-start mt-1">
                              <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                {building.addressLine1}
                                {building.location && (
                                  <span>, {building.location.wardName}, {building.location.districtName}, {building.location.provinceName}</span>
                                )}
                              </span>
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs md:text-sm text-gray-500">
                              <span>{buildingStats.totalRooms} phòng</span>
                              <span>•</span>
                              <span>{buildingStats.occupiedRooms} đã thuê</span>
                              <span>•</span>
                              <span>Tỷ lệ: {occupancyRate}%</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="w-full sm:w-auto">{buildingStats.totalRevenue > 0 ? `${(buildingStats.totalRevenue / 1000000).toFixed(1)}M VNĐ/tháng` : 'Chưa có doanh thu'}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
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
                        <div className="flex sm:flex-col gap-2 sm:gap-2 w-full sm:w-auto">
                          <Link href={`/dashboard/landlord/properties/${building.id}`} className="flex-1 sm:flex-initial">
                            <Button variant="outline" size="sm" className="w-full whitespace-nowrap">
                              Xem chi tiết
                            </Button>
                          </Link>
                          <Link href={`/dashboard/landlord/properties/${building.id}/edit`} className="flex-1 sm:flex-initial">
                            <Button size="sm" className="w-full">
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
      <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Recent Contracts */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Hợp đồng gần đây</h3>
          {loadingContracts ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Chưa có hợp đồng nào</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {contracts.slice(0, 3).map((contract) => (
                  <div key={contract.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {contract.tenant?.firstName} {contract.tenant?.lastName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {contract.contractData?.monthlyRent ? (contract.contractData.monthlyRent / 1000000).toFixed(1) : '0'}M VNĐ/tháng •
                        <Calendar className="h-3 w-3 inline ml-1 mr-1" />
                        {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      contract.status === 'active' ? 'bg-green-100 text-green-800' : 
                      contract.status === 'pending_signatures' ? 'bg-yellow-100 text-yellow-800' :
                      contract.status === 'fully_signed' ? 'bg-blue-100 text-blue-800' :
                      contract.status === 'partially_signed' ? 'bg-orange-100 text-orange-800' :
                      contract.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contract.status === 'active' ? 'Đang thuê' : 
                       contract.status === 'pending_signatures' ? 'Chờ ký' :
                       contract.status === 'fully_signed' ? 'Đã ký đầy đủ' :
                       contract.status === 'partially_signed' ? 'Đã ký một phần' :
                       contract.status === 'draft' ? 'Bản nháp' :
                       contract.status === 'expired' ? 'Hết hạn' :
                       contract.status === 'terminated' ? 'Đã chấm dứt' : 'Khác'}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/landlord/contracts">
                <Button variant="outline" className="w-full mt-4">
                  Xem tất cả hợp đồng
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Landlord Rating Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Đánh giá của bạn</h3>
          {loadingStats ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : statistics ? (
            <RatingStats statistics={statistics} targetType="landlord" />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Chưa có đánh giá nào</p>
              <p className="text-sm text-gray-400 mt-1">
                Hoàn thành hợp đồng thuê để nhận đánh giá
              </p>
            </div>
          )}
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
