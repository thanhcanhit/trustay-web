"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MultiStepForm, StepContent, StepNavigation } from "@/components/ui/multi-step-form"
import { Card, CardContent } from "@/components/ui/card"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateRoommatePostData } from "@/types/property"

type FormData = Partial<CreateRoommatePostData & { propertyId: string }>
import { Users, MapPin, Phone, Heart, Building, Check } from "lucide-react"
import { isValidVietnamesePhone } from '@/utils/phoneValidation'
import { useUserStore } from "@/stores/userStore"
import { mockProperties } from "@/data/mock-data"

const STEPS = [
  {
    id: 'basic-info',
    title: 'Thông tin cơ bản',
    description: 'Thông tin cá nhân và yêu cầu'
  },
  {
    id: 'property-selection',
    title: 'Chọn phòng trọ',
    description: 'Chọn phòng trọ để tìm bạn cùng ở'
  },
  {
    id: 'preferences',
    title: 'Sở thích & Yêu cầu',
    description: 'Mô tả về bản thân và yêu cầu'
  },
  {
    id: 'contact',
    title: 'Thông tin liên hệ',
    description: 'Cách thức liên hệ với bạn'
  }
]

export default function AddRoommatePostPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form data
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    authorGender: 'female',
    authorAge: undefined,
    budget: 0,
    preferredGender: undefined,
    preferredAgeRange: undefined,
    moveInDate: '',
    duration: undefined,
    propertyId: '',
    requirements: [],
    lifestyle: [],
    contactInfo: {
      phone: '',
      email: '',
      facebook: '',
      zalo: ''
    },
    images: [],
    expiresAt: ''
  })

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev: FormData) => ({
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
    setFormData((prev: FormData) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof CreateRoommatePostData] as Record<string, unknown> || {}),
        [field]: value
      }
    }))
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
        if (!formData.title?.trim()) {
          newErrors.title = 'Tiêu đề là bắt buộc'
        }
        if (!formData.authorAge || formData.authorAge <= 0) {
          newErrors.authorAge = 'Tuổi của bạn là bắt buộc'
        }
        if (!formData.budget || formData.budget <= 0) {
          newErrors.budget = 'Ngân sách phải lớn hơn 0'
        }
        if (!formData.moveInDate) {
          newErrors.moveInDate = 'Ngày chuyển vào là bắt buộc'
        }
        break

      case 1: // Property selection
        if (!formData.propertyId) {
          newErrors.propertyId = 'Vui lòng chọn phòng trọ'
        }
        break

      case 2: // Preferences
        if (!formData.description?.trim()) {
          newErrors.description = 'Mô tả là bắt buộc'
        }
        break

      case 3: // Contact
        if (!formData.contactInfo?.phone?.trim()) {
          newErrors['contactInfo.phone'] = 'Số điện thoại là bắt buộc'
        } else if (!isValidVietnamesePhone(formData.contactInfo.phone.replace(/\s/g, ''))) {
          newErrors['contactInfo.phone'] = 'Số điện thoại không hợp lệ'
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
      // TODO: Call API to create roommate post
      console.log('Creating roommate post:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to roommate posts list
      router.push('/profile/roommate')
    } catch (error) {
      console.error('Error creating roommate post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addRequirement = () => {
    const requirement = prompt('Nhập yêu cầu mới:')
    if (requirement?.trim()) {
      updateFormData('requirements', [...(formData.requirements || []), requirement.trim()])
    }
  }

  const removeRequirement = (index: number) => {
    const newRequirements = [...(formData.requirements || [])]
    newRequirements.splice(index, 1)
    updateFormData('requirements', newRequirements)
  }

  const addLifestyle = () => {
    const lifestyle = prompt('Nhập thói quen sống:')
    if (lifestyle?.trim()) {
      updateFormData('lifestyle', [...(formData.lifestyle || []), lifestyle.trim()])
    }
  }

  const removeLifestyle = (index: number) => {
    const newLifestyle = [...(formData.lifestyle || [])]
    newLifestyle.splice(index, 1)
    updateFormData('lifestyle', newLifestyle)
  }

  return (
    <DashboardLayout userType={user?.role === 'tenant' ? 'tenant' : 'landlord'}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng tìm người ở cùng</h1>
          <p className="text-gray-600">Tạo bài đăng để tìm bạn cùng phòng phù hợp</p>
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
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                  </div>

                  <FormField>
                    <FormLabel required>Tiêu đề</FormLabel>
                    <Input
                      placeholder="VD: Tìm bạn nữ ở ghép quận 1, gần trường ĐH..."
                      value={formData.title || ''}
                      onChange={(e) => updateFormData('title', e.target.value)}
                    />
                    <FormMessage>{errors.title}</FormMessage>
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField>
                      <FormLabel required>Giới tính của bạn</FormLabel>
                      <Select
                        value={formData.authorGender || 'female'}
                        onValueChange={(value) => updateFormData('authorGender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="male">Nam</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField>
                      <FormLabel required>Tuổi của bạn</FormLabel>
                      <Input
                        type="number"
                        placeholder="25"
                        value={formData.authorAge || ''}
                        onChange={(e) => updateFormData('authorAge', parseInt(e.target.value) || undefined)}
                      />
                      <FormMessage>{errors.authorAge}</FormMessage>
                    </FormField>

                    <FormField>
                      <FormLabel>Giới tính mong muốn</FormLabel>
                      <Select
                        value={formData.preferredGender || 'no-preference'}
                        onValueChange={(value) => updateFormData('preferredGender', value === 'no-preference' ? undefined : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-preference">Không yêu cầu</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="mixed">Cả hai</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField>
                      <FormLabel required>Ngân sách (VNĐ/tháng)</FormLabel>
                      <Input
                        type="number"
                        placeholder="2500000"
                        value={formData.budget || ''}
                        onChange={(e) => updateFormData('budget', parseInt(e.target.value) || 0)}
                      />
                      <FormMessage>{errors.budget}</FormMessage>
                    </FormField>

                    <FormField>
                      <FormLabel required>Ngày chuyển vào</FormLabel>
                      <Input
                        type="date"
                        value={formData.moveInDate || ''}
                        onChange={(e) => updateFormData('moveInDate', e.target.value)}
                      />
                      <FormMessage>{errors.moveInDate}</FormMessage>
                    </FormField>
                  </div>
                </div>
              </StepContent>

              {/* Step 2: Property Selection */}
              <StepContent step={1}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Building className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Chọn phòng trọ</h3>
                  </div>
                  
                  <FormField>
                    <FormLabel required>Chọn phòng trọ có sẵn</FormLabel>
                    <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                      {mockProperties.map((property) => (
                        <div
                          key={property.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            formData.propertyId === property.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => updateFormData('propertyId', property.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{property.name}</h4>
                              <p className="text-gray-600 text-sm flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {property.address}, {property.district}, {property.city}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>{property.totalRooms} phòng</span>
                                <span>•</span>
                                <span>{(property.monthlyRevenue / 1000000).toFixed(1)}M VNĐ/tháng</span>
                              </div>
                            </div>
                            {formData.propertyId === property.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage>{errors.propertyId}</FormMessage>
                  </FormField>
                </div>
              </StepContent>

              {/* Step 3: Preferences & Requirements */}
              <StepContent step={2}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Heart className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Sở thích & Yêu cầu</h3>
                  </div>

                  <FormField>
                    <FormLabel required>Mô tả chi tiết</FormLabel>
                    <RichTextEditor
                      value={formData.description || ''}
                      onChange={(value) => updateFormData('description', value)}
                      placeholder="Mô tả về bản thân, yêu cầu về bạn cùng phòng..."
                    />
                    <FormMessage>{errors.description}</FormMessage>
                  </FormField>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <FormLabel>Yêu cầu về bạn cùng phòng</FormLabel>
                      <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                        Thêm yêu cầu
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData.requirements || []).map((req: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {req}
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <FormLabel>Thói quen sống của bạn</FormLabel>
                      <Button type="button" variant="outline" size="sm" onClick={addLifestyle}>
                        Thêm thói quen
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData.lifestyle || []).map((lifestyle: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                        >
                          {lifestyle}
                          <button
                            type="button"
                            onClick={() => removeLifestyle(index)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </StepContent>

              {/* Step 4: Contact Info */}
              <StepContent step={3}>
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

                  <FormField>
                    <FormLabel>Hình ảnh (tùy chọn)</FormLabel>
                    <ImageUpload
                      value={formData.images || []}
                      onChange={(files) => updateFormData('images', files)}
                      maxFiles={5}
                    />
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