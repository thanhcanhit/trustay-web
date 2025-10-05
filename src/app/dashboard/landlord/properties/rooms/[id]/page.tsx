"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Home, Users, DollarSign, Settings, Building as BuildingIcon } from "lucide-react"
import { useRoomStore } from "@/stores/roomStore"
import { type RoomResponse as Room } from "@/types/response/room"
import Link from "next/link"
import { toast } from "sonner"
import { PageHeader, PageHeaderActions } from "@/components/dashboard/page-header"
import { ROOM_TYPE_LABELS } from "@/types/basic"

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const { loadRoomById, deleteMyRoom, loadRoomInstances } = useRoomStore()
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
      const roomData = await loadRoomById(roomId)

      if (!roomData) {
        toast.error('Không tìm thấy phòng')
        router.push('/dashboard/landlord/properties/rooms')
        return
      }

      setRoom(roomData)

      // Fetch actual status counts from room instances
      try {
        const instancesData = await loadRoomInstances(roomId, 'all')
        if (instancesData) {
          setActualStatusCounts(instancesData.statusCounts)
        }
      } catch (instancesError) {
        console.error('Error fetching room instances:', instancesError)
        // Fallback to room.statusCounts if instances fetch fails
        if (roomData.statusCounts) {
          setActualStatusCounts(roomData.statusCounts)
        }
      }
    } catch (error) {
      console.error('Error fetching room detail:', error)
      toast.error('Không thể tải thông tin phòng')
      router.push('/dashboard/landlord/properties/rooms')
    } finally {
      setLoading(false)
    }
  }, [roomId, router, loadRoomById, loadRoomInstances])

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
      const success = await deleteMyRoom(room.id)
      if (!success) {
        toast.error('Không thể xóa loại phòng')
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
        <PageHeader
          title={room.name}
          subtitle={
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {ROOM_TYPE_LABELS[room.roomType as keyof typeof ROOM_TYPE_LABELS]}
              </Badge>
              <Badge className={room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {room.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </Badge>
              <span className="text-sm text-gray-500">
                Cập nhật: {new Date(room.lastUpdated).toLocaleDateString('vi-VN')}
              </span>
            </div>
          }
          backUrl="/dashboard/landlord/properties/rooms"
          backLabel="Quay lại"
          actions={
            <>
              <Link href={`/dashboard/landlord/properties/rooms/${room.id}/instances`}>
                <Button variant="outline" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Quản lý phòng
                </Button>
              </Link>
              <PageHeaderActions.Edit href={`/dashboard/landlord/properties/rooms/${room.id}/edit`} />
              <PageHeaderActions.Delete onClick={handleDeleteRoom} />
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
                <p className="text-xl font-bold text-gray-900">{room.totalRooms || 0}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Đã cho thuê</p>
                <p className="text-xl font-bold text-gray-900">{actualStatusCounts.occupied || 0}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Home className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Còn trống</p>
                <p className="text-xl font-bold text-gray-900">{actualStatusCounts.available || 0}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Giá thuê/tháng</p>
                <p className="text-xl font-bold text-gray-900">
                  {room.pricing?.basePriceMonthly ?
                    Number(room.pricing.basePriceMonthly).toLocaleString('vi-VN') + ' VNĐ' :
                    'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - 2 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information & Room Generation */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên loại phòng</label>
                  <p className="mt-0.5 text-gray-900">{room.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Loại phòng</label>
                  <p className="mt-0.5 text-gray-900">
                    {ROOM_TYPE_LABELS[room.roomType as keyof typeof ROOM_TYPE_LABELS]}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Dãy trọ</label>
                  <div className="mt-0.5 flex items-center space-x-2">
                    <BuildingIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{room.buildingName || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Diện tích</label>
                  <p className="mt-0.5 text-gray-900">{room.areaSqm || 'N/A'} m²</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Sức chứa</label>
                  <p className="mt-0.5 text-gray-900">{room.maxOccupancy || 'N/A'} người</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Tầng</label>
                  <p className="mt-0.5 text-gray-900">Tầng {room.floorNumber || 'N/A'}</p>
                </div>

                {room.description && (
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium text-gray-500">Mô tả</label>
                    <div className="mt-0.5 text-gray-900 text-sm" dangerouslySetInnerHTML={{ __html: room.description }} />
                  </div>
                )}
              </div>

              <Separator className="my-3" />

              <h4 className="text-sm font-semibold text-gray-900 mb-3">Thông tin sinh phòng</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Số lượng phòng</label>
                  <p className="mt-0.5 text-gray-900">{room.totalRooms || 'N/A'} phòng</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Tiền tố</label>
                  <p className="mt-0.5 text-gray-900">{room.roomNumberPrefix || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Số bắt đầu</label>
                  <p className="mt-0.5 text-gray-900">{room.roomNumberStart || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Ví dụ</label>
                  <p className="mt-0.5 text-gray-900 text-sm">
                    {room.roomNumberPrefix && room.roomNumberStart ?
                      `${room.roomNumberPrefix}${room.roomNumberStart}, ${room.roomNumberPrefix}${room.roomNumberStart + 1}` :
                      'N/A'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Pricing, Amenities, Rules, Costs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Thông tin giá cả</h3>

              {/* Pricing */}
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Giá thuê/tháng</label>
                    <p className="mt-0.5 text-base font-bold text-green-600">
                      {room.pricing?.basePriceMonthly ?
                        Number(room.pricing.basePriceMonthly).toLocaleString('vi-VN') :
                        'N/A'} VNĐ
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">Tiền cọc</label>
                    <p className="mt-0.5 text-base font-bold text-blue-600">
                      {room.pricing?.depositAmount ?
                        Number(room.pricing.depositAmount).toLocaleString('vi-VN') :
                        'N/A'} VNĐ
                    </p>
                    <p className="text-xs text-gray-500">({room.pricing?.depositMonths || 'N/A'} tháng)</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500">Thời gian thuê</label>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {room.pricing?.minimumStayMonths || 'N/A'} - {room.pricing?.maximumStayMonths || '∞'} tháng
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant={room.pricing?.utilityIncluded ? "default" : "secondary"} className="text-xs">
                    {room.pricing?.utilityIncluded ? 'Tiện ích bao gồm' : 'Tiện ích riêng'}
                  </Badge>
                  <Badge variant={room.pricing?.priceNegotiable ? "default" : "secondary"} className="text-xs">
                    {room.pricing?.priceNegotiable ? 'Thương lượng được' : 'Giá cố định'}
                  </Badge>
                </div>
              </div>

              {/* Amenities as badges */}
              {room.amenities && room.amenities.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity.systemAmenity?.name || amenity.customValue || `Tiện nghi ${index + 1}`}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* Rules as badges */}
              {room.rules && room.rules.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap gap-1.5">
                    {room.rules.map((rule, index) => (
                      <Badge
                        key={index}
                        variant={rule.isEnforced ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {rule.systemRule?.name || rule.customValue || `Quy định ${index + 1}`}
                        {rule.isEnforced && ' ⚠️'}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* Costs */}
              {room.costs && room.costs.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    {room.costs.map((cost, index) => (
                      <div key={index} className="flex justify-between items-start text-xs">
                        <span className="text-gray-900 font-medium">
                          {cost.systemCostType?.name || cost.notes || `Chi phí ${index + 1}`}
                        </span>
                        <span className="font-bold text-green-600">
                          {cost.value ? Number(cost.value).toLocaleString('vi-VN') : 'N/A'} VNĐ
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
