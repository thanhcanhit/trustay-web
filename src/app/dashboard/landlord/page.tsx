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
import { useBuildingStore } from "@/stores/buildingStore"
import { useUserStore } from "@/stores/userStore"
import { useRatingStore } from "@/stores/ratingStore"
import { useContractStore } from "@/stores/contractStore"
import { useBookingRequestStore } from "@/stores/bookingRequestStore"
import { useInvitationStore } from "@/stores/invitationStore"
import { useBillStore } from "@/stores/billStore"
import { RatingStats } from "@/components/rating"
import { format, differenceInDays } from "date-fns"
import { vi } from "date-fns/locale"
import {
  RevenueChart,
  OccupancyChart,
  PropertyPerformanceChart,
  RoomTypeDistributionChart,
  RevenueByRoomChart
} from "@/components/dashboard/charts"
import { generateDashboardAnalytics } from "@/lib/mock-analytics"

// Client Component for Dashboard Content
function DashboardContent() {
  const { dashboardData, isLoading, error, hasFetched, fetchDashboardData, forceRefresh } = useBuildingStore()
  const { user } = useUserStore()
  const { getRatingStats, statistics } = useRatingStore()
  const { contracts, loading: loadingContracts, loadContracts } = useContractStore()
  const { received, loadingReceived, loadReceived } = useBookingRequestStore()
  const { sent, loadingSent, loadSent } = useInvitationStore()
  const { bills, loading: loadingBills, loadLandlordBills } = useBillStore()
  const [loadingStats, setLoadingStats] = useState(true)
  const analytics = generateDashboardAnalytics()

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

  // Fetch pending booking requests
  useEffect(() => {
    loadReceived({ page: 1, limit: 5, status: 'pending' })
  }, [loadReceived])

  // Fetch pending invitations
  useEffect(() => {
    loadSent({ page: 1, limit: 5, status: 'pending' })
  }, [loadSent])

  // Fetch unpaid bills
  useEffect(() => {
    loadLandlordBills({ page: 1, limit: 5, status: 'pending' })
  }, [loadLandlordBills])

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

      {/* Stats Cards */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Tổng toà nhà"
            value={buildings.length}
            icon={BuildingIcon}
          />
          <StatCard
            title="Tổng phòng (loại)"
            value={Array.from(buildingRooms.values()).reduce((total, rooms) => total + rooms.length, 0)}
            icon={MapPin}
          />
          <StatCard
            title="Tổng phòng (đơn vị)"
            value={Array.from(buildingRooms.values()).reduce((total, rooms) => {
              return total + rooms.reduce((sum, room) => {
                return sum + (room.roomInstances?.length || 0)
              }, 0)
            }, 0)}
            icon={MapPin}
          />
          <StatCard
            title="Tỷ lệ lấp đầy"
            value={`${stats?.occupancyRate?.toFixed(0) || 0}%`}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Alert Widgets Row - Notifications & Alerts - MOVED TO TOP */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Booking Requests */}
        <Link href="/dashboard/landlord/requests">
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Yêu cầu mới</h3>
              </div>
              {!loadingReceived && received.length > 0 && (
                <Badge className="bg-red-500 text-white">{received.length}</Badge>
              )}
            </div>
            {loadingReceived ? (
              <div className="text-center py-4">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
              </div>
            ) : received.length === 0 ? (
              <p className="text-sm text-gray-500">Không có yêu cầu thuê mới</p>
            ) : (
              <div className="space-y-2">
                {received.slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-start justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {req.tenant?.firstName} {req.tenant?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {req.room?.name ? `Phòng ${req.room.name}` : '-'}
                      </p>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                  </div>
                ))}
                {received.length > 3 && (
                  <p className="text-xs text-blue-600 mt-2">+{received.length - 3} yêu cầu khác</p>
                )}
              </div>
            )}
          </div>
        </Link>

        {/* Pending Invitations */}
        <Link href="/dashboard/landlord/requests">
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Lời mời chờ</h3>
              </div>
              {!loadingSent && sent.filter(i => i.status === 'accepted' && !i.isConfirmedBySender).length > 0 && (
                <Badge className="bg-amber-500 text-white">
                  {sent.filter(i => i.status === 'accepted' && !i.isConfirmedBySender).length}
                </Badge>
              )}
            </div>
            {loadingSent ? (
              <div className="text-center py-4">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
              </div>
            ) : sent.filter(i => i.status === 'accepted' && !i.isConfirmedBySender).length === 0 ? (
              <p className="text-sm text-gray-500">Không có lời mời cần xác nhận</p>
            ) : (
              <div className="space-y-2">
                {sent.filter(i => i.status === 'accepted' && !i.isConfirmedBySender).slice(0, 3).map((inv) => (
                  <div key={inv.id} className="flex items-start justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {inv.recipient?.firstName} {inv.recipient?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {inv.room?.name || '-'} • Chờ xác nhận
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-amber-500 ml-2 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Unpaid Bills */}
        <Link href="/dashboard/landlord/invoices">
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Hóa đơn chờ</h3>
              </div>
              {!loadingBills && bills.filter(b => b.status === 'pending').length > 0 && (
                <Badge className="bg-orange-500 text-white">
                  {bills.filter(b => b.status === 'pending').length}
                </Badge>
              )}
            </div>
            {loadingBills ? (
              <div className="text-center py-4">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
              </div>
            ) : bills.filter(b => b.status === 'pending').length === 0 ? (
              <p className="text-sm text-gray-500">Không có hóa đơn chờ thanh toán</p>
            ) : (
              <div className="space-y-2">
                {bills.filter(b => b.status === 'pending').slice(0, 3).map((bill) => (
                  <div key={bill.id} className="flex items-start justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {bill.rental?.roomInstance?.room?.name ? `Phòng ${bill.rental.roomInstance.room.name}` :
                         bill.rental?.room?.name ? `Phòng ${bill.rental.room.name}` : '-'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {bill.totalAmount ? `${(bill.totalAmount / 1000000).toFixed(1)}M VNĐ` : '-'}
                      </p>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-orange-500 ml-2 flex-shrink-0" />
                  </div>
                ))}
                {bills.filter(b => b.status === 'pending').length > 3 && (
                  <p className="text-xs text-orange-600 mt-2">+{bills.filter(b => b.status === 'pending').length - 3} hóa đơn khác</p>
                )}
              </div>
            )}
          </div>
        </Link>
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
          <p className="text-sm text-gray-600">Theo dõi hiệu suất kinh doanh của bạn - Chọn tháng/năm ở mỗi biểu đồ</p>
        </div>

        {/* Main Charts with Month/Year Selectors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RevenueChart />
          <OccupancyChart />
        </div>

        {/* Revenue by Room - Full width */}
        <div className="mb-6">
          <RevenueByRoomChart data={analytics.revenueByRoom} />
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PropertyPerformanceChart data={analytics.propertyPerformance} />
          </div>
          <RoomTypeDistributionChart data={analytics.roomTypeDistribution} />
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
