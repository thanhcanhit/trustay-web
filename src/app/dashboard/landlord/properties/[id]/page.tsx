"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Edit, Trash2, ArrowLeft, Home, Users, DollarSign, TrendingUp } from "lucide-react"
import { getBuildingById, deleteBuilding } from "@/actions/building.action"
import { getRoomsByBuilding } from "@/actions/room.action"
import { type Building as BuildingType } from "@/types/types"
import Link from "next/link"
import { toast } from "sonner"

export default function BuildingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const buildingId = params.id as string

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
      const response = await getBuildingById(buildingId)
      
      if (!response.success) {
        toast.error(response.error)
        router.push('/dashboard/landlord/properties')
        return
      }
      
      setBuilding(response.data.data)
      
      // Fetch rooms data for this building
      try {
        const roomsResponse = await getRoomsByBuilding(buildingId, { limit: 1000 })
        
        if (roomsResponse.success && roomsResponse.data.rooms && Array.isArray(roomsResponse.data.rooms)) {
          const totalRooms = roomsResponse.data.rooms.reduce((sum: number, room: { totalRooms?: number }) => sum + (room.totalRooms || 0), 0)
          
          // Get status counts for all rooms
          let availableCount = 0
          let occupiedCount = 0
          let maintenanceCount = 0
          
          for (const room of roomsResponse.data.rooms) {
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
  }, [buildingId, router])

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
      const response = await deleteBuilding(building.id)
      if (!response.success) {
        toast.error(response.error)
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
              <Button className="mt-4">Quay lại danh sách</Button>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/landlord/properties">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={building.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {building.isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Badge>
                <span className="text-sm text-gray-500">
                  Cập nhật: {new Date(building.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link href={`/dashboard/landlord/properties/${building.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDeleteBuilding}>
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Tổng số phòng</p>
                  <p className="text-2xl font-bold text-gray-900">{roomsCount.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Phòng đã thuê</p>
                  <p className="text-2xl font-bold text-gray-900">{roomsCount.occupied}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Tỷ lệ lấp đầy</p>
                  <p className="text-2xl font-bold text-gray-900">{occupancyRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Doanh thu</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {building.monthlyRevenue ? (building.monthlyRevenue / 1000000).toFixed(1) + 'M' : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Building Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Tên dãy trọ</h4>
                <p className="text-gray-600">{building.name}</p>
              </div>
              
              {building.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Mô tả</h4>
                  <p className="text-gray-600">{building.description}</p>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Địa chỉ</h4>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="text-gray-600">
                    <p>{building.addressLine1}</p>
                    {building.addressLine2 && <p>{building.addressLine2}</p>}
                    <p>
                      {building.ward?.name && `${building.ward.name}, `}
                      {building.district?.name && `${building.district.name}, `}
                      {building.province?.name}
                    </p>
                  </div>
                </div>
              </div>
              
              {(building.latitude && building.longitude) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Tọa độ</h4>
                  <p className="text-gray-600">
                    {building.latitude}, {building.longitude}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê phòng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng số phòng:</span>
                  <span className="font-medium">{roomsCount.total}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phòng trống:</span>
                  <span className="font-medium text-green-600">{roomsCount.available}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phòng đã thuê:</span>
                  <span className="font-medium text-blue-600">{roomsCount.occupied}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phòng bảo trì:</span>
                  <span className="font-medium text-yellow-600">{roomsCount.maintenance}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tỷ lệ lấp đầy:</span>
                  <span className="font-medium text-lg">{occupancyRate}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href={`/dashboard/landlord/properties/rooms?buildingId=${building.id}`}>
                  <Button className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Quản lý phòng
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href={`/dashboard/landlord/properties/rooms?buildingId=${building.id}`}>
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Quản lý phòng
                </Button>
              </Link>
              
              <Link href={`/dashboard/landlord/properties/rooms/add?buildingId=${building.id}`}>
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Thêm loại phòng mới
                </Button>
              </Link>
              
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Xem khách thuê
              </Button>
              
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Báo cáo doanh thu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
