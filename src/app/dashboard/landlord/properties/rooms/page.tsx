"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, Eye, Home, MoreVertical } from "lucide-react"
import { useRoomStore } from "@/stores/roomStore"
import { useBuildingStore } from "@/stores/buildingStore"
import Link from "next/link"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PageHeader, PageHeaderActions } from "@/components/dashboard/page-header"
import { ROOM_TYPE_LABELS } from "@/constants/basic"

function RoomsManagementPageContent() {
  const searchParams = useSearchParams()
  const selectedBuildingId = searchParams.get('buildingId')

  // Room store
  const {
    myRooms: rooms,
    myRoomsLoading: loading,
    myRoomsError: roomsError,
    myRoomsPagination,
    fetchMyRooms,
    deleteMyRoom
  } = useRoomStore()

  // Building store
  const {
    buildings,
    error: buildingsError,
    fetchAllBuildings
  } = useBuildingStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [buildingFilter, setBuildingFilter] = useState(selectedBuildingId || 'all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageLimit = 12

  const totalPages = myRoomsPagination?.totalPages || 1
  const hasBuildings = buildings && Array.isArray(buildings) && buildings.length > 0

  // Fetch buildings for filter dropdown
  const fetchBuildings = useCallback(async () => {
    await fetchAllBuildings()
  }, [fetchAllBuildings])

  // Fetch all my rooms with pagination
  const fetchRooms = useCallback(async () => {
    await fetchMyRooms({
      page: currentPage,
      limit: pageLimit
    })
  }, [fetchMyRooms, currentPage, pageLimit])

  useEffect(() => {
    fetchBuildings()
    // Fetch rooms immediately when component mounts
    fetchRooms()
  }, [fetchBuildings, fetchRooms])

  useEffect(() => {
    // Fetch rooms when page changes
    fetchRooms()
  }, [currentPage, fetchRooms])

  // Filter rooms based on search, status, and building
  const filteredRooms = (rooms && Array.isArray(rooms) ? rooms : []).filter(room => {
    console.log('Filtering room:', room)
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && room.isActive) || 
      (statusFilter === 'inactive' && !room.isActive)
    const matchesBuilding = buildingFilter === 'all' || room.buildingId === buildingFilter
    
    return matchesSearch && matchesStatus && matchesBuilding
  })

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const success = await deleteMyRoom(roomId)
      if (success) {
        toast.success('Xóa loại phòng thành công')
      } else {
        toast.error('Không thể xóa loại phòng')
      }
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Không thể xóa loại phòng. Vui lòng kiểm tra lại.')
    }
  }

  // Handle errors
  useEffect(() => {
    if (roomsError) {
      toast.error(roomsError)
    }
  }, [roomsError])

  useEffect(() => {
    if (buildingsError) {
      toast.error(buildingsError)
    }
  }, [buildingsError])

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <PageHeader
          title="Quản lý phòng"
          subtitle="Quản lý tất cả các phòng trong hệ thống"
          backUrl="/dashboard/landlord/properties"
          backLabel="Quay lại dãy trọ"
          actions={
            <PageHeaderActions.Add 
              href={selectedBuildingId ? `/dashboard/landlord/properties/rooms/add?buildingId=${selectedBuildingId}` : '/dashboard/landlord/properties/rooms/add'}
              label="Thêm loại phòng"
            />
          }
        />
        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Tạm dừng</SelectItem>
            </SelectContent>
          </Select>

          <Select value={buildingFilter} onValueChange={(value) => {
            setBuildingFilter(value)
            setCurrentPage(1) // Reset pagination when changing building
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Dãy trọ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả dãy trọ</SelectItem>
              {buildings && Array.isArray(buildings) && buildings.map((building) => (
                <SelectItem key={building.id} value={building.id}>
                  {building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            <Button variant="outline" className="cursor-pointer">
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải danh sách phòng...</p>
            </div>
          </div>
        )}

        {/* Rooms Table */}
        {!loading && (
          <>
            {filteredRooms.length > 0 && (
              <div className="mb-4 text-sm text-gray-600">
                Hiển thị {filteredRooms.length} loại phòng
                {buildingFilter !== 'all' && buildings.find(b => b.id === buildingFilter) && (
                  <span> trong dãy trọ <strong>{buildings.find(b => b.id === buildingFilter)?.name}</strong></span>
                )}
                {totalPages > 1 && (
                  <span> • Trang {currentPage}/{totalPages}</span>
                )}
              </div>
            )}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên phòng</TableHead>
                      <TableHead>Dãy trọ</TableHead>
                      <TableHead>Loại phòng</TableHead>
                      <TableHead>Diện tích</TableHead>
                      <TableHead>Giá thuê</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Số người tối đa</TableHead>
                      <TableHead className="text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-[200px]">
                            <div className="font-semibold text-gray-900">{room.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Tổng: {room.totalRooms || 0} phòng
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px]">
                            <div>{room.buildingName || 'N/A'}</div>
                            {room.floorNumber && (
                              <div className="text-xs text-gray-500 mt-1">Tầng {room.floorNumber}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ROOM_TYPE_LABELS[room.roomType as keyof typeof ROOM_TYPE_LABELS]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {room.areaSqm ? `${room.areaSqm}m²` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            {room.pricing?.basePriceMonthly ?
                              Number(room.pricing.basePriceMonthly).toLocaleString('vi-VN') :
                              'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">VNĐ/tháng</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {room.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </Badge>
                            {room.availableInstancesCount !== undefined && room.occupiedInstancesCount !== undefined && (
                              <div className="text-xs text-gray-500">
                                <div>Trống: {room.availableInstancesCount}</div>
                                <div>Đã thuê: {room.occupiedInstancesCount}</div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {room.maxOccupancy ? `${room.maxOccupancy} người` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="cursor-pointer">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/landlord/properties/rooms/${room.id}`} className="cursor-pointer">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Xem chi tiết
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/landlord/properties/rooms/${room.id}/edit`} className="cursor-pointer">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Chỉnh sửa
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/landlord/properties/rooms/${room.id}/instances`} className="cursor-pointer">
                                    <Home className="h-4 w-4 mr-2" />
                                    Quản lý phòng
                                  </Link>
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 cursor-pointer">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Xóa
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xóa phòng {room.name}?</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogDescription>
                                      Điều này sẽ xóa phòng {room.name} và tất cả các phòng trong phòng này.
                                    </AlertDialogDescription>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                                        onClick={() => handleDeleteRoom(room.id)}
                                      >
                                        Xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && filteredRooms.length === 0 && (
          <div className="text-center py-12">
            {!hasBuildings ? (
              <div>
                <div className="text-gray-500 mb-4">Bạn chưa có dãy trọ nào. Vui lòng tạo dãy trọ trước khi thêm phòng.</div>
                <Link href="/dashboard/landlord/properties/add">
                  <Button className="cursor-pointer">Tạo dãy trọ đầu tiên</Button>
                </Link>
              </div>
            ) : searchTerm || buildingFilter !== 'all' || statusFilter !== 'all' ? (
              <div>
                <div className="text-gray-500 mb-4">Không tìm thấy loại phòng nào phù hợp với bộ lọc</div>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setBuildingFilter('all')
                  setStatusFilter('all')
                }} className="cursor-pointer">
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div>
                <div className="text-gray-500 mb-4">Bạn chưa có loại phòng nào. Hãy tạo loại phòng đầu tiên!</div>
                <Link href="/dashboard/landlord/properties/rooms/add">
                  <Button className="cursor-pointer">Thêm loại phòng đầu tiên</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredRooms.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer"
              >
                Trước
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="cursor-pointer"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function RoomsManagementPage() {
  return (
    <Suspense fallback={<DashboardLayout userType="landlord"><div className="p-6">Loading...</div></DashboardLayout>}>
      <RoomsManagementPageContent />
    </Suspense>
  )
}
