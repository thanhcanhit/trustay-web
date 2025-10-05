"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Home, Users, DollarSign, TrendingUp, Building as BuildingIcon, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useBuildingStore } from "@/stores/buildingStore"
import { type BuildingResponse as BuildingType } from "@/types/response/room"
import Link from "next/link"
import { toast } from "sonner"
import { PageHeader, PageHeaderActions } from "@/components/dashboard/page-header"

export default function BuildingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const buildingId = params.id as string

  const { loadBuildingById, deleteBuilding: deleteBuildingAction, loadRoomsByBuilding } = useBuildingStore()
  const [building, setBuilding] = useState<BuildingType | null>(null)
  const [loading, setLoading] = useState(true)
  const [roomsCount, setRoomsCount] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0
  })

  const fetchBuildingDetail = useCallback(async () => {
    try {
      setLoading(true)
      const buildingData = await loadBuildingById(buildingId)

      if (!buildingData) {
        toast.error('Không tìm thấy dãy trọ')
        router.push('/dashboard/landlord/properties')
        return
      }

      setBuilding(buildingData)

      // Fetch rooms data for this building
      try {
        const roomsData = await loadRoomsByBuilding(buildingId, { limit: 1000 })

        if (roomsData && Array.isArray(roomsData)) {
          const totalRooms = roomsData.reduce((sum: number, room: { totalRooms?: number }) => sum + (room.totalRooms || 0), 0)

          // Get status counts for all rooms
          let availableCount = 0
          let occupiedCount = 0
          let maintenanceCount = 0

          for (const room of roomsData) {
            if (room.statusCounts) {
              availableCount += room.statusCounts.available
              occupiedCount += room.statusCounts.occupied
              maintenanceCount += room.statusCounts.maintenance
            }
          }

          setRoomsCount({
            total: totalRooms,
            available: availableCount,
            occupied: occupiedCount,
            maintenance: maintenanceCount
          })
        }
      } catch (roomsError) {
        console.error('Error fetching rooms data:', roomsError)
      }
    } catch (error) {
      console.error('Error fetching building detail:', error)
      toast.error('Không thể tải thông tin dãy trọ')
      router.push('/dashboard/landlord/properties')
    } finally {
      setLoading(false)
    }
  }, [buildingId, router, loadBuildingById, loadRoomsByBuilding])

  useEffect(() => {
    if (buildingId) {
      fetchBuildingDetail()
    }
  }, [buildingId, fetchBuildingDetail])

  const handleDeleteBuilding = async () => {
    if (!building) return

    if (!confirm(`Bạn có chắc chắn muốn xóa dãy trọ "${building.name}"? Hành động này không thể hoàn tác.`)) {
      return
    }

    try {
      const success = await deleteBuildingAction(building.id)
      if (!success) {
        toast.error('Không thể xóa dãy trọ')
        return
      }

      toast.success('Xóa dãy trọ thành công')
      router.push('/dashboard/landlord/properties')
    } catch (error) {
      console.error('Error deleting building:', error)
      toast.error('Không thể xóa dãy trọ. Vui lòng kiểm tra lại.')
    }
  }

  if (loading) {
    return (
      <DashboardLayout userType="landlord">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải thông tin dãy trọ...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!building) {
    return (
      <DashboardLayout userType="landlord">
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy thông tin dãy trọ</p>
            <Link href="/dashboard/landlord/properties">
              <Button className="mt-4 cursor-pointer">Quay lại danh sách</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const occupancyRate = roomsCount.total > 0 ? Math.round((roomsCount.occupied / roomsCount.total) * 100) : 0

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <PageHeader
          title={building.name}
          subtitle={
            <div className="flex items-center space-x-2">
              <Badge className={building.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {building.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </Badge>
              <span className="text-sm text-gray-500">
                Cập nhật: {new Date(building.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          }
          backUrl="/dashboard/landlord/properties"
          backLabel="Quay lại"
          actions={
            <>
              <PageHeaderActions.Edit href={`/dashboard/landlord/properties/${building.id}/edit`} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="cursor-pointer">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/landlord/properties/rooms?buildingId=${building.id}`} className="cursor-pointer">
                      <Home className="h-4 w-4 mr-2" />
                      Quản lý phòng
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/landlord/properties/rooms/add?buildingId=${building.id}`} className="cursor-pointer">
                      <BuildingIcon className="h-4 w-4 mr-2" />
                      Thêm loại phòng
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Users className="h-4 w-4 mr-2" />
                    Xem khách thuê
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Báo cáo doanh thu
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />

        {/* Stats Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Tổng số phòng</p>
                <p className="text-xl font-bold text-gray-900">{roomsCount.total}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Đã cho thuê</p>
                <p className="text-xl font-bold text-gray-900">{roomsCount.occupied}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Tỷ lệ lấp đầy</p>
                <p className="text-xl font-bold text-gray-900">{occupancyRate}%</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Doanh thu</p>
                <p className="text-xl font-bold text-gray-900">
                  {building.monthlyRevenue ? (building.monthlyRevenue / 1000000).toFixed(1) + 'M' : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - 2 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info & Address */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên dãy trọ</label>
                  <p className="mt-0.5 text-gray-900">{building.name}</p>
                </div>

                {building.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mô tả</label>
                    <p className="mt-0.5 text-gray-900">{building.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Địa chỉ</h3>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-900 text-sm">
                  <p>{building.addressLine1}</p>
                  {building.addressLine2 && <p>{building.addressLine2}</p>}
                  <p className="text-gray-600">
                    {building.ward?.name && `${building.ward.name}, `}
                    {building.district?.name && `${building.district.name}, `}
                    {building.province?.name}
                  </p>
                  {(building.latitude && building.longitude) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tọa độ: {building.latitude}, {building.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Room Statistics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Thống kê phòng</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-600">Tổng số phòng</span>
                  <span className="font-semibold text-gray-900">{roomsCount.total}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-600">Phòng trống</span>
                  <span className="font-semibold text-green-600">{roomsCount.available}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-600">Phòng đã thuê</span>
                  <span className="font-semibold text-blue-600">{roomsCount.occupied}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-600">Phòng bảo trì</span>
                  <span className="font-semibold text-yellow-600">{roomsCount.maintenance}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-600">Tỷ lệ lấp đầy</span>
                  <span className="font-semibold text-lg text-gray-900">{occupancyRate}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
