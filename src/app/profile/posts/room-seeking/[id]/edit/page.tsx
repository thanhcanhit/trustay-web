"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProfileLayout } from '@/components/profile/profile-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { AddressSelector, type AddressData } from '@/components/ui/address-selector'
import { AmenityGrid } from '@/components/ui/amenity-grid'
import { useRoomSeekingStore } from '@/stores/roomSeekingStore'
import { ROOM_TYPE_LABELS, type RoomSeekingPost } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, Home, MapPin, DollarSign, Users, ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

interface FormData {
    title: string
    description: string
    preferredProvinceId: string
    preferredDistrictId: string
    preferredWardId: string
    minBudget: string
    maxBudget: string
    currency: 'VND' | 'USD'
    preferredRoomType: 'boarding_house' | 'apartment' | 'house' | 'studio'
    occupancy: string
    moveInDate: string
    isPublic: boolean
    expiresAt: string
    amenityIds: string[]
}

export default function EditRoomSeekingPostPage() {
    const params = useParams()
    const router = useRouter()
    const postId = params.id as string

    const { loadPostDetail, updatePost } = useRoomSeekingStore()
    const [post, setPost] = useState<RoomSeekingPost | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [addressData, setAddressData] = useState<AddressData | null>(null)

    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        preferredProvinceId: '',
        preferredDistrictId: '',
        preferredWardId: '',
        minBudget: '',
        maxBudget: '',
        currency: 'VND',
        preferredRoomType: 'boarding_house',
        occupancy: '',
        moveInDate: '',
        isPublic: true,
        expiresAt: '',
        amenityIds: [],
    })

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true)
                await loadPostDetail(postId)

                // Get the loaded post from store
                const postData = useRoomSeekingStore.getState().currentPost

                if (!postData) {
                    toast.error('Không thể tải thông tin bài đăng')
                    router.push('/profile/posts/room-seeking')
                    return
                }

                setPost(postData)
                
                // Initialize form with post data
                setFormData({
                    title: postData.title,
                    description: postData.description,
                    preferredProvinceId: String(postData.preferredProvinceId),
                    preferredDistrictId: String(postData.preferredDistrictId),
                    preferredWardId: String(postData.preferredWardId),
                    minBudget: String(postData.minBudget),
                    maxBudget: String(postData.maxBudget),
                    currency: postData.currency,
                    preferredRoomType: postData.preferredRoomType,
                    occupancy: String(postData.occupancy),
                    moveInDate: postData.moveInDate,
                    isPublic: postData.isPublic,
                    expiresAt: postData.expiresAt,
                    amenityIds: postData.amenityIds || [],
                })

                // Initialize address data
                // Note: You'll need to fetch province/district/ward data based on IDs
                // This is a simplified version
                setAddressData({
                    street: '',
                    province: {
                        id: postData.preferredProvinceId,
                        name: `Tỉnh/TP ${postData.preferredProvinceId}`,
                        nameEn: null,
                        code: ''
                    },
                    district: {
                        id: postData.preferredDistrictId,
                        name: `Quận/Huyện ${postData.preferredDistrictId}`,
                        nameEn: null,
                        code: '',
                        provinceId: postData.preferredProvinceId
                    },
                    ward: {
                        id: postData.preferredWardId,
                        name: `Phường/Xã ${postData.preferredWardId}`,
                        nameEn: null,
                        code: '',
                        level: '',
                        districtId: postData.preferredDistrictId
                    }
                })
            } catch (error) {
                console.error('Error fetching post:', error)
                toast.error('Không thể tải thông tin bài đăng')
                router.push('/profile/posts/room-seeking')
            } finally {
                setLoading(false)
            }
        }

        if (postId) {
            fetchPost()
        }
    }, [postId, router, loadPostDetail])

    const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
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

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc'
        } else if (formData.title.trim().length < 10) {
            newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự'
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả là bắt buộc'
        } else if (formData.description.trim().length < 50) {
            newErrors.description = 'Mô tả phải có ít nhất 50 ký tự'
        }

        if (!formData.preferredProvinceId) {
            newErrors.preferredProvinceId = 'Vui lòng chọn tỉnh/thành phố'
        }
        if (!formData.preferredDistrictId) {
            newErrors.preferredDistrictId = 'Vui lòng chọn quận/huyện'
        }
        if (!formData.preferredWardId) {
            newErrors.preferredWardId = 'Vui lòng chọn phường/xã'
        }

        if (!formData.minBudget || Number(formData.minBudget) < 100000) {
            newErrors.minBudget = 'Ngân sách tối thiểu phải từ 100,000 VNĐ'
        }
        if (!formData.maxBudget || Number(formData.maxBudget) < 100000) {
            newErrors.maxBudget = 'Ngân sách tối đa phải từ 100,000 VNĐ'
        }
        if (Number(formData.minBudget) > Number(formData.maxBudget)) {
            newErrors.maxBudget = 'Ngân sách tối đa phải lớn hơn tối thiểu'
        }

        if (!formData.occupancy || Number(formData.occupancy) < 1) {
            newErrors.occupancy = 'Số người ở phải từ 1'
        }

        if (!formData.moveInDate) {
            newErrors.moveInDate = 'Vui lòng chọn ngày dự định vào ở'
        }
        if (!formData.expiresAt) {
            newErrors.expiresAt = 'Vui lòng chọn ngày hết hạn'
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

        try {
            setIsSubmitting(true)

            const submitData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                preferredProvinceId: Number(formData.preferredProvinceId),
                preferredDistrictId: Number(formData.preferredDistrictId),
                preferredWardId: Number(formData.preferredWardId),
                minBudget: Number(formData.minBudget),
                maxBudget: Number(formData.maxBudget),
                currency: formData.currency,
                preferredRoomType: formData.preferredRoomType,
                occupancy: Number(formData.occupancy),
                moveInDate: formData.moveInDate ? new Date(formData.moveInDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                isPublic: formData.isPublic,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amenityIds: formData.amenityIds || []
            }

            const success = await updatePost(postId, submitData)

            if (!success) {
                const error = useRoomSeekingStore.getState().formError
                toast.error(error || 'Không thể cập nhật bài đăng')
                return
            }

            toast.success('Cập nhật bài đăng thành công!')
            router.push('/profile/posts/room-seeking')
        } catch (error) {
            console.error('Error updating post:', error)
            toast.error('Không thể cập nhật bài đăng. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        router.push('/profile/posts/room-seeking')
    }

    if (loading) {
        return (
            <ProfileLayout>
                <div className="max-w-4xl mx-auto p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Đang tải thông tin bài đăng...</p>
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        )
    }

    if (!post) {
        return (
            <ProfileLayout>
                <div className="max-w-4xl mx-auto p-6">
                    <div className="text-center py-12">
                        <p className="text-gray-600">Không tìm thấy thông tin bài đăng</p>
                        <Button onClick={handleCancel} className="mt-4 cursor-pointer">
                            Quay lại danh sách
                        </Button>
                    </div>
                </div>
            </ProfileLayout>
        )
    }

    return (
        <ProfileLayout>
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-6">
                    <Button variant="ghost" onClick={handleCancel} className="mb-4 cursor-pointer">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Chỉnh sửa bài đăng tìm trọ</h1>
                    <p className="text-gray-600">Cập nhật thông tin &quot;{post.title}&quot;</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Home className="h-5 w-5" />
                                <span>Thông tin cơ bản</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField>
                                <FormLabel>
                                    Tiêu đề bài đăng <span className="text-red-500">*</span>
                                </FormLabel>
                                <Input
                                    placeholder="VD: Tìm phòng trọ gần trường ĐH Bách Khoa, giá 3-5 triệu"
                                    value={formData.title}
                                    onChange={(e) => updateFormData('title', e.target.value)}
                                    maxLength={200}
                                />
                                <div className="flex justify-between items-center">
                                    {errors.title && <FormMessage>{errors.title}</FormMessage>}
                                    <span className="text-sm text-gray-500 ml-auto">{formData.title.length}/200</span>
                                </div>
                            </FormField>

                            <FormField>
                                <FormLabel>
                                    Mô tả chi tiết <span className="text-red-500">*</span>
                                </FormLabel>
                                <Textarea
                                    placeholder="Mô tả chi tiết về nhu cầu tìm phòng của bạn..."
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => updateFormData('description', e.target.value)}
                                    maxLength={2000}
                                />
                                <div className="flex justify-between items-center">
                                    {errors.description && <FormMessage>{errors.description}</FormMessage>}
                                    <span className="text-sm text-gray-500 ml-auto">{formData.description.length}/2000</span>
                                </div>
                            </FormField>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Location Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <MapPin className="h-5 w-5" />
                                <span>Khu vực mong muốn</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField>
                                <FormLabel>
                                    Địa điểm <span className="text-red-500">*</span>
                                </FormLabel>
                                <AddressSelector
                                    value={addressData || undefined}
                                    onChange={(address) => {
                                        setAddressData(address)
                                        if (address?.province) updateFormData('preferredProvinceId', address.province.id.toString())
                                        if (address?.district) updateFormData('preferredDistrictId', address.district.id.toString())
                                        if (address?.ward) updateFormData('preferredWardId', address.ward.id.toString())
                                    }}
                                    required
                                />
                                {(errors.preferredProvinceId || errors.preferredDistrictId || errors.preferredWardId) && (
                                    <FormMessage>
                                        {errors.preferredProvinceId || errors.preferredDistrictId || errors.preferredWardId}
                                    </FormMessage>
                                )}
                            </FormField>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Budget & Room Type */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5" />
                                <span>Ngân sách & Loại phòng</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField>
                                    <FormLabel>Ngân sách tối thiểu (VNĐ) <span className="text-red-500">*</span></FormLabel>
                                    <Input
                                        type="number"
                                        min="100000"
                                        placeholder="1000000"
                                        value={formData.minBudget}
                                        onChange={(e) => updateFormData('minBudget', e.target.value)}
                                    />
                                    {errors.minBudget && <FormMessage>{errors.minBudget}</FormMessage>}
                                </FormField>

                                <FormField>
                                    <FormLabel>Ngân sách tối đa (VNĐ) <span className="text-red-500">*</span></FormLabel>
                                    <Input
                                        type="number"
                                        min="100000"
                                        placeholder="5000000"
                                        value={formData.maxBudget}
                                        onChange={(e) => updateFormData('maxBudget', e.target.value)}
                                    />
                                    {errors.maxBudget && <FormMessage>{errors.maxBudget}</FormMessage>}
                                </FormField>
                            </div>

                            <FormField>
                                <FormLabel>Loại phòng mong muốn <span className="text-red-500">*</span></FormLabel>
                                <Select
                                    value={formData.preferredRoomType}
                                    onValueChange={(value) => updateFormData('preferredRoomType', value as FormData['preferredRoomType'])}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Requirements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Yêu cầu & Tiện ích</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField>
                                <FormLabel>Số người sẽ ở <span className="text-red-500">*</span></FormLabel>
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.occupancy}
                                    onChange={(e) => updateFormData('occupancy', e.target.value)}
                                />
                                {errors.occupancy && <FormMessage>{errors.occupancy}</FormMessage>}
                            </FormField>

                            <FormField>
                                <FormLabel>Tiện ích mong muốn</FormLabel>
                                <AmenityGrid
                                    selectedAmenities={formData.amenityIds}
                                    onSelectionChange={(amenityIds) => updateFormData('amenityIds', amenityIds as string[])}
                                />
                                {formData.amenityIds.length > 0 && (
                                    <p className="text-sm text-gray-600">
                                        Đã chọn {formData.amenityIds.length} tiện ích
                                    </p>
                                )}
                            </FormField>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CalendarIcon className="h-5 w-5" />
                                <span>Thời gian</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField>
                                    <FormLabel>Ngày dự định vào ở <span className="text-red-500">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !formData.moveInDate && 'text-muted-foreground'
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.moveInDate ? (
                                                    format(new Date(formData.moveInDate), 'PPP', { locale: vi })
                                                ) : (
                                                    <span>Chọn ngày</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.moveInDate ? new Date(formData.moveInDate) : undefined}
                                                onSelect={(date) => updateFormData('moveInDate', date?.toISOString() || '')}
                                                disabled={(date) => date < new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.moveInDate && <FormMessage>{errors.moveInDate}</FormMessage>}
                                </FormField>

                                <FormField>
                                    <FormLabel>Ngày hết hạn bài đăng <span className="text-red-500">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !formData.expiresAt && 'text-muted-foreground'
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.expiresAt ? (
                                                    format(new Date(formData.expiresAt), 'PPP', { locale: vi })
                                                ) : (
                                                    <span>Chọn ngày</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.expiresAt ? new Date(formData.expiresAt) : undefined}
                                                onSelect={(date) => updateFormData('expiresAt', date?.toISOString() || '')}
                                                disabled={(date) => date < new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.expiresAt && <FormMessage>{errors.expiresAt}</FormMessage>}
                                </FormField>
                            </div>

                            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Công khai bài đăng</FormLabel>
                                    <div className="text-sm text-gray-600">
                                        Cho phép mọi người xem bài đăng của bạn
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.isPublic}
                                    onCheckedChange={(checked) => updateFormData('isPublic', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Hủy
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-green-500 hover:bg-green-600 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Cập nhật bài đăng
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </ProfileLayout>
    )
}



