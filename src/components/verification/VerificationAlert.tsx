import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Loader2, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useVerificationStore } from '@/stores/verificationStore'

interface VerificationAlertProps {
  type: 'email' | 'phone'
  value: string
  isVerified?: boolean
  onVerificationComplete?: () => void
}

export function VerificationAlert({ type, value, isVerified = false, onVerificationComplete }: VerificationAlertProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  const { isLoading, error, sendVerificationCode, verifyCode: verifyCodeAction, clearError } = useVerificationStore()

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  if (isVerified) {
    return null
  }

  const handleSendVerificationCode = async () => {
    const success = await sendVerificationCode(type, value)
    if (success) {
      setCodeSent(true)
      toast.success(`Mã xác thực đã được gửi đến ${type === 'email' ? 'email' : 'số điện thoại'} của bạn`)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Vui lòng nhập mã xác thực 6 số')
      return
    }

    const success = await verifyCodeAction(type, value, verificationCode)
    if (success) {
      toast.success(`${type === 'email' ? 'Email' : 'Số điện thoại'} đã được xác thực thành công!`)
      setShowDialog(false)
      setVerificationCode('')
      setCodeSent(false)
      onVerificationComplete?.()
    }
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="text-sm font-medium text-green-600 hover:text-green-500 hover:underline transition-colors mt-1"
      >
        Xác thực ngay
      </button>

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
                  onClick={handleSendVerificationCode}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
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
                    onClick={handleVerifyCode}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    {isLoading ? (
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
                    onClick={handleSendVerificationCode}
                    disabled={isLoading}
                  >
                    {isLoading ? (
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
