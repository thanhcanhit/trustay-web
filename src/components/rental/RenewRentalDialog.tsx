"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CalendarCheck } from "lucide-react"
import type { Rental } from "@/types/rental.types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RenewRentalDialogProps {
  rental: Rental | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rentalId: string, data: { newEndDate: string }) => Promise<void>
  isSubmitting?: boolean
}

export function RenewRentalDialog({
  rental,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false
}: RenewRentalDialogProps) {
  const [newEndDate, setNewEndDate] = useState<string>("")

  const handleSubmit = async () => {
    if (!rental?.id || !newEndDate) return

    await onSubmit(rental.id, { newEndDate })

    // Reset form
    setNewEndDate("")
  }

  // Get minimum date (should be after current end date)
  const getMinDate = () => {
    if (!rental?.contractEndDate) return new Date().toISOString().split('T')[0]
    const currentEndDate = new Date(rental.contractEndDate)
    currentEndDate.setDate(currentEndDate.getDate() + 1) // At least 1 day after current end date
    return currentEndDate.toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <CalendarCheck className="h-5 w-5" />
            Yêu cầu gia hạn hợp đồng
          </DialogTitle>
          <DialogDescription>
            {rental && (
              <span>
                Phòng: {rental.roomInstance?.room?.name} ({rental.roomInstance?.roomNumber})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <CalendarCheck className="h-4 w-4" />
          <AlertDescription>
            Yêu cầu gia hạn sẽ được gửi đến chủ trọ để xem xét.
            Trạng thái hợp đồng sẽ chuyển thành &quot;Chờ gia hạn&quot;.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="currentEndDate">Ngày kết thúc hiện tại</Label>
          <Input
            id="currentEndDate"
            type="text"
            value={rental?.contractEndDate
              ? new Date(rental.contractEndDate).toLocaleDateString('vi-VN')
              : 'Không xác định'}
            disabled
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newEndDate">
            Ngày kết thúc mới <span className="text-red-500">*</span>
          </Label>
          <Input
            id="newEndDate"
            type="date"
            value={newEndDate}
            onChange={(e) => setNewEndDate(e.target.value)}
            min={getMinDate()}
            required
          />
          <p className="text-sm text-gray-500">
            Chọn ngày kết thúc mới cho hợp đồng gia hạn
          </p>
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
            disabled={isSubmitting || !newEndDate}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Gửi yêu cầu gia hạn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
