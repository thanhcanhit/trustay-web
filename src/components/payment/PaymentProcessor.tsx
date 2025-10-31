import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'bank_transfer' | 'e_wallet' | 'card' | 'cash'
  name: string
  description: string
  fees: number
  icon: string
  enabled: boolean
}

interface Props {
  billId: string
  amount: number
  paymentMethod: PaymentMethod
  onSuccess: () => void
  onError: (error: string) => void
}

export function PaymentProcessor({ billId, amount, paymentMethod, onSuccess, onError }: Props) {
  const [processing, setProcessing] = useState(false)
  const [reference, setReference] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')

  const processPayment = async () => {
    setProcessing(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bill_id: billId,
          amount,
          payment_method: paymentMethod.type,
          details: {
            reference,
            method_id: paymentMethod.id,
            card_number: cardNumber,
            card_expiry: cardExpiry,
            card_cvv: cardCvv,
            card_name: cardName
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        if (data.requires_confirmation) {
          // Show confirmation UI
          setProcessing(false)
          // Handle 3D secure or similar
        } else {
          onSuccess()
        }
      } else {
        onError(data.message || 'Thanh toán thất bại')
      }
    } catch {
      onError('Có lỗi xảy ra khi xử lý thanh toán')
    } finally {
      setProcessing(false)
    }
  }

  const renderPaymentForm = () => {
    switch (paymentMethod.type) {
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vui lòng chuyển khoản vào tài khoản sau và nhập mã tham chiếu:
              </AlertDescription>
            </Alert>

            <Card className="p-4 bg-gray-50">
              <div className="space-y-2 text-sm">
                <div><strong>Ngân hàng:</strong> Vietcombank</div>
                <div><strong>Số tài khoản:</strong> 1234567890</div>
                <div><strong>Chủ tài khoản:</strong> TRUSTAY VIETNAM</div>
                <div><strong>Số tiền:</strong> {amount.toLocaleString('vi-VN')} đ</div>
                <div><strong>Nội dung:</strong> BILL-{billId.slice(0, 8)}</div>
              </div>
            </Card>

            <Input
              placeholder="Mã tham chiếu giao dịch"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        )

      case 'e_wallet':
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Quét mã QR hoặc nhập số điện thoại ví điện tử
              </AlertDescription>
            </Alert>

            <div className="text-center">
              {/* QR Code component here */}
              <div className="w-48 h-48 bg-gray-200 mx-auto mb-4 flex items-center justify-center rounded-lg">
                <div className="text-gray-500 text-sm">QR Code</div>
              </div>
              <p className="text-sm text-gray-600">
                Quét mã QR với ứng dụng ví điện tử của bạn
              </p>
            </div>

            <Input
              placeholder="Hoặc nhập mã tham chiếu"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        )

      case 'card':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Số thẻ"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength={16}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                maxLength={5}
              />
              <Input
                placeholder="CVV"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                maxLength={3}
                type="password"
              />
            </div>
            <Input
              placeholder="Tên trên thẻ"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>
        )

      case 'cash':
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vui lòng thanh toán trực tiếp với chủ nhà
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Thanh toán {amount.toLocaleString('vi-VN')} đ
        </h3>
        <p className="text-gray-600">
          Phương thức: {paymentMethod.name}
        </p>
      </div>

      {renderPaymentForm()}

      <Button
        onClick={processPayment}
        disabled={processing}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <Loader className="animate-spin mr-2" size={20} />
            Đang xử lý...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2" size={20} />
            Xác nhận thanh toán
          </>
        )}
      </Button>
    </div>
  )
}
