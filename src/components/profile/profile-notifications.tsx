'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationItem } from '@/stores/notification.store'
import { Button } from '@/components/ui/button'
import { Bell, UserCog2, X, CalendarCheck2, UserCheck, Settings } from 'lucide-react'

export function ProfileNotifications() {
  const router = useRouter()
  const { notifications, error, loadNotifications, markAsRead, deleteNotification } = useNotifications()
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    console.log('All notifications in profile:', notifications)
    console.log('Available notification types:', notifications.map(n => n.type))

    // Temporarily show all notifications for debugging
    setFilteredNotifications(notifications)

    // Filter for tenant-specific notifications
    // const tenantNotifications = notifications.filter(
    //   (n: NotificationItem) =>
    //     n.type === 'booking_request_accepted' ||
    //     n.type === 'booking_request_rejected' ||
    //     n.type === 'room_invitation_received' ||
    //     n.type === 'profile_updated'
    // )
    // console.log('Filtered tenant notifications:', tenantNotifications)
    // setFilteredNotifications(tenantNotifications)
  }, [notifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request_accepted':
        return <CalendarCheck2 className="h-4 w-4 text-green-500" />
      case 'booking_request_rejected':
        return <X className="h-4 w-4 text-red-500" />
      case 'room_invitation_received':
        return <UserCheck className="h-4 w-4 text-blue-500" />
      case 'profile_updated':
        return <Settings className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'booking_request_accepted':
        return 'Yêu cầu đặt phòng được chấp nhận'
      case 'booking_request_rejected':
        return 'Yêu cầu đặt phòng bị từ chối'
      case 'booking_request_confirmed':
        return 'Yêu cầu booking được xác nhận'
      case 'room_invitation_received':
        return 'Lời mời phòng mới'
      case 'profile_updated':
        return 'Hồ sơ được cập nhật'
      case 'rental_created':
        return 'Hợp đồng thuê được tạo'
      case 'room_issue_resolved':
        return 'Sự cố phòng đã được xử lý'
      default:
        return 'Thông báo'
    }
  }

  const getNavigationPath = (notification: NotificationItem): string | null => {
    const data = notification.data as Record<string, unknown>
    
    switch (notification.type) {
      case 'booking_request_accepted':
      case 'booking_request_rejected':
        // Navigate to tenant's booking requests page
        if (data?.bookingId) {
          return `/dashboard/tenant/requests?highlight=${data.bookingId}`
        }
        return '/dashboard/tenant/requests'
        
      case 'booking_request_confirmed':
      case 'rental_created':
        // Navigate to tenant's rentals page
        if (data?.rentalId) {
          return `/dashboard/tenant/rentals/${data.rentalId}`
        }
        return '/dashboard/tenant/rentals'
        
      case 'room_invitation_received':
        // Navigate to roommate invitations page
        if (data?.invitationId) {
          return `/dashboard/tenant/roommate-invitation?highlight=${data.invitationId}`
        }
        return '/dashboard/tenant/roommate-invitation'
        
      case 'room_issue_resolved':
        // Navigate to rental detail where issues are displayed
        if (data?.rentalId) {
          return `/dashboard/tenant/rentals/${data.rentalId}`
        }
        return '/dashboard/tenant/rentals'
        
      case 'profile_updated':
        return '/profile'
        
      default:
        return null
    }
  }

  const handleNotificationClick = (notification: NotificationItem) => {
    const path = getNavigationPath(notification)
    
    // Mark as read when clicked
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    // Navigate to the appropriate page
    if (path) {
      router.push(path)
    }
  }

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-red-600">Lỗi khi tải thông báo: {error}</p>
      </Card>
    )
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground py-8">
            <Bell className="h-6 w-6" />
            <p>Không có thông báo mới</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <UserCog2 className="h-5 w-5" />
          Tất cả thông báo ({filteredNotifications.length})
        </h3>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`p-4 transition-colors hover:bg-accent cursor-pointer ${!notification.isRead ? 'border-blue-200 bg-blue-50/50' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {getNotificationTypeText(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${notification.isRead ? 'text-muted-foreground' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.receivedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notification.id)
                      }}
                      className="text-xs"
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}