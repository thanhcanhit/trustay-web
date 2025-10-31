"use client"

import { useEffect, useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Phone, Mail, Calendar, Loader2, AlertCircle, Users } from "lucide-react"
import { useLandlordStore } from "@/stores/landlordStore"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

export default function TenantsManagementPage() {
  const { tenants, loadingTenants, errorTenants, tenantsMeta, loadTenants } = useLandlordStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  // Load tenants on mount and when page or statusFilter changes
  // searchTerm is handled separately via handleSearch
  useEffect(() => {
    loadTenants({ 
      page, 
      limit: 12,
    })
  }, [loadTenants, page])

  const handleSearch = () => {
    setPage(1)
    loadTenants({ 
      page: 1, 
      limit: 12, 
      search: searchTerm.trim() || undefined
    })
  }

  const filteredTenants = useMemo(() => {
    if (!searchTerm.trim()) return tenants
    const term = searchTerm.toLowerCase()
    return tenants.filter(tenant => {
      const name = `${tenant.firstName} ${tenant.lastName}`.toLowerCase()
      return name.includes(term) || 
             tenant.phone?.toLowerCase().includes(term) ||
             tenant.email.toLowerCase().includes(term)
    })
  }, [tenants, searchTerm])

  // Loading state
  if (loadingTenants) {
    return (
      <DashboardLayout userType="landlord">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (errorTenants) {
    return (
      <DashboardLayout userType="landlord">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-red-600 font-medium">{errorTenants}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khách thuê</h1>
          <p className="text-gray-600">Quản lý thông tin và trạng thái của tất cả khách thuê {tenantsMeta ? `(${tenantsMeta.total} người thuê)` : ''}</p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm khách thuê..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="pl-10"
              />
            </div>
            
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang thuê</SelectItem>
                <SelectItem value="overdue">Quá hạn thanh toán</SelectItem>
                <SelectItem value="inactive">Không còn thuê</SelectItem>
                <SelectItem value="pending">Chờ ký hợp đồng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Thêm khách thuê</span>
          </Button>
        </div>

        {/* Tenants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => {
            const fullName = `${tenant.firstName} ${tenant.lastName}`
            const initials = `${tenant.firstName[0]}${tenant.lastName[0]}`
            const roomInfo = tenant.room.roomName 
              ? `${tenant.room.roomNumber} - ${tenant.room.roomName}` 
              : tenant.room.roomNumber
            const buildingInfo = tenant.room.buildingName ? ` (${tenant.room.buildingName})` : ''
            
            return (
              <Card key={tenant.tenantId} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{fullName}</CardTitle>
                        {/* <Badge className={STATUS_COLORS[tenant.rental.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-600'}>
                          {STATUS_LABELS[tenant.rental.status as keyof typeof STATUS_LABELS] || tenant.rental.status}
                        </Badge> */}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {tenant.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{tenant.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{tenant.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Phòng: {roomInfo}{buildingInfo}</span>
                    </div>
                    
      
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Ngày bắt đầu:</span>
                      <span className="font-medium">
                        {format(new Date(tenant.contractStartDate), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    
                    {tenant.contractEndDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Ngày kết thúc:</span>
                        <span className="font-medium">
                          {format(new Date(tenant.contractEndDate), 'dd/MM/yyyy', { locale: vi })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Chỉnh sửa
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTenants.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Chưa có khách thuê</EmptyTitle>
              <EmptyDescription>
                {searchTerm
                  ? 'Không tìm thấy khách thuê nào phù hợp với từ khóa tìm kiếm.'
                  : 'Bạn chưa có khách thuê nào. Khách thuê sẽ xuất hiện sau khi có hợp đồng thuê được ký kết.'}
              </EmptyDescription>
            </EmptyHeader>
            {!searchTerm && (
              <EmptyContent>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm khách thuê
                </Button>
              </EmptyContent>
            )}
          </Empty>
        )}

        {/* Pagination */}
        {tenantsMeta && tenantsMeta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Trang trước
            </Button>
            <span className="text-sm text-gray-600">
              Trang {page} / {tenantsMeta.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === tenantsMeta.totalPages}
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
