"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MultiStepForm, StepContent, StepNavigation } from "@/components/ui/multi-step-form"
import { Card, CardContent } from "@/components/ui/card"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useReferenceStore } from "@/stores/referenceStore"
import { CreateBlockData, PropertyRule } from "@/types/property"
import { Building, Phone, Image, FileText, Settings, Check } from "lucide-react"
import { isValidVietnamesePhone } from '@/utils/phoneValidation'

const STEPS = [
  {
    id: 'basic-info',
    title: 'Thông tin cơ bản',
    description: 'Tên và địa chỉ nhà trọ'
  },
  {
    id: 'contact',
    title: 'Thông tin liên hệ',
    description: 'Cách thức liên hệ với bạn'
  },
  {
    id: 'images',
    title: 'Hình ảnh',
    description: 'Ảnh nhà trọ và tiện ích'
  },
  {
    id: 'amenities',
    title: 'Tiện nghi',
    description: 'Các tiện ích có sẵn'
  },
  {
    id: 'rules',
    title: 'Nội quy',
    description: 'Quy định của nhà trọ'
  },
  {
    id: 'description',
    title: 'Mô tả',
    description: 'Mô tả chi tiết về nhà trọ'
  }
]

export default function AddPropertyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reference store for amenities
  const { amenities, getAmenitiesByCategory, loadReferenceData, isLoading: isLoadingAmenities } = useReferenceStore()

  // Form data
  const [formData, setFormData] = useState<Partial<CreateBlockData>>({
    name: '',
    address: {
      street: '',
      ward: '',
      district: '',
      city: ''
    },
    description: '',
    images: [],
    amenities: [],
    rules: [],
    contactInfo: {
      phone: '',
      email: '',
      facebook: '',
      zalo: ''
    }
  })

  // Load reference data on component mount
  useEffect(() => {
    if (amenities.length === 0) {
      loadReferenceData()
    }
  }, [amenities.length, loadReferenceData])

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
    setFormData(prev => {
      const parentValue = prev[parent as keyof CreateBlockData];
      const parentObj = (typeof parentValue === 'object' && parentValue !== null && !Array.isArray(parentValue))
        ? (parentValue as unknown as Record<string, unknown>)
        : {};

      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [field]: value
        }
      };
    })
    // Clear error when user starts typing
    const errorKey = `${parent}.${field}`
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0: // Basic info
        if (!formData.name?.trim()) {
          newErrors.name = 'Tên nhà trọ là bắt buộc'
        }
        if (!formData.address?.street?.trim()) {
          newErrors['address.street'] = 'Địa chỉ là bắt buộc'
        }
        if (!formData.address?.ward?.trim()) {
          newErrors['address.ward'] = 'Phường/Xã là bắt buộc'
        }
        if (!formData.address?.district?.trim()) {
          newErrors['address.district'] = 'Quận/Huyện là bắt buộc'
        }
        if (!formData.address?.city?.trim()) {
          newErrors['address.city'] = 'Tỉnh/Thành phố là bắt buộc'
        }
        break

      case 1: // Contact
        if (!formData.contactInfo?.phone?.trim()) {
          newErrors['contactInfo.phone'] = 'Số điện thoại là bắt buộc'
        } else if (!isValidVietnamesePhone(formData.contactInfo.phone.replace(/\s/g, ''))) {
          newErrors['contactInfo.phone'] = 'Số điện thoại không hợp lệ'
        }
        break

      case 2: // Images
        if (!formData.images || formData.images.length === 0) {
          newErrors.images = 'Cần ít nhất 1 hình ảnh'
        }
        break

      case 3: // Amenities - optional
        break

      case 4: // Rules - optional
        break

      case 5: // Description
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
      // TODO: Call API to create property
      console.log('Creating property:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to properties list
      router.push('/dashboard/landlord/properties')
    } catch (error) {
      console.error('Error creating property:', error)
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

  const addRule = () => {
    const newRule: Omit<PropertyRule, 'id'> = {
      title: '',
      description: '',
      type: 'allowed'
    }
    updateFormData('rules', [...(formData.rules || []), newRule])
  }

  const updateRule = (index: number, field: keyof PropertyRule, value: unknown) => {
    const newRules = [...(formData.rules || [])]
    newRules[index] = { ...newRules[index], [field]: value }
    updateFormData('rules', newRules)
  }

  const removeRule = (index: number) => {
    const newRules = [...(formData.rules || [])]
    newRules.splice(index, 1)
    updateFormData('rules', newRules)
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thêm nhà trọ mới</h1>
          <p className="text-gray-600">Tạo thông tin nhà trọ để bắt đầu cho thuê</p>
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
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Building className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                  </div>

                  <FormField>
                    <FormLabel required>Tên nhà trọ</FormLabel>
                    <Input
                      placeholder="VD: Nhà trọ ABC, Khu trọ sinh viên..."
                      value={formData.name || ''}
                      onChange={(e) => updateFormData('name', e.target.value)}
                    />
                    <FormMessage>{errors.name}</FormMessage>
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField>
                      <FormLabel required>Địa chỉ</FormLabel>
                      <Input
                        placeholder="Số nhà, tên đường"
                        value={formData.address?.street || ''}
                        onChange={(e) => updateNestedFormData('address', 'street', e.target.value)}
                      />
                      <FormMessage>{errors['address.street']}</FormMessage>
                    </FormField>

                    <FormField>
                      <FormLabel required>Phường/Xã</FormLabel>
                      <Input
                        placeholder="Phường/Xã"
                        value={formData.address?.ward || ''}
                        onChange={(e) => updateNestedFormData('address', 'ward', e.target.value)}
                      />
                      <FormMessage>{errors['address.ward']}</FormMessage>
                    </FormField>

                    <FormField>
                      <FormLabel required>Quận/Huyện</FormLabel>
                      <Input
                        placeholder="Quận/Huyện"
                        value={formData.address?.district || ''}
                        onChange={(e) => updateNestedFormData('address', 'district', e.target.value)}
                      />
                      <FormMessage>{errors['address.district']}</FormMessage>
                    </FormField>

                    <FormField>
                      <FormLabel required>Tỉnh/Thành phố</FormLabel>
                      <Input
                        placeholder="Tỉnh/Thành phố"
                        value={formData.address?.city || ''}
                        onChange={(e) => updateNestedFormData('address', 'city', e.target.value)}
                      />
                      <FormMessage>{errors['address.city']}</FormMessage>
                    </FormField>
                  </div>
                </div>
              </StepContent>

              {/* Step 2: Contact Info */}
              <StepContent step={1}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField>
                      <FormLabel required>Số điện thoại</FormLabel>
                      <Input
                        placeholder="0123456789"
                        value={formData.contactInfo?.phone || ''}
                        onChange={(e) => updateNestedFormData('contactInfo', 'phone', e.target.value)}
                      />
                      <FormMessage>{errors['contactInfo.phone']}</FormMessage>
                    </FormField>

                    <FormField>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={formData.contactInfo?.email || ''}
                        onChange={(e) => updateNestedFormData('contactInfo', 'email', e.target.value)}
                      />
                    </FormField>

                    <FormField>
                      <FormLabel>Facebook</FormLabel>
                      <Input
                        placeholder="facebook.com/username"
                        value={formData.contactInfo?.facebook || ''}
                        onChange={(e) => updateNestedFormData('contactInfo', 'facebook', e.target.value)}
                      />
                    </FormField>

                    <FormField>
                      <FormLabel>Zalo</FormLabel>
                      <Input
                        placeholder="Số Zalo"
                        value={formData.contactInfo?.zalo || ''}
                        onChange={(e) => updateNestedFormData('contactInfo', 'zalo', e.target.value)}
                      />
                    </FormField>
                  </div>
                </div>
              </StepContent>

              {/* Step 3: Images */}
              <StepContent step={2}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image className="h-5 w-5 text-primary"/>
                    <h3 className="text-lg font-semibold">Hình ảnh nhà trọ</h3>
                  </div>

                  <FormField>
                    <FormLabel required>Ảnh nhà trọ</FormLabel>
                    <ImageUpload
                      value={formData.images || []}
                      onChange={(files) => updateFormData('images', files)}
                      maxFiles={10}
                    />
                    <FormMessage>{errors.images}</FormMessage>
                  </FormField>
                </div>
              </StepContent>

              {/* Step 4: Amenities */}
              <StepContent step={3}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Tiện nghi</h3>
                  </div>

                  {isLoadingAmenities ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">Đang tải tiện ích...</div>
                    </div>
                  ) : (
                    ['basic', 'furniture', 'appliance', 'service', 'security'].map((category) => {
                      const categoryAmenities = getAmenitiesByCategory(category);
                      if (categoryAmenities.length === 0) return null;

                      return (
                        <div key={category} className="space-y-3">
                          <h4 className="font-medium text-sm text-gray-700 capitalize">
                            {category === 'basic' && 'Tiện ích cơ bản'}
                            {category === 'furniture' && 'Nội thất'}
                            {category === 'appliance' && 'Thiết bị điện'}
                            {category === 'service' && 'Dịch vụ'}
                            {category === 'security' && 'An ninh'}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {categoryAmenities.map((amenity) => (
                              <label
                                key={amenity.id}
                                className={`
                                  flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors
                                  ${(formData.amenities || []).includes(amenity.id)
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 hover:border-gray-300'
                                  }
                                `}
                              >
                                <input
                                  type="checkbox"
                                  checked={(formData.amenities || []).includes(amenity.id)}
                                  onChange={() => toggleAmenity(amenity.id)}
                                  className="sr-only"
                                />
                                <span className="text-lg">{amenity.icon || '🏠'}</span>
                                <span className="text-sm font-medium">{amenity.name}</span>
                                {(formData.amenities || []).includes(amenity.id) && (
                                  <Check className="h-4 w-4 ml-auto" />
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </StepContent>

              {/* Step 5: Rules */}
              <StepContent step={4}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Nội quy nhà trọ</h3>
                    </div>
                    <Button type="button" variant="outline" onClick={addRule}>
                      Thêm quy định
                    </Button>
                  </div>

                  {(formData.rules || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Chưa có quy định nào</p>
                      <p className="text-sm">Thêm các quy định để khách thuê biết rõ</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(formData.rules || []).map((rule, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <select
                              value={rule.type}
                              onChange={(e) => updateRule(index, 'type', e.target.value)}
                              className="px-3 py-1 border rounded text-sm"
                            >
                              <option value="allowed">Được phép</option>
                              <option value="forbidden">Không được phép</option>
                              <option value="required">Bắt buộc</option>
                            </select>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeRule(index)}
                            >
                              Xóa
                            </Button>
                          </div>
                          <Input
                            placeholder="Tiêu đề quy định"
                            value={rule.title}
                            onChange={(e) => updateRule(index, 'title', e.target.value)}
                          />
                          <Textarea
                            placeholder="Mô tả chi tiết"
                            value={rule.description}
                            onChange={(e) => updateRule(index, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </StepContent>

              {/* Step 6: Description */}
              <StepContent step={5}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Mô tả nhà trọ</h3>
                  </div>

                  <FormField>
                    <FormLabel required>Mô tả chi tiết</FormLabel>
                    <RichTextEditor
                      value={formData.description || ''}
                      onChange={(value) => updateFormData('description', value)}
                      placeholder="Mô tả chi tiết về nhà trọ, vị trí, tiện ích xung quanh..."
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
