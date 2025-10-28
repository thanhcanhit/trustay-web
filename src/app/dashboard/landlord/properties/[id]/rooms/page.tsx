"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Home, Plus, MoreVertical, Edit } from "lucide-react"
import { useBuildingStore } from "@/stores/buildingStore"
import { type Building as BuildingType, type Room } from "@/types/types"
import Link from "next/link"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ROOM_TYPE_LABELS } from "@/constants/basic"

export default function BuildingRoomsPage() {
  const params = useParams()
  const router = useRouter()
  const buildingId = params.id as string

  const { loadBuildingById, loadRoomsByBuilding } = useBuildingStore()
  const [building, setBuilding] = useState<BuildingType | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageLimit = 20

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      // Load building info
      const buildingData = await loadBuildingById(buildingId)
      if (!buildingData) {
        toast.error('Không tìm thấy dãy trọ')
        router.push('/dashboard/landlord/properties')
        return
      }
      setBuilding(buildingData)

      // Load rooms
      setRoomsLoading(true)
      const roomsData = await loadRoomsByBuilding(buildingId, { 
        limit: pageLimit,
        page: currentPage 
      })

      if (roomsData && Array.isArray(roomsData)) {
        setRooms(roomsData)
        
        if (buildingData?.totalRooms) {
          const estimated = Math.ceil(buildingData.totalRooms / pageLimit)
          setTotalPages(estimated)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Không thể tải thông tin')
    } finally {
      setLoading(false)
      setRoomsLoading(false)
    }
  }, [buildingId, currentPage, loadBuildingById, loadRoomsByBuilding, pageLimit, router])

  useEffect(() => {
    if (buildingId) {
      fetchData()
    }
  }, [buildingId, fetchData])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <DashboardLayout userType="landlord">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải danh sách phòng...</p>
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

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link 
              href="/dashboard/landlord/properties"
              className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
            >
              ← Quay lại danh sách dãy trọ
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
            <p className="text-gray-600 mt-1">
              {building.addressLine1}
              {building.ward && `, ${building.ward.name}`}
              {building.district && `, ${building.district.name}`}
            </p>
            <div className="flex gap-2 mt-2">
              <Link href={`/dashboard/landlord/properties/${building.id}`}>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  Xem chi tiết dãy trọ
                </Button>
              </Link>
            </div>
          </div>
          <Link href={`/dashboard/landlord/properties/rooms/add?buildingId=${building.id}`}>
            <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Thêm loại phòng
            </Button>
          </Link>
        </div>

        {/* Rooms List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách loại phòng ({rooms.length})
            </h2>
          </div>

          {roomsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải danh sách phòng...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
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
                <div className="flex justify-center items-center gap-2 p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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
