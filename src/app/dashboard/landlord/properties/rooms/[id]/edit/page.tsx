"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MultiStepForm, StepContent, StepNavigation } from "@/components/ui/multi-step-form"
import { Card, CardContent } from "@/components/ui/card"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AmenityGrid } from "@/components/ui/amenity-grid"
import { CostCheckboxSelector } from "@/components/ui/cost-checkbox-selector"
import { RuleGrid } from "@/components/ui/rule-grid"
import { useReferenceStore } from "@/stores/referenceStore"
import { getRoomById, updateRoom } from "@/actions/room.action"
import { 
  type Room,
  type UpdateRoomRequest, 
  type RoomAmenity,
  type RoomCost,
  type RoomRule,
} from "@/types/types"

// Interface for update request costs (only allowed fields)
interface UpdateRoomCost {
  systemCostTypeId: string;
  value: number;
  costType: 'fixed' | 'per_unit' | 'percentage' | 'metered' | 'tiered';
  unit?: string;
  isMandatory?: boolean;
  isIncludedInRent?: boolean;
  notes?: string;
}

// Interface for update request rules (only allowed fields)
interface UpdateRoomRule {
  systemRuleId: string;
  customValue?: string;
  notes?: string;
}

// Interface for API response cost structure
interface ApiCost extends RoomCost {
  fixedAmount?: number;
  unitPrice?: number;
  baseRate?: number;
}
import { Building as BuildingIcon, Home, DollarSign, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { cleanDescriptionText } from "@/utils/textProcessing"
import { validateReferenceIds } from "@/utils/referenceValidation"
import { getRoomTypeOptions } from "@/utils/room-types"

const STEPS = [
  {
    id: 'basic-info',
    title: 'Thông tin cơ bản',
    description: 'Thông tin phòng và vị trí'
  },
  {
    id: 'pricing-costs',
    title: 'Giá cả & Chi phí phát sinh',
    description: 'Giá thuê và chi phí phát sinh'
  },
  {
    id: 'amenities-rules',
    title: 'Tiện nghi & Nội quy',
    description: 'Tiện ích và quy định phòng'
  }
]

// Room types
const ROOM_TYPES = getRoomTypeOptions()


// Helper function to convert string IDs to full objects
const convertAmenitiesToObjects = (amenities: string[] | RoomAmenity[]): RoomAmenity[] => {
  if (!Array.isArray(amenities)) return []
  
  return amenities.map(amenity => {
    if (typeof amenity === 'string') {
      const amenityData = useReferenceStore.getState().amenities.find(a => a.id === amenity)
      return {
        systemAmenityId: amenity,
        customValue: amenityData?.name || '',
        notes: ''
      }
    }
    return amenity
  })
}

const convertCostsToObjects = (costs: string[] | RoomCost[]): UpdateRoomCost[] => {
  if (!Array.isArray(costs)) return []
  
  return costs.map(cost => {
    if (typeof cost === 'string') {
      const costTypeData = useReferenceStore.getState().costTypes.find(c => c.id === cost)
      return {
        systemCostTypeId: cost,
        value: 0,
        costType: 'fixed' as const,
        unit: 'VND',
        isMandatory: true,
        isIncludedInRent: false,
        notes: costTypeData?.name || ''
      }
    }
    
    // Handle API response data with extended fields
    const apiCost = cost as ApiCost;
    const value = apiCost.fixedAmount || apiCost.unitPrice || apiCost.baseRate || parseFloat(String(cost.value)) || 0;
    
    // Return only the fields allowed by the API specification
    return {
      systemCostTypeId: cost.systemCostTypeId,
      value: value,
      costType: cost.costType || 'fixed' as const,
      unit: cost.unit || 'VND',
      isMandatory: Boolean(cost.isOptional === false),
      isIncludedInRent: Boolean(cost.includedInRent),
      notes: cost.notes || ''
    }
  })
}

const convertRulesToObjects = (rules: string[] | RoomRule[]): UpdateRoomRule[] => {
  if (!Array.isArray(rules)) return []
  
  return rules.map(rule => {
    if (typeof rule === 'string') {
      const ruleData = useReferenceStore.getState().rules.find(r => r.id === rule)
      return {
        systemRuleId: rule,
        customValue: ruleData?.name || '',
        notes: ''
      }
    }
    return {
      systemRuleId: rule.systemRuleId,
      customValue: rule.customValue || '',
      notes: rule.notes || ''
    }
  })
}

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
      
      // Initialize form with room data - only allowed fields for update
      setFormData({
        name: roomData.name,
        description: roomData.description,
        roomType: roomData.roomType,
        areaSqm: typeof roomData.areaSqm === 'string' ? parseFloat(roomData.areaSqm) : roomData.areaSqm,
        totalRooms: roomData.totalRooms,
        pricing: {
          basePriceMonthly: roomData.pricing?.basePriceMonthly,
          depositAmount: roomData.pricing?.depositAmount,
          isNegotiable: roomData.pricing?.priceNegotiable
        },
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
        // Amenities and rules are optional
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

      // Convert amenities, costs, and rules to proper format
      const amenities = convertAmenitiesToObjects(formData.amenities || [])
      const costs = convertCostsToObjects(formData.costs as RoomCost[] || [])
      const rules = convertRulesToObjects(formData.rules as RoomRule[] || [])

      // Validate reference IDs
      const selectedAmenityIds = amenities.map(a => a.systemAmenityId)
      const selectedCostTypeIds = (costs as UpdateRoomCost[]).map(c => c.systemCostTypeId)
      const selectedRuleIds = (rules as UpdateRoomRule[]).map(r => r.systemRuleId)
      
      const validation = validateReferenceIds(selectedAmenityIds, selectedCostTypeIds, selectedRuleIds)
      
      if (validation.hasErrors) {
        const errorMessages = []
        if (validation.invalidAmenityIds.length > 0) {
          errorMessages.push(`Tiện nghi không tồn tại: ${validation.invalidAmenityIds.join(', ')}`)
        }
        if (validation.invalidCostTypeIds.length > 0) {
          errorMessages.push(`Loại chi phí không tồn tại: ${validation.invalidCostTypeIds.join(', ')}`)
        }
        if (validation.invalidRuleIds.length > 0) {
          errorMessages.push(`Nội quy không tồn tại: ${validation.invalidRuleIds.join(', ')}`)
        }
        
        toast.error(errorMessages.join('\n'))
        return
      }

      // Prepare update data according to API specification - only allowed fields
      const updateData: UpdateRoomRequest = {
        name: formData.name!,
        description: formData.description ? cleanDescriptionText(formData.description) : undefined,
        roomType: formData.roomType!,
        areaSqm: formData.areaSqm!,
        totalRooms: formData.totalRooms!,
        pricing: {
          basePriceMonthly: formData.pricing?.basePriceMonthly,
          depositAmount: formData.pricing?.depositAmount,
          isNegotiable: formData.pricing?.isNegotiable
        },
        amenities: amenities,
        costs: costs,
        rules: rules,
        isActive: formData.isActive!
      }

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
              <Button className="mt-4 cursor-pointer">Quay lại danh sách</Button>
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
              <Button variant="outline" size="sm" className="cursor-pointer">
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
                    <Select
                      value={formData.roomType || ''}
                      onValueChange={(value) => updateFormData('roomType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map((roomType) => (
                          <SelectItem key={roomType.value} value={roomType.value}>
                            {roomType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.roomType && <FormMessage>{errors.roomType}</FormMessage>}
                  </FormField>
                </div>

                <FormField>
                  <FormLabel>Mô tả</FormLabel>
                  <RichTextEditor
                    value={formData.description || ''}
                    onChange={(value) => updateFormData('description', value)}
                    placeholder="Mô tả về loại phòng..."
                    maxLength={1000}
                    showCharCount={true}
                    error={!!errors.description}
                  />
                  {errors.description && <FormMessage>{errors.description}</FormMessage>}
                </FormField>

                <Separator />

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
                    <FormLabel>Sức chứa</FormLabel>
                    <Input
                      value={room?.maxOccupancy || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Sức chứa không thể thay đổi</p>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField>
                    <FormLabel>Tầng</FormLabel>
                    <Input
                      value={room?.floorNumber || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tầng không thể thay đổi</p>
                  </FormField>

                  <FormField>
                    <FormLabel>Tiền tố số phòng</FormLabel>
                    <Input
                      value={room?.roomNumberPrefix || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tiền tố số phòng không thể thay đổi</p>
                  </FormField>

                  <FormField>
                    <FormLabel>Số phòng bắt đầu</FormLabel>
                    <Input
                      value={room?.roomNumberStart || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Số phòng bắt đầu không thể thay đổi</p>
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
              </CardContent>
            </Card>
          </StepContent>

          {/* Step 2: Pricing & Costs */}
          <StepContent stepIndex={1} currentStep={currentStep}>
            <Card>
              <CardContent className="p-6 space-y-8">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium">Giá cả & Chi phí phát sinh</h3>
                </div>

                <Separator />

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

                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Giá có thể thương lượng</FormLabel>
                    <div className="text-sm text-gray-600">
                      Cho phép người thuê thương lượng giá
                    </div>
                </div>
                  <Switch
                    checked={formData.pricing?.isNegotiable || false}
                    onCheckedChange={(checked) => updateNestedFormData('pricing', 'isNegotiable', checked)}
                  />
                </div>

                {/* Costs Section */}
                <div>
                  <CostCheckboxSelector
                    selectedCosts={formData.costs as RoomCost[] || []}
                    onSelectionChange={(costs) => updateFormData('costs', costs)}
                  />
                </div>
              </CardContent> 
            </Card>
          </StepContent>

          {/* Step 3: Amenities & Rules */}
          <StepContent stepIndex={2} currentStep={currentStep}>
            <Card>
              <CardContent className="p-6 space-y-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Home className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-medium">Tiện nghi & Nội quy</h3>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h4 className="font-medium mb-4">Tiện nghi</h4>
                  <AmenityGrid
                    selectedAmenities={formData.amenities || []}
                    onSelectionChange={(amenities) => updateFormData('amenities', amenities)}
                  />
                </div>

                {/* Rules */}
                <div>
                  <h4 className="font-medium mb-4">Nội quy phòng</h4>
                  <RuleGrid
                    selectedRules={formData.rules as RoomRule[] || []}
                    onSelectionChange={(rules) => updateFormData('rules', rules)}
                  />

                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <h5 className="font-medium mb-2">Gợi ý nội quy:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Không hút thuốc trong phòng</li>
                      <li>• Không nuôi thú cưng</li>
                      <li>• Giữ yên lặng sau 22h</li>
                      <li>• Không tổ chức tiệc tùng</li>
                      <li>• Giữ gìn vệ sinh chung</li>
                    </ul>
                  </div>
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
