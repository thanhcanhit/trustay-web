"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, TrendingUp, TrendingDown, Users, Home, DollarSign, Calendar } from "lucide-react"
import { Report } from "@/types/report"

// Mock data for reports
const MOCK_REPORTS = [
  {
    id: '1',
    title: 'Báo cáo doanh thu tháng 1/2024',
    type: 'revenue',
    period: '2024-01',
    status: 'completed',
    totalRevenue: 25000000,
    totalExpenses: 8500000,
    netProfit: 16500000,
    occupancyRate: 85,
    createdAt: '2024-01-31'
  },
  {
    id: '2',
    title: 'Báo cáo tình trạng phòng tháng 1/2024',
    type: 'occupancy',
    period: '2024-01',
    status: 'completed',
    totalRooms: 20,
    occupiedRooms: 17,
    vacantRooms: 3,
    maintenanceRooms: 0,
    createdAt: '2024-01-31'
  },
  {
    id: '3',
    title: 'Báo cáo khách thuê tháng 1/2024',
    type: 'tenants',
    period: '2024-01',
    status: 'completed',
    totalTenants: 17,
    newTenants: 2,
    leavingTenants: 1,
    averageRent: 3800000,
    createdAt: '2024-01-31'
  },
  {
    id: '4',
    title: 'Báo cáo doanh thu tháng 12/2023',
    type: 'revenue',
    period: '2023-12',
    status: 'completed',
    totalRevenue: 23000000,
    totalExpenses: 8000000,
    netProfit: 15000000,
    occupancyRate: 80,
    createdAt: '2023-12-31'
  }
]

// const REPORT_TYPE_LABELS = {
//   revenue: 'Doanh thu',
//   occupancy: 'Tình trạng phòng',
//   tenants: 'Khách thuê',
//   maintenance: 'Bảo trì',
//   services: 'Dịch vụ'
// }

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-800',
  processing: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800'
}

const STATUS_LABELS = {
  completed: 'Hoàn thành',
  processing: 'Đang xử lý',
  failed: 'Thất bại'
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('all')
  const [timeRange, setTimeRange] = useState('all')

  const filteredReports = MOCK_REPORTS.filter(report => {
    const matchesType = reportType === 'all' || report.type === reportType
    const matchesTime = timeRange === 'all' || report.period.startsWith(timeRange.split('-')[0])
    
    return matchesType && matchesTime
  })

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-5 w-5 text-green-600" />
      case 'occupancy':
        return <Home className="h-5 w-5 text-blue-600" />
      case 'tenants':
        return <Users className="h-5 w-5 text-purple-600" />
      case 'maintenance':
        return <TrendingDown className="h-5 w-5 text-orange-600" />
      case 'services':
        return <TrendingUp className="h-5 w-5 text-indigo-600" />
      default:
        return <BarChart3 className="h-5 w-5 text-gray-600" />
    }
  }

  const getReportSummary = (report: Report) => {
    switch (report.type) {
      case 'revenue':
        return {
          primary: `Doanh thu: ${report.totalRevenue?.toLocaleString('vi-VN') ?? '0'} VNĐ`,
          secondary: `Lợi nhuận: ${report.netProfit?.toLocaleString('vi-VN') ?? '0'} VNĐ`,
          tertiary: `Tỷ lệ lấp đầy: ${report.occupancyRate ?? 0}%`
        }
      case 'occupancy':
        return {
          primary: `Phòng đã thuê: ${report.occupiedRooms ?? 0}/${report.totalRooms ?? 0}`,
          secondary: `Phòng trống: ${report.vacantRooms ?? 0}`,
          tertiary: `Tỷ lệ: ${Math.round(((report.occupiedRooms ?? 0) / (report.totalRooms ?? 1)) * 100)}%`
        }
      case 'tenants':
        return {
          primary: `Tổng khách thuê: ${report.totalTenants ?? 0}`,
          secondary: `Khách mới: ${report.newTenants ?? 0}`,
          tertiary: `Thuê trung bình: ${report.averageRent?.toLocaleString('vi-VN') ?? '0'} VNĐ`
        }
      default:
        return {
          primary: 'Báo cáo chi tiết',
          secondary: '',
          tertiary: ''
        }
    }
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Báo cáo</h1>
          <p className="text-gray-600">Xem và tạo các báo cáo quản lý</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tạo báo cáo mới</h3>
                  <p className="text-gray-600">Chọn loại báo cáo và thời gian để tạo</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Loại báo cáo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Báo cáo doanh thu</SelectItem>
                      <SelectItem value="occupancy">Báo cáo tình trạng phòng</SelectItem>
                      <SelectItem value="tenants">Báo cáo khách thuê</SelectItem>
                      <SelectItem value="maintenance">Báo cáo bảo trì</SelectItem>
                      <SelectItem value="services">Báo cáo dịch vụ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Tạo báo cáo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loại báo cáo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="revenue">Doanh thu</SelectItem>
              <SelectItem value="occupancy">Tình trạng phòng</SelectItem>
              <SelectItem value="tenants">Khách thuê</SelectItem>
              <SelectItem value="maintenance">Bảo trì</SelectItem>
              <SelectItem value="services">Dịch vụ</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thời gian</SelectItem>
              <SelectItem value="2024">Năm 2024</SelectItem>
              <SelectItem value="2023">Năm 2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => {
            const summary = getReportSummary(report)
            
            return (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getReportIcon(report.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <Badge className={STATUS_COLORS[report.status as keyof typeof STATUS_COLORS]}>
                          {STATUS_LABELS[report.status as keyof typeof STATUS_COLORS]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Kỳ báo cáo: {report.period}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">{summary.primary}</p>
                      {summary.secondary && (
                        <p className="text-sm text-gray-700">{summary.secondary}</p>
                      )}
                      {summary.tertiary && (
                        <p className="text-sm text-gray-600">{summary.tertiary}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>Tạo: {report.createdAt}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Xem chi tiết
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Tải xuống
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không có báo cáo nào</div>
            <Button>Tạo báo cáo đầu tiên</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
