"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Plus, Search, MapPin, Users, DollarSign, Home, Edit, Trash2, Eye } from "lucide-react"
import { getBuildings, deleteBuilding } from "@/actions/building.action"
import { type Building as BuildingType } from "@/types/types"
import Link from "next/link"
import { toast } from "sonner"

export default function LandlordProperties() {
  const [buildings, setBuildings] = useState<BuildingType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageLimit = 12

  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getBuildings({
        page: currentPage,
        limit: pageLimit,
        search: searchTerm || undefined,
        isActive: true
      })
      
      console.log('Buildings API Response:', response)
      
      if (!response.success) {
        toast.error(response.error)
        setBuildings([])
        setTotalPages(1)
        return
      }
      
      // Ensure we have valid data
      const buildingsData = response.data.buildings || []
      const totalPagesData = response.data.totalPages || 1
      
      setBuildings(buildingsData)
      setTotalPages(totalPagesData)
    } catch (error) {
      console.error('Error fetching buildings:', error)
      toast.error('Không thể tải danh sách dãy trọ')
      setBuildings([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageLimit, searchTerm])

  useEffect(() => {
    fetchBuildings()
  }, [currentPage, searchTerm, fetchBuildings])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchBuildings()
  }

  const handleDeleteBuilding = async (buildingId: string, buildingName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dãy trọ "${buildingName}"?`)) {
      return
    }

    try {
      const response = await deleteBuilding(buildingId)
      if (!response.success) {
        toast.error(response.error)
        return
      }
      
      toast.success('Xóa dãy trọ thành công')
      fetchBuildings() // Refresh list
    } catch (error) {
      console.error('Error deleting building:', error)
      toast.error('Không thể xóa dãy trọ. Vui lòng kiểm tra lại.')
    }
  }

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải danh sách dãy trọ...</p>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && buildings && Array.isArray(buildings) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {buildings.map((building) => (
              <Card key={building.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{building.name}</CardTitle>
                        <Badge className={
                          building.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }>
                          {building.isActive ? 'Hoạt động' : 'Tạm dừng'}
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
                        {building.addressLine1}
                        {building.ward && `, ${building.ward.name}`}
                        {building.district && `, ${building.district.name}`}
                        {building.province && `, ${building.province.name}`}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Tổng phòng</p>
                          <p className="font-medium">{building.roomCount || 0}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Trạng thái</p>
                          <p className="font-medium">{building.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Ngày tạo</p>
                          <p className="font-medium text-blue-600">
                            {new Date(building.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className={`h-4 w-4 rounded-full ${
                          building.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="text-gray-600">Xác thực</p>
                          <p className="font-medium">
                            {building.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {building.description && (
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {building.description}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Cập nhật: {new Date(building.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Link href={`/dashboard/landlord/properties/${building.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>
                    </Link>
                    <Link href={`/dashboard/landlord/properties/${building.id}/edit`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Sửa
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="mt-2 flex space-x-2">
                    <Link href={`/dashboard/landlord/properties/rooms?buildingId=${building.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-green-600 border-green-300 hover:bg-green-50">
                        <Home className="h-4 w-4 mr-1" />
                        Quản lý phòng
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleDeleteBuilding(building.id, building.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && (!buildings || !Array.isArray(buildings) || buildings.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchTerm ? 'Không tìm thấy dãy trọ nào phù hợp' : 'Bạn chưa có dãy trọ nào'}
            </div>
            <Link href="/dashboard/landlord/properties/add">
              <Button>Thêm dãy trọ đầu tiên</Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {!loading && buildings && Array.isArray(buildings) && buildings.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
