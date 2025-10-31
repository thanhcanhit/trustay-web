"use client"

import { useEffect, useMemo, useState } from "react"
import { ProfileLayout } from "@/components/profile/profile-layout"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  approved_by_tenant: 'Bạn đã chấp nhận',
  rejected_by_tenant: 'Bạn đã từ chối',
  approved_by_landlord: 'Chủ trọ đã chấp nhận',
  rejected_by_landlord: 'Chủ trọ đã từ chối',
  cancelled: 'Đã hủy',
  expired: 'Đã hết hạn'
} as const

const STATUS_LABELS_SENT = {
  pending: 'Chờ phản hồi',
  approved_by_tenant: 'Tenant đã chấp nhận',
  rejected_by_tenant: 'Tenant đã từ chối',
  approved_by_landlord: 'Chủ trọ đã chấp nhận',
  rejected_by_landlord: 'Chủ trọ đã từ chối',
  cancelled: 'Đã hủy',
  expired: 'Đã hết hạn'
} as const

export default function RoommateApplicationsPage() {
  const {
    applicationsForMyPosts,
    myApplications,
    pagination,
    isLoading,
    error,
    fetchApplicationsForMyPosts,
    fetchMyApplications,
    respondToApplication,
    confirmApplication,
    cancelApplication
  } = useRoommateApplicationsStore()
  const { sendMessage: sendChatMessage, setCurrentUserId } = useChatStore()
  const { user } = useUserStore()

  // States for received tab
  const [receivedSearchTerm, setReceivedSearchTerm] = useState('')
  const [receivedPage, setReceivedPage] = useState(1)
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

  // States for sent tab
  const [sentSearchTerm, setSentSearchTerm] = useState('')
  const [sentPage, setSentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')

  // Active tab
  const [activeTab, setActiveTab] = useState('received')

  // Set current user ID for chat
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id)
    }
  }, [user?.id, setCurrentUserId])

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'received') {
      fetchApplicationsForMyPosts({ page: receivedPage, limit: 12 })
    } else {
      fetchMyApplications({
        page: sentPage,
        limit: 12,
        status: statusFilter === 'all' ? undefined : (statusFilter as 'pending' | 'approved_by_tenant' | 'rejected_by_tenant' | 'approved_by_landlord' | 'rejected_by_landlord' | 'cancelled' | 'expired')
      })
    }
  }, [activeTab, receivedPage, sentPage, statusFilter, fetchApplicationsForMyPosts, fetchMyApplications])

  const canPrevReceived = useMemo(() => pagination && pagination.page > 1, [pagination])
  const canNextReceived = useMemo(() => pagination && pagination.page < pagination.totalPages, [pagination])

  const canPrevSent = useMemo(() => pagination && pagination.page > 1, [pagination])
  const canNextSent = useMemo(() => pagination && pagination.page < pagination.totalPages, [pagination])

  const filteredReceived = useMemo(() => {
    const term = receivedSearchTerm.trim().toLowerCase()
    if (!term) return applicationsForMyPosts
    return applicationsForMyPosts.filter(app => {
      return app.fullName.toLowerCase().includes(term) ||
             app.phoneNumber.toLowerCase().includes(term) ||
             app.occupation.toLowerCase().includes(term)
    })
  }, [applicationsForMyPosts, receivedSearchTerm])

  const filteredSent = useMemo(() => {
    const term = sentSearchTerm.trim().toLowerCase()
    if (!term) return myApplications
    return myApplications.filter(app => {
      const postTitle = app.roommateSeekingPostId?.toLowerCase() || ''
      return postTitle.includes(term) || app.fullName.toLowerCase().includes(term)
    })
  }, [myApplications, sentSearchTerm])

  const handleRespond = async () => {
    if (!respondDialog.applicationId) return

    const application = applicationsForMyPosts.find(app => app.id === respondDialog.applicationId)

    const success = await respondToApplication(respondDialog.applicationId, {
      status: respondDialog.approve ? 'approved_by_tenant' : 'rejected_by_tenant'
    })

    if (success) {
      if (application?.applicantId) {
        try {
          console.log('🚀 Sending roommate application response notification')

          const defaultMessage = respondDialog.approve
            ? 'Đơn ứng tuyển của bạn đã được chấp nhận!'
            : 'Rất tiếc, đơn ứng tuyển của bạn không được chấp nhận.'

          const encodedContent = encodeStructuredMessage({
            type: respondDialog.approve ? 'roommate_application_approved' : 'roommate_application_rejected',
            roommateSeeking: {
              roommateSeekingPostId: application.roommateSeekingPostId,
              roommateSeekingPostTitle: '',
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
        }
      }

      toast.success(respondDialog.approve ? 'Đã chấp nhận đơn ứng tuyển' : 'Đã từ chối đơn ứng tuyển')
      setRespondDialog({ open: false, applicationId: null, approve: false })
      setResponseMessage('')
      fetchApplicationsForMyPosts({ page: receivedPage, limit: 12 })
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
      toast.success('Đã xác nhận đơn ứng tuyển')
      setConfirmDialog({ open: false, applicationId: null })

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
            message: 'Tenant đã xác nhận đơn ứng tuyển của bạn!'
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

      fetchApplicationsForMyPosts({ page: receivedPage, limit: 12 })
    } else {
      toast.error('Không thể xác nhận đơn ứng tuyển')
    }
  }

  const handleCancel = async (id: string) => {
    const success = await cancelApplication(id)
    if (success) {
      toast.success('Đã hủy đơn ứng tuyển')
      fetchMyApplications({
        page: sentPage,
        limit: 12,
        status: statusFilter === 'all' ? undefined : (statusFilter as 'pending' | 'approved_by_tenant' | 'rejected_by_tenant' | 'approved_by_landlord' | 'rejected_by_landlord' | 'cancelled' | 'expired')
      })
    } else {
      toast.error('Không thể hủy đơn ứng tuyển')
    }
  }

  return (
    <ProfileLayout>
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu ở ghép</h1>
          <p className="text-gray-600">Quản lý các đơn ứng tuyển tìm bạn cùng phòng</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="received">Đã nhận</TabsTrigger>
            <TabsTrigger value="sent">Đã gửi</TabsTrigger>
          </TabsList>

          {/* Received Applications Tab */}
          <TabsContent value="received">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, số điện thoại, nghề nghiệp"
                  value={receivedSearchTerm}
                  onChange={(event) => setReceivedSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => fetchApplicationsForMyPosts({ page: receivedPage, limit: 12 })}
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
                      <TableHead className="w-[180px]">Ứng viên</TableHead>
                      <TableHead className="w-[150px]">Liên hệ</TableHead>
                      <TableHead className="w-[120px]">Nghề nghiệp</TableHead>
                      <TableHead className="w-[100px]">Loại phòng</TableHead>
                      <TableHead className="w-[120px]">Ngày chuyển vào</TableHead>
                      <TableHead className="w-[100px]">Thời gian ở</TableHead>
                      <TableHead className="w-[120px]">Trạng thái</TableHead>
                      <TableHead className="w-[120px]">Ngày gửi</TableHead>
                      <TableHead className="w-[250px]">Lời nhắn</TableHead>
                      <TableHead className="w-[150px] text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow key="loading">
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : filteredReceived.length === 0 ? (
                      <TableRow key="empty">
                        <TableCell colSpan={10} className="text-center py-12 text-gray-500">
                          Chưa có đơn ứng tuyển nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReceived.map((application) => (
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
                          {application.roommateSeekingPost?.roomInstanceId != null ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                              Trên nền tảng
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                              Ngoài hệ thống
                            </Badge>
                          )}
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
                          {application.status === 'pending' && (
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
                          {application.roommateSeekingPost?.roomInstanceId == null &&
                           application.status === 'approved_by_tenant' &&
                           !application.isConfirmedByTenant && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setConfirmDialog({ open: true, applicationId: application.id })}
                            >
                              Xác nhận
                            </Button>
                          )}
                          {application.roommateSeekingPost?.roomInstanceId != null &&
                           application.status === 'approved_by_landlord' &&
                           !application.isConfirmedByTenant && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setConfirmDialog({ open: true, applicationId: application.id })}
                            >
                              Xác nhận
                            </Button>
                          )}
                          {application.isConfirmedByTenant && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {application.roommateSeekingPost?.roomInstanceId == null
                                ? 'Đã xác nhận'
                                : application.isConfirmedByLandlord
                                  ? 'Đã xác nhận - Rental đã tạo'
                                  : 'Đã xác nhận - Chờ landlord'}
                            </Badge>
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
                  onClick={() => setReceivedPage((p) => Math.max(1, p - 1))}
                  disabled={!canPrevReceived}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReceivedPage((p) => p + 1)}
                  disabled={!canNextReceived}
                >
                  Sau
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Sent Applications Tab */}
          <TabsContent value="sent">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, bài đăng"
                  value={sentSearchTerm}
                  onChange={(event) => setSentSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setSentPage(1) }}>
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
                  page: sentPage,
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
                    ) : filteredSent.length === 0 ? (
                      <TableRow key="empty">
                        <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                          Chưa gửi đơn ứng tuyển nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSent.map((application) => (
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
                            {STATUS_LABELS_SENT[application.status as keyof typeof STATUS_LABELS_SENT]}
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
                  onClick={() => setSentPage((p) => Math.max(1, p - 1))}
                  disabled={!canPrevSent}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSentPage((p) => p + 1)}
                  disabled={!canNextSent}
                >
                  Sau
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
              {(() => {
                const application = applicationsForMyPosts.find(app => app.id === confirmDialog.applicationId)
                const isExternalRoom = application?.roommateSeekingPost?.roomInstanceId == null

                if (isExternalRoom) {
                  return 'Bạn có chắc chắn muốn xác nhận đơn ứng tuyển này? Sau khi xác nhận, bạn có thể liên hệ trực tiếp với ứng viên để sắp xếp.'
                } else {
                  return 'Bạn có chắc chắn muốn xác nhận đơn ứng tuyển này? Sau khi xác nhận, chủ trọ sẽ cần xác nhận và hợp đồng sẽ được tạo tự động trong hệ thống.'
                }
              })()}
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
    </ProfileLayout>
  )
}
