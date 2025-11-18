'use client'
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building as BuildingIcon,
  Users,
  TrendingUp,
  Plus,
  MapPin,
  Calendar,
  Loader2,
  Star,
  FileText,
  AlertTriangle,
  ClipboardList,
  Clock,
  MessageSquare,
  Receipt,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useLandlordStore } from "@/stores/landlordStore"
import { useUserStore } from "@/stores/userStore"
import { useRatingStore } from "@/stores/ratingStore"
import { useContractStore } from "@/stores/contractStore"
import { RatingStats } from "@/components/rating"
import { format, differenceInDays } from "date-fns"
import { vi } from "date-fns/locale"
import {
  RevenueTrendChart,
  BuildingPerformanceBarChart,
  RoomTypePieChart,
  OccupancyStatusChart,
  OperationsPipelineChart
} from "@/components/dashboard/charts"

// Client Component for Dashboard Content
function DashboardContent() {
  const {
    dashboardOverview,
    dashboardOperations,
    dashboardFinance,
    loadingDashboardOverview,
    loadingDashboardOperations,
    loadingDashboardFinance,
    errorDashboardOverview,
    errorDashboardOperations,
    errorDashboardFinance,
    loadDashboardOverview,
    loadDashboardOperations,
    loadDashboardFinance,
  } = useLandlordStore()
  const { user } = useUserStore()
  const { getRatingStats, statistics } = useRatingStore()
  const { contracts, loading: loadingContracts, loadContracts } = useContractStore()
  const [loadingStats, setLoadingStats] = useState(true)

  // Load dashboard data
  useEffect(() => {
    loadDashboardOverview()
    loadDashboardOperations()
    loadDashboardFinance()
  }, [loadDashboardOverview, loadDashboardOperations, loadDashboardFinance])

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

  const isLoading = loadingDashboardOverview || loadingDashboardOperations
  const hasError = errorDashboardOverview || errorDashboardOperations

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

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi: {errorDashboardOverview || errorDashboardOperations}</p>
          <Button onClick={() => {
            loadDashboardOverview()
            loadDashboardOperations()
            loadDashboardFinance()
          }} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  if (!dashboardOverview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không có dữ liệu dashboard</p>
          <Button onClick={() => {
            loadDashboardOverview()
            loadDashboardOperations()
            loadDashboardFinance()
          }} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard Tổng quan</h1>
        <p className="text-sm md:text-base text-gray-600">Quản lý và theo dõi hoạt động kinh doanh của bạn</p>
      </div>

      {/* Quick Actions - MOVED TO TOP */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/landlord/properties/add">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Thêm nhà trọ
            </Button>
          </Link>
          <Link href="/dashboard/landlord/properties">
            <Button variant="outline">
              <BuildingIcon className="h-4 w-4 mr-2" />
              Quản lý nhà trọ
            </Button>
          </Link>
          <Link href="/dashboard/landlord/contracts">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Xem hợp đồng
            </Button>
          </Link>
          <Link href="/dashboard/landlord/invoices">
            <Button variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              Quản lý hóa đơn
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Compact 6-column Layout */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <StatCard
            title="Tổng toà nhà"
            value={dashboardOverview.buildings.total}
            icon={BuildingIcon}
            compact
          />
          <StatCard
            title="Phòng trống"
            value={dashboardOverview.rooms.availableInstances}
            icon={MapPin}
            compact
          />
          <StatCard
            title="Phòng đã thuê"
            value={dashboardOverview.rooms.occupiedInstances}
            icon={Users}
            compact
          />
          <StatCard
            title="Tỷ lệ lấp đầy"
            value={`${(dashboardOverview.rooms.occupancyRate * 100).toFixed(0)}%`}
            icon={TrendingUp}
            compact
          />
          <StatCard
            title="Người thuê đang hoạt động"
            value={dashboardOverview.tenants.activeTenants}
            icon={Users}
            compact
          />
          <StatCard
            title="Đánh giá trung bình"
            value={dashboardOverview.tenants.averageRating > 0 ? dashboardOverview.tenants.averageRating.toFixed(1) : 'N/A'}
            icon={Star}
            compact
          />
        </div>
      </div>

      {/* Alert Widgets Row - Notifications & Alerts */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Pending Bookings */}
        <Link href="/dashboard/landlord/requests">
          <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Yêu cầu đặt phòng</h3>
              </div>
              {dashboardOperations && dashboardOperations.summary.pendingBookings > 0 && (
                <Badge className="bg-blue-500 text-white text-xs">{dashboardOperations.summary.pendingBookings}</Badge>
              )}
            </div>
            <p className="text-xl font-bold text-gray-900">
              {dashboardOperations?.summary.pendingBookings || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Yêu cầu chờ xử lý</p>
          </div>
        </Link>

        {/* Pending Invitations */}
        <Link href="/dashboard/landlord/requests">
          <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Lời mời</h3>
              </div>
              {dashboardOperations && dashboardOperations.summary.pendingInvitations > 0 && (
                <Badge className="bg-amber-500 text-white text-xs">{dashboardOperations.summary.pendingInvitations}</Badge>
              )}
            </div>
            <p className="text-xl font-bold text-gray-900">
              {dashboardOperations?.summary.pendingInvitations || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Lời mời chờ phản hồi</p>
          </div>
        </Link>

        {/* Pending Contracts */}
        <Link href="/dashboard/landlord/contracts">
          <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Hợp đồng</h3>
              </div>
              {dashboardOperations && dashboardOperations.summary.contractAlerts > 0 && (
                <Badge className="bg-green-500 text-white text-xs">{dashboardOperations.summary.contractAlerts}</Badge>
              )}
            </div>
            <p className="text-xl font-bold text-gray-900">
              {dashboardOperations?.summary.contractAlerts || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Hợp đồng chờ ký</p>
          </div>
        </Link>

        {/* Upcoming Move-ins */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 h-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Dọn vào sắp tới</h3>
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {dashboardOverview?.pipeline.upcomingMoveIns || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Trong 7 ngày tới</p>
        </div>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      {dashboardFinance && (
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-600 mb-1">Tổng doanh thu</p>
              <p className="text-xl font-bold text-gray-900">
                {(dashboardFinance.revenue.totalBilled / 1000000).toFixed(1)}M VNĐ
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-600 mb-1">Đã thu</p>
              <p className="text-xl font-bold text-green-600">
                {(dashboardFinance.revenue.totalPaid / 1000000).toFixed(1)}M VNĐ
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-600 mb-1">Còn nợ</p>
              <p className="text-xl font-bold text-orange-600">
                {(dashboardFinance.revenue.outstandingAmount / 1000000).toFixed(1)}M VNĐ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alert Summary Cards */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Expiring Rentals */}
          <Link href="/dashboard/landlord/rentals">
            <div className="bg-white rounded-lg border border-orange-200 p-3 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Thuê sắp hết hạn</h3>
                </div>
                {dashboardOverview.alerts.expiringRentals > 0 && (
                  <Badge className="bg-orange-500 text-white text-xs">{dashboardOverview.alerts.expiringRentals}</Badge>
                )}
              </div>
              <p className="text-xl font-bold text-gray-900">
                {dashboardOverview.alerts.expiringRentals}
              </p>
              <p className="text-xs text-gray-500 mt-1">Trong 30 ngày tới</p>
            </div>
          </Link>

          {/* Expiring Contracts */}
          <Link href="/dashboard/landlord/contracts">
            <div className="bg-white rounded-lg border border-red-200 p-3 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-red-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Hợp đồng sắp hết hạn</h3>
                </div>
                {dashboardOverview.alerts.expiringContracts > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">{dashboardOverview.alerts.expiringContracts}</Badge>
                )}
              </div>
              <p className="text-xl font-bold text-gray-900">
                {dashboardOverview.alerts.expiringContracts}
              </p>
              <p className="text-xs text-gray-500 mt-1">Trong 30 ngày tới</p>
            </div>
          </Link>

          {/* Open Alerts */}
          <div className="bg-white rounded-lg border border-yellow-200 p-3 h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Cảnh báo mở</h3>
              </div>
              {dashboardOverview.alerts.openAlerts > 0 && (
                <Badge className="bg-yellow-500 text-white text-xs">{dashboardOverview.alerts.openAlerts}</Badge>
              )}
            </div>
            <p className="text-xl font-bold text-gray-900">
              {dashboardOverview.alerts.openAlerts}
            </p>
            <p className="text-xs text-gray-500 mt-1">Cần xử lý</p>
          </div>
        </div>
      </div>

      {/* Contracts Expiring Soon */}
      {contracts.filter(c => {
        if (c.status !== 'active' || !c.endDate) return false
        const daysUntilExpiry = differenceInDays(new Date(c.endDate), new Date())
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 30
      }).length > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Hợp đồng sắp hết hạn</h3>
                <div className="space-y-2">
                  {contracts.filter(c => {
                    if (c.status !== 'active' || !c.endDate) return false
                    const daysUntilExpiry = differenceInDays(new Date(c.endDate), new Date())
                    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30
                  }).slice(0, 3).map(contract => {
                    const daysLeft = differenceInDays(new Date(contract.endDate!), new Date())
                    return (
                      <Link key={contract.id} href={`/dashboard/landlord/contracts/${contract.id}`}>
                        <div className="flex items-center justify-between text-sm bg-white p-3 rounded hover:bg-yellow-100 transition-colors cursor-pointer">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {contract.tenant?.firstName} {contract.tenant?.lastName}
                            </p>
                            <p className="text-xs text-gray-600">
                              Hết hạn: {format(new Date(contract.endDate!), 'dd/MM/yyyy', { locale: vi })}
                            </p>
                          </div>
                          <Badge className={
                            daysLeft <= 7 ? 'bg-red-100 text-red-800' :
                            daysLeft <= 14 ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {daysLeft} ngày
                          </Badge>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                <Link href="/dashboard/landlord/contracts">
                  <Button variant="link" className="text-yellow-700 hover:text-yellow-800 p-0 mt-2 h-auto">
                    Xem tất cả hợp đồng →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts Section */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Thống kê & Phân tích</h2>
          <p className="text-sm text-gray-600">Theo dõi hiệu suất kinh doanh của bạn</p>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RevenueTrendChart
            data={dashboardFinance?.charts?.revenueTrend || null}
            isLoading={loadingDashboardFinance}
          />
          <BuildingPerformanceBarChart
            data={dashboardFinance?.charts?.buildingPerformance || null}
            isLoading={loadingDashboardFinance}
          />
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <RoomTypePieChart
            data={dashboardFinance?.charts?.roomTypeDistribution || null}
            isLoading={loadingDashboardFinance}
          />
          <OccupancyStatusChart
            data={dashboardOverview?.rooms || null}
            isLoading={loadingDashboardOverview}
          />
          <OperationsPipelineChart
            data={dashboardOperations?.summary || null}
            isLoading={loadingDashboardOperations}
          />
        </div>
      </div>

      {/* Activity Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
