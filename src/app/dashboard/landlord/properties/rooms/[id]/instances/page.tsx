"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormLabel } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, 
  Home, 
  Edit, 
  Save, 
  X, 
  Users, 
  Settings,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import { 
  getRoomById, 
  getRoomInstancesByStatus, 
  updateRoomInstanceStatus, 
  bulkUpdateRoomInstancesStatus 
} from "@/actions/room.action"
import { 
  type Room, 
  type RoomInstance, 
  type UpdateRoomInstanceStatusRequest,
  type BulkUpdateRoomInstancesRequest,
  type RoomStatus 
} from "@/types/types"
import Link from "next/link"
import { toast } from "sonner"

const STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-blue-100 text-blue-800', 
  maintenance: 'bg-yellow-100 text-yellow-800',
  reserved: 'bg-purple-100 text-purple-800',
  unavailable: 'bg-gray-100 text-gray-800'
}

const STATUS_LABELS = {
  available: 'Còn trống',
  occupied: 'Đã cho thuê',
  maintenance: 'Bảo trì',
  reserved: 'Đã đặt trước',
  unavailable: 'Không khả dụng'
}

const STATUS_ICONS = {
  available: CheckCircle,
  occupied: Users,
  maintenance: Settings,
  reserved: Clock,
  unavailable: XCircle
}

export default function RoomInstancesPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [room, setRoom] = useState<Room | null>(null)
  const [instances, setInstances] = useState<RoomInstance[]>([])
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInstances, setSelectedInstances] = useState<string[]>([])
  const [editingInstance, setEditingInstance] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    status: '' as RoomStatus,
    reason: ''
  })
  const [bulkEditForm, setBulkEditForm] = useState({
    status: '' as RoomStatus,
    reason: ''
  })
  const [showBulkEdit, setShowBulkEdit] = useState(false)

  const fetchRoomAndInstances = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch room details
      const roomResponse = await getRoomById(roomId)
      if (!roomResponse.success) {
        toast.error(roomResponse.error)
        router.push('/dashboard/landlord/properties/rooms')
        return
      }
      setRoom(roomResponse.data.data)
      
      // Fetch room instances
      const instancesResponse = await getRoomInstancesByStatus(roomId, statusFilter)
      if (!instancesResponse.success) {
        toast.error(instancesResponse.error)
        return
      }
      
      setInstances(instancesResponse.data.data.instances)
      setStatusCounts(instancesResponse.data.data.statusCounts)
    } catch (error) {
      console.error('Error fetching room instances:', error)
      toast.error('Không thể tải danh sách phòng')
    } finally {
      setLoading(false)
    }
  }, [roomId, statusFilter, router])

  useEffect(() => {
    if (roomId) {
      fetchRoomAndInstances()
    }
  }, [roomId, fetchRoomAndInstances])

  const handleInstanceSelection = (instanceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInstances(prev => [...prev, instanceId])
    } else {
      setSelectedInstances(prev => prev.filter(id => id !== instanceId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInstances(instances.map(instance => instance.id))
    } else {
      setSelectedInstances([])
    }
  }

  const handleEditInstance = (instance: RoomInstance) => {
    setEditingInstance(instance.id)
    setEditForm({
      status: instance.status,
      reason: instance.statusReason || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingInstance) return

    try {
      const updateData: UpdateRoomInstanceStatusRequest = {
        status: editForm.status,
        reason: editForm.reason || undefined
      }

      const response = await updateRoomInstanceStatus(editingInstance, updateData)
      if (!response.success) {
        toast.error(response.error)
        return
      }

      toast.success('Cập nhật trạng thái phòng thành công')
      setEditingInstance(null)
      fetchRoomAndInstances()
    } catch (error) {
      console.error('Error updating room instance:', error)
      toast.error('Không thể cập nhật trạng thái phòng')
    }
  }

  const handleCancelEdit = () => {
    setEditingInstance(null)
    setEditForm({ status: '' as RoomStatus, reason: '' })
  }

  const handleBulkUpdate = async () => {
    if (selectedInstances.length === 0) {
      toast.error('Vui lòng chọn ít nhất một phòng')
      return
    }

    if (!bulkEditForm.status) {
      toast.error('Vui lòng chọn trạng thái')
      return
    }

    try {
      const updateData: BulkUpdateRoomInstancesRequest = {
        roomInstanceIds: selectedInstances,
        status: bulkEditForm.status,
        reason: bulkEditForm.reason || undefined
      }

      const response = await bulkUpdateRoomInstancesStatus(roomId, updateData)
      if (!response.success) {
        toast.error(response.error)
        return
      }

      toast.success(`Cập nhật trạng thái cho ${selectedInstances.length} phòng thành công`)
      setSelectedInstances([])
      setShowBulkEdit(false)
      setBulkEditForm({ status: '' as RoomStatus, reason: '' })
      fetchRoomAndInstances()
    } catch (error) {
      console.error('Error bulk updating room instances:', error)
      toast.error('Không thể cập nhật trạng thái phòng')
    }
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

  if (!room) {
    return (
      <DashboardLayout userType="landlord">
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy thông tin phòng</p>
            <Link href="/dashboard/landlord/properties/rooms">
              <Button className="mt-4">Quay lại danh sách</Button>
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
            <Link href={`/dashboard/landlord/properties/rooms/${roomId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng: {room.name}</h1>
              <p className="text-gray-600">
                Quản lý trạng thái {room.totalRooms} phòng cụ thể
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {selectedInstances.length > 0 && (
              <Button onClick={() => setShowBulkEdit(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Sửa hàng loạt ({selectedInstances.length})
              </Button>
            )}
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS]
            const count = statusCounts[status] || 0
            
            return (
              <Card 
                key={status} 
                className={`cursor-pointer transition-colors ${
                  statusFilter === status ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">{label}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedInstances.length === instances.length && instances.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">
                Chọn tất cả ({selectedInstances.length}/{instances.length})
              </span>
            </div>
          </div>
        </div>

        {/* Room Instances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {instances.map((instance) => {
            const StatusIcon = STATUS_ICONS[instance.status]
            const isEditing = editingInstance === instance.id
            
            return (
              <Card key={instance.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedInstances.includes(instance.id)}
                        onCheckedChange={(checked) => handleInstanceSelection(instance.id, !!checked)}
                      />
                      <div>
                        <CardTitle className="text-lg">{instance.roomNumber}</CardTitle>
                        <p className="text-sm text-gray-600">Tầng {instance.floorNumber}</p>
                      </div>
                    </div>
                    
                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditInstance(instance)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {isEditing ? (
                    <div className="space-y-4">
                      <FormField>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select 
                          value={editForm.status} 
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as RoomStatus }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([status, label]) => (
                              <SelectItem key={status} value={status}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                      
                      <FormField>
                        <FormLabel>Lý do</FormLabel>
                        <Textarea
                          placeholder="Nhập lý do thay đổi trạng thái..."
                          value={editForm.reason}
                          onChange={(e) => setEditForm(prev => ({ ...prev, reason: e.target.value }))}
                          className="min-h-[80px]"
                        />
                      </FormField>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveEdit} className="flex-1">
                          <Save className="h-4 w-4 mr-1" />
                          Lưu
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-4 w-4 text-gray-600" />
                        <Badge className={STATUS_COLORS[instance.status]}>
                          {STATUS_LABELS[instance.status]}
                        </Badge>
                      </div>
                      
                      {instance.statusReason && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Lý do:</p>
                          <p className="text-sm text-gray-700">{instance.statusReason}</p>
                        </div>
                      )}
                      
                      {instance.lastStatusChange && (
                        <p className="text-xs text-gray-500">
                          Cập nhật: {new Date(instance.lastStatusChange).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {instances.length === 0 && (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {statusFilter === 'all' 
                ? 'Chưa có phòng nào được tạo' 
                : `Không có phòng nào ở trạng thái "${STATUS_LABELS[statusFilter as keyof typeof STATUS_LABELS]}"`
              }
            </p>
            {statusFilter !== 'all' && (
              <Button variant="outline" onClick={() => setStatusFilter('all')}>
                Xem tất cả phòng
              </Button>
            )}
          </div>
        )}

        {/* Bulk Edit Modal */}
        {showBulkEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Cập nhật hàng loạt</CardTitle>
                <p className="text-sm text-gray-600">
                  Cập nhật trạng thái cho {selectedInstances.length} phòng đã chọn
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField>
                  <FormLabel>Trạng thái mới</FormLabel>
                  <Select 
                    value={bulkEditForm.status} 
                    onValueChange={(value) => setBulkEditForm(prev => ({ ...prev, status: value as RoomStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <SelectItem key={status} value={status}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField>
                  <FormLabel>Lý do</FormLabel>
                  <Textarea
                    placeholder="Nhập lý do thay đổi trạng thái..."
                    value={bulkEditForm.reason}
                    onChange={(e) => setBulkEditForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </FormField>
                
                <div className="flex space-x-2">
                  <Button onClick={handleBulkUpdate} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowBulkEdit(false)
                      setBulkEditForm({ status: '' as RoomStatus, reason: '' })
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
