"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProfileLayout } from "@/components/profile/profile-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Clock,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"
import { useContractStore } from "@/stores/contractStore"
import { Contract } from "@/types/types"
import ContractSigningWorkflow from "@/components/contract/ContractSigningWorkflow"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  pending_signatures: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  terminated: 'bg-red-100 text-red-800',
  signed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const STATUS_LABELS = {
  draft: 'Bản nháp',
  pending_signatures: 'Chờ ký',
  active: 'Đang hiệu lực',
  expired: 'Hết hạn',
  terminated: 'Đã chấm dứt',
  signed: 'Đã ký',
  cancelled: 'Đã hủy'
}

export default function TenantContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string
  const [contract, setContract] = useState<Contract | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const {
    loadContractById,
    downloadPDF,
    loading,
    downloading,
    error,
    clearErrors
  } = useContractStore()

  const loadContract = useCallback(async () => {
    const result = await loadContractById(contractId)
    if (result) {
      setContract(result)
      // Determine current user ID (tenant)
      setCurrentUserId(result.tenantId || '')
    }
  }, [contractId, loadContractById])

  useEffect(() => {
    if (contractId) {
      loadContract()
    }
  }, [contractId, loadContract])

  const handleDownload = async () => {
    if (!contract) return

    try {
      const blob = await downloadPDF(contract.id!)
      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Contract-${contract.id?.slice(-8)}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Đã tải xuống hợp đồng thành công!')
      }
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Không thể tải xuống hợp đồng')
    }
  }

  const handleSigningComplete = () => {
    // Reload contract after signing
    loadContract()
    toast.success('Hợp đồng đã được cập nhật!')
  }

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="text-gray-500">Đang tải hợp đồng...</span>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  if (error || !contract) {
    return (
      <ProfileLayout>
        <div className="px-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Không thể tải hợp đồng</h3>
                <p className="text-red-600">{error || 'Hợp đồng không tồn tại hoặc bạn không có quyền truy cập'}</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button onClick={clearErrors} variant="outline">
                Đóng thông báo
              </Button>
            </div>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  const tenantName = contract.tenant
    ? `${contract.tenant.firstName} ${contract.tenant.lastName}`
    : 'Chưa có thông tin'

  const landlordName = contract.landlord
    ? `${contract.landlord.firstName} ${contract.landlord.lastName}`
    : 'Chưa có thông tin'

  const roomInfo = contract.room
    ? `${contract.room.name || 'N/A'}`
    : 'Chưa có thông tin'

  const buildingInfo = contract.room?.buildingName || 'N/A'

  return (
    <ProfileLayout>
      <div className="px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hợp đồng #{contract.id?.slice(-8)}
              </h1>
              <p className="text-gray-600">Chi tiết và ký hợp đồng thuê trọ</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                {STATUS_LABELS[contract.status as keyof typeof STATUS_LABELS] || contract.status}
              </Badge>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className={`h-4 w-4 mr-2 ${downloading ? 'animate-spin' : ''}`} />
                {downloading ? 'Đang tải...' : 'Tải PDF'}
              </Button>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Tenant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Người thuê
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contract.tenant?.avatarUrl || ''} alt={tenantName} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {tenantName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{tenantName}</p>
                  <p className="text-sm text-gray-600">{contract.tenant?.email}</p>
                </div>
              </div>
              {contract.tenant?.phone && (
                <p className="text-sm text-gray-600">
                  📱 {contract.tenant.phone}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Landlord Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Chủ nhà
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contract.landlord?.avatarUrl || ''} alt={landlordName} />
                  <AvatarFallback className="bg-green-100 text-green-600">
                    {landlordName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{landlordName}</p>
                  <p className="text-sm text-gray-600">{contract.landlord?.email}</p>
                </div>
              </div>
              {contract.landlord?.phone && (
                <p className="text-sm text-gray-600">
                  📱 {contract.landlord.phone}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Room Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                Phòng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-lg">{roomInfo}</p>
                  <p className="text-sm text-gray-600">{buildingInfo}</p>
                </div>
                {contract.room?.roomType && (
                  <p className="text-sm text-gray-600">
                    Loại: {contract.room.roomType}
                  </p>
                )}
                {contract.room?.areaSqm && (
                  <p className="text-sm text-gray-600">
                    Diện tích: {contract.room.areaSqm}m²
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Điều khoản hợp đồng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tiền thuê hàng tháng</p>
                  <p className="text-xl font-bold text-green-600">
                    {(contract.monthlyRent || 0).toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tiền cọc</p>
                  <p className="text-xl font-bold text-blue-600">
                    {contract.depositAmount
                      ? contract.depositAmount.toLocaleString('vi-VN') + ' VNĐ'
                      : 'Chưa có thông tin'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                  <p className="text-lg font-semibold">
                    {contract.startDate
                      ? format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: vi })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày kết thúc</p>
                  <p className="text-lg font-semibold">
                    {contract.endDate
                      ? format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            {contract.terms && (
              <>
                <Separator className="my-6" />
                <div>
                  <h4 className="font-semibold mb-3">Điều khoản chi tiết:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {contract.terms}
                    </p>
                  </div>
                </div>
              </>
            )}

            {contract.createdAt && (
              <div className="mt-4 pt-4 border-t flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Tạo lúc: {format(new Date(contract.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signing Section */}
        <ContractSigningWorkflow
          contract={contract}
          currentUserId={currentUserId}
          currentUserRole="tenant"
          onSigningComplete={handleSigningComplete}
        />

        {/* Contract Fully Signed Notice */}
        {contract.landlordSignature && contract.tenantSignature && (
          <Card className="mt-6 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Hợp đồng đã hoàn tất!
                  </h3>
                  <p className="text-green-700">
                    Cả hai bên đã ký hợp đồng. Hợp đồng đang có hiệu lực.
                  </p>
                  {contract.fullySignedAt && (
                    <p className="text-sm text-green-600 mt-1">
                      Hoàn thành lúc: {format(new Date(contract.fullySignedAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProfileLayout>
  )
}
