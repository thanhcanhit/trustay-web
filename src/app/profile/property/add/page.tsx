"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProfileLayout } from "@/components/profile/profile-layout"
import { MultiStepForm, StepContent, StepNavigation } from "@/components/ui/multi-step-form"
import { Card, CardContent } from "@/components/ui/card"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useReferenceStore } from "@/stores/referenceStore"
import { CreateBlockData, ImageFile } from "@/types/property"
import { Building, Phone, ImageIcon, FileText, Settings, Check } from "lucide-react"
import { isValidVietnamesePhone } from '@/utils/phoneValidation'
//import { useUserStore } from "@/stores/userStore"

const STEPS = [
  {
    id: 'basic-contact-info',
    title: 'Thông tin cơ bản & Liên hệ',
    description: 'Tên, địa chỉ nhà trọ và thông tin liên hệ'
  },
  {
    id: 'images-verification',
    title: 'Hình ảnh & Minh chứng',
    description: 'Ảnh nhà trọ và giấy tờ minh chứng'
  },
  {
    id: 'amenities-rules',
    title: 'Tiện ích & Nội quy',
    description: 'Tiện ích, quy định và mô tả chi tiết'
  }
]

export default function AddPropertyPage() {
  const router = useRouter()
  //const { user } = useUserStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reference store for amenities and rules
  const { amenities, getAmenitiesByCategory, getRulesByCategory, loadReferenceData, isLoading: isLoadingAmenities } = useReferenceStore()

  // Form data
  const [formData, setFormData] = useState<Partial<CreateBlockData & { verificationDocuments: ImageFile[] }>>({
    name: '',
    address: {
      street: '',
      ward: '',
      district: '',
      city: ''
    },
    description: '',
    images: [],
    verificationDocuments: [],
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
      case 0: // Basic info & Contact
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
        if (!formData.contactInfo?.phone?.trim()) {
          newErrors['contactInfo.phone'] = 'Số điện thoại là bắt buộc'
        } else if (!isValidVietnamesePhone(formData.contactInfo.phone.replace(/\s/g, ''))) {
          newErrors['contactInfo.phone'] = 'Số điện thoại không hợp lệ'
        }
        break

      case 1: // Images & Verification
        if (!formData.images || formData.images.length === 0) {
          newErrors.images = 'Cần ít nhất 1 hình ảnh'
        }
        break

      case 2: // Amenities & Rules & Description
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
      
      // Redirect to profile
      router.push('/profile/personal')
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

  const toggleRule = (rule: { id: string; name: string; description?: string; ruleType: string; category: string }) => {
    const currentRules = formData.rules || []
    const isSelected = currentRules.includes(rule.id)
    
    if (isSelected) {
      // Remove rule
      const newRules = currentRules.filter(id => id !== rule.id)
      updateFormData('rules', newRules)
    } else {
      // Add rule
      updateFormData('rules', [...currentRules, rule.id])
    }
  }

  return (
    <ProfileLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng tin tìm trọ</h1>
          <p className="text-gray-600">Tạo thông tin nhà trọ để bắt đầu cho thuê</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <MultiStepForm
              steps={STEPS}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
            >
              {/* Step 1: Basic Info & Contact */}
              <StepContent step={0}>
                <div className="space-y-8">
                  {/* Basic Info Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Building className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                    </div>

                    <div className="space-y-4">
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
                  </div>

                  {/* Contact Info Section */}
                  <div>
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
                </div>
              </StepContent>

              {/* Step 2: Images & Verification */}
              <StepContent step={1}>
                <div className="space-y-8">
                  {/* Property Images Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-primary"/>
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

                  {/* Verification Documents Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="h-5 w-5 text-orange-500"/>
                      <h3 className="text-lg font-semibold">Minh chứng trọ</h3>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-orange-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-orange-800">Tại sao cần minh chứng?</h4>
                          <p className="text-sm text-orange-700 mt-1">
                            Giúp xác minh tính xác thực của nhà trọ, tăng độ tin cậy và tránh lừa đảo cho người thuê.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FormField>
                      <FormLabel>Giấy tờ minh chứng (tùy chọn nhưng khuyến khích)</FormLabel>
                      <p className="text-sm text-gray-500 mb-3">
                        Sổ đỏ, giấy phép kinh doanh, hợp đồng thuê, hoặc các giấy tờ chứng minh quyền sở hữu/quản lý
                      </p>
                      <ImageUpload
                        value={formData.verificationDocuments || []}
                        onChange={(files) => updateFormData('verificationDocuments', files)}
                        maxFiles={5}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Chấp nhận: JPG, PNG, PDF. Tối đa 5 file.
                      </p>
                    </FormField>
                  </div>
                </div>
              </StepContent>

              {/* Step 3: Amenities, Rules & Description */}
              <StepContent step={2}>
                <div className="space-y-8">
                  {/* Amenities Section */}
                  <div>
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

                  {/* Rules Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Nội quy nhà trọ</h3>
                    </div>
                    
                    {isLoadingAmenities ? (
                      <div className="text-center py-8">
                        <div className="text-gray-500">Đang tải nội quy...</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {['basic', 'security', 'guest', 'payment'].map((category) => {
                          const categoryRules = getRulesByCategory(category);
                          if (categoryRules.length === 0) return null;

                          return (
                            <div key={category} className="space-y-3">
                              <h4 className="font-medium text-sm text-gray-700">
                                {category === 'basic' && 'Quy định cơ bản'}
                                {category === 'security' && 'An ninh & An toàn'}
                                {category === 'guest' && 'Khách đến thăm'}
                                {category === 'payment' && 'Thanh toán'}
                              </h4>
                              <div className="grid grid-cols-1 gap-3">
                                {categoryRules.map((rule) => (
                                  <label
                                    key={rule.id}
                                    className={`
                                      flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors
                                      ${(formData.rules || []).includes(rule.id)
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                      }
                                    `}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={(formData.rules || []).includes(rule.id)}
                                      onChange={() => toggleRule(rule)}
                                      className="sr-only"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-lg">📋</span>
                                        <span className="font-medium text-sm">{rule.name}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          rule.ruleType === 'allowed' ? 'bg-green-100 text-green-800' :
                                          rule.ruleType === 'forbidden' ? 'bg-red-100 text-red-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {rule.ruleType === 'allowed' ? 'Được phép' :
                                           rule.ruleType === 'forbidden' ? 'Cấm' : 'Bắt buộc'}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                                    </div>
                                    {(formData.rules || []).includes(rule.id) && (
                                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                    )}
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Description Section */}
                  <div>
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
    </ProfileLayout>
  )
}