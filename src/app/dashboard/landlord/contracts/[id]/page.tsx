"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  FileText,
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
import { ContractSignature } from "@/types/contract.types"
import ContractSigningWorkflow from "@/components/contract/ContractSigningWorkflow"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CONTRACT_SIGN, STATUS_COLORS, CONTRACT_TYPE_LABELS } from "@/constants/basic"

export default function ContractDetailPage() {
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
      // Determine current user ID (landlord)
      setCurrentUserId(result.landlordId || '')
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
      <DashboardLayout userType="landlord">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="text-gray-500">Đang tải hợp đồng...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !contract) {
    return (
      <DashboardLayout userType="landlord">
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
      </DashboardLayout>
    )
  }

  const tenantName = contract.tenant?.fullName || 
    (contract.tenant ? `${contract.tenant.firstName} ${contract.tenant.lastName}` : 'Chưa có thông tin')

  const landlordName = contract.landlord?.fullName || 
    (contract.landlord ? `${contract.landlord.firstName} ${contract.landlord.lastName}` : 'Chưa có thông tin')

  const roomInfo = contract.room?.roomName || contract.room?.name || 'Chưa có thông tin'
  const roomNumber = contract.room?.roomNumber || 'N/A'
  const buildingInfo = contract.room?.buildingName || contract.contractData?.buildingName || 'N/A'
  const buildingAddress = contract.contractData?.buildingAddress || 'N/A'

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6 max-w-7xl mx-auto">
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
                {contract.contractCode || `Hợp đồng #${contract.id?.slice(-8)}`}
              </h1>
              <p className="text-gray-600">Chi tiết và ký hợp đồng thuê trọ</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                {CONTRACT_SIGN[contract.status as keyof typeof CONTRACT_SIGN] || contract.status}
              </Badge>
              {contract.contractType && (
                <Badge variant="outline">
                  {CONTRACT_TYPE_LABELS[contract.contractType as keyof typeof CONTRACT_TYPE_LABELS] || contract.contractType}
                </Badge>
              )}
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contract Details (2/3 width) */}
          <div className="lg:col-span-2">
            {/* Single Combined Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <FileText className="h-6 w-6 mr-2" />
                  Chi tiết hợp đồng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* People Info - Same Row */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin các bên</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tenant Info */}
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={contract.tenant?.avatarUrl || ''} alt={tenantName} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {tenantName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center mb-1">
                          <User className="h-4 w-4 mr-1 text-blue-600 flex-shrink-0" />
                          <p className="text-xs font-semibold text-blue-600">Người thuê</p>
                        </div>
                        <p className="font-semibold text-sm">{tenantName}</p>
                        <p className="text-xs text-gray-600 truncate">{contract.tenant?.email}</p>
                        {contract.tenant?.phone && (
                          <p className="text-xs text-gray-600 mt-1">📱 {contract.tenant.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Landlord Info */}
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={contract.landlord?.avatarUrl || ''} alt={landlordName} />
                        <AvatarFallback className="bg-green-100 text-green-600">
                          {landlordName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center mb-1">
                          <User className="h-4 w-4 mr-1 text-green-600 flex-shrink-0" />
                          <p className="text-xs font-semibold text-green-600">Chủ nhà</p>
                        </div>
                        <p className="font-semibold text-sm">{landlordName}</p>
                        <p className="text-xs text-gray-600 truncate">{contract.landlord?.email}</p>
                        {contract.landlord?.phone && (
                          <p className="text-xs text-gray-600 mt-1">📱 {contract.landlord.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Room Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-orange-600" />
                    Thông tin phòng
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tên phòng</p>
                      <p className="font-semibold text-sm">{roomInfo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Số phòng</p>
                      <p className="font-semibold text-sm">{roomNumber}</p>
                    </div>
                    {contract.room?.areaSqm && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Diện tích</p>
                        <p className="font-semibold text-sm">{contract.room.areaSqm}m²</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Tòa nhà</p>
                      <p className="font-semibold text-sm">{buildingInfo}</p>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
                      <p className="font-semibold text-sm">{buildingAddress}</p>
                    </div>
                    {contract.room?.roomType && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Loại phòng</p>
                        <p className="font-semibold text-sm">{contract.room.roomType}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Contract Financial Terms */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Điều khoản tài chính
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">Tiền thuê/tháng</p>
                      <p className="text-base font-bold text-green-600">
                        {(contract.monthlyRent || contract.contractData?.monthlyRent || 0).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-600 mb-1">Tiền cọc</p>
                      <p className="text-base font-bold text-blue-600">
                        {(contract.depositAmount || contract.contractData?.depositAmount || 0).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-xs text-gray-600 mb-1">Ngày bắt đầu</p>
                      <p className="text-sm font-semibold text-purple-700">
                        {contract.startDate
                          ? format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: vi })
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="text-xs text-gray-600 mb-1">Ngày kết thúc</p>
                      <p className="text-sm font-semibold text-orange-700">
                        {contract.endDate
                          ? format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })
                          : 'Không giới hạn'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {contract.terms && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Điều khoản chi tiết</h3>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {contract.terms}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Signature Status */}
                {contract.signatures && contract.signatures.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                        Trạng thái ký
                      </h3>
                      <div className="space-y-2">
                        {contract.signatures.map((sig: ContractSignature, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="text-sm font-semibold">
                                  {sig.signerRole === 'landlord' ? 'Chủ nhà' : 'Người thuê'} đã ký
                                </p>
                                <p className="text-xs text-gray-600">
                                  {format(new Date(sig.signedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Signatures Display - Show actual signatures with images */}
                {(contract.landlordSignature || contract.tenantSignature) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Chữ ký hợp đồng</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {contract.landlordSignature && (
                          <div className="border rounded-lg p-3 bg-gray-50">
                            <h4 className="text-xs font-semibold text-gray-800 mb-1">Chữ ký Chủ nhà</h4>
                            <p className="text-xs text-gray-600 mb-2">{landlordName}</p>
                            <div className="border border-gray-300 rounded bg-white p-2 mb-1 flex justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={typeof contract.landlordSignature === 'string' ? contract.landlordSignature : contract.landlordSignature.signatureData}
                                alt={`Chữ ký của ${landlordName}`}
                                className="max-w-full h-auto max-h-24 object-contain"
                              />
                            </div>
                            {typeof contract.landlordSignature !== 'string' && contract.landlordSignature.signedAt && (
                              <p className="text-xs text-gray-500">
                                Đã ký: {format(new Date(contract.landlordSignature.signedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {contract.tenantSignature && (
                          <div className="border rounded-lg p-3 bg-gray-50">
                            <h4 className="text-xs font-semibold text-gray-800 mb-1">Chữ ký Người thuê</h4>
                            <p className="text-xs text-gray-600 mb-2">{tenantName}</p>
                            <div className="border border-gray-300 rounded bg-white p-2 mb-1 flex justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={typeof contract.tenantSignature === 'string' ? contract.tenantSignature : contract.tenantSignature.signatureData}
                                alt={`Chữ ký của ${tenantName}`}
                                className="max-w-full h-auto max-h-24 object-contain"
                              />
                            </div>
                            {typeof contract.tenantSignature !== 'string' && contract.tenantSignature.signedAt && (
                              <p className="text-xs text-gray-500">
                                Đã ký: {format(new Date(contract.tenantSignature.signedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Metadata */}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                  {contract.createdAt && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Tạo: {format(new Date(contract.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                    </div>
                  )}
                  {contract.updatedAt && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Cập nhật: {format(new Date(contract.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                    </div>
                  )}
                  {contract.signedAt && (
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      <span>Hoàn tất: {format(new Date(contract.signedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Signing Section (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <ContractSigningWorkflow
                contract={contract}
                currentUserId={currentUserId}
                currentUserRole="landlord"
                onSigningComplete={handleSigningComplete}
              />

              {/* Contract Fully Signed Notice */}
              {contract.landlordSignature && contract.tenantSignature && (
                <Card className="mt-6 bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">
                          Hợp đồng đã hoàn tất!
                        </h3>
                        <p className="text-green-700 text-sm mt-1">
                          Cả hai bên đã ký hợp đồng. Hợp đồng đang có hiệu lực.
                        </p>
                        {(contract.fullySignedAt || contract.signedAt) && (
                          <p className="text-xs text-green-600 mt-2">
                            Hoàn thành: {format(new Date(contract.fullySignedAt || contract.signedAt!), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
