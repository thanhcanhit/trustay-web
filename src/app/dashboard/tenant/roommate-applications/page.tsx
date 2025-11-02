"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Check, X, Calendar, Clock, User, Briefcase, Phone } from "lucide-react"
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
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  awaiting_confirmation: 'bg-blue-100 text-blue-800',
  approved_by_tenant: 'bg-blue-100 text-blue-800',
  rejected_by_tenant: 'bg-red-100 text-red-800',
  approved_by_landlord: 'bg-green-100 text-green-800',
  rejected_by_landlord: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  expired: 'bg-gray-100 text-gray-800'
} as const

const STATUS_LABELS = {
  pending: 'Chờ phản hồi',
  accepted: 'Đã chấp nhận',
  rejected: 'Đã từ chối',
  awaiting_confirmation: 'Chờ xác nhận',
  approved_by_tenant: 'Đã chấp nhận',
  rejected_by_tenant: 'Đã từ chối',
  approved_by_landlord: 'Chủ trọ đã chấp nhận',
  rejected_by_landlord: 'Chủ trọ đã từ chối',
  cancelled: 'Đã hủy',
  expired: 'Đã hết hạn'
} as const

const STATUS_LABELS_SENT = {
  pending: 'Chờ phản hồi',
  accepted: 'Đã chấp nhận',
  rejected: 'Đã từ chối',
  awaiting_confirmation: 'Chờ xác nhận',
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
    cancelApplication,
    confirmApplication
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
             (app.phoneNumber && app.phoneNumber.toLowerCase().includes(term)) ||
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

    const defaultMessage = respondDialog.approve
      ? 'Đơn ứng tuyển của bạn đã được chấp nhận!'
      : 'Rất tiếc, đơn ứng tuyển của bạn không được chấp nhận.'

    const success = await respondToApplication(respondDialog.applicationId, {
      status: respondDialog.approve ? 'accepted' : 'rejected',
      response: responseMessage || defaultMessage
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

  const handleConfirmApplication = async (id: string) => {
    try {
      const success = await confirmApplication(id)
      if (success) {
        toast.success('Đã xác nhận đơn ứng tuyển thành công!')
        // Refresh list
        fetchMyApplications({
          page: sentPage,
          limit: 12,
        })
      } else {
        toast.error(error || 'Không thể xác nhận đơn ứng tuyển')
      }
    } catch (error) {
      console.error('Confirm application error:', error)
      toast.error('Có lỗi xảy ra khi xác nhận đơn ứng tuyển')
    }
  }

  return (
    <DashboardLayout userType="tenant">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu ở ghép</h1>
          <p className="text-gray-600">Quản lý các đơn ứng tuyển tìm bạn cùng phòng</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Đã nhận ({filteredReceived.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Đã gửi ({filteredSent.length})
            </TabsTrigger>
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

            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                Đang tải...
              </div>
            ) : filteredReceived.length === 0 ? (
              <div className="text-center py-12">
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Chưa có đơn ứng tuyển nào</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredReceived.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header: Name and Status */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{application.fullName}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={STATUS_COLORS[application.status as keyof typeof STATUS_COLORS]}>
                                {STATUS_LABELS[application.status as keyof typeof STATUS_LABELS]}
                              </Badge>
                              {application.isUrgent && (
                                <Badge variant="destructive" className="text-xs">Cần gấp</Badge>
                              )}
                              {application.roommateSeekingPost?.roomInstanceId != null ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                  Trên nền tảng
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                                  Ngoài hệ thống
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contact and Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{application.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Briefcase className="h-4 w-4 flex-shrink-0" />
                            <span>{application.occupation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {application.moveInDate ? format(new Date(application.moveInDate), 'dd/MM/yyyy', { locale: vi }) : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{application.intendedStayMonths} tháng</span>
                          </div>
                        </div>

                        {/* Submission Date */}
                        <div className="text-xs text-gray-500">
                          Gửi lúc: {application.createdAt ? (
                            <>
                              {format(new Date(application.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </>
                          ) : '-'}
                        </div>

                        {/* Message */}
                        {application.applicationMessage && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700 line-clamp-3">{application.applicationMessage}</p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          {application.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                                onClick={() => openRespondDialog(application.id, true)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Chấp nhận
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => openRespondDialog(application.id, false)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Từ chối
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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

            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                Đang tải...
              </div>
            ) : filteredSent.length === 0 ? (
              <div className="text-center py-12">
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Chưa gửi đơn ứng tuyển nào</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSent.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header: Post Title and Status */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                              {application.roommateSeekingPostId}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge className={STATUS_COLORS[application.status as keyof typeof STATUS_COLORS]}>
                                {STATUS_LABELS_SENT[application.status as keyof typeof STATUS_LABELS_SENT]}
                              </Badge>
                              {application.isUrgent && (
                                <Badge variant="destructive">Gấp</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Applicant Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="font-medium text-gray-900">{application.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 flex-shrink-0" />
                            <span>{application.occupation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{application.phoneNumber}</span>
                          </div>
                        </div>

                        {/* Dates Info */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Ngày chuyển vào</div>
                              <div>
                                {application.moveInDate ? format(new Date(application.moveInDate), 'dd/MM/yyyy', { locale: vi }) : '-'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Thời gian ở</div>
                              <div>{application.intendedStayMonths} tháng</div>
                            </div>
                          </div>
                        </div>

                        {/* Submission Date */}
                        <div className="text-xs text-gray-500">
                          Gửi lúc: {application.createdAt ? (
                            <>
                              {format(new Date(application.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </>
                          ) : '-'}
                        </div>

                        {/* Message */}
                        {application.applicationMessage && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700 line-clamp-3">{application.applicationMessage}</p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-2">
                          {application.status === 'awaiting_confirmation' && (
                            <>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                                <p className="text-sm font-medium text-green-800">
                                  ✅ Cả Tenant và Landlord đã chấp nhận đơn của bạn!
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                  Vui lòng xác nhận để hoàn tất quy trình và chính thức trở thành người thuê.
                                </p>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleConfirmApplication(application.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Xác nhận thuê phòng
                              </Button>
                            </>
                          )}
                          
                          {application.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleCancel(application.id)}
                            >
                              Hủy đơn
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
    </DashboardLayout>
  )
}
