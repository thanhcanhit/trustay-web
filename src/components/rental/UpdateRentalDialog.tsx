"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Rental, RentalStatus } from "@/types/rental.types"

interface UpdateRentalDialogProps {
  rental: Rental | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rentalId: string, data: {
    contractEndDate?: string
    monthlyRent?: string
    status?: RentalStatus
    contractDocumentUrl?: string
  }) => Promise<void>
  isSubmitting?: boolean
}

export function UpdateRentalDialog({
  rental,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false
}: UpdateRentalDialogProps) {
  const [contractEndDate, setContractEndDate] = useState<string>("")
  const [monthlyRent, setMonthlyRent] = useState<string>("")
  const [status, setStatus] = useState<RentalStatus | "">("")
  const [contractDocumentUrl, setContractDocumentUrl] = useState<string>("")

  const handleSubmit = async () => {
    if (!rental?.id) return

    const updateData: {
      contractEndDate?: string
      monthlyRent?: string
      status?: RentalStatus
      contractDocumentUrl?: string
    } = {}

    if (contractEndDate) updateData.contractEndDate = contractEndDate
    if (monthlyRent) updateData.monthlyRent = monthlyRent
    if (status) updateData.status = status as RentalStatus
    if (contractDocumentUrl) updateData.contractDocumentUrl = contractDocumentUrl

    await onSubmit(rental.id, updateData)

    // Reset form
    setContractEndDate("")
    setMonthlyRent("")
    setStatus("")
    setContractDocumentUrl("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật hợp đồng cho thuê</DialogTitle>
          <DialogDescription>
            {rental && (
              <span>
                Phòng: {rental.roomInstance?.room?.name} ({rental.roomInstance?.roomNumber})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contractEndDate">Ngày kết thúc hợp đồng</Label>
            <Input
              id="contractEndDate"
              type="date"
              value={contractEndDate}
              onChange={(e) => setContractEndDate(e.target.value)}
              min={rental?.contractStartDate ? new Date(rental.contractStartDate).toISOString().split('T')[0] : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Tiền thuê hàng tháng (VNĐ)</Label>
            <Input
              id="monthlyRent"
              type="number"
              placeholder="3000000"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as RentalStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="pending_renewal">Chờ gia hạn</SelectItem>
                <SelectItem value="terminated">Đã chấm dứt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractDocumentUrl">URL tài liệu hợp đồng</Label>
            <Input
              id="contractDocumentUrl"
              type="url"
              placeholder="https://example.com/contract.pdf"
              value={contractDocumentUrl}
              onChange={(e) => setContractDocumentUrl(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!contractEndDate && !monthlyRent && !status && !contractDocumentUrl)}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
