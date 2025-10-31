"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreateRatingForm } from "@/components/rating"
import { ProfileLayout } from "@/components/profile/profile-layout"
import { useRentalStore } from "@/stores/rentalStore"
import { useRatingStore } from "@/stores/ratingStore"
import { useUserStore } from "@/stores/userStore"
import { Rental } from "@/types/types"
import { 
  Home, 
  User, 
  CheckCircle2, 
  Star, 
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"

export default function RateRentalPage() {
  return (
    <ProfileLayout>
      <RateRentalContent />
    </ProfileLayout>
  )
}

function RateRentalContent() {
  const params = useParams()
  const router = useRouter()
  const rentalId = params.rentalId as string

  const { user } = useUserStore()
  const { tenantRentals, loadingTenant, loadTenantRentals } = useRentalStore()
  const { hasUserRatedTarget } = useRatingStore()

  const [rental, setRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasRatedRoom, setHasRatedRoom] = useState(false)
  const [hasRatedLandlord, setHasRatedLandlord] = useState(false)
  const [activeTab, setActiveTab] = useState<'room' | 'landlord'>('room')

  // Fetch rental and check if already rated
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Load tenant rentals
      await loadTenantRentals()
      
      setLoading(false)
    }

    if (rentalId && user) {
      fetchData()
    }
  }, [rentalId, user, loadTenantRentals])

  // Find rental from loaded tenantRentals
  useEffect(() => {
    if (tenantRentals && tenantRentals.length > 0) {
      const foundRental = tenantRentals.find(r => r.id === rentalId)
      if (foundRental) {
        setRental(foundRental)
        
        // Check if already rated
        const checkRatings = async () => {
          if (foundRental.roomInstance?.roomId) {
            const roomResult = await hasUserRatedTarget('room', foundRental.roomInstance.roomId)
            setHasRatedRoom(roomResult.hasRated)
          }

          if (foundRental.owner?.id) {
            const landlordResult = await hasUserRatedTarget('landlord', foundRental.owner.id)
            setHasRatedLandlord(landlordResult.hasRated)
          }
        }
        checkRatings()
      }
    }
  }, [tenantRentals, rentalId, hasUserRatedTarget])

  // Validate rental is completed
  const isRentalCompleted = rental?.status === 'expired' || rental?.status === 'terminated'
  const isTenant = user?.id === rental?.tenantId

  const handleRoomRatingSuccess = () => {
    toast.success("Đã gửi đánh giá phòng trọ!")
    setHasRatedRoom(true)
    // Switch to landlord tab if not rated yet
    if (!hasRatedLandlord) {
      setActiveTab('landlord')
    }
  }

  const handleLandlordRatingSuccess = () => {
    toast.success("Đã gửi đánh giá chủ trọ!")
    setHasRatedLandlord(true)
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U'
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  if (loading || loadingTenant) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="text-gray-500">Đang tải thông tin...</span>
        </div>
      </div>
    )
  }

  if (!rental) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Không tìm thấy thông tin thuê trọ. Vui lòng kiểm tra lại.
        </AlertDescription>
      </Alert>
    )
  }

  if (!isTenant) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Bạn không có quyền đánh giá hợp đồng thuê này.
        </AlertDescription>
      </Alert>
    )
  }

  if (!isRentalCompleted) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Chỉ có thể đánh giá sau khi hợp đồng thuê kết thúc (hết hạn hoặc chấm dứt).
        </AlertDescription>
      </Alert>
    )
  }

  const bothRated = hasRatedRoom && hasRatedLandlord

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đánh giá trải nghiệm thuê trọ</h1>
          <p className="text-gray-600 mt-2">
            Chia sẻ đánh giá của bạn về phòng trọ và chủ trọ
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      {bothRated && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Bạn đã hoàn thành đánh giá cho cả phòng trọ và chủ trọ. Cảm ơn bạn đã chia sẻ!
          </AlertDescription>
        </Alert>
      )}

      {/* Rental Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Thông tin hợp đồng thuê
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Info */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phòng trọ</p>
                <p className="font-semibold">
                  {rental.roomInstance?.room?.name || rental.room?.name || 'N/A'}
                </p>
                {rental.roomInstance?.roomNumber && (
                  <p className="text-sm text-gray-600">Số phòng: {rental.roomInstance.roomNumber}</p>
                )}
              </div>
            </div>

            {/* Landlord Info */}
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getInitials(rental.owner?.firstName, rental.owner?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-600">Chủ trọ</p>
                <p className="font-semibold">
                  {rental.owner?.firstName} {rental.owner?.lastName}
                </p>
                <p className="text-sm text-gray-600">{rental.owner?.email}</p>
              </div>
            </div>

            {/* Rental Period */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời gian thuê</p>
                <p className="font-semibold">
                  {rental.contractStartDate && format(new Date(rental.contractStartDate), 'dd/MM/yyyy', { locale: vi })}
                  {' - '}
                  {rental.contractEndDate && format(new Date(rental.contractEndDate), 'dd/MM/yyyy', { locale: vi })}
                </p>
              </div>
            </div>

            {/* Monthly Rent */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Giá thuê</p>
                <p className="font-semibold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    parseFloat(rental.monthlyRent || '0')
                  )}/tháng
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <Badge variant={rental.status === 'expired' ? 'secondary' : 'destructive'}>
                {rental.status === 'expired' ? 'Hết hạn' : 'Đã chấm dứt'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Tabs */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('room')}
          className={`p-4 rounded-lg border-2 transition-all ${
            activeTab === 'room'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span className="font-semibold">Đánh giá phòng trọ</span>
            </div>
            {hasRatedRoom && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('landlord')}
          className={`p-4 rounded-lg border-2 transition-all ${
            activeTab === 'landlord'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-semibold">Đánh giá chủ trọ</span>
            </div>
            {hasRatedLandlord && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
          </div>
        </button>
      </div>

      {/* Rating Forms */}
      {activeTab === 'room' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Đánh giá phòng trọ
            </CardTitle>
            <CardDescription>
              Chia sẻ trải nghiệm của bạn về phòng trọ này
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasRatedRoom ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Bạn đã đánh giá phòng trọ này rồi.
                </AlertDescription>
              </Alert>
            ) : (
              <CreateRatingForm
                targetType="room"
                targetId={rental.roomInstance?.roomId || ''}
                onSuccess={handleRoomRatingSuccess}
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'landlord' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Đánh giá chủ trọ
            </CardTitle>
            <CardDescription>
              Đánh giá về thái độ và dịch vụ của chủ trọ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasRatedLandlord ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Bạn đã đánh giá chủ trọ này rồi.
                </AlertDescription>
              </Alert>
            ) : (
              <CreateRatingForm
                targetType="landlord"
                targetId={rental.owner?.id || ''}
                onSuccess={handleLandlordRatingSuccess}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {bothRated && (
        <div className="flex justify-center pt-4">
          <Button onClick={() => router.push('/profile/accommodation')} size="lg">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Hoàn tất
          </Button>
        </div>
      )}
    </div>
  )
}
