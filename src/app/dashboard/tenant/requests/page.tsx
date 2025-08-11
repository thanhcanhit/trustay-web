"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Clock, CheckCircle, XCircle, Home, MapPin } from "lucide-react"

// Mock data for rental requests
const mockRentalRequests = [
  {
    id: "req-1",
    propertyName: "Nhà trọ ABC",
    roomNumber: "Phòng 101",
    address: "123 Đường XYZ, Quận 1, TP.HCM",
    monthlyRent: 3500000,
    status: "pending",
    requestDate: "2024-01-15",
    message: "Tôi quan tâm đến phòng này và muốn thuê từ đầu tháng 2."
  },
  {
    id: "req-2", 
    propertyName: "Chung cư mini DEF",
    roomNumber: "Phòng 205",
    address: "456 Đường ABC, Quận 3, TP.HCM",
    monthlyRent: 4200000,
    status: "approved",
    requestDate: "2024-01-10",
    message: "Phòng rất đẹp, tôi muốn thuê ngay."
  },
  {
    id: "req-3",
    propertyName: "Nhà trọ GHI", 
    roomNumber: "Phòng 302",
    address: "789 Đường DEF, Quận 7, TP.HCM",
    monthlyRent: 2800000,
    status: "rejected",
    requestDate: "2024-01-05",
    message: "Tôi có thể xem phòng vào cuối tuần được không?"
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Đang chờ</Badge>
    case "approved":
      return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Đã duyệt</Badge>
    case "rejected":
      return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Từ chối</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function TenantRequests() {
  const handleWithdrawRequest = (requestId: string) => {
    // Handle withdraw request logic
    console.log("Withdrawing request:", requestId)
  }

  return (
    <DashboardLayout userType="tenant">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu thuê</h1>
          <p className="text-gray-600">Quản lý các yêu cầu thuê trọ của bạn</p>
        </div>

        <div className="space-y-6">
          {mockRentalRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{request.propertyName}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {request.address}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phòng</p>
                    <p className="text-gray-900">{request.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Giá thuê</p>
                    <p className="text-gray-900 font-semibold">
                      {(request.monthlyRent / 1000000).toFixed(1)} triệu VNĐ/tháng
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ngày gửi yêu cầu</p>
                    <p className="text-gray-900">{new Date(request.requestDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tin nhắn</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{request.message}</p>
                </div>

                <div className="flex space-x-3">
                  {request.status === "pending" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleWithdrawRequest(request.id)}
                    >
                      Thu hồi yêu cầu
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Xem chi tiết
                  </Button>
                  {request.status === "approved" && (
                    <Button size="sm">
                      Xem hợp đồng
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {mockRentalRequests.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Send className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có yêu cầu thuê nào</h3>
                <p className="text-gray-600 mb-6">
                  Bạn chưa gửi yêu cầu thuê trọ nào. Hãy tìm kiếm và gửi yêu cầu thuê cho những phòng trọ bạn quan tâm.
                </p>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Tìm trọ để thuê
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
