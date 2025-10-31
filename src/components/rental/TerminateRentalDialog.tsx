"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, AlertTriangle } from "lucide-react"
import type { Rental } from "@/types/rental.types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TerminateRentalDialogProps {
  rental: Rental | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rentalId: string, data: { terminationNoticeDate: string; terminationReason: string }) => Promise<void>
  isSubmitting?: boolean
}

export function TerminateRentalDialog({
  rental,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false
}: TerminateRentalDialogProps) {
  const [terminationReason, setTerminationReason] = useState<string>("")

  const handleSubmit = async () => {
    if (!rental?.id || !terminationReason.trim()) return

    await onSubmit(rental.id, {
      terminationNoticeDate: new Date().toISOString(),
      terminationReason: terminationReason.trim()
    })

    // Reset form
    setTerminationReason("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Chấm dứt hợp đồng cho thuê
          </DialogTitle>
          <DialogDescription>
            {rental && (
              <span>
                Phòng: {rental.roomInstance?.room?.name} ({rental.roomInstance?.roomNumber}) -
                Người thuê: {rental.tenant?.firstName} {rental.tenant?.lastName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hành động này sẽ chấm dứt hợp đồng và cập nhật trạng thái phòng thành &quot;có sẵn&quot;.
            Người thuê sẽ nhận được thông báo.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="terminationReason">
            Lý do chấm dứt <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="terminationReason"
            placeholder="Vui lòng nhập lý do chấm dứt hợp đồng..."
            value={terminationReason}
            onChange={(e) => setTerminationReason(e.target.value)}
            className="min-h-[120px]"
            required
          />
          <p className="text-sm text-gray-500">
            Lý do này sẽ được gửi cho người thuê
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
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || !terminationReason.trim()}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Xác nhận chấm dứt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
