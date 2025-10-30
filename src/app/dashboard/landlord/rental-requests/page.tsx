"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Search, Calendar, Phone, Mail, Clock, CheckCircle, MessageSquare, X } from "lucide-react"
import { useBookingRequestStore } from "@/stores/bookingRequestStore"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ClickableUserAvatar } from "@/components/profile/clickable-user-avatar"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

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

const CONFIRMED_COLORS = {
  true: 'bg-green-100 text-green-800',
  false: 'bg-yellow-100 text-yellow-800'
}

const CONFIRMED_LABELS = {
  true: 'Đã xác nhận',
  false: 'Chờ xác nhận'
}

export default function RentalRequestsPage() {
  const { received, receivedMeta, loadingReceived, errorReceived, submitting, loadReceived, ownerUpdate } = useBookingRequestStore()
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
    const success = await ownerUpdate(id, { status: 'accepted' })
    if (success) {
      toast.success(
        'Đã chấp nhận yêu cầu!\n\nĐang chờ tenant xác nhận để tạo hợp đồng thuê.',
        { duration: 3000 }
      )
      loadReceived({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })
    }
  }

  const handleReject = async (id: string) => {
    const success = await ownerUpdate(id, { status: 'rejected' })
    if (success) {
      toast.success('Đã từ chối yêu cầu')
      loadReceived({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })
    }
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

        {loadingReceived ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">Đang tải...</CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar />
              </EmptyMedia>
              <EmptyTitle>
                {searchTerm || statusFilter !== 'all'
                  ? 'Không tìm thấy yêu cầu'
                  : 'Chưa có yêu cầu thuê trọ'
                }
              </EmptyTitle>
              <EmptyDescription>
                {searchTerm || statusFilter !== 'all'
                  ? 'Không có yêu cầu nào phù hợp với bộ lọc hiện tại. Hãy thử tìm kiếm hoặc lọc với điều kiện khác.'
                  : 'Bạn chưa nhận được yêu cầu thuê trọ nào. Yêu cầu sẽ xuất hiện khi khách thuê gửi yêu cầu cho phòng của bạn.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Người thuê</TableHead>
                  <TableHead className="w-[180px]">Liên hệ</TableHead>
                  <TableHead className="w-[150px]">Phòng</TableHead>
                  <TableHead className="w-[110px]">Ngày vào</TableHead>
                  <TableHead className="w-[130px]">Ngày gửi</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[130px]">Xác nhận tenant</TableHead>
                  <TableHead className="text-right w-[200px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <ClickableUserAvatar
                          userId={request.tenant?.id || ''}
                          avatarUrl={request.tenant?.avatarUrl}
                          userName={`${request.tenant?.firstName || ''} ${request.tenant?.lastName || ''}`}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {request.tenant?.firstName} {request.tenant?.lastName}
                          </p>
                          {request.messageToOwner && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center text-xs text-gray-500 mt-1 cursor-help">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  <span className="truncate">Có tin nhắn</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs whitespace-pre-wrap">{request.messageToOwner}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {request.tenant?.phone && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
                            <span className="truncate">{request.tenant.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center text-xs text-gray-600">
                          <Mail className="h-3 w-3 mr-1.5 text-gray-400" />
                          <span className="truncate">{request.tenant?.email || '-'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate">
                        {request.room?.name ? `Phòng ${request.room.name}` : request.room?.building?.name || '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3 w-3 mr-1.5 text-gray-400" />
                        <span>{format(new Date(request.moveInDate), 'dd/MM/yyyy', { locale: vi })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1.5 text-gray-400" />
                        <span>{format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[request.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'approved' ? (
                        <div>
                          <Badge className={CONFIRMED_COLORS[String(request.isConfirmedByTenant) as keyof typeof CONFIRMED_COLORS]}>
                            {CONFIRMED_LABELS[String(request.isConfirmedByTenant) as keyof typeof CONFIRMED_LABELS]}
                          </Badge>
                          {request.isConfirmedByTenant && request.confirmedAt && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-gray-500 mt-1 cursor-help truncate">
                                  {format(new Date(request.confirmedAt), 'dd/MM HH:mm', { locale: vi })}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Xác nhận lúc: {format(new Date(request.confirmedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8 px-3"
                            onClick={() => handleApprove(request.id)}
                            disabled={submitting}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Chấp nhận
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50 h-8 px-3"
                            onClick={() => handleReject(request.id)}
                            disabled={submitting}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                      {request.status === 'approved' && !request.isConfirmedByTenant && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex items-center text-xs text-yellow-600 cursor-help">
                              <Clock className="h-4 w-4 mr-1" />
                              Chờ xác nhận
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Đã gửi yêu cầu đến tenant. Khi tenant xác nhận, hợp đồng thuê sẽ được tạo tự động.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {request.status === 'approved' && request.isConfirmedByTenant && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex items-center text-xs text-green-600 cursor-help">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Hoàn tất
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Tenant đã xác nhận. Hợp đồng thuê đã được tạo tự động!</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {request.status === 'rejected' && (
                        <span className="text-xs text-red-600">Đã từ chối</span>
                      )}
                      {request.status === 'cancelled' && (
                        <span className="text-xs text-gray-600">Đã hủy</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
