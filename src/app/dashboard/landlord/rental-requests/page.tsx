"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Calendar, Home, Phone, Mail, Clock } from "lucide-react"
import { useBookingRequestStore } from "@/stores/bookingRequestStore"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  approved: 'Đã chấp nhận',
  rejected: 'Đã từ chối',
  cancelled: 'Đã hủy'
}

export default function RentalRequestsPage() {
  const { received, receivedMeta, loadingReceived, errorReceived, loadReceived, ownerUpdate } = useBookingRequestStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadReceived({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })
  }, [loadReceived, page, statusFilter])

  const canPrev = useMemo(() => receivedMeta?.hasPrev, [receivedMeta])
  const canNext = useMemo(() => receivedMeta?.hasNext, [receivedMeta])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return received
    return received.filter(r => {
      const name = `${r.tenant?.firstName || ''} ${r.tenant?.lastName || ''}`.toLowerCase()
      const phone = r.tenant?.phone?.toLowerCase() || ''
      const email = r.tenant?.email?.toLowerCase() || ''
      return name.includes(term) || phone.includes(term) || email.includes(term)
    })
  }, [received, searchTerm])

  const handleApprove = async (id: string) => {
    await ownerUpdate(id, { status: 'approved' })
    loadReceived({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })
  }
  const handleReject = async (id: string) => {
    await ownerUpdate(id, { status: 'rejected' })
    loadReceived({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu thuê trọ</h1>
          <p className="text-gray-600">Quản lý các yêu cầu thuê trọ từ khách thuê</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, điện thoại, email"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="approved">Đã chấp nhận</SelectItem>
              <SelectItem value="rejected">Đã từ chối</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => loadReceived({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })}>Làm mới</Button>
        </div>

        {errorReceived && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-4 text-sm">{errorReceived}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingReceived && Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx}><CardContent className="p-6 text-gray-500">Đang tải...</CardContent></Card>
          ))}

          {!loadingReceived && filtered.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.tenant?.avatarUrl || ''} alt={`${request.tenant?.firstName || ''} ${request.tenant?.lastName || ''}`} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {`${(request.tenant?.firstName || 'U')[0]}${(request.tenant?.lastName || 'S')[0]}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{request.tenant?.firstName} {request.tenant?.lastName}</CardTitle>
                      <Badge className={STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[request.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {request.tenant?.phone ? (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{request.tenant?.phone || '-'}</span>
                  </div>
                  ): null}                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{request.tenant?.email || '-'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{request.room?.name ? `Phòng: ${request.room.name}` : request.room?.building?.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Ngày vào: {format(new Date(request.moveInDate), 'dd/MM/yyyy', { locale: vi })}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Gửi: {format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                  </div>
                  
                  {request.messageToOwner && (
                    <div className="text-sm">
                      <p className="text-gray-600 font-medium mb-1">Tin nhắn:</p>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                        {request.messageToOwner}
                      </p>
                    </div>
                  )}
                </div>
                
                {request.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(request.id)}
                    >
                      Chấp nhận
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleReject(request.id)}
                    >
                      Từ chối
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {!loadingReceived && filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không có yêu cầu thuê trọ nào</div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">Trang {receivedMeta?.page || 1}/{receivedMeta?.totalPages || 1}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>Trước</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!canNext}>Sau</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
