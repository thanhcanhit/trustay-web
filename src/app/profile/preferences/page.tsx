"use client"

import { useState, useEffect } from 'react'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Home, DollarSign, Check, Users, UserCheck } from 'lucide-react'
import { useTenantPreferencesStore } from '@/stores/tenant-preferences.store'
import { useReferenceStore } from '@/stores/referenceStore'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import type { RoomType, Gender } from '@/types/types'

interface LocalRoomPreferences {
  preferredProvinceIds: number[]
  preferredDistrictIds: number[]
  minBudget: number
  maxBudget: number
  currency: string
  preferredRoomTypes: RoomType[]
  maxOccupancy?: number
  requiresAmenityIds: string[]
  availableFromDate?: string
  minLeaseTerm?: number
  isActive: boolean
}

interface LocalRoommatePreferences {
  preferredGender?: Gender
  preferredAgeMin?: number
  preferredAgeMax?: number
  allowsSmoking: boolean
  allowsPets: boolean
  allowsGuests: boolean
  cleanlinessLevel?: number
  socialInteractionLevel?: number
  dealBreakers: string[]
  isActive: boolean
}

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'boarding_house', label: 'Nhà trọ' },
  { value: 'dormitory', label: 'Ký túc xá' },
  { value: 'sleepbox', label: 'Sleepbox' },
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'whole_house', label: 'Nguyên căn' }
]

const DEAL_BREAKERS = [
  'Hút thuốc',
  'Nuôi thú cưng',
  'Đưa khách về thường xuyên',
  'Ồn ào về đêm',
  'Không giữ vệ sinh chung',
  'Không chia sẻ chi phí',
  'Sử dụng chung đồ dùng cá nhân'
]

export default function TenantPreferencesPage() {
  const {
    roomPreferences,
    roommatePreferences,
    isLoading,
    error,
    fetchRoomPreferences,
    fetchRoommatePreferences,
    saveRoomPreferences,
    saveRoommatePreferences,
    clearError
  } = useTenantPreferencesStore()
  const { amenities, loadReferenceData, isLoaded: isReferenceLoaded } = useReferenceStore()

  const [activeTab, setActiveTab] = useState<'room' | 'roommate'>('room')

  const [roomPrefs, setRoomPrefs] = useState<LocalRoomPreferences>({
    preferredProvinceIds: [],
    preferredDistrictIds: [],
    minBudget: 1000000,
    maxBudget: 5000000,
    currency: 'VND',
    preferredRoomTypes: [],
    maxOccupancy: undefined,
    requiresAmenityIds: [],
    availableFromDate: undefined,
    minLeaseTerm: undefined,
    isActive: true
  })

  const [roommatePrefs, setRoommatePrefs] = useState<LocalRoommatePreferences>({
    preferredGender: undefined,
    preferredAgeMin: undefined,
    preferredAgeMax: undefined,
    allowsSmoking: false,
    allowsPets: false,
    allowsGuests: false,
    cleanlinessLevel: undefined,
    socialInteractionLevel: undefined,
    dealBreakers: [],
    isActive: true
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchRoomPreferences()
    fetchRoommatePreferences()
    if (!isReferenceLoaded) {
      loadReferenceData()
    }
  }, [fetchRoomPreferences, fetchRoommatePreferences, isReferenceLoaded, loadReferenceData])

  useEffect(() => {
    if (roomPreferences) {
      setRoomPrefs({
        preferredProvinceIds: roomPreferences.preferredProvinceIds || [],
        preferredDistrictIds: roomPreferences.preferredDistrictIds || [],
        minBudget: roomPreferences.minBudget || 0,
        maxBudget: roomPreferences.maxBudget,
        currency: roomPreferences.currency || 'VND',
        preferredRoomTypes: roomPreferences.preferredRoomTypes || [],
        maxOccupancy: roomPreferences.maxOccupancy,
        requiresAmenityIds: roomPreferences.requiresAmenityIds || [],
        availableFromDate: roomPreferences.availableFromDate,
        minLeaseTerm: roomPreferences.minLeaseTerm,
        isActive: roomPreferences.isActive
      })
    }
  }, [roomPreferences])

  useEffect(() => {
    if (roommatePreferences) {
      setRoommatePrefs({
        preferredGender: roommatePreferences.preferredGender,
        preferredAgeMin: roommatePreferences.preferredAgeMin,
        preferredAgeMax: roommatePreferences.preferredAgeMax,
        allowsSmoking: roommatePreferences.allowsSmoking,
        allowsPets: roommatePreferences.allowsPets,
        allowsGuests: roommatePreferences.allowsGuests,
        cleanlinessLevel: roommatePreferences.cleanlinessLevel,
        socialInteractionLevel: roommatePreferences.socialInteractionLevel,
        dealBreakers: roommatePreferences.dealBreakers || [],
        isActive: roommatePreferences.isActive
      })
    }
  }, [roommatePreferences])

  const savePreferences = async () => {
    setSaving(true)
    setSaved(false)

    try {
      let success = false
      if (activeTab === 'room') {
        success = await saveRoomPreferences(roomPrefs)
      } else {
        // Clean up roommate preferences: convert 0 to undefined for levels
        const cleanedPrefs = {
          ...roommatePrefs,
          cleanlinessLevel: roommatePrefs.cleanlinessLevel === 0 ? undefined : roommatePrefs.cleanlinessLevel,
          socialInteractionLevel: roommatePrefs.socialInteractionLevel === 0 ? undefined : roommatePrefs.socialInteractionLevel,
        }
        success = await saveRoommatePreferences(cleanedPrefs)
      }

      if (success) {
        setSaved(true)
        toast.success('Đã lưu tùy chọn thành công')
        setTimeout(() => setSaved(false), 3000)
      } else {
        toast.error('Có lỗi xảy ra khi lưu tùy chọn')
      }
    } catch {
      toast.error('Có lỗi xảy ra khi lưu tùy chọn')
    } finally {
      setSaving(false)
    }
  }

  const toggleAmenity = (amenity: string) => {
    setRoomPrefs(prev => ({
      ...prev,
      requiresAmenityIds: prev.requiresAmenityIds.includes(amenity)
        ? prev.requiresAmenityIds.filter(a => a !== amenity)
        : [...prev.requiresAmenityIds, amenity]
    }))
  }

  const toggleRoomType = (roomType: RoomType) => {
    setRoomPrefs(prev => ({
      ...prev,
      preferredRoomTypes: prev.preferredRoomTypes.includes(roomType)
        ? prev.preferredRoomTypes.filter(t => t !== roomType)
        : [...prev.preferredRoomTypes, roomType]
    }))
  }

  const toggleDealBreaker = (dealBreaker: string) => {
    setRoommatePrefs(prev => ({
      ...prev,
      dealBreakers: prev.dealBreakers.includes(dealBreaker)
        ? prev.dealBreakers.filter(d => d !== dealBreaker)
        : [...prev.dealBreakers, dealBreaker]
    }))
  }

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Đang tải tùy chọn...</p>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sở Thích & Ưu Tiên</h1>
            <p className="text-gray-600">Cài đặt tùy chọn để nhận gợi ý phù hợp</p>
          </div>
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Đã lưu
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu tùy chọn
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>Đóng</Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'room' | 'roommate')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="room" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Sở thích về phòng
            </TabsTrigger>
            <TabsTrigger value="roommate" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Sở thích về bạn cùng phòng
            </TabsTrigger>
          </TabsList>

          {/* Room Preferences Tab */}
          <TabsContent value="room" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Budget & Room Types */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Ngân sách
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Giá tối thiểu</Label>
                      <Input
                        type="number"
                        value={roomPrefs.minBudget}
                        onChange={(e) => setRoomPrefs({ ...roomPrefs, minBudget: parseInt(e.target.value) || 0 })}
                        placeholder="1,000,000"
                      />
                    </div>
                    <div>
                      <Label>Giá tối đa</Label>
                      <Input
                        type="number"
                        value={roomPrefs.maxBudget}
                        onChange={(e) => setRoomPrefs({ ...roomPrefs, maxBudget: parseInt(e.target.value) || 0 })}
                        placeholder="5,000,000"
                      />
                    </div>
                    <div>
                      <Label>Loại tiền tệ</Label>
                      <Select
                        value={roomPrefs.currency}
                        onValueChange={(value) => setRoomPrefs({ ...roomPrefs, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VND">VND</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {roomPrefs.minBudget.toLocaleString('vi-VN')} - {roomPrefs.maxBudget.toLocaleString('vi-VN')} {roomPrefs.currency}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Loại phòng
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ROOM_TYPES.map((type) => (
                      <Badge
                        key={type.value}
                        variant={roomPrefs.preferredRoomTypes.includes(type.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleRoomType(type.value)}
                      >
                        {type.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Occupancy & Lease */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Yêu cầu khác
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Số người ở tối đa</Label>
                    <Input
                      type="number"
                      value={roomPrefs.maxOccupancy || ''}
                      onChange={(e) => setRoomPrefs({ ...roomPrefs, maxOccupancy: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="Không giới hạn"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Thời hạn thuê tối thiểu (tháng)</Label>
                    <Input
                      type="number"
                      value={roomPrefs.minLeaseTerm || ''}
                      onChange={(e) => setRoomPrefs({ ...roomPrefs, minLeaseTerm: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="Không yêu cầu"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Có thể chuyển vào từ</Label>
                    <Input
                      type="date"
                      value={roomPrefs.availableFromDate || ''}
                      onChange={(e) => setRoomPrefs({ ...roomPrefs, availableFromDate: e.target.value || undefined })}
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Tiện nghi bắt buộc</h3>
                {amenities.length === 0 ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Đang tải danh sách tiện nghi...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity) => (
                        <Badge
                          key={amenity.id}
                          variant={roomPrefs.requiresAmenityIds.includes(amenity.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleAmenity(amenity.id)}
                        >
                          {amenity.name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Lưu ý: Các tiện nghi được chọn là bắt buộc phải có trong kết quả tìm kiếm
                    </p>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Roommate Preferences Tab */}
          <TabsContent value="roommate" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Gender & Age */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Giới tính mong muốn</Label>
                    <Select
                      value={roommatePrefs.preferredGender || 'any'}
                      onValueChange={(value) => setRoommatePrefs({ ...roommatePrefs, preferredGender: value === 'any' ? undefined : value as Gender })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Không yêu cầu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Không yêu cầu</SelectItem>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Độ tuổi tối thiểu</Label>
                    <Input
                      type="number"
                      value={roommatePrefs.preferredAgeMin || ''}
                      onChange={(e) => setRoommatePrefs({ ...roommatePrefs, preferredAgeMin: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="18"
                      min="18"
                    />
                  </div>
                  <div>
                    <Label>Độ tuổi tối đa</Label>
                    <Input
                      type="number"
                      value={roommatePrefs.preferredAgeMax || ''}
                      onChange={(e) => setRoommatePrefs({ ...roommatePrefs, preferredAgeMax: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="35"
                      min="18"
                    />
                  </div>
                </div>
              </div>

              {/* Lifestyle Preferences */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Lối sống</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Chấp nhận hút thuốc</Label>
                      <p className="text-sm text-gray-500">Bạn cùng phòng có thể hút thuốc trong phòng</p>
                    </div>
                    <Switch
                      checked={roommatePrefs.allowsSmoking}
                      onCheckedChange={(checked) => setRoommatePrefs({ ...roommatePrefs, allowsSmoking: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Chấp nhận nuôi thú cưng</Label>
                      <p className="text-sm text-gray-500">Bạn cùng phòng có thể nuôi thú cưng</p>
                    </div>
                    <Switch
                      checked={roommatePrefs.allowsPets}
                      onCheckedChange={(checked) => setRoommatePrefs({ ...roommatePrefs, allowsPets: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Chấp nhận đưa khách về</Label>
                      <p className="text-sm text-gray-500">Bạn cùng phòng có thể đưa khách về</p>
                    </div>
                    <Switch
                      checked={roommatePrefs.allowsGuests}
                      onCheckedChange={(checked) => setRoommatePrefs({ ...roommatePrefs, allowsGuests: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Cleanliness & Social Level */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Mức độ ưu tiên</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Mức độ sạch sẽ</Label>
                      <span className="text-sm text-gray-500">
                        {roommatePrefs.cleanlinessLevel !== undefined ? `${roommatePrefs.cleanlinessLevel}/5` : 'Chưa thiết lập'}
                      </span>
                    </div>
                    <Slider
                      value={[roommatePrefs.cleanlinessLevel || 0]}
                      onValueChange={(value) => setRoommatePrefs({ ...roommatePrefs, cleanlinessLevel: value[0] })}
                      min={0}
                      max={5}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Không quan trọng</span>
                      <span>Rất quan trọng</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Mức độ tương tác xã hội</Label>
                      <span className="text-sm text-gray-500">
                        {roommatePrefs.socialInteractionLevel !== undefined ? `${roommatePrefs.socialInteractionLevel}/5` : 'Chưa thiết lập'}
                      </span>
                    </div>
                    <Slider
                      value={[roommatePrefs.socialInteractionLevel || 0]}
                      onValueChange={(value) => setRoommatePrefs({ ...roommatePrefs, socialInteractionLevel: value[0] })}
                      min={0}
                      max={5}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Không quan trọng</span>
                      <span>Rất quan trọng</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal Breakers */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Điều không thể chấp nhận</h3>
                <p className="text-sm text-gray-500 mb-3">Những hành vi bạn không thể chấp nhận ở bạn cùng phòng</p>
                <div className="flex flex-wrap gap-2">
                  {DEAL_BREAKERS.map((dealBreaker) => (
                    <Badge
                      key={dealBreaker}
                      variant={roommatePrefs.dealBreakers.includes(dealBreaker) ? "destructive" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDealBreaker(dealBreaker)}
                    >
                      {dealBreaker}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProfileLayout>
  )
}
