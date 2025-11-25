"use client"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function PaymentCancelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const billId = searchParams.get("billId")

  const handleRetry = () => {
    if (billId) {
      router.push(`/dashboard/tenant/bills?billId=${billId}`)
    } else {
      router.push("/dashboard/tenant/bills")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full shadow-lg border-orange-100">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-orange-100 p-4">
              <AlertTriangle className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Thanh toán chưa hoàn tất
          </CardTitle>
          <p className="text-gray-600">
            Bạn đã hủy quá trình thanh toán hoặc có sự cố khiến PayOS không thể xử lý giao dịch. Hóa đơn vẫn ở trạng thái chờ thanh toán.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {billId && (
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <p className="text-sm text-orange-700">
                Mã hóa đơn bị gián đoạn
              </p>
              <p className="font-semibold text-orange-900">{billId}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={handleRetry} className="gap-2">
              Thử thanh toán lại
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/dashboard/tenant/bills">
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách hóa đơn
              </Link>
            </Button>
          </div>

          <p className="text-sm text-center text-gray-500">
            Nếu bạn gặp vấn đề liên tục, vui lòng liên hệ bộ phận hỗ trợ Trustay để được giúp đỡ.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="animate-pulse">Đang tải...</div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}
