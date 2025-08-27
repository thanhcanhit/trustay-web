"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MultiStepForm, StepContent, StepNavigation } from "@/components/ui/multi-step-form"
import { Card, CardContent } from "@/components/ui/card"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AmenityGrid } from "@/components/ui/amenity-grid"
import { CostCheckboxSelector } from "@/components/ui/cost-checkbox-selector"
import { RuleGrid } from "@/components/ui/rule-grid"
import { ImageUpload } from "@/components/ui/image-upload"
import { useReferenceStore } from "@/stores/referenceStore"
import { createRoom } from "@/actions/room.action"
import { getBuildings } from "@/actions/building.action"
import { 
  type CreateRoomRequest, 
  type Building,
} from "@/types/types"
import { Building as BuildingIcon, Home, DollarSign, ArrowLeft, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { stripHtmlTags, limitTextLength } from "@/utils/textProcessing"

// Additional interfaces for form handling
interface ImageFile {
  file: File
  preview: string
  id: string
}

interface CreateRoomFormData extends CreateRoomRequest {
  images?: ImageFile[]
}

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
  },
  {
    id: 'images',
    title: 'Hình ảnh phòng',
    description: 'Hình ảnh minh họa (tùy chọn)'
  }
]

// Room types
const ROOM_TYPES = [
  { value: 'boarding_house', label: 'Nhà trọ' },
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'house', label: 'Nhà nguyên căn' },
  { value: 'studio', label: 'Studio' }
]

function AddRoomPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedBuildingId = searchParams.get('buildingId')
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [buildings, setBuildings] = useState<Building[]>([])
  
  const {
    loadReferenceData,
    isLoading: isReferenceLoading
  } = useReferenceStore()

  // Form data - using proper RoomCost format
  const [formData, setFormData] = useState<Partial<CreateRoomFormData>>({
    name: '',
    description: '',
    roomType: 'boarding_house',
    areaSqm: 0,
    maxOccupancy: 1,
    totalRooms: 1,
    floorNumber: 1,
    roomNumberPrefix: 'A',
    roomNumberStart: 101,
    pricing: {
      basePriceMonthly: 0,
      depositAmount: 0,
      depositMonths: 2,
      utilityIncluded: false,
      utilityCostMonthly: 0,
      cleaningFee: 0,
      serviceFeePercentage: 0,
      minimumStayMonths: 1,
      maximumStayMonths: 12,
      priceNegotiable: false
    },
    amenities: [],
    costs: [],
    rules: [],
    images: [],
    isActive: true
  })

  const [selectedBuildingId2, setSelectedBuildingId2] = useState(selectedBuildingId || '')

  // Load reference data and buildings
  useEffect(() => {
    loadReferenceData()
    fetchBuildings()
  }, [loadReferenceData])

  const fetchBuildings = async () => {
    try {
      const response = await getBuildings({ limit: 1000 })
      console.log('Buildings response in add page:', response)
      if (response.success && response.data.buildings && Array.isArray(response.data.buildings)) {
        setBuildings(response.data.buildings)
      } else {
        console.error('Buildings fetch failed:', !response.success ? response.error : 'Unknown error')
        setBuildings([])
      }
    } catch (error) {
      console.error('Error fetching buildings:', error)
      setBuildings([])
    }
  }

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
        ...prev[parent as keyof Partial<CreateRoomFormData>] as object,
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
        if (!selectedBuildingId2) newErrors.buildingId = 'Vui lòng chọn dãy trọ'
        
        // Validate description length (strip HTML tags first)
        if (formData.description) {
          const plainText = stripHtmlTags(formData.description)
          if (plainText.length > 1000) {
            newErrors.description = 'Mô tả không được vượt quá 1000 ký tự'
          }
        }
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
      case 3:
        // Images are optional
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

    if (!selectedBuildingId2) {
      toast.error('Vui lòng chọn dãy trọ')
      return
    }

    try {
      setIsLoading(true)

      // Prepare room data
      const roomData: CreateRoomRequest = {
        name: formData.name!,
        description: formData.description ? 
          // Strip HTML tags and limit to 1000 characters
          limitTextLength(formData.description, 1000) || undefined
          : undefined,
        roomType: formData.roomType!,
        areaSqm: parseFloat(String(formData.areaSqm!)) || 0,
        maxOccupancy: parseInt(String(formData.maxOccupancy!)) || 1,
        totalRooms: parseInt(String(formData.totalRooms!)) || 1,
        floorNumber: parseInt(String(formData.floorNumber!)) || 1,
        roomNumberPrefix: formData.roomNumberPrefix!,
        roomNumberStart: parseInt(String(formData.roomNumberStart!)) || 101,
        pricing: {
          basePriceMonthly: parseFloat(String(formData.pricing!.basePriceMonthly)) || 0,
          depositAmount: parseFloat(String(formData.pricing!.depositAmount)) || 0,
          depositMonths: parseInt(String(formData.pricing!.depositMonths)) || 2,
          utilityIncluded: Boolean(formData.pricing!.utilityIncluded),
          utilityCostMonthly: parseFloat(String(formData.pricing!.utilityCostMonthly)) || 0,
          cleaningFee: parseFloat(String(formData.pricing!.cleaningFee)) || 0,
          serviceFeePercentage: parseFloat(String(formData.pricing!.serviceFeePercentage)) || 0,
          minimumStayMonths: parseInt(String(formData.pricing!.minimumStayMonths)) || 1,
          maximumStayMonths: parseInt(String(formData.pricing!.maximumStayMonths)) || 12,
          priceNegotiable: Boolean(formData.pricing!.priceNegotiable)
        },
        amenities: formData.amenities!.map(amenity => 
          typeof amenity === 'string' 
            ? { systemAmenityId: amenity }
            : amenity
        ),
        costs: formData.costs!.map(cost => ({
          systemCostTypeId: cost.systemCostTypeId,
          value: parseFloat(String(cost.value)) || 0,
          costType: cost.costType || 'fixed' as const,
          unit: cost.unit || 'VND',
          billingCycle: cost.billingCycle || 'monthly' as const,
          includedInRent: Boolean(cost.includedInRent),
          isOptional: Boolean(cost.isOptional),
          notes: cost.notes
        })),
        rules: formData.rules!,
        isActive: Boolean(formData.isActive)
      }

      // Log data before sending to API
      console.log('📤 Sending room data to API:', JSON.stringify(roomData, null, 2))

      const response = await createRoom(selectedBuildingId2, roomData)
      
      if (!response.success) {
        // Show detailed error message if available
        let errorMessage = response.error
        if (typeof response.error === 'object' && response.error && 'message' in response.error) {
          const errorObj = response.error as { message?: string | string[] }
          if (Array.isArray(errorObj.message)) {
            errorMessage = 'Dữ liệu không hợp lệ:\n' + errorObj.message.join('\n')
          } else if (typeof errorObj.message === 'string') {
            errorMessage = errorObj.message
          }
        }
        console.error('❌ API Error:', response.error)
        toast.error(errorMessage)
        return
      }

      console.log('✅ Room created successfully:', response.data)
      toast.success('Tạo loại phòng thành công!')
      router.push(`/dashboard/landlord/properties/rooms?buildingId=${selectedBuildingId2}`)
    } catch (error) {
      console.error('❌ Error creating room:', error)
      
      // Extract meaningful error message
      let errorMessage = 'Không thể tạo loại phòng. Vui lòng thử lại.'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        if ('response' in error && typeof error.response === 'object' && error.response !== null) {
          const response = error.response as { data?: { message?: string | string[], error?: string } }
          if (response.data?.message) {
            if (Array.isArray(response.data.message)) {
              errorMessage = 'Dữ liệu không hợp lệ:\n' + response.data.message.join('\n')
            } else {
              errorMessage = response.data.message
            }
          } else if (response.data?.error) {
            errorMessage = response.data.error
          }
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isReferenceLoading) {
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

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={selectedBuildingId ? `/dashboard/landlord/properties/rooms?buildingId=${selectedBuildingId}` : '/dashboard/landlord/properties/rooms'}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thêm loại phòng mới</h1>
              <p className="text-gray-600">Tạo loại phòng và sinh ra các phòng cụ thể</p>
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

                {/* Building Selection */}
                <FormField>
                  <FormLabel>Dãy trọ <span className="text-red-500">*</span></FormLabel>
                  <Select value={selectedBuildingId2} onValueChange={setSelectedBuildingId2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dãy trọ" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.buildingId && <FormMessage>{errors.buildingId}</FormMessage>}
                </FormField>

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
                    <Select value={formData.roomType} onValueChange={(value) => updateFormData('roomType', value)}>
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
                      min="1"
                      placeholder="5"
                      value={formData.totalRooms || ''}
                      onChange={(e) => updateFormData('totalRooms', parseInt(e.target.value) || 0)}
                    />
                    {errors.totalRooms && <FormMessage>{errors.totalRooms}</FormMessage>}
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField>
                    <FormLabel>Tầng <span className="text-red-500">*</span></FormLabel>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={formData.floorNumber || ''}
                      onChange={(e) => updateFormData('floorNumber', parseInt(e.target.value) || 1)}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Tiền tố số phòng <span className="text-red-500">*</span></FormLabel>
                    <Input
                      placeholder="A"
                      value={formData.roomNumberPrefix || ''}
                      onChange={(e) => updateFormData('roomNumberPrefix', e.target.value)}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Số phòng bắt đầu <span className="text-red-500">*</span></FormLabel>
                    <Input
                      type="number"
                      min="1"
                      placeholder="101"
                      value={formData.roomNumberStart || ''}
                      onChange={(e) => updateFormData('roomNumberStart', parseInt(e.target.value) || 101)}
                    />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField>
                    <FormLabel>Chi phí tiện ích hàng tháng (VNĐ)</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      placeholder="500000"
                      value={formData.pricing?.utilityCostMonthly || ''}
                      onChange={(e) => updateNestedFormData('pricing', 'utilityCostMonthly', parseInt(e.target.value) || 0)}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Phí vệ sinh (VNĐ)</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      placeholder="200000"
                      value={formData.pricing?.cleaningFee || ''}
                      onChange={(e) => updateNestedFormData('pricing', 'cleaningFee', parseInt(e.target.value) || 0)}
                    />
                  </FormField>
                </div>

                <FormField>
                  <FormLabel>Phí dịch vụ (%)</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="5.0"
                    value={formData.pricing?.serviceFeePercentage || ''}
                    onChange={(e) => updateNestedFormData('pricing', 'serviceFeePercentage', parseFloat(e.target.value) || 0)}
                  />
                </FormField>

               

                {/* Costs Section */}
                <div>
                  <CostCheckboxSelector
                    selectedCosts={formData.costs || []}
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
                    selectedRules={formData.rules || []}
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

          {/* Step 4: Images */}
          <StepContent stepIndex={3} currentStep={currentStep}>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ImageIcon className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-medium">Hình ảnh phòng</h3>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-yellow-600 mt-0.5">ℹ️</div>
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-1">Tùy chọn</h5>
                      <p className="text-sm text-yellow-700">
                        Bạn có thể thêm hình ảnh để minh họa cho loại phòng này. 
                        Tuy nhiên, hình ảnh sẽ không được lưu vào hệ thống vì endpoint chưa xử lý dữ liệu này.
                      </p>
                    </div>
                  </div>
                </div>

                <ImageUpload
                  value={formData.images || []}
                  onChange={(images) => updateFormData('images', images)}
                  maxFiles={5}
                  accept="image/*"
                  disabled={false}
                />
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
            submitLabel="Tạo loại phòng"
          />
        </MultiStepForm>
      </div>
    </DashboardLayout>
  )
}

export default function AddRoomPage() {
  return (
    <Suspense fallback={<DashboardLayout userType="landlord"><div className="p-6">Loading...</div></DashboardLayout>}>
      <AddRoomPageContent />
    </Suspense>
  )
}
