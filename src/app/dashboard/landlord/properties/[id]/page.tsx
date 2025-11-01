"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Home, Users, DollarSign, TrendingUp, MoreVertical, Trash, Edit, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useBuildingStore } from "@/stores/buildingStore"
import { type Building as BuildingType, type Room } from "@/types/types"
import Link from "next/link"
import { toast } from "sonner"
import { PageHeader, PageHeaderActions } from "@/components/dashboard/page-header"
import { ROOM_TYPE_LABELS } from "@/constants/basic"
import { HTMLContent } from "@/components/ui/html-content"

export default function BuildingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const buildingId = params.id as string

  const { loadBuildingById, deleteBuilding: deleteBuildingAction, loadRoomsByBuilding } = useBuildingStore()
  const [building, setBuilding] = useState<BuildingType | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsLoaded, setRoomsLoaded] = useState(false) // Track if rooms have been loaded
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageLimit = 20
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
    } catch (error) {
      console.error('Error fetching building detail:', error)
      toast.error('Không thể tải thông tin dãy trọ')
      router.push('/dashboard/landlord/properties')
    } finally {
      setLoading(false)
    }
  }, [buildingId, router, loadBuildingById])

  const loadRooms = useCallback(async (page = 1) => {
    try {
      setRoomsLoading(true)
      setCurrentPage(page)
      // Use pagination with page parameter
      const response = await loadRoomsByBuilding(buildingId, { 
        limit: pageLimit,
        page: page 
      })

      if (response && Array.isArray(response)) {
        setRooms(response)
        
        // Calculate total pages from response metadata if available
        // For now, estimate based on building data
        if (building?.totalRooms) {
          const estimated = Math.ceil(building.totalRooms / pageLimit)
          setTotalPages(estimated)
        }
        
        // Calculate actual stats from loaded rooms
        const totalRooms = response.reduce((sum: number, room: { totalRooms?: number }) => sum + (room.totalRooms || 0), 0)

        let availableCount = 0
        let occupiedCount = 0
        let maintenanceCount = 0

        for (const room of response) {
          if (room.statusCounts) {
            availableCount += room.statusCounts.available
            occupiedCount += room.statusCounts.occupied
            maintenanceCount += room.statusCounts.maintenance
          }
        }

        // Only update counts if we have actual data
        if (page === 1) {
          setRoomsCount({
            total: totalRooms,
            available: availableCount,
            occupied: occupiedCount,
            maintenance: maintenanceCount
          })
        }
      }
    } catch (roomsError) {
      console.error('Error loading rooms:', roomsError)
      toast.error('Không thể tải danh sách phòng')
    } finally {
      setRoomsLoading(false)
    }
  }, [buildingId, loadRoomsByBuilding, building, pageLimit])

  useEffect(() => {
    if (buildingId) {
      fetchBuildingDetail()
    }
  }, [buildingId, fetchBuildingDetail])

  // Auto-load rooms only once after building is loaded
  useEffect(() => {
    if (building && !roomsLoaded && !roomsLoading && rooms.length === 0) {
      setRoomsLoaded(true)
      loadRooms(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building?.id]) // Only depend on building.id to prevent infinite loops


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
              <Link href={`/dashboard/landlord/properties/rooms/add?buildingId=${building.id}`}>
                <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm loại phòng
                </Button>
              </Link>
              <PageHeaderActions.Edit href={`/dashboard/landlord/properties/${building.id}/edit`} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="cursor-pointer">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={handleDeleteBuilding} className="cursor-pointer text-red-600 hover:bg-red-100">
                    <Trash className="h-4 w-4 mr-2" />
                    Xóa dãy trọ
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
                    <HTMLContent content={building.description} className="mt-0.5" />
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

        {/* Rooms List Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách loại phòng</h3>
            <Link href={`/dashboard/landlord/properties/rooms/add?buildingId=${building.id}`}>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Thêm loại phòng
              </Button>
            </Link>
          </div>

          {roomsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải danh sách phòng...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Chưa có loại phòng nào</p>
              <Link href={`/dashboard/landlord/properties/rooms/add?buildingId=${building.id}`}>
                <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm loại phòng đầu tiên
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên phòng</TableHead>
                      <TableHead>Loại phòng</TableHead>
                      <TableHead>Diện tích</TableHead>
                      <TableHead>Sức chứa</TableHead>
                      <TableHead>Tổng số phòng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Giá thuê</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow 
                        key={room.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => window.location.href = `/dashboard/landlord/properties/rooms/${room.id}`}
                      >
                        <TableCell className="font-medium">{room.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ROOM_TYPE_LABELS[room.roomType.toUpperCase() as keyof typeof ROOM_TYPE_LABELS] || room.roomType}
                          </Badge>
                        </TableCell>
                        <TableCell>{room.areaSqm}m²</TableCell>
                        <TableCell>{room.maxOccupancy} người</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{room.totalRooms}</span>
                            <span className="text-xs text-gray-500">
                              {room.statusCounts?.available || 0} trống / {room.statusCounts?.occupied || 0} đã thuê
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {room.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {room.pricing?.basePriceMonthly 
                            ? `${Number(room.pricing.basePriceMonthly).toLocaleString('vi-VN')}đ/tháng`
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="cursor-pointer">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/landlord/properties/rooms/${room.id}/edit`} className="cursor-pointer">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Chỉnh sửa
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const prev = currentPage - 1
                      setCurrentPage(prev)
                      loadRooms(prev)
                    }}
                    disabled={currentPage === 1 || roomsLoading}
                    className="cursor-pointer"
                  >
                    Trang trước
                  </Button>
                  <span className="text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = currentPage + 1
                      setCurrentPage(next)
                      loadRooms(next)
                    }}
                    disabled={currentPage === totalPages || roomsLoading}
                    className="cursor-pointer"
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
