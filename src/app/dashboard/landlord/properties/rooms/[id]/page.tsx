"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Edit, Trash2, ArrowLeft, Users, DollarSign, Settings, Building } from "lucide-react"
import { getRoomById, deleteRoom, getRoomInstancesByStatus } from "@/actions/room.action"
import { type Room } from "@/types/types"
import Link from "next/link"
import { toast } from "sonner"

const ROOM_TYPE_LABELS = {
  boarding_house: 'Nhà trọ',
  apartment: 'Căn hộ',
  house: 'Nhà nguyên căn',
  studio: 'Studio'
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [actualStatusCounts, setActualStatusCounts] = useState<{
    available: number;
    occupied: number;
    maintenance: number;
    reserved: number;
    unavailable: number;
  }>({
    available: 0,
    occupied: 0,
    maintenance: 0,
    reserved: 0,
    unavailable: 0
  })

  const fetchRoomDetail = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getRoomById(roomId)
      
      if (!response.success) {
        toast.error(response.error)
        router.push('/dashboard/landlord/properties/rooms')
        return
      }
      
      setRoom(response.data.data)
      
      // Fetch actual status counts from room instances
      try {
        const instancesResponse = await getRoomInstancesByStatus(roomId, 'all')
        if (instancesResponse.success) {
          setActualStatusCounts(instancesResponse.data.data.statusCounts)
        }
      } catch (instancesError) {
        console.error('Error fetching room instances:', instancesError)
        // Fallback to room.statusCounts if instances fetch fails
        if (response.data.data.statusCounts) {
          setActualStatusCounts(response.data.data.statusCounts)
        }
      }
    } catch (error) {
      console.error('Error fetching room detail:', error)
      toast.error('Không thể tải thông tin phòng')
      router.push('/dashboard/landlord/properties/rooms')
    } finally {
      setLoading(false)
    }
  }, [roomId, router])

  useEffect(() => {
    if (roomId) {
      fetchRoomDetail()
    }
  }, [roomId, fetchRoomDetail])

  const handleDeleteRoom = async () => {
    if (!room) return
    
    if (!confirm(`Bạn có chắc chắn muốn xóa loại phòng "${room.name}"? Hành động này không thể hoàn tác.`)) {
      return
    }

    try {
      const response = await deleteRoom(room.id)
      if (!response.success) {
        toast.error(response.error)
        return
      }
      
      toast.success('Xóa loại phòng thành công')
      router.push('/dashboard/landlord/properties/rooms')
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Không thể xóa loại phòng. Vui lòng kiểm tra lại.')
    }
  }

  if (loading) {
    return (
      <DashboardLayout userType="landlord">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải thông tin phòng...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!room) {
    return (
      <DashboardLayout userType="landlord">
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy thông tin phòng</p>
            <Link href="/dashboard/landlord/properties/rooms">
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/landlord/properties/rooms">
              <Button variant="outline" size="sm" className="cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">
                  {ROOM_TYPE_LABELS[room.roomType as keyof typeof ROOM_TYPE_LABELS]}
                </Badge>
                <Badge className={room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {room.isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Badge>
                <span className="text-sm text-gray-500">
                  Cập nhật: {new Date(room.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link href={`/dashboard/landlord/properties/rooms/${room.id}/edit`}>
              <Button className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDeleteRoom} className="cursor-pointer">
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
                  <p className="text-2xl font-bold text-gray-900">{room.totalRooms || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Đã cho thuê</p>
                  <p className="text-2xl font-bold text-gray-900">
                      {actualStatusCounts.occupied || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Còn trống</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {actualStatusCounts.available || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Giá thuê/tháng</p>
                  <p className="text-xl font-bold text-gray-900">
                    {room.pricing?.basePriceMonthly ? 
                      Number(room.pricing.basePriceMonthly).toLocaleString('vi-VN') : 
                      'Chưa cập nhật'} VNĐ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="pricing">Giá cả</TabsTrigger>
            <TabsTrigger value="amenities">Tiện nghi</TabsTrigger>
            <TabsTrigger value="instances">Quản lý phòng</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Tên loại phòng</h4>
                    <p className="text-gray-600">{room.name}</p>
                  </div>
                  
                  {room.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Mô tả</h4>
                      <p className="text-gray-600">{room.description}</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Loại phòng</h4>
                      <p className="text-gray-600">
                        {ROOM_TYPE_LABELS[room.roomType as keyof typeof ROOM_TYPE_LABELS]}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Diện tích</h4>
                      <p className="text-gray-600">{room.areaSqm || 'Chưa cập nhật'} m²</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Sức chứa</h4>
                      <p className="text-gray-600">{room.maxOccupancy || 'Chưa cập nhật'} người</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Tầng</h4>
                      <p className="text-gray-600">Tầng {room.floorNumber || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Dãy trọ</h4>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{room.building?.name || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Room Generation Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin sinh phòng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Số lượng phòng</h4>
                      <p className="text-gray-600">{room.totalRooms || 'Chưa cập nhật'} phòng</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Tiền tố</h4>
                      <p className="text-gray-600">{room.roomNumberPrefix || 'Chưa cập nhật'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Số bắt đầu</h4>
                      <p className="text-gray-600">{room.roomNumberStart || 'Chưa cập nhật'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Ví dụ số phòng</h4>
                      <p className="text-gray-600">
                        {room.roomNumberPrefix && room.roomNumberStart ? 
                          `${room.roomNumberPrefix}${room.roomNumberStart}, ${room.roomNumberPrefix}${room.roomNumberStart + 1}, ...` : 
                          'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  
                  {(actualStatusCounts.available > 0 || actualStatusCounts.occupied > 0 || actualStatusCounts.maintenance > 0 || actualStatusCounts.reserved > 0 || actualStatusCounts.unavailable > 0) && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Thống kê trạng thái</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Còn trống:</span>
                            <span className="font-medium text-green-600">
                              {actualStatusCounts.available || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Đã đặt:</span>
                            <span className="font-medium text-purple-600">{actualStatusCounts.reserved || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bảo trì:</span>
                            <span className="font-medium text-yellow-600">{actualStatusCounts.maintenance || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Đã cho thuê:</span>
                            <span className="font-medium text-blue-600">
                              {actualStatusCounts.occupied || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Không hoạt động:</span>
                            <span className="font-medium text-red-600">{actualStatusCounts.unavailable || 0}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="pricing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin giá cả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Giá thuê hàng tháng</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {room.pricing?.basePriceMonthly ? 
                        Number(room.pricing.basePriceMonthly).toLocaleString('vi-VN') : 
                        'Chưa cập nhật'} VNĐ
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Tiền cọc</h4>
                    <p className="text-xl font-bold text-blue-600">
                      {room.pricing?.depositAmount ? 
                        Number(room.pricing.depositAmount).toLocaleString('vi-VN') : 
                        'Chưa cập nhật'} VNĐ
                    </p>
                    <p className="text-sm text-gray-500">({room.pricing?.depositMonths || 'Chưa cập nhật'} tháng)</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Thời gian thuê</h4>
                    <p className="text-gray-600">
                      {room.pricing?.minimumStayMonths || 'Chưa cập nhật'} - {room.pricing?.maximumStayMonths || '∞'} tháng
                    </p>
                  </div>
                  
                  {room.pricing?.utilityCostMonthly && Number(room.pricing.utilityCostMonthly) > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Chi phí tiện ích</h4>
                      <p className="text-gray-600">
                        {Number(room.pricing.utilityCostMonthly).toLocaleString('vi-VN')} VNĐ/tháng
                      </p>
                    </div>
                  )}
                  
                  {room.pricing?.cleaningFee && Number(room.pricing.cleaningFee) > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Phí vệ sinh</h4>
                      <p className="text-gray-600">
                        {Number(room.pricing.cleaningFee).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  )}
                  
                  {room.pricing?.serviceFeePercentage && Number(room.pricing.serviceFeePercentage) > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Phí dịch vụ</h4>
                      <p className="text-gray-600">{room.pricing.serviceFeePercentage}%</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <Badge variant={room.pricing?.utilityIncluded ? "default" : "secondary"}>
                    {room.pricing?.utilityIncluded ? 'Tiện ích đã bao gồm' : 'Tiện ích tính riêng'}
                  </Badge>
                  <Badge variant={room.pricing?.priceNegotiable ? "default" : "secondary"}>
                    {room.pricing?.priceNegotiable ? 'Có thể thương lượng' : 'Giá cố định'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="amenities" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Tiện nghi</CardTitle>
                </CardHeader>
                <CardContent>
                  {room.amenities && room.amenities.length > 0 ? (
                    <div className="space-y-3">
                      {room.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{amenity.customValue || `Tiện nghi ${index + 1}`}</p>
                            {amenity.notes && (
                              <p className="text-sm text-gray-600">{amenity.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có tiện nghi nào</p>
                  )}
                </CardContent>
              </Card>

              {/* Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Nội quy</CardTitle>
                </CardHeader>
                <CardContent>
                  {room.rules && room.rules.length > 0 ? (
                    <div className="space-y-3">
                      {room.rules.map((rule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{rule.customValue || `Quy định ${index + 1}`}</p>
                            {rule.notes && (
                              <p className="text-sm text-gray-600">{rule.notes}</p>
                            )}
                          </div>
                          <Badge variant={rule.isEnforced ? "default" : "secondary"}>
                            {rule.isEnforced ? 'Bắt buộc' : 'Khuyến khích'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có nội quy nào</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Costs */}
            {room.costs && room.costs.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Chi phí phát sinh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {room.costs.map((cost, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{cost.notes || `Chi phí ${index + 1}`}</p>
                          <p className="text-sm text-gray-600">
                            {cost.costType} • {cost.billingCycle}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {cost.value ? 
                              Number(cost.value).toLocaleString('vi-VN') : 
                              'Chưa cập nhật'} VNĐ
                            {cost.unit && `/${cost.unit}`}
                          </p>
                          <div className="flex space-x-2">
                            <Badge variant={cost.includedInRent ? "default" : "outline"}>
                              {cost.includedInRent ? 'Đã bao gồm' : 'Tính riêng'}
                            </Badge>
                            <Badge variant={cost.isOptional ? "secondary" : "default"}>
                              {cost.isOptional ? 'Tùy chọn' : 'Bắt buộc'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="instances" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý các phòng cụ thể</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Quản lý trạng thái từng phòng cụ thể</p>
                  <Link href={`/dashboard/landlord/properties/rooms/${room.id}/instances`}>
                    <Button className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Quản lý phòng
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
