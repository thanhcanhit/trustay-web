"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  Info,
  Settings
} from "lucide-react"

// Notification type definition
interface Notification {
  id: string;
  type: 'rental_approved' | 'rental_rejected' | 'payment_reminder' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl: string | null;
}

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "rental_approved",
    title: "Yêu cầu thuê được chấp nhận",
    message: "Chủ trọ đã chấp nhận yêu cầu thuê phòng 101 tại Nhà trọ ABC. Vui lòng liên hệ để hoàn tất thủ tục.",
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
    actionUrl: "/dashboard/tenant/requests"
  },
  {
    id: "notif-2", 
    type: "payment_reminder",
    title: "Nhắc nhở thanh toán",
    message: "Tiền thuê tháng 2/2024 sẽ đến hạn vào ngày 01/02. Vui lòng chuẩn bị thanh toán.",
    timestamp: "2024-01-14T09:00:00Z",
    isRead: false,
    actionUrl: "/dashboard/tenant/accommodation"
  },
  {
    id: "notif-3",
    type: "message",
    title: "Tin nhắn mới từ chủ trọ",
    message: "Bạn có tin nhắn mới từ chủ trọ về việc bảo trì điều hòa phòng.",
    timestamp: "2024-01-13T16:45:00Z", 
    isRead: true,
    actionUrl: "/messages"
  },
  {
    id: "notif-4",
    type: "system",
    title: "Cập nhật hệ thống",
    message: "Hệ thống đã được cập nhật với các tính năng mới. Khám phá ngay!",
    timestamp: "2024-01-12T08:00:00Z",
    isRead: true,
    actionUrl: null
  },
  {
    id: "notif-5",
    type: "rental_rejected", 
    title: "Yêu cầu thuê bị từ chối",
    message: "Rất tiếc, yêu cầu thuê phòng 205 tại Chung cư mini DEF đã bị từ chối.",
    timestamp: "2024-01-11T14:20:00Z",
    isRead: true,
    actionUrl: "/dashboard/tenant/requests"
  }
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "rental_approved":
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case "rental_rejected":
      return <AlertCircle className="h-5 w-5 text-red-600" />
    case "payment_reminder":
      return <AlertCircle className="h-5 w-5 text-orange-600" />
    case "message":
      return <MessageSquare className="h-5 w-5 text-blue-600" />
    case "system":
      return <Info className="h-5 w-5 text-gray-600" />
    default:
      return <Bell className="h-5 w-5 text-gray-600" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case "rental_approved":
      return "bg-green-50 border-green-200"
    case "rental_rejected":
      return "bg-red-50 border-red-200"
    case "payment_reminder":
      return "bg-orange-50 border-orange-200"
    case "message":
      return "bg-blue-50 border-blue-200"
    case "system":
      return "bg-gray-50 border-gray-200"
    default:
      return "bg-white border-gray-200"
  }
}

export default function TenantNotifications() {
  const unreadNotifications = mockNotifications.filter(n => !n.isRead)
  const readNotifications = mockNotifications.filter(n => n.isRead)

  const handleMarkAsRead = (notificationId: string) => {
    console.log("Marking as read:", notificationId)
  }

  const handleMarkAllAsRead = () => {
    console.log("Marking all as read")
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Vừa xong"
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    if (diffInHours < 48) return "Hôm qua"
    return date.toLocaleDateString('vi-VN')
  }

  const NotificationCard = ({ notification, showAsUnread = false }: { notification: Notification, showAsUnread?: boolean }) => (
    <Card className={`${getNotificationColor(notification.type)} ${!notification.isRead || showAsUnread ? 'ring-2 ring-blue-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {notification.title}
                  {(!notification.isRead || showAsUnread) && (
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                      Mới
                    </Badge>
                  )}
                </h4>
                <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                <p className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                {(!notification.isRead || showAsUnread) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {notification.actionUrl && (
                  <Button size="sm" variant="outline">
                    Xem
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout userType="tenant">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông báo</h1>
            <p className="text-gray-600">
              Tất cả thông báo và cập nhật ({unreadNotifications.length} chưa đọc)
            </p>
          </div>
          <div className="flex space-x-3">
            {unreadNotifications.length > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Đánh dấu tất cả đã đọc
              </Button>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              Tất cả ({mockNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Chưa đọc ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Đã đọc ({readNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {mockNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} showAsUnread />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Bạn đã đọc hết thông báo!</h3>
                  <p className="text-gray-600">Không có thông báo chưa đọc nào.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="read" className="space-y-4">
            {readNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </TabsContent>
        </Tabs>

        {mockNotifications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
              <p className="text-gray-600 mb-6">
                Bạn sẽ nhận được thông báo về các hoạt động liên quan đến tài khoản tại đây.
              </p>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt thông báo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
