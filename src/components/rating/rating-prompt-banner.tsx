"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, X } from "lucide-react"
import { useRentalStore } from "@/stores/rentalStore"
import { useRatingStore } from "@/stores/ratingStore"
import { useUserStore } from "@/stores/userStore"
import { Rental } from "@/types/types"
import Link from "next/link"

interface CompletedRentalWithoutRating {
  rental: Rental
  needsRoomRating: boolean
  needsLandlordRating: boolean
}

/**
 * Component to show banner prompting users to rate completed rentals
 * Shows for tenants who have expired/terminated rentals without ratings
 */
export function RatingPromptBanner() {
  const { user } = useUserStore()
  const { tenantRentals, loadTenantRentals } = useRentalStore()
  const { hasUserRatedTarget } = useRatingStore()

  const [completedRentalsNeedingRating, setCompletedRentalsNeedingRating] = useState<CompletedRentalWithoutRating[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)

  const checkRatings = useCallback(async () => {
    if (!user || hasLoaded) {
      return
    }

    setLoading(true)

    // Load tenant's rentals only once
    await loadTenantRentals()

    setHasLoaded(true)
  }, [user, hasLoaded, loadTenantRentals])

  // Load rentals only once
  useEffect(() => {
    checkRatings()
  }, [checkRatings])

  // Check ratings when rentals are loaded
  useEffect(() => {
    const processRatings = async () => {
      if (!hasLoaded || !tenantRentals) {
        setLoading(false)
        return
      }

      // Find completed rentals (expired or terminated)
      const completedRentals = tenantRentals.filter(
        r => r.status === 'expired' || r.status === 'terminated'
      )

      // Check each rental for missing ratings
      const needsRating: CompletedRentalWithoutRating[] = []

      for (const rental of completedRentals) {
        if (dismissed.includes(rental.id)) continue

        let needsRoomRating = false
        let needsLandlordRating = false

        // Check room rating
        if (rental.roomInstance?.roomId) {
          const hasRatedRoom = await hasUserRatedTarget('room', rental.roomInstance.roomId)
          needsRoomRating = !hasRatedRoom
        }

        // Check landlord rating
        if (rental.owner?.id) {
          const hasRatedLandlord = await hasUserRatedTarget('landlord', rental.owner.id)
          needsLandlordRating = !hasRatedLandlord
        }

        if (needsRoomRating || needsLandlordRating) {
          needsRating.push({
            rental,
            needsRoomRating,
            needsLandlordRating
          })
        }
      }

      setCompletedRentalsNeedingRating(needsRating)
      setLoading(false)
    }

    processRatings()
  }, [hasLoaded, tenantRentals, hasUserRatedTarget, dismissed])

  const handleDismiss = (rentalId: string) => {
    setDismissed(prev => [...prev, rentalId])
  }

  if (loading || completedRentalsNeedingRating.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {completedRentalsNeedingRating.map(({ rental, needsRoomRating, needsLandlordRating }) => (
        <Card key={rental.id} className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    Đánh giá trải nghiệm thuê trọ của bạn
                  </h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    Bạn đã hoàn thành thuê trọ tại{' '}
                    <span className="font-medium">
                      {rental.roomInstance?.room?.name || rental.room?.name || 'phòng'}
                    </span>
                    . Hãy chia sẻ đánh giá để giúp người khác!
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-yellow-700">
                    {needsRoomRating && <span>• Đánh giá phòng trọ</span>}
                    {needsLandlordRating && <span>• Đánh giá chủ trọ</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/profile/rate-rental/${rental.id}`}>
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                    <Star className="h-3 w-3 mr-1" />
                    Đánh giá ngay
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(rental.id)}
                  className="text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
