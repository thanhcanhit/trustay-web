"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, XCircle, Clock, CheckCircle2, Home, Calendar, Square } from "lucide-react"
import { ProfileLayout } from "@/components/profile/profile-layout"
import { useBookingRequestStore } from "@/stores/bookingRequestStore"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' | 'cancelled' }) {
  const map = {
    pending: { label: 'Đang chờ', className: 'bg-amber-100 text-amber-800' },
    approved: { label: 'Đã duyệt', className: 'bg-emerald-100 text-emerald-800' },
    rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-800' },
  } as const
  const it = map[status]
  return <Badge className={it.className}>{it.label}</Badge>
}

function RequestsContent() {
  const { mine, mineMeta, loadingMine, errorMine, loadMine, cancelMine, submitting } = useBookingRequestStore()
  const [status, setStatus] = useState<string>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadMine({ page, limit: 10, status: status === 'all' ? undefined : status })
  }, [loadMine, page, status])

  const canPrev = useMemo(() => mineMeta?.hasPrev, [mineMeta])
  const canNext = useMemo(() => mineMeta?.hasNext, [mineMeta])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Yêu cầu thuê của tôi</span>
        </CardTitle>
        <CardDescription>Quản lý các yêu cầu thuê trọ đã gửi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadMine({ page, limit: 10, status: status === 'all' ? undefined : status })}>
              Làm mới
            </Button>
          </div>
        </div>

        {errorMine && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-3 text-sm">{errorMine}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingMine && Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx}><CardContent className="p-6 text-gray-500">Đang tải...</CardContent></Card>
          ))}

          {!loadingMine && mine.map((req) => (
            <Card key={req.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Home className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {req.room?.name}
                      </CardTitle>
                      <p className="text-xs text-gray-500">{req.room?.building?.name}</p>
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                  <Send className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Square className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Diện tích: {req.room?.areaSqm}m² • Tối đa {req.room?.maxOccupancy} người
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Ngày vào: {format(new Date(req.moveInDate), 'dd/MM/yyyy', { locale: vi })}</span>
                  </div>

                  {req.moveOutDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Ngày rời: {format(new Date(req.moveOutDate), 'dd/MM/yyyy', { locale: vi })}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Gửi lúc: {format(new Date(req.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                  </div>

                  {req.messageToOwner && (
                    <div className="text-sm">
                      <p className="text-gray-600 font-medium mb-1">Tin nhắn gửi chủ nhà:</p>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                        {req.messageToOwner}
                      </p>
                    </div>
                  )}

                  {req.ownerNotes && (
                    <div className="text-sm">
                      <p className="text-gray-600 font-medium mb-1">Ghi chú từ chủ nhà:</p>
                      <p className="text-gray-700 bg-blue-50 p-2 rounded text-xs whitespace-pre-wrap">
                        {req.ownerNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {req.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => cancelMine(req.id, { cancellationReason: 'Người thuê huỷ' })}
                      disabled={submitting}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Hủy yêu cầu
                    </Button>
                  )}
                  {req.status === 'approved' && (
                    <div className="text-center">
                      <div className="inline-flex items-center text-emerald-700 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Đã được duyệt
                      </div>
                    </div>
                  )}
                  {req.status === 'rejected' && (
                    <div className="text-center">
                      <div className="inline-flex items-center text-red-600 text-sm font-medium">
                        <XCircle className="h-4 w-4 mr-1" /> Đã bị từ chối
                      </div>
                    </div>
                  )}
                  {req.status === 'cancelled' && (
                    <div className="text-center">
                      <div className="inline-flex items-center text-gray-600 text-sm font-medium">
                        <Clock className="h-4 w-4 mr-1" /> Đã hủy
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loadingMine && mine.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Chưa có yêu cầu thuê nào</div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Trang {mineMeta?.page || 1}/{mineMeta?.totalPages || 1}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>Trước</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!canNext}>Sau</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RequestsPageContent() {
  return (
    <ProfileLayout>
      <div className="px-6">
        <div className="space-y-6">
          <RequestsContent />
        </div>
      </div>
    </ProfileLayout>
  )
}

export default function RequestsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <RequestsPageContent />
    </Suspense>
  )
}