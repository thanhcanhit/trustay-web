"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
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
import { useRoomStore } from "@/stores/roomStore"
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
  costType: 'fixed' | 'per_person' | 'metered';
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
interface ApiCost {
  id: string;
  roomId: string;
  systemCostTypeId: string;
  costType: 'fixed' | 'per_person' | 'metered';
  // baseRate?: number | null;
  unitPrice?: number | null;
  fixedAmount?: string;
  currency: string;
  unit: string;
  minimumCharge?: number | null;
  maximumCharge?: number | null;
  isMetered: boolean;
  meterReading?: number | null;
  lastMeterReading?: number | null;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  includedInRent: boolean;
  isOptional: boolean;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  systemCostType: {
    name: string;
    nameEn: string;
    category: string;
  };
}
import { Building as BuildingIcon, Home, DollarSign } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { validateReferenceIds } from "@/utils/referenceValidation"
import { getRoomTypeOptions } from "@/utils/room-types"
import { PageHeader } from "@/components/dashboard/page-header"


// Room types
const ROOM_TYPES = getRoomTypeOptions()


// Helper function to convert string IDs to full objects
const convertAmenitiesToObjects = (amenities: string[] | RoomAmenity[]): RoomAmenity[] => {
  if (!Array.isArray(amenities)) return []

  return amenities
    .filter(amenity => amenity != null)
    .map(amenity => {
      if (typeof amenity === 'string') {
        const amenityData = useReferenceStore.getState().amenities.find(a => a.id === amenity)
        return {
          id: '',
          roomId: '',
          systemAmenityId: amenity,
          customValue: amenityData?.name || '',
          notes: '',
          createdAt: '',
          systemAmenity: {
            name: amenityData?.name || '',
            nameEn: amenityData?.name || '',
            category: amenityData?.category || ''
          }
        }
      }
      // Handle API response data - API might return 'id' instead of 'systemAmenityId'
      const apiAmenity = amenity as unknown as Record<string, unknown>;
      const systemAmenityId = amenity.systemAmenityId || apiAmenity.id as string;

      if (!systemAmenityId) {
        console.warn('Amenity missing systemAmenityId and id:', amenity)
        return null as unknown as RoomAmenity
      }

      // Convert to proper RoomAmenity format
      return {
        id: amenity.id || '',
        roomId: amenity.roomId || '',
        systemAmenityId: systemAmenityId,
        customValue: amenity.customValue || apiAmenity.name as string || '',
        notes: amenity.notes || '',
        createdAt: amenity.createdAt || '',
        systemAmenity: amenity.systemAmenity || {
          name: apiAmenity.name as string || '',
          nameEn: apiAmenity.name as string || '',
          category: apiAmenity.category as string || ''
        }
      }
    })
    .filter(amenity => amenity != null && amenity.systemAmenityId)
}

const convertCostsToObjects = (costs: string[] | RoomCost[]): UpdateRoomCost[] => {
  if (!Array.isArray(costs)) return []
  
  // Helper function to determine cost type based on name
  const determineCostType = (costTypeId: string): 'fixed' | 'per_person' | 'metered' => {
    const costTypeData = useReferenceStore.getState().costTypes.find(c => c.id === costTypeId);
    
    // If backend provides costType, use it
    if (costTypeData?.costType) {
      return costTypeData.costType;
    }
    
    // Otherwise, determine by name
    const nameLower = (costTypeData?.name || '').toLowerCase();
    
    // Metered costs (electricity, water)
    if (nameLower.includes('điện') || nameLower.includes('electric') || 
        nameLower.includes('nước') || nameLower.includes('water')) {
      return 'metered';
    }
    
    // Per person costs
    if (nameLower.includes('người')) {
      return 'per_person';
    }
    
    return 'fixed';
  };
  
  return costs
    .filter(cost => cost != null)
    .map(cost => {
      if (typeof cost === 'string') {
        const costTypeData = useReferenceStore.getState().costTypes.find(c => c.id === cost)
        return {
          systemCostTypeId: cost,
          value: 0,
          costType: determineCostType(cost),
          unit: 'VND',
          isMandatory: true,
          isIncludedInRent: false,
          notes: costTypeData?.name || ''
        }
      }

      // Handle API response data with extended fields
      const apiCost = cost as unknown as Record<string, unknown>;
      const extendedCost = cost as ApiCost;

      // API might return 'id' instead of 'systemCostTypeId'
      const systemCostTypeId = cost.systemCostTypeId || apiCost.id as string;

      let value = 0;

      // Try to extract value from different possible fields
      if (extendedCost.fixedAmount != null && extendedCost.fixedAmount !== '') {
        const parsed = parseFloat(String(extendedCost.fixedAmount));
        if (!isNaN(parsed)) value = parsed;
      } else if (extendedCost.unitPrice != null) {
        value = typeof extendedCost.unitPrice === 'number' ? extendedCost.unitPrice : parseFloat(String(extendedCost.unitPrice)) || 0;
      } else if (apiCost.value != null) {
        // Fallback to 'value' field if it exists
        value = typeof apiCost.value === 'number' ? apiCost.value : parseFloat(String(apiCost.value)) || 0;
      }

      // Return only the fields allowed by the API specification
      return {
        systemCostTypeId: systemCostTypeId,
        value: value,
        costType: cost.costType || determineCostType(systemCostTypeId) || 'fixed' as const,
        unit: cost.unit || 'VND',
        isMandatory: Boolean(cost.isOptional === false),
        isIncludedInRent: Boolean(cost.includedInRent),
        notes: cost.notes || apiCost.notes as string || ''
      }
    })
}

const convertRulesToObjects = (rules: string[] | RoomRule[]): UpdateRoomRule[] => {
  if (!Array.isArray(rules)) return []

  return rules
    .filter(rule => rule != null)
    .map(rule => {
      if (typeof rule === 'string') {
        const ruleData = useReferenceStore.getState().rules.find(r => r.id === rule)
        return {
          systemRuleId: rule,
          customValue: ruleData?.name || '',
          notes: ''
        }
      }
      // Handle API response data - API might return 'id' instead of 'systemRuleId'
      const apiRule = rule as unknown as Record<string, unknown>;
      const systemRuleId = rule.systemRuleId || apiRule.id as string;

      return {
        systemRuleId: systemRuleId,
        customValue: rule.customValue || apiRule.name as string || '',
        notes: rule.notes || ''
      }
    })
    .filter(rule => rule.systemRuleId != null && rule.systemRuleId !== '')
}

export default function EditRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const { loadRoomById, updateExistingRoom } = useRoomStore()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    loadReferenceData,
    isLoading: isReferenceLoading
  } = useReferenceStore()

  // Form data
  const [formData, setFormData] = useState<Partial<UpdateRoomRequest>>({})

  const fetchRoomDetail = useCallback(async () => {
    try {
      setLoading(true)
      const roomData = await loadRoomById(roomId)

      if (!roomData) {
        toast.error('Không tìm thấy phòng')
        return
      }

      setRoom(roomData)

      // Log raw data for debugging
      console.log('Room data from API:', {
        amenities: roomData.amenities,
        costs: roomData.costs,
        rules: roomData.rules
      });

      // Convert data to proper format
      const convertedAmenities = convertAmenitiesToObjects(roomData.amenities || []);
      const convertedCosts = convertCostsToObjects(roomData.costs || []);
      const convertedRules = convertRulesToObjects(roomData.rules || []);

      console.log('Converted data:', {
        amenities: convertedAmenities,
        costs: convertedCosts,
        rules: convertedRules
      });

      // Initialize form with room data - only allowed fields for update
      setFormData({
        name: roomData.name,
        description: roomData.description,
        roomType: roomData.roomType,
        areaSqm: typeof roomData.areaSqm === 'string' ? parseFloat(roomData.areaSqm) : roomData.areaSqm,
        totalRooms: roomData.totalRooms,
        pricing: {
          basePriceMonthly: roomData.pricing?.basePriceMonthly ? parseFloat(roomData.pricing.basePriceMonthly) : undefined,
          depositAmount: roomData.pricing?.depositAmount ? parseFloat(roomData.pricing.depositAmount) : undefined,
          isNegotiable: roomData.pricing?.priceNegotiable
        },
        amenities: convertedAmenities,
        costs: convertedCosts,
        rules: convertedRules,
        isActive: roomData.isActive
      })
    } catch (error) {
      console.error('Error fetching room detail:', error)
      toast.error('Không thể tải thông tin phòng')
    } finally {
      setLoading(false)
    }
  }, [roomId, loadRoomById])

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Basic info validation
    if (!formData.name?.trim()) newErrors.name = 'Tên phòng là bắt buộc'
    if (!formData.roomType) newErrors.roomType = 'Loại phòng là bắt buộc'
    if (!formData.areaSqm || formData.areaSqm <= 0) newErrors.areaSqm = 'Diện tích phải lớn hơn 0'
    if (!formData.totalRooms || formData.totalRooms <= 0) newErrors.totalRooms = 'Số lượng phòng phải lớn hơn 0'
    
    // Pricing validation
    if (!formData.pricing?.basePriceMonthly || formData.pricing.basePriceMonthly <= 0) {
      newErrors.basePriceMonthly = 'Giá thuê phải lớn hơn 0'
    }
    if (!formData.pricing?.depositAmount || formData.pricing.depositAmount < 0) {
      newErrors.depositAmount = 'Tiền cọc không được âm'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
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
      const amenities = convertAmenitiesToObjects(formData.amenities as (string[] | RoomAmenity[]) || [])
      const costs = convertCostsToObjects(formData.costs as (string[] | RoomCost[]) || [])
      const rules = convertRulesToObjects(formData.rules as (string[] | RoomRule[]) || [])

      // Validate reference IDs
      const selectedAmenityIds = amenities.map(a => a.systemAmenityId)
      const selectedCostTypeIds = costs.map(c => c.systemCostTypeId)
      const selectedRuleIds = rules.map(r => r.systemRuleId)
      
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
        description: formData.description || undefined,
        roomType: formData.roomType!,
        areaSqm: formData.areaSqm!,
        totalRooms: formData.totalRooms!,
        pricing: {
          basePriceMonthly: formData.pricing?.basePriceMonthly,
          depositAmount: formData.pricing?.depositAmount,
          isNegotiable: formData.pricing?.isNegotiable
        },
        amenities: amenities.map(a => ({
          systemAmenityId: a.systemAmenityId,
          customValue: a.customValue,
          notes: a.notes
        })),
        costs: costs.map(c => ({
          systemCostTypeId: c.systemCostTypeId,
          value: c.value,
          costType: c.costType,
          unit: c.unit,
          isMandatory: c.isMandatory,
          isIncludedInRent: c.isIncludedInRent,
          notes: c.notes
        })),
        rules: rules.map(r => ({
          systemRuleId: r.systemRuleId,
          customValue: r.customValue,
          notes: r.notes
        })),
        isActive: formData.isActive!
      }

      const result = await updateExistingRoom(room.id, updateData)

      if (!result) {
        toast.error('Không thể cập nhật loại phòng')
        return
      }

      toast.success('Cập nhật loại phòng thành công!')
      
      // Navigate to room detail page
      router.push(`/dashboard/landlord/properties/rooms/${room.id}`)
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
        <PageHeader
          title={`Chỉnh sửa: ${room.name}`}
          subtitle="Cập nhật thông tin loại phòng"
          backUrl={`/dashboard/landlord/properties/rooms/${roomId}`}
          backLabel="Quay lại"
        />

        <div className="space-y-6">
          {/* Basic Info Section */}
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
                    value="A" // Default prefix
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tiền tố số phòng không thể thay đổi</p>
                </FormField>

                <FormField>
                  <FormLabel>Số phòng bắt đầu</FormLabel>
                  <Input
                    value="101" // Default start number
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

          {/* Pricing & Costs Section */}
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

          {/* Amenities & Rules Section */}
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

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href={`/dashboard/landlord/properties/rooms/${roomId}`}>
              <Button variant="outline" className="cursor-pointer">
                Hủy
              </Button>
            </Link>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật loại phòng'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
