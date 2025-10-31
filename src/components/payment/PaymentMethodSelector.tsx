import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { CreditCard, Smartphone, Building, DollarSign, Loader2 } from 'lucide-react'

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
  amount: number
  onSelect: (method: PaymentMethod) => void
  selectedMethod?: PaymentMethod
}

export function PaymentMethodSelector({ amount, onSelect, selectedMethod }: Props) {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/methods`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMethods(data.methods || [])
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      // Set default methods if API fails
      setMethods([
        {
          id: '1',
          type: 'bank_transfer',
          name: 'Chuyển khoản ngân hàng',
          description: 'Chuyển khoản qua ngân hàng',
          fees: 0,
          icon: 'building',
          enabled: true
        },
        {
          id: '2',
          type: 'e_wallet',
          name: 'Ví điện tử',
          description: 'MoMo, ZaloPay, VNPay',
          fees: 1.5,
          icon: 'smartphone',
          enabled: true
        },
        {
          id: '3',
          type: 'card',
          name: 'Thẻ tín dụng/ghi nợ',
          description: 'Visa, Mastercard, JCB',
          fees: 2,
          icon: 'card',
          enabled: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer': return <Building size={24} />
      case 'e_wallet': return <Smartphone size={24} />
      case 'card': return <CreditCard size={24} />
      case 'cash': return <DollarSign size={24} />
      default: return <CreditCard size={24} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chọn phương thức thanh toán</h3>

      <div className="grid gap-3">
        {methods.filter(m => m.enabled).map((method) => {
          const totalAmount = amount + (amount * method.fees / 100)
          const isSelected = selectedMethod?.id === method.id

          return (
            <Card
              key={method.id}
              className={`p-4 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(method)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {getIcon(method.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{method.name}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </div>
                  {method.fees > 0 && (
                    <div className="text-sm text-gray-500">
                      (Phí: {method.fees}%)
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
