"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MultiStepForm, StepContent, StepNavigation } from "@/components/ui/multi-step-form"
import { Card, CardContent } from "@/components/ui/card"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useReferenceStore } from "@/stores/referenceStore"
import { useUserStore } from "@/stores/userStore"
import { CreateRoomData, ImageFile } from "@/types/property"
import { Phone, Camera, FileText, Settings, Check, Home, Zap, Droplets, Wifi, Wrench, DollarSign } from "lucide-react"
import { getAmenityIcon } from "@/utils/icon-mapping"

const STEPS = [
  {
    id: 'basic-info',
    title: 'Thông tin cơ bản',
    description: 'Thông tin phòng và chi phí'
  },
  {
    id: 'images-proof',
    title: 'Hình ảnh & Minh chứng',
    description: 'Ảnh phòng và các minh chứng'
  },
  {
    id: 'amenities-rules',
    title: 'Tiện nghi & Nội quy',
    description: 'Tiện ích và quy định phòng'
  },
  {
    id: 'description',
    title: 'Mô tả',
    description: 'Mô tả chi tiết về phòng'
  }
]

// Room types
const ROOM_TYPES = [
  { value: 'single', label: 'Phòng đơn' },
  { value: 'double', label: 'Phòng đôi' },
  { value: 'triple', label: 'Phòng ba' },
  { value: 'studio', label: 'Studio' },
  { value: 'apartment', label: 'Căn hộ mini' }
]

export default function AddRoomPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reference store for amenities and rules
  const { amenities, rules, loadReferenceData, isLoading: isLoadingReferences } = useReferenceStore()
  
  // User store for contact info
  const { user } = useUserStore()

  // Form data for room
  const [formData, setFormData] = useState<Partial<CreateRoomData> & { roomType?: string, roomCount?: number }>({
    roomNumber: '',
    name: '',
    area: 0,
    price: 0,
    deposit: 0,
    electricityCost: 0,
    waterCost: 0,
    internetCost: 0,
    cleaningCost: 0,
    parkingCost: 0,
    maxOccupants: 1,
    images: [] as ImageFile[],
    amenities: [],
    description: '',
    roomType: '',
    roomCount: 1
  })

  // Mock data for buildings and floors (in real app, this would come from API)
  const [buildings] = useState([
    { id: '1', name: 'Toà A - 123 Đường ABC' },
    { id: '2', name: 'Toà B - 456 Đường XYZ' },
    { id: '3', name: 'Toà C - 789 Đường DEF' }
  ])

  const [floors] = useState([
    { id: '1', buildingId: '1', floorNumber: 1, name: 'Tầng 1' },
    { id: '2', buildingId: '1', floorNumber: 2, name: 'Tầng 2' },
    { id: '3', buildingId: '1', floorNumber: 3, name: 'Tầng 3' },
    { id: '4', buildingId: '2', floorNumber: 1, name: 'Tầng 1' },
    { id: '5', buildingId: '2', floorNumber: 2, name: 'Tầng 2' }
  ])

  const [selectedBuilding, setSelectedBuilding] = useState('')
  const [selectedFloor, setSelectedFloor] = useState('')

  // Load reference data on component mount
  useEffect(() => {
    if (amenities.length === 0 || rules.length === 0) {
      loadReferenceData()
    }
  }, [amenities.length, rules.length, loadReferenceData])

  // Auto-fill contact info from user data
  useEffect(() => {
    if (user) {
      // Contact info will be automatically filled from user data
      console.log('User data loaded:', user)
    }
  }, [user])

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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0: // Basic info
        if (!formData.roomCount || formData.roomCount <= 0) {
          newErrors.roomCount = 'Số lượng phòng là bắt buộc và phải lớn hơn 0'
        }
        if (!formData.name?.trim()) {
          newErrors.name = 'Tên phòng là bắt buộc'
        }
        if (!selectedBuilding) {
          newErrors.building = 'Vui lòng chọn toà nhà'
        }
        if (!selectedFloor) {
          newErrors.floor = 'Vui lòng chọn tầng'
        }
        if (!formData.area || formData.area <= 0) {
          newErrors.area = 'Diện tích phải lớn hơn 0'
        }
        if (!formData.maxOccupants || formData.maxOccupants <= 0) {
          newErrors.maxOccupants = 'Sức chứa phải lớn hơn 0'
        }
        if (!formData.price || formData.price <= 0) {
          newErrors.price = 'Tiền thuê phải lớn hơn 0'
        }
        break

      case 1: // Images
        if (!formData.images || formData.images.length === 0) {
          newErrors.images = 'Cần ít nhất 1 hình ảnh'
        }
        break

      case 2: // Amenities + Rules - optional
        break

      case 3: // Description
        if (!formData.description?.trim()) {
          newErrors.description = 'Mô tả là bắt buộc'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsLoading(true)
    try {
      // TODO: Call API to create room
      console.log('Creating room:', {
        ...formData,
        buildingId: selectedBuilding,
        floorId: selectedFloor
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to properties list
      router.push('/dashboard/landlord/properties')
    } catch (error) {
      console.error('Error creating room:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAmenity = (amenityId: string) => {
    const currentAmenities = formData.amenities || []
    const newAmenities = currentAmenities.includes(amenityId)
      ? currentAmenities.filter(id => id !== amenityId)
      : [...currentAmenities, amenityId]
    
    updateFormData('amenities', newAmenities)
  }

  // Filter floors based on selected building
  const availableFloors = floors.filter(floor => floor.buildingId === selectedBuilding)

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thêm phòng mới</h1>
          <p className="text-gray-600">Tạo thông tin phòng để bắt đầu cho thuê</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <MultiStepForm
              steps={STEPS}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
            >
              {/* Step 1: Basic Info */}
              <StepContent step={0}>
                <div className="space-y-8">
                  {/* Basic Info Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Home className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField>
                        <FormLabel required>Số lượng phòng</FormLabel>
                        <Input
                          type="number"
                          placeholder="VD: 5"
                          value={formData.roomCount || ''}
                          onChange={(e) => updateFormData('roomCount', parseInt(e.target.value) || 1)}
                        />
                        <FormMessage>{errors.roomCount}</FormMessage>
                      </FormField>

                      <FormField>
                        <FormLabel required>Tên phòng</FormLabel>
                        <Input
                          placeholder="VD: Phòng đơn view đẹp, Studio cao cấp..."
                          value={formData.name || ''}
                          onChange={(e) => updateFormData('name', e.target.value)}
                        />
                        <FormMessage>{errors.name}</FormMessage>
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField>
                        <FormLabel required>Loại phòng</FormLabel>
                        <Select
                          value={formData.roomType || ''}
                          onValueChange={(value) => updateFormData('roomType', value)}
                        >
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
                      </FormField>

                      <FormField>
                        <FormLabel required>Toà nhà</FormLabel>
                        <Select
                          value={selectedBuilding}
                          onValueChange={setSelectedBuilding}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn toà nhà" />
                          </SelectTrigger>
                          <SelectContent>
                            {buildings.map((building) => (
                              <SelectItem key={building.id} value={building.id}>
                                {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage>{errors.building}</FormMessage>
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField>
                        <FormLabel required>Tầng</FormLabel>
                        <Select
                          value={selectedFloor}
                          onValueChange={setSelectedFloor}
                          disabled={!selectedBuilding}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tầng" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFloors.map((floor) => (
                              <SelectItem key={floor.id} value={floor.id}>
                                {floor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage>{errors.floor}</FormMessage>
                      </FormField>

                      <FormField>
                        <FormLabel required>Diện tích (m²)</FormLabel>
                        <Input
                          type="number"
                          placeholder="VD: 25"
                          value={formData.area || ''}
                          onChange={(e) => updateFormData('area', parseFloat(e.target.value) || 0)}
                        />
                        <FormMessage>{errors.area}</FormMessage>
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField>
                        <FormLabel required>Sức chứa tối đa</FormLabel>
                        <Input
                          type="number"
                          placeholder="VD: 2"
                          value={formData.maxOccupants || ''}
                          onChange={(e) => updateFormData('maxOccupants', parseInt(e.target.value) || 1)}
                        />
                        <FormMessage>{errors.maxOccupants}</FormMessage>
                      </FormField>

                      <FormField>
                        <FormLabel required>Tiền thuê (VNĐ/tháng)</FormLabel>
                        <Input
                          type="number"
                          placeholder="VD: 3000000"
                          value={formData.price || ''}
                          onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                        />
                        <FormMessage>{errors.price}</FormMessage>
                      </FormField>
                    </div>
                  </div>

                  {/* Cost Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Chi phí dịch vụ</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField>
                        <FormLabel>Tiền điện (VNĐ/kWh)</FormLabel>
                        <div className="relative">
                          <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="VD: 3500"
                            className="pl-10"
                            value={formData.electricityCost || ''}
                            onChange={(e) => updateFormData('electricityCost', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormField>

                      <FormField>
                        <FormLabel>Tiền nước (VNĐ/m³)</FormLabel>
                        <div className="relative">
                          <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="VD: 15000"
                            className="pl-10"
                            value={formData.waterCost || ''}
                            onChange={(e) => updateFormData('waterCost', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField>
                        <FormLabel>Tiền internet (VNĐ/tháng)</FormLabel>
                        <div className="relative">
                          <Wifi className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="VD: 200000"
                            className="pl-10"
                            value={formData.internetCost || ''}
                            onChange={(e) => updateFormData('internetCost', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormField>

                      <FormField>
                        <FormLabel>Tiền dịch vụ (VNĐ/tháng)</FormLabel>
                        <div className="relative">
                          <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="VD: 100000"
                            className="pl-10"
                            value={formData.cleaningCost || ''}
                            onChange={(e) => updateFormData('cleaningCost', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField>
                        <FormLabel>Tiền cọc (VNĐ)</FormLabel>
                        <Input
                          type="number"
                          placeholder="VD: 3000000"
                          value={formData.deposit || ''}
                          onChange={(e) => updateFormData('deposit', parseFloat(e.target.value) || 0)}
                        />
                      </FormField>

                      <FormField>
                        <FormLabel>Phí gửi xe (VNĐ/tháng)</FormLabel>
                        <Input
                          type="number"
                          placeholder="VD: 100000"
                          value={formData.parkingCost || ''}
                          onChange={(e) => updateFormData('parkingCost', parseFloat(e.target.value) || 0)}
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* Contact Info Section - Auto-filled from user data */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Phone className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
                      <span className="text-sm text-gray-500">(Tự động từ thông tin người dùng)</span>
                    </div>

                    {user ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField>
                          <FormLabel>Số điện thoại</FormLabel>
                          <Input
                            value={user.phone || ''}
                            disabled
                            className="bg-gray-50"
                          />
                        </FormField>

                        <FormField>
                          <FormLabel>Email</FormLabel>
                          <Input
                            value={user.email || ''}
                            disabled
                            className="bg-gray-50"
                          />
                        </FormField>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Đang tải thông tin người dùng...
                      </div>
                    )}
                  </div>
                </div>
              </StepContent>

              {/* Step 2: Images */}
              <StepContent step={1}>
                <div className="space-y-8">
                  {/* Images Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Camera className="h-5 w-5 text-primary"/>
                      <h3 className="text-lg font-semibold">Hình ảnh phòng</h3>
                    </div>

                    <FormField>
                      <FormLabel required>Ảnh phòng</FormLabel>
                      <ImageUpload
                        value={formData.images || []}
                        onChange={(files) => updateFormData('images', files)}
                        maxFiles={10}
                      />
                      <FormMessage>{errors.images}</FormMessage>
                    </FormField>
                  </div>
                </div>
              </StepContent>

              {/* Step 3: Amenities + Rules */}
              <StepContent step={2}>
                <div className="space-y-8">
                  {/* Amenities Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Settings className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Tiện nghi</h3>
                    </div>

                    {isLoadingReferences ? (
                      <div className="text-center py-8">
                        <div className="text-gray-500">Đang tải tiện ích...</div>
                      </div>
                    ) : amenities.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-500">Không có tiện ích nào</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {amenities.map((amenity) => {
                          const IconComponent = getAmenityIcon(amenity.name)
                          return (
                            <label
                              key={amenity.id}
                              className={`
                                flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors
                                ${(formData.amenities || []).includes(amenity.id)
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                }
                              `}
                            >
                              <input
                                type="checkbox"
                                checked={(formData.amenities || []).includes(amenity.id)}
                                onChange={() => toggleAmenity(amenity.id)}
                                className="sr-only"
                              />
                              <IconComponent className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                              {(formData.amenities || []).includes(amenity.id) && (
                                <Check className="h-4 w-4 ml-auto text-primary" />
                              )}
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Rules Section - Removed since Room type doesn't have rules */}
                </div>
              </StepContent>

              {/* Step 4: Description */}
              <StepContent step={3}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Mô tả phòng</h3>
                  </div>

                  <FormField>
                    <FormLabel required>Mô tả chi tiết</FormLabel>
                    <RichTextEditor
                      value={formData.description || ''}
                      onChange={(value) => updateFormData('description', value)}
                      placeholder="Mô tả chi tiết về phòng, vị trí, tiện ích xung quanh..."
                    />
                    <FormMessage>{errors.description}</FormMessage>
                  </FormField>
                </div>
              </StepContent>

              {/* Navigation */}
              <StepNavigation
                onNext={handleNext}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </MultiStepForm>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
