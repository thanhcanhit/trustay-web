"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MessageSquare } from "lucide-react"
import { useRoommateApplicationsStore } from "@/stores/roommate-applications.store"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved_by_tenant: 'bg-blue-100 text-blue-800',
  rejected_by_tenant: 'bg-red-100 text-red-800',
  approved_by_landlord: 'bg-green-100 text-green-800',
  rejected_by_landlord: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  expired: 'bg-gray-100 text-gray-800'
} as const

const STATUS_LABELS = {
  pending: 'Chờ phản hồi',
  approved_by_tenant: 'Tenant đã chấp nhận',
  rejected_by_tenant: 'Tenant đã từ chối',
  approved_by_landlord: 'Chủ trọ đã chấp nhận',
  rejected_by_landlord: 'Chủ trọ đã từ chối',
  cancelled: 'Đã hủy',
  expired: 'Đã hết hạn'
} as const

export default function SentRoommateApplicationsPage() {
  const { myApplications, pagination, isLoading, error, fetchMyApplications, cancelApplication } = useRoommateApplicationsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchMyApplications({ 
      page, 
      limit: 12, 
      status: statusFilter === 'all' ? undefined : (statusFilter as 'pending' | 'approved_by_tenant' | 'rejected_by_tenant' | 'approved_by_landlord' | 'rejected_by_landlord' | 'cancelled' | 'expired')
    })
  }, [fetchMyApplications, page, statusFilter])

  const canPrev = useMemo(() => pagination && pagination.page > 1, [pagination])
  const canNext = useMemo(() => pagination && pagination.page < pagination.totalPages, [pagination])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return myApplications
    return myApplications.filter(app => {
      const postTitle = app.roommateSeekingPostId?.toLowerCase() || ''
      return postTitle.includes(term) || app.fullName.toLowerCase().includes(term)
    })
  }, [myApplications, searchTerm])

  const handleCancel = async (id: string) => {
    const success = await cancelApplication(id)
    if (success) {
      toast.success('Đã hủy đơn ứng tuyển')
      fetchMyApplications({ 
        page, 
        limit: 12, 
        status: statusFilter === 'all' ? undefined : (statusFilter as 'pending' | 'approved_by_tenant' | 'rejected_by_tenant' | 'approved_by_landlord' | 'rejected_by_landlord' | 'cancelled' | 'expired')
      })
    } else {
      toast.error('Không thể hủy đơn ứng tuyển')
    }
  }

  return (
    <DashboardLayout userType="tenant">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đơn ứng tuyển đã gửi</h1>
          <p className="text-gray-600">Quản lý các đơn ứng tuyển tìm bạn cùng phòng bạn đã gửi</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, bài đăng"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ phản hồi</SelectItem>
              <SelectItem value="approved_by_tenant">Tenant đã chấp nhận</SelectItem>
              <SelectItem value="rejected_by_tenant">Tenant đã từ chối</SelectItem>
              <SelectItem value="approved_by_landlord">Chủ trọ đã chấp nhận</SelectItem>
              <SelectItem value="rejected_by_landlord">Chủ trọ đã từ chối</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
              <SelectItem value="expired">Đã hết hạn</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => fetchMyApplications({ 
              page, 
              limit: 12, 
              status: statusFilter === 'all' ? undefined : (statusFilter as 'pending' | 'approved_by_tenant' | 'rejected_by_tenant' | 'approved_by_landlord' | 'rejected_by_landlord' | 'cancelled' | 'expired')
            })}
          >
            Làm mới
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-4 text-sm">{error}</div>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Bài đăng</TableHead>
                  <TableHead className="w-[150px]">Thông tin ứng viên</TableHead>
                  <TableHead className="w-[120px]">Ngày chuyển vào</TableHead>
                  <TableHead className="w-[100px]">Thời gian ở</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[120px]">Ngày gửi</TableHead>
                  <TableHead className="w-[300px]">Lời nhắn</TableHead>
                  <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow key="loading">
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow key="empty">
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      Chưa gửi đơn ứng tuyển nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((application) => (
                  <TableRow key={application.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-900 truncate">
                        {application.roommateSeekingPostId}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium text-gray-900">{application.fullName}</div>
                        <div className="text-gray-500">{application.occupation}</div>
                        <div className="text-gray-500 text-xs">{application.phoneNumber}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {application.moveInDate ? format(new Date(application.moveInDate), 'dd/MM/yyyy', { locale: vi }) : '-'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {application.intendedStayMonths} tháng
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={STATUS_COLORS[application.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[application.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                      {application.isUrgent && (
                        <Badge variant="destructive" className="ml-1">Gấp</Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {application.createdAt ? (
                        <>
                          <div className="text-sm text-gray-500">
                            {format(new Date(application.createdAt), 'dd/MM/yyyy', { locale: vi })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(application.createdAt), 'HH:mm', { locale: vi })}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </TableCell>

                    <TableCell>
                      {application.applicationMessage && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center text-xs text-blue-600 cursor-help">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-[250px]">{application.applicationMessage}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm whitespace-pre-wrap">{application.applicationMessage}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {application.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleCancel(application.id)}
                        >
                          Hủy
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Trang {pagination?.page || 1}/{pagination?.totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={!canPrev}
            >
              Trước
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage((p) => p + 1)} 
              disabled={!canNext}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
