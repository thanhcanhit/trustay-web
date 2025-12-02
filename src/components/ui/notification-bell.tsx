"use client"

import { Bell, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { useNotifications } from "@/hooks/useNotifications"
import { useUserStore } from "@/stores/userStore"
import { useState } from "react"
import { NotificationData } from "@/actions/notification.action"
import { NotificationItem } from "@/stores/notification.store"

export function NotificationBell() {
  const {
    notifications,
    unread,
    isLoading,
    error,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    refresh
  } = useNotifications()

  const { user } = useUserStore()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId)
  }

  const handleRefresh = async () => {
    await refresh()
  }

  const formatNotificationTime = (timestamp: number) => {
    return formatDistanceToNow(timestamp, {
      addSuffix: true,
      locale: vi
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
      case 'booking_request':
        return "📋"
      case 'BOOKING_APPROVED':
        return "✅"
      case 'BOOKING_REJECTED':
        return "❌"
      case 'ROOM_INVITATION':
        return "🏠"
      case 'INVITATION_REJECTED':
        return "❌"
      case 'rental_request':
        return "🏠"
      case 'monthly_bill_created':
      case 'bill_created':
      case 'bill_reminder':
        return "🧾"
      case 'PAYMENT_RECEIVED':
      case 'payment_reminder':
        return "💰"
      case 'PAYMENT_FAILED':
        return "💸"
      case 'contract_update':
        return "📄"
      case 'message':
        return "💬"
      case 'room_issue_reported':
      case 'room_issue_resolved':
      case 'room_issue_updated':
      case 'room_issue_status_changed':
      case 'room_issue_status_updated':
        return "🔧"
      case 'WELCOME':
        return "👋"
      case 'PROFILE_UPDATED':
        return "👤"
      case 'SYSTEM_ANNOUNCEMENT':
        return "📢"
      default:
        return "🔔"
    }
  }

  const getNotificationTitle = (notification: NotificationData | NotificationItem) => {
    // Use the title from the notification if available
    if (notification.title) {
      return notification.title;
    }

    // Fallback to type-based titles
    switch (notification.type) {
      case 'BOOKING_REQUEST':
      case 'booking_request':
        return 'Yêu cầu đặt phòng mới'
      case 'BOOKING_APPROVED':
        return 'Yêu cầu đặt phòng được chấp nhận'
      case 'BOOKING_REJECTED':
        return 'Yêu cầu đặt phòng bị từ chối'
      case 'ROOM_INVITATION':
        return 'Lời mời thuê phòng'
      case 'INVITATION_REJECTED':
        return 'Lời mời bị từ chối'
      case 'rental_request':
        return 'Yêu cầu thuê phòng mới'
      case 'PAYMENT_RECEIVED':
        return 'Đã nhận thanh toán'
      case 'payment_reminder':
        return 'Nhắc nhở thanh toán'
      case 'PAYMENT_FAILED':
        return 'Thanh toán thất bại'
      case 'contract_update':
        return 'Cập nhật hợp đồng'
      case 'message':
        return 'Tin nhắn mới'
      case 'room_issue_reported':
        return 'Sự cố phòng được báo cáo'
      case 'room_issue_resolved':
        return 'Sự cố phòng đã được xử lý'
      case 'room_issue_updated':
      case 'room_issue_status_changed':
      case 'room_issue_status_updated':
        return 'Cập nhật trạng thái sự cố'
      case 'WELCOME':
        return 'Chào mừng đến với Trustay'
      case 'PROFILE_UPDATED':
        return 'Hồ sơ đã được cập nhật'
      case 'SYSTEM_ANNOUNCEMENT':
        return 'Thông báo hệ thống'
      default:
        return (typeof notification.data === 'object' && notification.data && 'title' in notification.data && typeof notification.data.title === 'string' ? notification.data.title : null) || 'Thông báo mới'
    }
  }

  const handleNotificationClick = async (notification: NotificationData | NotificationItem) => {
    console.log('🔔 Notification clicked:', notification)
    console.log('📋 Notification type:', notification.type)
    console.log('📦 Notification data:', notification.data)
    
    // Mark as read if not already
    if (!notification.isRead && notification.id) {
      await handleMarkAsRead(notification.id)
    }

    // Close the dropdown
    setIsOpen(false)

    // Navigate based on notification type and data
    const notificationData = notification.data as Record<string, unknown> | undefined
    console.log('🔍 Parsed notification data:', notificationData)

    // Determine navigation path
    let targetPath: string | null = null

    // Handle room issue notifications
    if (notification.type === 'room_issue_reported') {
      console.log('🔧 Handling room issue reported notification (landlord)')
      targetPath = '/dashboard/landlord/feedback'
    }
    // Handle room issue resolved/updated notifications (tenant)
    else if (notification.type === 'room_issue_resolved' || 
             notification.type === 'room_issue_updated' ||
             notification.type === 'room_issue_status_changed' ||
             notification.type === 'room_issue_status_updated') {
      console.log('🔧 Handling room issue status notification (tenant)')
      targetPath = '/dashboard/tenant/room-issues'
    }
    // Handle rental created notifications
    else if (notification.type === 'rental_created') {
      console.log('📝 Handling rental created notification')
      const isLandlord = user?.role === 'landlord'
      if (notificationData?.rentalId && typeof notificationData.rentalId === 'string') {
        targetPath = isLandlord 
          ? `/dashboard/landlord/rentals/${notificationData.rentalId}`
          : `/dashboard/tenant/rentals/${notificationData.rentalId}`
      } else {
        targetPath = isLandlord ? '/dashboard/landlord/rentals' : '/dashboard/tenant/rentals'
      }
    }
    // Handle booking request confirmed (landlord)
    else if (notification.type === 'booking_request_confirmed') {
      console.log('✅ Handling booking confirmed notification')
      if (notificationData?.rentalId && typeof notificationData.rentalId === 'string') {
        targetPath = `/dashboard/landlord/rentals/${notificationData.rentalId}`
      } else if (notificationData?.bookingId && typeof notificationData.bookingId === 'string') {
        targetPath = '/dashboard/landlord/requests'
      } else {
        targetPath = '/dashboard/landlord/rentals'
      }
    }
    // Handle booking-related notifications
    else if (notificationData?.bookingId && typeof notificationData.bookingId === 'string') {
      console.log('📋 Handling booking notification, bookingId:', notificationData.bookingId)
      const isLandlord = notification.type === 'booking_request' || 
                         notification.type === 'BOOKING_REQUEST' ||
                         notification.type === 'booking_request_received'
      
      targetPath = isLandlord ? '/dashboard/landlord/requests' : '/dashboard/tenant/requests'
    }
    // Handle invitation-related notifications
    else if (notification.type === 'ROOM_INVITATION' || 
             notification.type === 'room_invitation' ||
             notification.type === 'room_invitation_received') {
      console.log('📨 Handling invitation notification')
      targetPath = '/dashboard/tenant/roommate-invitation'
    }
    // Handle invitation acceptance/rejection (landlord)
    else if (notification.type === 'room_invitation_accepted' || 
             notification.type === 'room_invitation_rejected' ||
             notification.type === 'INVITATION_REJECTED') {
      console.log('📨 Handling invitation response notification')
      targetPath = '/dashboard/landlord/tenants'
    }
    // Handle bill-related notifications
    else if (notification.type === 'monthly_bill_created' || 
             notification.type === 'bill_created' ||
             notification.type === 'bill_reminder') {
      console.log('💵 Handling bill notification')
      targetPath = notificationData?.billId && typeof notificationData.billId === 'string'
        ? `/dashboard/tenant/invoices/${notificationData.billId}`
        : '/dashboard/tenant/invoices'
    }
    // Handle payment-related notifications
    else if (notification.type === 'payment_reminder' || 
             notification.type === 'PAYMENT_RECEIVED' ||
             notification.type === 'PAYMENT_FAILED') {
      targetPath = notificationData?.rentalId && typeof notificationData.rentalId === 'string'
        ? `/dashboard/tenant/rentals/${notificationData.rentalId}`
        : '/dashboard/tenant/rentals'
    }
    // Handle contract-related notifications
    else if (notification.type === 'contract_update') {
      targetPath = notificationData?.contractId && typeof notificationData.contractId === 'string'
        ? `/dashboard/tenant/contracts/${notificationData.contractId}`
        : '/dashboard/tenant/contracts'
    }
    // Handle message notifications
    else if (notification.type === 'message') {
      targetPath = notificationData?.conversationId && typeof notificationData.conversationId === 'string'
        ? `/messages?conversation=${notificationData.conversationId}`
        : '/messages'
    }
    // Handle room-related notifications
    else if (notificationData?.roomId && typeof notificationData.roomId === 'string') {
      targetPath = `/rooms/${notificationData.roomId}`
    }
    
    // Navigate if path exists
    if (targetPath) {
      console.log('➡️ Navigating to:', targetPath)
      router.push(targetPath)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-10 w-10 rounded-full hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-red-500 text-white border-2 border-white"
            >
              {unread > 99 ? '99+' : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 z-[10000]" align="end">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="p-0">Thông báo</DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-xs h-6 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {unread > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-6 px-2"
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {error && (
          <div className="p-3 text-center text-red-500 text-sm">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="block mx-auto mt-2 text-xs"
            >
              Thử lại
            </Button>
          </div>
        )}

        {isLoading && notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
            Đang tải...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Không có thông báo nào
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem 
                key={notification.id || notification.receivedAt} 
                className="p-0"
                asChild
              >
                <div 
                  className={`flex items-start gap-3 p-3 w-full hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="text-lg flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 mb-1`}>
                      {getNotificationTitle(notification)}
                    </div>
                    {(notification.message || (typeof notification.data === 'object' && notification.data && 'message' in notification.data && typeof notification.data.message === 'string' ? notification.data.message : null)) && (
                      <div className="text-xs text-gray-600 mb-1 line-clamp-2">
                        {notification.message || (typeof notification.data === 'object' && notification.data && 'message' in notification.data && typeof notification.data.message === 'string' ? notification.data.message : '')}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {formatNotificationTime(notification.receivedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Only show action buttons if notification belongs to current user */}
                    {notification.userId === user?.id && (
                      <>
                        {!notification.isRead && notification.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id!)
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-green-600"
                            title="Đánh dấu đã đọc"
                          >
                            ✓
                          </Button>
                        )}
                        {notification.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNotification(notification.id!)
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                            title="Xóa thông báo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}

            {notifications.length > 10 && (
              <DropdownMenuItem className="p-0">
                <div className="p-3 text-center text-sm text-gray-500 w-full">
                  Và {notifications.length - 10} thông báo khác...
                </div>
              </DropdownMenuItem>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}