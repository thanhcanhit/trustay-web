"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building, Plus, Search, Edit, Trash2, MoreVertical } from "lucide-react"
import { useBuildingStore } from "@/stores/buildingStore"
import Link from "next/link"
import { toast } from "sonner"
import { AlertDialog, AlertDialogTitle, AlertDialogHeader, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

export default function LandlordProperties() {
  const { buildings, isLoading, error, pagination, fetchAllBuildings, deleteBuilding: deleteBuildingFromStore } = useBuildingStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageLimit = 20
  const totalPages = pagination?.totalPages || 1
  const total = pagination?.total || 0

  const fetchBuildings = useCallback(async (page = 1, search = '') => {
    await fetchAllBuildings({ page, limit: pageLimit, search })
  }, [fetchAllBuildings, pageLimit])

  useEffect(() => {
    fetchBuildings(1, '')
  }, [fetchBuildings]) // Fetch on mount

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchBuildings(1, searchTerm)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    fetchBuildings(newPage, searchTerm)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteBuilding = async (buildingId: string) => {
    try {
      const success = await deleteBuildingFromStore(buildingId)
      if (success) {
        toast.success('Xóa dãy trọ thành công')
      } else {
        toast.error('Không thể xóa dãy trọ')
      }
    } catch (error) {
      console.error('Error deleting building:', error)
      toast.error('Không thể xóa dãy trọ. Vui lòng kiểm tra lại.')
    }
  }

  return (
    <DashboardLayout userType="landlord">
      <div>
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Dãy trọ/Tòa nhà</h1>
          <p className="text-sm md:text-base text-gray-600 mb-4">Quản lý tất cả các dãy trọ và tòa nhà của bạn</p>
          <Link href="/dashboard/landlord/properties/add">
            <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Thêm dãy trọ mới
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên dãy trọ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
            </div>
            <Button onClick={handleSearch} variant="outline" className="cursor-pointer w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải danh sách dãy trọ...</p>
            </div>
          </div>
        )}

        {/* Properties Table - Desktop */}
        {!isLoading && buildings && Array.isArray(buildings) && buildings.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Tên dãy trọ</TableHead>
                    <TableHead className="w-[250px] max-w-[250px]">Địa chỉ</TableHead>
                    <TableHead className="w-[100px] text-center">Số phòng</TableHead>
                    <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
                    <TableHead className="w-[120px] text-center">Xác thực</TableHead>
                    <TableHead className="w-[120px]">Ngày tạo</TableHead>
                    <TableHead className="w-[200px] text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildings.map((building) => (
                    <TableRow 
                      key={building.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => window.location.href = `/dashboard/landlord/properties/${building.id}/rooms`}
                    >
                      <TableCell className="font-medium max-w-[250px]">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <Building className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="line-clamp-2 truncate">{building.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <div className="text-sm text-gray-600">
                          {building.addressLine1}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{building.roomCount || 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          building.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }>
                          {building.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          building.isVerified
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {building.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(building.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="cursor-pointer">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/landlord/properties/${building.id}`} className="cursor-pointer">
                                  <Building className="h-4 w-4 mr-2" />
                                  Xem chi tiết dãy trọ
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/landlord/properties/${building.id}/edit`} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Chỉnh sửa
                                </Link>
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 cursor-pointer">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa dãy trọ {building.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Điều này sẽ xóa dãy trọ {building.name} và tất cả các phòng trong dãy trọ này. Hành động này không thể hoàn tác.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                                      onClick={() => handleDeleteBuilding(building.id)}
                                    >
                                      Xóa
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {buildings.map((building) => (
                <div
                  key={building.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/landlord/properties/${building.id}/rooms`}
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate text-sm">{building.name}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {building.addressLine1}
                        {building.ward && `, ${building.ward.name}`}
                        {building.district && `, ${building.district.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={building.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {building.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
                    <Badge className={building.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                      {building.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </Badge>
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded">
                      {building.roomCount || 0} phòng
                    </span>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/dashboard/landlord/properties/${building.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Building className="h-3 w-3 mr-1" />
                        Chi tiết
                      </Button>
                    </Link>
                    <Link href={`/dashboard/landlord/properties/${building.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Edit className="h-3 w-3 mr-1" />
                        Sửa
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="cursor-pointer px-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 cursor-pointer">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bạn có chắc chắn muốn xóa dãy trọ {building.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Điều này sẽ xóa dãy trọ {building.name} và tất cả các phòng trong dãy trọ này. Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                                onClick={() => handleDeleteBuilding(building.id)}
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!buildings || !Array.isArray(buildings) || buildings.length === 0) && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building />
              </EmptyMedia>
              <EmptyTitle>
                {searchTerm ? 'Không tìm thấy dãy trọ' : 'Chưa có dãy trọ'}
              </EmptyTitle>
              <EmptyDescription>
                {searchTerm
                  ? 'Không có dãy trọ nào phù hợp với từ khóa tìm kiếm. Hãy thử tìm kiếm với từ khóa khác.'
                  : 'Bạn chưa có dãy trọ nào. Hãy thêm dãy trọ đầu tiên để bắt đầu quản lý cho thuê.'}
              </EmptyDescription>
            </EmptyHeader>
            {!searchTerm && (
              <EmptyContent>
                <Link href="/dashboard/landlord/properties/add">
                  <Button className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm dãy trọ đầu tiên
                  </Button>
                </Link>
              </EmptyContent>
            )}
          </Empty>
        )}

        {/* Pagination */}
        {!isLoading && buildings && Array.isArray(buildings) && buildings.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2 items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer"
              >
                Trước
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Trang {currentPage} / {totalPages} ({total} dãy trọ)
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="cursor-pointer"
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
