'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationItem } from '@/stores/notification.store'
import { Button } from '@/components/ui/button'
import { Bell, CalendarCheck2, UserCheck, UserX, X } from 'lucide-react'

export function DashboardNotifications() {
  const router = useRouter()
  const { notifications, error, loadNotifications, markAsRead: markNotificationAsRead, deleteNotification } = useNotifications()
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    console.log('All notifications in dashboard:', notifications)
    console.log('Available notification types:', notifications.map(n => n.type))

    // Temporarily show all notifications for debugging
    setFilteredNotifications(notifications)

    // Filter for landlord-specific notifications
    // const landlordNotifications = notifications.filter(
    //   (n: NotificationItem) =>
    //     n.type === 'booking_request_received' ||
    //     n.type === 'booking_request_cancelled' ||
    //     n.type === 'room_invitation_accepted' ||
    //     n.type === 'room_invitation_rejected'
    // )
    // console.log('Filtered landlord notifications:', landlordNotifications)
    // setFilteredNotifications(landlordNotifications)
  }, [notifications])

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-red-600">Error loading notifications: {error}</p>
      </Card>
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request_received':
        return <CalendarCheck2 className="h-4 w-4 text-blue-500" />
      case 'booking_request_cancelled':
        return <X className="h-4 w-4 text-red-500" />
      case 'room_invitation_accepted':
        return <UserCheck className="h-4 w-4 text-green-500" />
      case 'room_invitation_rejected':
        return <UserX className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'booking_request_received':
        return 'Yêu cầu đặt phòng mới'
      case 'booking_request_cancelled':
        return 'Yêu cầu đặt phòng bị hủy'
      case 'booking_request_confirmed':
        return 'Yêu cầu booking được xác nhận'
      case 'room_invitation_accepted':
        return 'Lời mời được chấp nhận'
      case 'room_invitation_rejected':
        return 'Lời mời bị từ chối'
      case 'room_issue_reported':
        return 'Sự cố phòng được báo cáo'
      case 'rental_created':
        return 'Hợp đồng thuê được tạo'
      default:
        return 'Thông báo'
    }
  }

  const getNavigationPath = (notification: NotificationItem): string | null => {
    const data = notification.data as Record<string, unknown>
    
    switch (notification.type) {
      case 'room_issue_reported':
        // Navigate to feedback page where issues are managed
        return '/dashboard/landlord/feedback'
        
      case 'rental_created':
        // Navigate to specific rental detail page
        if (data?.rentalId) {
          return `/dashboard/landlord/rentals/${data.rentalId}`
        }
        return '/dashboard/landlord/rentals'
        
      case 'booking_request_received':
      case 'booking_request_cancelled':
        // Navigate to booking requests page
        if (data?.bookingId) {
          return `/dashboard/landlord/requests?highlight=${data.bookingId}`
        }
        return '/dashboard/landlord/requests'
        
      case 'booking_request_confirmed':
        // Navigate to rentals page since contract was created
        if (data?.rentalId) {
          return `/dashboard/landlord/rentals/${data.rentalId}`
        }
        return '/dashboard/landlord/rentals'
        
      case 'room_invitation_accepted':
      case 'room_invitation_rejected':
        // Navigate to tenants or properties management
        return '/dashboard/landlord/tenants'
        
      default:
        return null
    }
  }

  const handleNotificationClick = (notification: NotificationItem) => {
    const path = getNavigationPath(notification)
    
    // Mark as read when clicked
    if (!notification.isRead) {
      markNotificationAsRead(notification.id)
    }
    
    // Navigate to the appropriate page
    if (path) {
      router.push(path)
    }
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
          <Bell className="h-5 w-5" />
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
                        markNotificationAsRead(notification.id)
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