"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { AddressSelector, type AddressData } from "@/components/ui/address-selector"
import { useBuildingStore } from "@/stores/buildingStore"
import { type Building, type CreateBuildingRequest, type UpdateBuildingRequest } from "@/types/types"
import { MapPin, Building as BuildingIcon, Save, X } from "lucide-react"
import { toast } from "sonner"

interface BuildingFormProps {
  building?: Building
  mode: 'create' | 'edit'
  onSuccess?: (building: Building) => void
  onCancel?: () => void
}

interface FormData {
  name: string
  description: string
  addressLine2: string
  latitude: string
  longitude: string
  isActive: boolean
}

export function BuildingForm({ building, mode, onSuccess, onCancel }: BuildingFormProps) {
  const router = useRouter()
  const { createBuilding, updateBuilding } = useBuildingStore()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [addressData, setAddressData] = useState<AddressData | null>(null)

  const [formData, setFormData] = useState<FormData>({
    name: building?.name || "",
    description: building?.description || "",
    addressLine2: building?.addressLine2 || "",
    latitude: building?.latitude?.toString() || "",
    longitude: building?.longitude?.toString() || "",
    isActive: building?.isActive ?? true,
  })

  // Initialize address data for existing building
  useEffect(() => {
    if (building) {
      setAddressData({
        street: building.addressLine1 || '',
        ward: building.ward ? {
          id: building.wardId,
          name: building.ward.name,
          nameEn: null,
          code: '',
          level: '',
          districtId: building.districtId
        } : null,
        district: building.district ? {
          id: building.districtId,
          name: building.district.name,
          nameEn: null,
          code: '',
          provinceId: building.provinceId
        } : null,
        province: building.province ? {
          id: building.provinceId,
          name: building.province.name,
          nameEn: null,
          code: ''
        } : null,
      })
    }
  }, [building])

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Tên dãy trọ là bắt buộc'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Tên dãy trọ phải có ít nhất 3 ký tự'
    }

    if (!addressData?.province) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố'
    }

    if (!addressData?.district) {
      newErrors.district = 'Vui lòng chọn quận/huyện'
    }

    if (!addressData?.ward) {
      newErrors.ward = 'Vui lòng chọn phường/xã'
    }

    if (!addressData?.street?.trim()) {
      newErrors.street = 'Địa chỉ chi tiết là bắt buộc'
    }

    if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
      newErrors.latitude = 'Vĩ độ phải là số'
    }

    if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
      newErrors.longitude = 'Kinh độ phải là số'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin nhập vào')
      return
    }

    if (!addressData?.ward || !addressData?.district || !addressData?.province) {
      toast.error('Vui lòng chọn đầy đủ thông tin địa chỉ')
      return
    }

    try {
      setLoading(true)

      const buildingData: CreateBuildingRequest | UpdateBuildingRequest = {
        name: formData.name.trim(),
        description: formData.description || undefined,
        addressLine1: addressData.street.trim(),
        addressLine2: formData.addressLine2.trim() || undefined,
        wardId: addressData.ward.id,
        districtId: addressData.district.id,
        provinceId: addressData.province.id,
        country: "Vietnam",
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        isActive: formData.isActive,
      }

      let result: Building | null
      if (mode === 'create') {
        result = await createBuilding(buildingData as CreateBuildingRequest)
        if (!result) {
          toast.error('Không thể tạo dãy trọ')
          return
        }
        toast.success('Tạo dãy trọ thành công!')
      } else {
        result = await updateBuilding(building!.id, buildingData)
        if (!result) {
          toast.error('Không thể cập nhật dãy trọ')
          return
        }
        toast.success('Cập nhật dãy trọ thành công!')
      }

      if (onSuccess) {
        onSuccess(result)
      } else {
        router.push('/dashboard/landlord/properties')
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} building:`, error)
      toast.error(`Không thể ${mode === 'create' ? 'tạo' : 'cập nhật'} dãy trọ. Vui lòng thử lại.`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BuildingIcon className="h-5 w-5" />
            <span>{mode === 'create' ? 'Thêm dãy trọ mới' : 'Chỉnh sửa dãy trọ'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
              
              <FormField>
                <FormLabel>
                  Tên dãy trọ <span className="text-red-500">*</span>
                </FormLabel>
                <Input
                  placeholder="Nhập tên dãy trọ..."
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                />
                {errors.name && <FormMessage>{errors.name}</FormMessage>}
              </FormField>

              <FormField>
                <FormLabel>
                  Mô tả <span className="text-red-500">*</span>
                </FormLabel>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => updateFormData('description', value)}
                  placeholder="Mô tả về dãy trọ..."
                  maxLength={1000}
                  showCharCount={true}
                  error={!!errors.description}
                />
                {errors.description && <FormMessage>{errors.description}</FormMessage>}
              </FormField>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Trạng thái hoạt động</FormLabel>
                  <div className="text-sm text-gray-600">
                    Cho phép hiển thị dãy trọ này trong hệ thống
                  </div>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => updateFormData('isActive', checked)}
                />
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Địa chỉ</span>
              </h3>

              <div>
                {/* <FormLabel>
                  Chọn tỉnh/thành phố, quận/huyện, phường/xã <span className="text-red-500">*</span>
                </FormLabel> */}
                <div className="mt-2">
                  <AddressSelector
                    value={addressData || undefined}
                    onChange={setAddressData}
                    required
                  />
                </div>
                {(errors.province || errors.district || errors.ward) && (
                  <FormMessage>
                    {errors.province || errors.district || errors.ward}
                  </FormMessage>
                )}
              </div>

              <FormField>
                <FormLabel>Địa chỉ bổ sung</FormLabel>
                <Input
                  placeholder="Hẻm, ngõ, khu vực..."
                  value={formData.addressLine2}
                  onChange={(e) => updateFormData('addressLine2', e.target.value)}
                />
                {errors.addressLine2 && <FormMessage>{errors.addressLine2}</FormMessage>}
              </FormField>
            </div>

            <Separator />

            {/* Location Coordinates (Optional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tọa độ địa lý (tùy chọn)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField>
                  <FormLabel>Vĩ độ (Latitude)</FormLabel>
                  <Input
                    type="number"
                    step="any"
                    placeholder="10.8231"
                    value={formData.latitude}
                    onChange={(e) => updateFormData('latitude', e.target.value)}
                  />
                  {errors.latitude && <FormMessage>{errors.latitude}</FormMessage>}
                </FormField>

                <FormField>
                  <FormLabel>Kinh độ (Longitude)</FormLabel>
                  <Input
                    type="number"
                    step="any"
                    placeholder="106.6297"
                    value={formData.longitude}
                    onChange={(e) => updateFormData('longitude', e.target.value)}
                  />
                  {errors.longitude && <FormMessage>{errors.longitude}</FormMessage>}
                </FormField>
              </div>
              
              <p className="text-sm text-gray-600">
                Tọa độ giúp xác định vị trí chính xác của dãy trọ trên bản đồ
              </p>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === 'create' ? 'Đang tạo...' : 'Đang cập nhật...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Tạo dãy trọ' : 'Lưu thay đổi'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}