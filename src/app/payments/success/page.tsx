"use client"

import { Suspense } from "react"
import { CheckCircle2, Home, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const billId = searchParams.get("billId")

  const handleViewBill = () => {
    if (billId) {
      router.push(`/dashboard/tenant/invoices/${billId}`)
    } else {
      router.push("/dashboard/tenant/bills")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full shadow-lg border-emerald-100">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Thanh toán thành công!
          </CardTitle>
          <p className="text-gray-600">
            Cảm ơn bạn đã hoàn tất giao dịch qua PayOS. Trạng thái hóa đơn sẽ được cập nhật tự động ngay khi hệ thống nhận được xác nhận từ PayOS.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {billId && (
            <div className="p-4 bg-emerald-50 rounded-lg text-center">
              <p className="text-sm text-emerald-700">
                Mã hóa đơn liên quan
              </p>
              <p className="font-semibold text-emerald-900">{billId}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={handleViewBill} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Kiểm tra trạng thái hóa đơn
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Về trang dashboard
              </Link>
            </Button>
          </div>

          <p className="text-sm text-center text-gray-500">
            Nếu trạng thái chưa thay đổi sau vài phút, vui lòng tải lại trang hoặc liên hệ bộ phận hỗ trợ để được trợ giúp.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="animate-pulse">Đang tải...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
