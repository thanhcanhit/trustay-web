"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, Home, ArrowLeft} from "lucide-react"
import { getRoomsByBuilding, deleteRoom } from "@/actions/room.action"
import { getBuildings } from "@/actions/building.action"
import { type Room, type Building } from "@/types/types"
import Link from "next/link"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const ROOM_TYPE_LABELS = {
  boarding_house: 'Nhà trọ',
  apartment: 'Căn hộ',
  house: 'Nhà nguyên căn',
  studio: 'Studio'
}

function RoomsManagementPageContent() {
  const searchParams = useSearchParams()
  const selectedBuildingId = searchParams.get('buildingId')
  
  const [rooms, setRooms] = useState<Room[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [buildingFilter, setBuildingFilter] = useState(selectedBuildingId || 'all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasBuildings, setHasBuildings] = useState(false)
  const [roomsCache, setRoomsCache] = useState<Map<string, { rooms: Room[], totalPages: number, lastFetched: number }>>(new Map())
  const [switchingBuilding, setSwitchingBuilding] = useState(false)
  const pageLimit = 12

  // Fetch buildings for filter dropdown
  const fetchBuildings = async () => {
    try {
      // Only fetch a reasonable number of buildings for the dropdown
      const response = await getBuildings({ limit: 50 })
      
      if (response.success && response.data.buildings && Array.isArray(response.data.buildings)) {
        setBuildings(response.data.buildings)
        setHasBuildings(response.data.buildings.length > 0)
      } else {
        console.error('Buildings fetch failed:', !response.success ? response.error : 'Unknown error')
        setBuildings([])
        setHasBuildings(false)
      }
    } catch (error) {
      console.error('Error fetching buildings:', error)
      setBuildings([])
      setHasBuildings(false)
    }
  }

  // Fetch rooms based on filters with pagination and caching
  const fetchRooms = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      if (buildingFilter === 'all') {
        // For "all buildings", we'll implement a different approach
        // Instead of fetching all rooms from all buildings, we'll show a message
        // and encourage users to select a specific building
        setRooms([])
        setTotalPages(1)
      } else {
        const cacheKey = `${buildingFilter}-${currentPage}`
        const cached = roomsCache.get(cacheKey)
        const now = Date.now()
        const cacheExpiry = 5 * 60 * 1000 // 5 minutes

        // Use cache if available and not expired, unless force refresh
        if (cached && !forceRefresh && (now - cached.lastFetched) < cacheExpiry) {
          const selectedBuilding = buildings && Array.isArray(buildings) ? buildings.find(b => b.id === buildingFilter) : undefined
          setRooms(cached.rooms.map(room => ({ ...room, building: selectedBuilding })))
          setTotalPages(cached.totalPages)
          setLoading(false)
          return
        }

        // Fetch rooms for specific building with pagination
        const response = await getRoomsByBuilding(buildingFilter, {
          page: currentPage,
          limit: pageLimit
        })
        
        if (response.success && response.data.rooms && Array.isArray(response.data.rooms)) {
          const selectedBuilding = buildings && Array.isArray(buildings) ? buildings.find(b => b.id === buildingFilter) : undefined
          const roomsWithBuilding = response.data.rooms.map(room => ({ ...room, building: selectedBuilding }))
          
          setRooms(roomsWithBuilding)
          setTotalPages(response.data.totalPages || 1)
          
          // Cache the result
          setRoomsCache(prev => new Map(prev).set(cacheKey, {
            rooms: response.data.rooms,
            totalPages: response.data.totalPages || 1,
            lastFetched: now
          }))
        } else {
          setRooms([])
          setTotalPages(1)
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast.error('Không thể tải danh sách phòng')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [buildingFilter, buildings, currentPage, pageLimit, roomsCache])

  useEffect(() => {
    fetchBuildings()
  }, [])

  useEffect(() => {
    if (buildings.length > 0) {
      // Only fetch rooms if a specific building is selected
      if (buildingFilter !== 'all') {
        fetchRooms().finally(() => {
          setSwitchingBuilding(false)
        })
      } else {
        // If "all" is selected, stop loading and show empty state
        setLoading(false)
        setSwitchingBuilding(false)
      }
    } else if (hasBuildings === false) {
      // If we've confirmed there are no buildings, stop loading
      setLoading(false)
      setSwitchingBuilding(false)
    }
  }, [buildings, fetchRooms, hasBuildings, buildingFilter, selectedBuildingId])

  // Filter rooms based on search and status
  const filteredRooms = (rooms && Array.isArray(rooms) ? rooms : []).filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase())
    // We'll filter by status when we have room instances data
    const matchesStatus = statusFilter === 'all' || room.isActive
    
    return matchesSearch && matchesStatus
  })

  // Clear cache for current building
  const clearBuildingCache = (buildingId: string) => {
    setRoomsCache(prev => {
      const newCache = new Map(prev)
      // Remove all cache entries for this building
      for (const key of newCache.keys()) {
        if (key.startsWith(`${buildingId}-`)) {
          newCache.delete(key)
        }
      }
      return newCache
    })
  }

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const response = await deleteRoom(roomId)
      if (!response.success) {
        toast.error(response.error)
        return
      }
      
      toast.success('Xóa loại phòng thành công')
      // Clear cache and refresh
      clearBuildingCache(buildingFilter)
      fetchRooms(true) // Force refresh
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Không thể xóa loại phòng. Vui lòng kiểm tra lại.')
    }
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý phòng</h1>
            <p className="text-gray-600">Quản lý tất cả các phòng trong hệ thống</p>
          </div>
          <Link href={selectedBuildingId ? `/dashboard/landlord/properties/rooms/add?buildingId=${selectedBuildingId}` : '/dashboard/landlord/properties/rooms/add'}>
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Thêm loại phòng
            </Button>
          </Link>
        </div>
        {/* Header Actions - Only show when viewing specific building */}
        {selectedBuildingId && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/landlord/properties">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại dãy trọ
                </Button>
              </Link>
            </div>
          </div>
        )}
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
            setSwitchingBuilding(true)
            setBuildingFilter(value)
            setCurrentPage(1) // Reset pagination when changing building
            // Clear current rooms immediately for better UX
            setRooms([])
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
        {(loading || switchingBuilding) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">
                {switchingBuilding ? 'Đang chuyển dãy trọ...' : 'Đang tải danh sách phòng...'}
              </p>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {!loading && !switchingBuilding && (
          <>
            {filteredRooms.length > 0 && buildingFilter !== 'all' && (
              <div className="mb-4 text-sm text-gray-600">
                Hiển thị {filteredRooms.length} loại phòng
                {buildings.find(b => b.id === buildingFilter) && (
                  <span> trong dãy trọ <strong>{buildings.find(b => b.id === buildingFilter)?.name}</strong></span>
                )}
                {totalPages > 1 && (
                  <span> • Trang {currentPage}/{totalPages}</span>
                )}
                {/* Show cache status in development */}
                {process.env.NODE_ENV === 'development' && (
                  <span className="ml-2 text-xs text-blue-500">
                    (Cache: {roomsCache.has(`${buildingFilter}-${currentPage}`) ? 'Hit' : 'Miss'})
                  </span>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className={`hover:shadow-lg transition-shadow ${
                room.isActive 
                  ? 'border-green-500 border-2' 
                  : 'border-gray-300 border-2'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{room.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {ROOM_TYPE_LABELS[room.roomType as keyof typeof ROOM_TYPE_LABELS]}
                        </Badge>
                        <Badge className={room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {room.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Dãy trọ:</span>
                      <span className="font-medium">{room.building?.name || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tầng:</span>
                      <span className="font-medium">Tầng {room.floorNumber || 'Chưa cập nhật'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Diện tích:</span>
                      <span className="font-medium">{room.areaSqm || 'Chưa cập nhật'}m²</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sức chứa:</span>
                      <span className="font-medium">{room.maxOccupancy || 'Chưa cập nhật'} người</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tổng phòng:</span>
                      <span className="font-medium">{room.totalRooms || 'Chưa cập nhật'} phòng</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Giá thuê:</span>
                      <span className="font-medium text-green-600">
                        {room.pricing?.basePriceMonthly ? 
                          Number(room.pricing.basePriceMonthly).toLocaleString('vi-VN') : 
                          'Chưa cập nhật'} VNĐ/tháng
                      </span>
                    </div>
                    
                    {room.availableInstancesCount !== undefined && room.occupiedInstancesCount !== undefined && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-2">Tình trạng phòng:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Trống:</span>
                            <span className="font-medium text-green-600">{room.availableInstancesCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Đã thuê:</span>
                            <span className="font-medium text-blue-600">{room.occupiedInstancesCount}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cập nhật:</span>
                      <span className="text-gray-500">{new Date(room.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Link href={`/dashboard/landlord/properties/rooms/${room.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full cursor-pointer">
                        <Eye className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>
                    </Link>
                    <Link href={`/dashboard/landlord/properties/rooms/${room.id}/edit`} className="flex-1">
                      <Button size="sm" className="w-full cursor-pointer">
                        <Edit className="h-4 w-4 mr-1" />
                        Sửa
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="mt-2 flex space-x-2">
                    <Link href={`/dashboard/landlord/properties/rooms/${room.id}/instances`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-green-600 border-green-300 hover:bg-green-50 cursor-pointer">
                        <Home className="h-4 w-4 mr-1" />
                        Quản lý phòng
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !switchingBuilding && filteredRooms.length === 0 && (
          <div className="text-center py-12">
            {buildingFilter === 'all' ? (
              <div>
                <div className="text-gray-500 mb-4">
                  <strong>Chọn một dãy trọ để xem danh sách phòng</strong><br/>
                  Vui lòng chọn một dãy trọ từ danh sách bên trên để xem các phòng trong dãy trọ đó.
                </div>
                <div className="text-sm text-gray-400">
                  Bạn có {buildings.length} dãy trọ để chọn
                </div>
              </div>
            ) : !hasBuildings ? (
              <div>
                <div className="text-gray-500 mb-4">Bạn chưa có dãy trọ nào. Vui lòng tạo dãy trọ trước khi thêm phòng.</div>
                <Link href="/dashboard/landlord/properties/add">
                  <Button className="cursor-pointer">Tạo dãy trọ đầu tiên</Button>
                </Link>
              </div>
            ) : searchTerm ? (
              <div>
                <div className="text-gray-500 mb-4">Không tìm thấy loại phòng nào phù hợp</div>
                <Button variant="outline" onClick={() => setSearchTerm('')} className="cursor-pointer">
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div>
                <div className="text-gray-500 mb-4">Chưa có loại phòng nào trong dãy trọ này</div>
                <Link href={selectedBuildingId ? `/dashboard/landlord/properties/rooms/add?buildingId=${selectedBuildingId}` : '/dashboard/landlord/properties/rooms/add'}>
                  <Button className="cursor-pointer">Thêm loại phòng đầu tiên</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !switchingBuilding && filteredRooms.length > 0 && totalPages > 1 && buildingFilter !== 'all' && (
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
