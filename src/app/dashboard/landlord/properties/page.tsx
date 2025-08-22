"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Plus, Search, Filter, MapPin, Users, DollarSign, Home} from "lucide-react"
import { mockProperties } from "@/data/mock-data"
import Link from "next/link"

export default function LandlordProperties() {
  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dãy trọ/Tòa nhà</h1>
            <p className="text-gray-600">Quản lý tất cả các dãy trọ và tòa nhà của bạn</p>
          </div>
          <Link href="/dashboard/landlord/properties/add">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Thêm dãy trọ mới
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên dãy trọ..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <Badge className={
                        property.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }>
                        {property.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {property.address}, {property.district}, {property.city}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Home className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Tổng phòng</p>
                        <p className="font-medium">{property.totalRooms}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Đã thuê</p>
                        <p className="font-medium">{property.occupiedRooms}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Doanh thu</p>
                        <p className="font-medium text-green-600">
                          {(property.monthlyRevenue / 1000000).toFixed(1)}M VNĐ
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-gray-600">Tỷ lệ lấp đầy</p>
                        <p className="font-medium">
                          {Math.round((property.occupiedRooms / property.totalRooms) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{property.amenities.length - 3} khác
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Cập nhật: {new Date().toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Xem chi tiết
                  </Button>
                  <Button size="sm" className="flex-1">
                    Chỉnh sửa
                  </Button>
                </div>
                
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="w-full text-orange-600 border-orange-300 hover:bg-orange-50">
                    Quảng cáo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {mockProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Bạn chưa có dãy trọ nào</div>
            <Link href="/dashboard/landlord/properties/add">
              <Button>Thêm dãy trọ đầu tiên</Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
