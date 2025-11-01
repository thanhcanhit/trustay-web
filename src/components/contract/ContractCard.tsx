"use client"

import { Contract } from "@/types/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { translateContractStatus, getContractStatusColor } from "@/utils"
import {
  Building,
  Calendar,
  DollarSign,
  Download,
  Eye,
  FileSignature,
  FileText,
  Home,
  MoreHorizontal,
  Trash2,
  User,
  Zap,
  Droplet,
  Wifi,
  CreditCard,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface ContractCardProps {
  contract: Contract
  userType: "landlord" | "tenant"
  onViewDetails: (contractId: string) => void
  onViewPreview: (contractId: string) => void
  onSign?: (contractId: string) => void
  onDownload: (contractId: string, contractCode: string) => void
  onDelete?: (contract: Contract) => void
  onViewProfile?: (userId: string) => void
  downloading?: boolean
}

export function ContractCard({
  contract,
  userType,
  onViewDetails,
  onViewPreview,
  onSign,
  onDownload,
  onDelete,
  onViewProfile,
  downloading = false,
}: ContractCardProps) {
  // Get the other party based on user type
  const otherParty = userType === "landlord" ? contract.tenant : contract.landlord
  const otherPartyName = otherParty?.fullName || `${otherParty?.firstName || ''} ${otherParty?.lastName || ''}`.trim() || 'N/A'

  // Get room info
  const roomNumber = contract.room?.roomNumber || contract.contractData?.roomNumber || 'N/A'
  const roomName = contract.room?.roomName || contract.room?.name || contract.contractData?.roomName || 'N/A'
  const buildingName = contract.room?.buildingName || contract.contractData?.buildingName || 'N/A'

  // Get financial info
  const monthlyRent = contract.contractData?.financial?.monthlyRent || contract.contractData?.monthlyRent || contract.monthlyRent || 0
  const depositAmount = contract.contractData?.financial?.deposit || contract.contractData?.depositAmount || contract.depositAmount || 0
  const depositMonths = contract.contractData?.financial?.depositMonths || 0

  // Get utility costs
  const electricityPrice = contract.contractData?.financial?.electricityPrice
  const waterPrice = contract.contractData?.financial?.waterPrice
  const internetPrice = contract.contractData?.financial?.internetPrice

  // Format dates
  const startDate = contract.startDate
    ? new Date(contract.startDate).toLocaleDateString('vi-VN')
    : 'N/A'
  const endDate = contract.endDate
    ? new Date(contract.endDate).toLocaleDateString('vi-VN')
    : 'Không xác định'

  // Check if user can sign
  const canSign = userType === "landlord"
    ? (contract.status === 'draft' || contract.status === 'pending_signatures' || contract.status === 'partially_signed') && !contract.landlordSignature
    : (contract.status === 'draft' || contract.status === 'pending_signatures') && !contract.tenantSignature

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">
                {contract.contractCode || `HĐ-${contract.id?.slice(-8)}`}
              </h3>
              <Badge className={getContractStatusColor(contract.status)}>
                {translateContractStatus(contract.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Ngày tạo: {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(contract.id!)}>
                <FileText className="h-4 w-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewPreview(contract.id!)}>
                <Eye className="h-4 w-4 mr-2" />
                Xem trước hợp đồng
              </DropdownMenuItem>
              {canSign && onSign && (
                <DropdownMenuItem onClick={() => onSign(contract.id!)}>
                  <FileSignature className="h-4 w-4 mr-2" />
                  Ký hợp đồng
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDownload(contract.id!, contract.contractCode || `HĐ-${contract.id?.slice(-8)}`)}
                disabled={downloading}
              >
                <Download className={`h-4 w-4 mr-2 ${downloading ? 'animate-spin' : ''}`} />
                Tải PDF
              </DropdownMenuItem>
              {userType === 'landlord' && contract.status === 'draft' && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(contract)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa hợp đồng
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Party Information */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {userType === "landlord" ? "Người thuê:" : "Chủ nhà:"}
          </span>
          <button
            onClick={() => otherParty?.id && onViewProfile?.(otherParty.id)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            disabled={!otherParty?.id || !onViewProfile}
          >
            {otherPartyName}
          </button>
        </div>

        <Separator />

        {/* Room Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tòa nhà:</span>
            <span className="text-sm font-medium">{buildingName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Phòng:</span>
            <span className="text-sm font-medium">
              {roomName} ({roomNumber})
            </span>
          </div>
        </div>

        <Separator />

        {/* Financial Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Tiền thuê:</span>
            </div>
            <span className="text-sm font-semibold text-green-600">
              {monthlyRent.toLocaleString('vi-VN')} đ/tháng
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Tiền cọc:</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">
              {depositAmount.toLocaleString('vi-VN')} đ
              {depositMonths > 0 && <span className="text-xs text-muted-foreground ml-1">({depositMonths} tháng)</span>}
            </span>
          </div>

          {/* Utility costs */}
          {(electricityPrice || waterPrice || internetPrice) && (
            <div className="mt-2 pt-2 border-t space-y-1">
              {electricityPrice !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-600" />
                    <span className="text-muted-foreground">Điện:</span>
                  </div>
                  <span>{electricityPrice.toLocaleString('vi-VN')} đ/kWh</span>
                </div>
              )}
              {waterPrice !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Droplet className="h-3 w-3 text-blue-600" />
                    <span className="text-muted-foreground">Nước:</span>
                  </div>
                  <span>{waterPrice.toLocaleString('vi-VN')} đ/m³</span>
                </div>
              )}
              {internetPrice !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Wifi className="h-3 w-3 text-purple-600" />
                    <span className="text-muted-foreground">Internet:</span>
                  </div>
                  <span>{internetPrice.toLocaleString('vi-VN')} đ/tháng</span>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Date Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Thời hạn:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Bắt đầu</p>
              <p className="text-sm font-medium">{startDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kết thúc</p>
              <p className="text-sm font-medium">{endDate}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails(contract.id!)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Chi tiết
        </Button>
        {canSign && onSign && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSign(contract.id!)}
          >
            <FileSignature className="h-4 w-4 mr-2" />
            Ký hợp đồng
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
