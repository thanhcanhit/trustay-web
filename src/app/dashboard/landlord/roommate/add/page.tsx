"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { CreateRoommatePostData} from "@/types/property"
import { Users, MapPin, Phone, Heart } from "lucide-react"
import { isValidVietnamesePhone } from '@/utils/phoneValidation'

export default function AddRoommatePostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form data
  const [formData, setFormData] = useState<Partial<CreateRoommatePostData>>({
    title: '',
    description: '',
    authorGender: 'female',
    authorAge: undefined,
    budget: 0,
    preferredGender: undefined,
    preferredAgeRange: undefined,
    moveInDate: '',
    duration: undefined,
    location: '',
    address: {
      street: '',
      ward: '',
      district: '',
      city: ''
    },
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc'
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Mô tả là bắt buộc'
    }

    if (!formData.budget || formData.budget <= 0) {
      newErrors.budget = 'Ngân sách phải lớn hơn 0'
    }

    if (!formData.moveInDate) {
      newErrors.moveInDate = 'Ngày chuyển vào là bắt buộc'
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Vị trí mong muốn là bắt buộc'
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // TODO: Call API to create roommate post
      console.log('Creating roommate post:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to roommate posts list
      router.push('/dashboard/landlord/roommate')
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
    <DashboardLayout userType="landlord">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng tìm người ở cùng</h1>
          <p className="text-gray-600">Tạo bài đăng để tìm bạn cùng phòng phù hợp</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Thông tin cơ bản</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField>
                  <FormLabel required>Tiêu đề</FormLabel>
                  <Input
                    placeholder="VD: Tìm bạn nữ ở ghép quận 1, gần trường ĐH..."
                    value={formData.title || ''}
                    onChange={(e) => updateFormData('title', e.target.value)}
                  />
                  <FormMessage>{errors.title}</FormMessage>
                </FormField>

                <FormField>
                  <FormLabel required>Mô tả chi tiết</FormLabel>
                  <RichTextEditor
                    value={formData.description || ''}
                    onChange={(value) => updateFormData('description', value)}
                    placeholder="Mô tả về bản thân, yêu cầu về bạn cùng phòng..."
                  />
                  <FormMessage>{errors.description}</FormMessage>
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField>
                    <FormLabel required>Giới tính của bạn</FormLabel>
                    <select
                      value={formData.authorGender || 'female'}
                      onChange={(e) => updateFormData('authorGender', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="female">Nữ</option>
                      <option value="male">Nam</option>
                    </select>
                  </FormField>

                  <FormField>
                    <FormLabel>Tuổi của bạn</FormLabel>
                    <Input
                      type="number"
                      placeholder="25"
                      value={formData.authorAge || ''}
                      onChange={(e) => updateFormData('authorAge', parseInt(e.target.value) || undefined)}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Giới tính mong muốn</FormLabel>
                    <select
                      value={formData.preferredGender || ''}
                      onChange={(e) => updateFormData('preferredGender', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="">Không yêu cầu</option>
                      <option value="female">Nữ</option>
                      <option value="male">Nam</option>
                      <option value="mixed">Cả hai</option>
                    </select>
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Location & Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Vị trí & Ngân sách</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <FormField>
                  <FormLabel required>Vị trí mong muốn</FormLabel>
                  <Input
                    placeholder="VD: Gần trường ĐH Kinh tế, gần bến xe..."
                    value={formData.location || ''}
                    onChange={(e) => updateFormData('location', e.target.value)}
                  />
                  <FormMessage>{errors.location}</FormMessage>
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField>
                    <FormLabel required>Quận/Huyện</FormLabel>
                    <Input
                      placeholder="Quận 1"
                      value={formData.address?.district || ''}
                      onChange={(e) => updateNestedFormData('address', 'district', e.target.value)}
                    />
                    <FormMessage>{errors['address.district']}</FormMessage>
                  </FormField>

                  <FormField>
                    <FormLabel required>Tỉnh/Thành phố</FormLabel>
                    <Input
                      placeholder="TP.HCM"
                      value={formData.address?.city || ''}
                      onChange={(e) => updateNestedFormData('address', 'city', e.target.value)}
                    />
                    <FormMessage>{errors['address.city']}</FormMessage>
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Lifestyle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <span>Yêu cầu & Thói quen</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <FormLabel>Yêu cầu về bạn cùng phòng</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                      Thêm yêu cầu
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.requirements || []).map((req, index) => (
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
                    {(formData.lifestyle || []).map((lifestyle, index) => (
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
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>Thông tin liên hệ</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh (tùy chọn)</CardTitle>
                <CardDescription>Thêm ảnh để bài đăng thu hút hơn</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={formData.images || []}
                  onChange={(files) => updateFormData('images', files)}
                  maxFiles={5}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Đang đăng..." : "Đăng bài"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
