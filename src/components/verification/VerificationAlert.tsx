import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Loader2, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'

interface VerificationAlertProps {
  type: 'email' | 'phone'
  value: string
  isVerified?: boolean
  onVerificationComplete?: () => void
}

export function VerificationAlert({ type, value, isVerified = false, onVerificationComplete }: VerificationAlertProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  if (isVerified) {
    return null
  }

  const sendVerificationCode = async () => {
    setIsSending(true)
    try {
      const token = localStorage.getItem('token')
      const endpoint = type === 'email'
        ? `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/send`
        : `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-phone/send`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [type]: value })
      })

      if (response.ok) {
        setCodeSent(true)
        toast.success(`Mã xác thực đã được gửi đến ${type === 'email' ? 'email' : 'số điện thoại'} của bạn`)
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra khi gửi mã xác thực')
      }
    } catch (error) {
      console.error('Error sending verification code:', error)
      toast.error('Có lỗi xảy ra khi gửi mã xác thực')
    } finally {
      setIsSending(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Vui lòng nhập mã xác thực 6 số')
      return
    }

    setIsVerifying(true)
    try {
      const token = localStorage.getItem('token')
      const endpoint = type === 'email'
        ? `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`
        : `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-phone`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [type]: value,
          code: verificationCode
        })
      })

      if (response.ok) {
        toast.success(`${type === 'email' ? 'Email' : 'Số điện thoại'} đã được xác thực thành công!`)
        setShowDialog(false)
        setVerificationCode('')
        setCodeSent(false)
        onVerificationComplete?.()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Mã xác thực không chính xác')
      }
    } catch (error) {
      console.error('Error verifying code:', error)
      toast.error('Có lỗi xảy ra khi xác thực')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <>
      <Alert className="border-yellow-200 bg-yellow-50 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              {type === 'email' ? 'Email' : 'Số điện thoại'} chưa được xác thực
            </AlertDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            onClick={() => setShowDialog(true)}
          >
            Xác thực ngay
          </Button>
        </div>
      </Alert>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {type === 'email' ? <Mail className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
              Xác thực {type === 'email' ? 'Email' : 'Số điện thoại'}
            </DialogTitle>
            <DialogDescription>
              Chúng tôi sẽ gửi mã xác thực đến {type === 'email' ? 'email' : 'số điện thoại'}: <strong>{value}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!codeSent ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Nhấn nút bên dưới để nhận mã xác thực
                </p>
                <Button
                  onClick={sendVerificationCode}
                  disabled={isSending}
                  className="w-full"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi mã xác thực'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Mã xác thực đã được gửi!
                  </span>
                </div>

                <div>
                  <Label>Nhập mã xác thực (6 số)</Label>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={verifyCode}
                    disabled={isVerifying || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      'Xác thực'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={sendVerificationCode}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Gửi lại'
                    )}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Không nhận được mã? Kiểm tra thư mục spam hoặc nhấn &quot;Gửi lại&quot;
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
