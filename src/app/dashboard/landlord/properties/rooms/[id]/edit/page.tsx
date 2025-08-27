"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MultiStepForm, StepContent, StepNavigation } from "@/components/ui/multi-step-form"
import { Card, CardContent } from "@/components/ui/card"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AmenitySelector } from "@/components/ui/amenity-selector"
import { CostTypeSelector } from "@/components/ui/cost-type-selector"
import { RuleSelector } from "@/components/ui/rule-selector"
import { useReferenceStore } from "@/stores/referenceStore"
import { getRoomById, updateRoom } from "@/actions/room.action"
import { 
  type Room,
  type UpdateRoomRequest, 
  type RoomType
} from "@/types/types"
import { Building as BuildingIcon, Home, DollarSign, Settings, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const STEPS = [
  {
    id: 'basic-info',
    title: 'Thông tin cơ bản',
    description: 'Thông tin phòng và vị trí'
  },
  {
    id: 'pricing',
    title: 'Giá cả & Chi phí',
    description: 'Giá thuê và các khoản phí'
  },
  {
    id: 'amenities-costs',
    title: 'Tiện nghi & Chi phí',
    description: 'Tiện ích và chi phí phát sinh'
  },
  {
    id: 'rules',
    title: 'Nội quy',
    description: 'Quy định và nội quy phòng'
  }
]

// Room types
const ROOM_TYPES = [
  { value: 'boarding_house', label: 'Nhà trọ' },
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'house', label: 'Nhà nguyên căn' },
  { value: 'studio', label: 'Studio' }
]

export default function EditRoomPage() {
  const params = useParams()
  const roomId = params.id as string
  
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  
  const {
    loadReferenceData,
    isLoading: isReferenceLoading
  } = useReferenceStore()

  // Form data
  const [formData, setFormData] = useState<Partial<UpdateRoomRequest>>({})

  const fetchRoomDetail = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getRoomById(roomId)
      
      if (!response.success) {
        toast.error(response.error)
        return
      }
      
      const roomData = response.data.data
      setRoom(roomData)
      
      // Initialize form with room data
      setFormData({
        name: roomData.name,
        description: roomData.description,
        roomType: roomData.roomType,
        areaSqm: roomData.areaSqm,
        maxOccupancy: roomData.maxOccupancy,
        totalRooms: roomData.totalRooms,
        floorNumber: roomData.floorNumber,
        roomNumberPrefix: roomData.roomNumberPrefix,
        roomNumberStart: roomData.roomNumberStart,
        pricing: roomData.pricing,
        amenities: roomData.amenities,
        costs: roomData.costs,
        rules: roomData.rules,
        isActive: roomData.isActive
      })
    } catch (error) {
      console.error('Error fetching room detail:', error)
      toast.error('Không thể tải thông tin phòng')
    } finally {
      setLoading(false)
    }
  }, [roomId])

  // Load reference data and room details
  useEffect(() => {
    loadReferenceData()
    if (roomId) {
      fetchRoomDetail()
    }
  }, [loadReferenceData, roomId, fetchRoomDetail])

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const updateNestedFormData = (parent: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof UpdateRoomRequest] as object,
        [field]: value
      }
    }))
  }

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (stepIndex) {
      case 0:
        if (!formData.name?.trim()) newErrors.name = 'Tên phòng là bắt buộc'
        if (!formData.roomType) newErrors.roomType = 'Loại phòng là bắt buộc'
        if (!formData.areaSqm || formData.areaSqm <= 0) newErrors.areaSqm = 'Diện tích phải lớn hơn 0'
        if (!formData.maxOccupancy || formData.maxOccupancy <= 0) newErrors.maxOccupancy = 'Sức chứa phải lớn hơn 0'
        if (!formData.totalRooms || formData.totalRooms <= 0) newErrors.totalRooms = 'Số lượng phòng phải lớn hơn 0'
        break
      case 1:
        if (!formData.pricing?.basePriceMonthly || formData.pricing.basePriceMonthly <= 0) {
          newErrors.basePriceMonthly = 'Giá thuê phải lớn hơn 0'
        }
        if (!formData.pricing?.depositAmount || formData.pricing.depositAmount < 0) {
          newErrors.depositAmount = 'Tiền cọc không được âm'
        }
        break
      case 2:
        // Amenities and costs are optional
        break
      case 3:
        // Rules are optional
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }

    if (!room) {
      toast.error('Không tìm thấy thông tin phòng')
      return
    }

    try {
      setIsLoading(true)

      // Only send changed fields
      const updateData: UpdateRoomRequest = {}
      
      if (formData.name !== room.name) updateData.name = formData.name!
      if (formData.description !== room.description) updateData.description = formData.description
      if (formData.roomType !== room.roomType) updateData.roomType = formData.roomType!
      if (formData.areaSqm !== room.areaSqm) updateData.areaSqm = formData.areaSqm!
      if (formData.maxOccupancy !== room.maxOccupancy) updateData.maxOccupancy = formData.maxOccupancy!
      if (formData.isActive !== room.isActive) updateData.isActive = formData.isActive!
      
      // Note: totalRooms can only be increased, not decreased
      if (formData.totalRooms && formData.totalRooms > room.totalRooms) {
        updateData.totalRooms = formData.totalRooms
      }
      
      // Always send pricing, amenities, costs, rules (OVERRIDE mode)
      updateData.pricing = formData.pricing!
      updateData.amenities = formData.amenities!
      updateData.costs = formData.costs!
      updateData.rules = formData.rules!

      const response = await updateRoom(room.id, updateData)
      
      if (!response.success) {
        toast.error(response.error)
        return
      }

      toast.success('Cập nhật loại phòng thành công!')
      // Refresh room data
      fetchRoomDetail()
    } catch (error) {
      console.error('Error updating room:', error)
      toast.error('Không thể cập nhật loại phòng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isReferenceLoading) {
    return (
      <DashboardLayout userType="landlord">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!room) {
    return (
      <DashboardLayout userType="landlord">
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy thông tin phòng</p>
            <Link href="/dashboard/landlord/properties/rooms">
              <Button className="mt-4">Quay lại danh sách</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/landlord/properties/rooms/${roomId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Chỉnh sửa: {room.name}</h1>
              <p className="text-gray-600">Cập nhật thông tin loại phòng</p>
            </div>
          </div>
        </div>

        <MultiStepForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        >
          {/* Step 1: Basic Info */}
          <StepContent stepIndex={0} currentStep={currentStep}>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BuildingIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField>
                    <FormLabel>Tên loại phòng <span className="text-red-500">*</span></FormLabel>
                    <Input
                      placeholder="VD: Phòng VIP"
                      value={formData.name || ''}
                      onChange={(e) => updateFormData('name', e.target.value)}
                    />
                    {errors.name && <FormMessage>{errors.name}</FormMessage>}
                  </FormField>

                  <FormField>
                    <FormLabel>Loại phòng <span className="text-red-500">*</span></FormLabel>
                    <Select value={formData.roomType} onValueChange={(value) => updateFormData('roomType', value as RoomType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.roomType && <FormMessage>{errors.roomType}</FormMessage>}
                  </FormField>
                </div>

                <FormField>
                  <FormLabel>Mô tả</FormLabel>
                  <Textarea
                    placeholder="Mô tả về loại phòng..."
                    className="min-h-[100px]"
                    value={formData.description || ''}
                    onChange={(e) => updateFormData('description', e.target.value)}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField>
                    <FormLabel>Diện tích (m²) <span className="text-red-500">*</span></FormLabel>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      placeholder="25.5"
                      value={formData.areaSqm || ''}
                      onChange={(e) => updateFormData('areaSqm', parseFloat(e.target.value) || 0)}
                    />
                    {errors.areaSqm && <FormMessage>{errors.areaSqm}</FormMessage>}
                  </FormField>

                  <FormField>
                    <FormLabel>Sức chứa <span className="text-red-500">*</span></FormLabel>
                    <Input
                      type="number"
                      min="1"
                      placeholder="2"
                      value={formData.maxOccupancy || ''}
                      onChange={(e) => updateFormData('maxOccupancy', parseInt(e.target.value) || 0)}
                    />
                    {errors.maxOccupancy && <FormMessage>{errors.maxOccupancy}</FormMessage>}
                  </FormField>

                  <FormField>
                    <FormLabel>Số lượng phòng <span className="text-red-500">*</span></FormLabel>
                    <Input
                      type="number"
                      min={room.totalRooms} // Can only increase
                      placeholder="5"
                      value={formData.totalRooms || ''}
                      onChange={(e) => updateFormData('totalRooms', parseInt(e.target.value) || 0)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Chỉ có thể tăng từ {room.totalRooms} phòng hiện tại
                    </p>
                    {errors.totalRooms && <FormMessage>{errors.totalRooms}</FormMessage>}
                  </FormField>
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Trạng thái hoạt động</FormLabel>
                    <div className="text-sm text-gray-600">
                      Cho phép hiển thị loại phòng này
                    </div>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => updateFormData('isActive', checked)}
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Một số thông tin như tầng, tiền tố số phòng không thể chỉnh sửa để đảm bảo tính nhất quán của hệ thống.
                  </p>
                </div>
              </CardContent>
            </Card>
          </StepContent>

          {/* Step 2: Pricing - Similar to create form */}
          <StepContent stepIndex={1} currentStep={currentStep}>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium">Giá cả & Chi phí</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField>
                    <FormLabel>Giá thuê hàng tháng (VNĐ) <span className="text-red-500">*</span></FormLabel>
                    <Input
                      type="number"
                      min="0"
                      placeholder="3500000"
                      value={formData.pricing?.basePriceMonthly || ''}
                      onChange={(e) => updateNestedFormData('pricing', 'basePriceMonthly', parseInt(e.target.value) || 0)}
                    />
                    {errors.basePriceMonthly && <FormMessage>{errors.basePriceMonthly}</FormMessage>}
                  </FormField>

                  <FormField>
                    <FormLabel>Tiền cọc (VNĐ) <span className="text-red-500">*</span></FormLabel>
                    <Input
                      type="number"
                      min="0"
                      placeholder="7000000"
                      value={formData.pricing?.depositAmount || ''}
                      onChange={(e) => updateNestedFormData('pricing', 'depositAmount', parseInt(e.target.value) || 0)}
                    />
                    {errors.depositAmount && <FormMessage>{errors.depositAmount}</FormMessage>}
                  </FormField>
                </div>

                {/* Rest of pricing form similar to create... */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField>
                    <FormLabel>Số tháng cọc</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      placeholder="2"
                      value={formData.pricing?.depositMonths || ''}
                      onChange={(e) => updateNestedFormData('pricing', 'depositMonths', parseInt(e.target.value) || 2)}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Thời gian thuê tối thiểu (tháng)</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      placeholder="3"
                      value={formData.pricing?.minimumStayMonths || ''}
                      onChange={(e) => updateNestedFormData('pricing', 'minimumStayMonths', parseInt(e.target.value) || 1)}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Thời gian thuê tối đa (tháng)</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      placeholder="24"
                      value={formData.pricing?.maximumStayMonths || ''}
                      onChange={(e) => updateNestedFormData('pricing', 'maximumStayMonths', parseInt(e.target.value) || 12)}
                    />
                  </FormField>
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Có thể thương lượng giá</FormLabel>
                    <div className="text-sm text-gray-600">
                      Cho phép khách hàng thương lượng giá thuê
                    </div>
                  </div>
                  <Switch
                    checked={formData.pricing?.priceNegotiable || false}
                    onCheckedChange={(checked) => updateNestedFormData('pricing', 'priceNegotiable', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </StepContent>

          {/* Step 3: Amenities & Costs - Similar to create form */}
          <StepContent stepIndex={2} currentStep={currentStep}>
            <Card>
              <CardContent className="p-6 space-y-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Home className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-medium">Tiện nghi & Chi phí</h3>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-medium mb-4">Tiện nghi</h4>
                  <AmenitySelector
                    selectedAmenities={formData.amenities || []}
                    onSelectionChange={(amenities) => updateFormData('amenities', amenities)}
                    mode="select"
                  />
                  {formData.amenities && formData.amenities.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Tiện nghi đã chọn:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary">
                            {amenity.customValue || `Amenity ${index + 1}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Costs */}
                <div>
                  <h4 className="font-medium mb-4">Chi phí phát sinh</h4>
                  <CostTypeSelector
                    selectedCostTypes={formData.costs || []}
                    onSelectionChange={(costs) => updateFormData('costs', costs)}
                    mode="select"
                  />
                </div>
              </CardContent>
            </Card>
          </StepContent>

          {/* Step 4: Rules - Similar to create form */}
          <StepContent stepIndex={3} currentStep={currentStep}>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-medium">Nội quy phòng</h3>
                </div>

                                  <RuleSelector
                    selectedRules={formData.rules || []}
                    onSelectionChange={(rules) => updateFormData('rules', rules)}
                    mode="select"
                  />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Việc thay đổi tiện nghi, chi phí và nội quy sẽ được áp dụng cho tất cả các phòng thuộc loại này.
                  </p>
                </div>
              </CardContent>
            </Card>
          </StepContent>

          {/* Navigation */}
          <StepNavigation
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isLastStep={currentStep === STEPS.length - 1}
            canProceed={true}
            isLoading={isLoading}
            prevLabel="Quay lại"
            nextLabel="Tiếp theo"
            submitLabel="Cập nhật loại phòng"
          />
        </MultiStepForm>
      </div>
    </DashboardLayout>
  )
}
