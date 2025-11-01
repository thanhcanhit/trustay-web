"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MessageSquare, Check, X } from "lucide-react"
import { useRoommateApplicationsStore } from "@/stores/roommate-applications.store"
import { useChatStore } from "@/stores/chat.store"
import { useUserStore } from "@/stores/userStore"
import { MESSAGE_TYPES } from "@/constants/chat.constants"
import { encodeStructuredMessage } from "@/lib/chat-message-encoder"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

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
  pending: 'Chờ tenant phản hồi',
  approved_by_tenant: 'Tenant đã chấp nhận',
  rejected_by_tenant: 'Tenant đã từ chối',
  approved_by_landlord: 'Bạn đã chấp nhận',
  rejected_by_landlord: 'Bạn đã từ chối',
  cancelled: 'Đã hủy',
  expired: 'Đã hết hạn'
} as const

export default function RoommateApplicationsPage() {
  const { applicationsForMyPosts, pagination, isLoading, error, fetchApplicationsForMyPosts, respondToApplication, confirmApplication } = useRoommateApplicationsStore()
  const { sendMessage: sendChatMessage, setCurrentUserId } = useChatStore()
  const { user } = useUserStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [respondDialog, setRespondDialog] = useState<{ open: boolean; applicationId: string | null; approve: boolean }>({
    open: false,
    applicationId: null,
    approve: false
  })
  const [responseMessage, setResponseMessage] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; applicationId: string | null }>({
    open: false,
    applicationId: null
  })

  // Set current user ID for chat
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id)
    }
  }, [user?.id, setCurrentUserId])

  useEffect(() => {
    fetchApplicationsForMyPosts({ page, limit: 12 })
  }, [fetchApplicationsForMyPosts, page])

  const canPrev = useMemo(() => pagination && pagination.page > 1, [pagination])
  const canNext = useMemo(() => pagination && pagination.page < pagination.totalPages, [pagination])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    // Landlord chỉ quan tâm đến Platform Room (có roomInstanceId)
    const platformRoomApps = applicationsForMyPosts.filter(app =>
      app.roommateSeekingPost?.roomInstanceId != null
    )

    if (!term) return platformRoomApps
    return platformRoomApps.filter(app => {
      return app.fullName.toLowerCase().includes(term) ||
             app.phoneNumber.toLowerCase().includes(term) ||
             app.occupation.toLowerCase().includes(term)
    })
  }, [applicationsForMyPosts, searchTerm])

  const handleRespond = async () => {
    if (!respondDialog.applicationId) return

    // Find the application to get applicant info
    const application = applicationsForMyPosts.find(app => app.id === respondDialog.applicationId)

    const success = await respondToApplication(respondDialog.applicationId, {
      status: respondDialog.approve ? 'approved_by_landlord' : 'rejected_by_landlord'
    })

    if (success) {
      // Send notification message to applicant
      if (application?.applicantId) {
        try {
          console.log('🚀 Sending roommate application response notification')

          // Encode structured message with minimal info
          const defaultMessage = respondDialog.approve
            ? 'Đơn ứng tuyển của bạn đã được chấp nhận!'
            : 'Rất tiếc, đơn ứng tuyển của bạn không được chấp nhận.'

          const encodedContent = encodeStructuredMessage({
            type: respondDialog.approve ? 'roommate_application_approved' : 'roommate_application_rejected',
            roommateSeeking: {
              roommateSeekingPostId: application.roommateSeekingPostId,
              roommateSeekingPostTitle: '', // We don't have this in the application object
              roommateSeekingPostBudget: undefined,
              roommateSeekingPostLocation: undefined
            },
            message: responseMessage || defaultMessage
          })

          await sendChatMessage({
            recipientId: application.applicantId,
            content: encodedContent,
            type: MESSAGE_TYPES.TEXT
          })
          console.log('✅ Response notification sent successfully')
        } catch (error) {
          console.error('❌ Failed to send response notification:', error)
          // Don't fail the whole operation if message sending fails
        }
      }

      toast.success(respondDialog.approve ? 'Đã chấp nhận đơn ứng tuyển' : 'Đã từ chối đơn ứng tuyển')
      setRespondDialog({ open: false, applicationId: null, approve: false })
      setResponseMessage('')
      fetchApplicationsForMyPosts({ page, limit: 12 })
    } else {
      toast.error('Không thể phản hồi đơn ứng tuyển')
    }
  }

  const openRespondDialog = (applicationId: string, approve: boolean) => {
    setRespondDialog({ open: true, applicationId, approve })
    setResponseMessage('')
  }

  const handleConfirm = async () => {
    if (!confirmDialog.applicationId) return

    const application = applicationsForMyPosts.find(app => app.id === confirmDialog.applicationId)

    const success = await confirmApplication(confirmDialog.applicationId)

    if (success) {
      toast.success('Đã xác nhận đơn ứng tuyển. Hợp đồng sẽ được tạo tự động.')
      setConfirmDialog({ open: false, applicationId: null })

      // Send notification to applicant and tenant
      if (application?.applicantId) {
        try {
          const encodedContent = encodeStructuredMessage({
            type: 'roommate_application_approved',
            roommateSeeking: {
              roommateSeekingPostId: application.roommateSeekingPostId,
              roommateSeekingPostTitle: '',
              roommateSeekingPostBudget: undefined,
              roommateSeekingPostLocation: undefined
            },
            message: 'Chủ trọ đã xác nhận đơn ứng tuyển. Hợp đồng đã được tạo!'
          })

          await sendChatMessage({
            recipientId: application.applicantId,
            content: encodedContent,
            type: MESSAGE_TYPES.TEXT
          })
        } catch (error) {
          console.error('Failed to send confirmation notification:', error)
        }
      }

      fetchApplicationsForMyPosts({ page, limit: 12 })
    } else {
      toast.error('Không thể xác nhận đơn ứng tuyển')
    }
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu ở ghép</h1>
          <p className="text-gray-600">
            Quản lý các đơn ứng tuyển tìm bạn cùng phòng cho các phòng được quản lý trên nền tảng
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại, nghề nghiệp"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => fetchApplicationsForMyPosts({ page, limit: 12 })}
          >
            Làm mới
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-4 text-sm">{error}</div>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">Đang tải...</CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare />
              </EmptyMedia>
              <EmptyTitle>
                {searchTerm ? 'Không tìm thấy đơn ứng tuyển' : 'Chưa có đơn ứng tuyển'}
              </EmptyTitle>
              <EmptyDescription>
                {searchTerm
                  ? 'Không có đơn ứng tuyển nào phù hợp với tìm kiếm.'
                  : 'Bạn chưa nhận được đơn ứng tuyển nào cho các bài đăng tìm bạn cùng phòng.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Ứng viên</TableHead>
                    <TableHead className="w-[150px]">Liên hệ</TableHead>
                    <TableHead className="w-[120px]">Nghề nghiệp</TableHead>
                    <TableHead className="w-[120px]">Ngày chuyển vào</TableHead>
                    <TableHead className="w-[100px]">Thời gian ở</TableHead>
                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                    <TableHead className="w-[120px]">Ngày gửi</TableHead>
                    <TableHead className="w-[250px]">Lời nhắn</TableHead>
                    <TableHead className="w-[150px] text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((application) => (
                  <TableRow key={application.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{application.fullName}</div>
                        {application.isUrgent && (
                          <Badge variant="destructive" className="text-xs">Cần gấp</Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-600">{application.phoneNumber}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-600">{application.occupation}</div>
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
                                <span className="truncate max-w-[200px]">{application.applicationMessage}</span>
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
                      {application.status === 'approved_by_tenant' && (
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => openRespondDialog(application.id, true)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Chấp nhận
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => openRespondDialog(application.id, false)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                      {application.status === 'approved_by_landlord' && application.isConfirmedByTenant && !application.isConfirmedByLandlord && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setConfirmDialog({ open: true, applicationId: application.id })}
                        >
                          Xác nhận
                        </Button>
                      )}
                      {application.isConfirmedByLandlord && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Đã xác nhận
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

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

      {/* Respond Dialog */}
      <Dialog open={respondDialog.open} onOpenChange={(open) => setRespondDialog({ ...respondDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {respondDialog.approve ? 'Chấp nhận đơn ứng tuyển' : 'Từ chối đơn ứng tuyển'}
            </DialogTitle>
            <DialogDescription>
              {respondDialog.approve
                ? 'Bạn có chắc chắn muốn chấp nhận đơn ứng tuyển này không?'
                : 'Bạn có chắc chắn muốn từ chối đơn ứng tuyển này không?'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tin nhắn phản hồi (tùy chọn)
              </label>
              <Textarea
                placeholder="Nhập tin nhắn của bạn..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRespondDialog({ open: false, applicationId: null, approve: false })}
            >
              Hủy
            </Button>
            <Button
              variant={respondDialog.approve ? "default" : "destructive"}
              onClick={handleRespond}
            >
              {respondDialog.approve ? 'Chấp nhận' : 'Từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đơn ứng tuyển</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xác nhận đơn ứng tuyển này?
              Sau khi xác nhận, hợp đồng thuê (Rental) sẽ được tạo tự động trong hệ thống.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, applicationId: null })}
            >
              Hủy
            </Button>
            <Button
              variant="default"
              onClick={handleConfirm}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
