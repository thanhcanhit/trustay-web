'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { AddressSelector } from '@/components/ui/address-selector'
import { ImageUpload } from '@/components/ui/image-upload'
import { AmenityGrid } from '@/components/ui/amenity-grid'
import { RuleGrid } from '@/components/ui/rule-grid'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { CreateRentalPostData } from '@/types'

interface RentalPostFormProps {
	onBack: () => void
}

const steps = [
	{ id: 1, title: 'Thông tin cơ bản', description: 'Tiêu đề và mô tả' },
	{ id: 2, title: 'Hình ảnh', description: 'Tải lên ảnh phòng' },
	{ id: 3, title: 'Giá cả và diện tích', description: 'Giá thuê và diện tích phòng' },
	{ id: 4, title: 'Địa chỉ', description: 'Địa chỉ phòng cho thuê' },
	{ id: 5, title: 'Tiện ích và quy định', description: 'Tiện ích có sẵn và quy định' },
	{ id: 6, title: 'Thông tin chi tiết', description: 'Loại phòng và thời gian' },
	{ id: 7, title: 'Chi phí phụ', description: 'Tiền điện, nước, internet...' },
	{ id: 8, title: 'Liên hệ và hoàn tất', description: 'Thông tin liên hệ và hết hạn' },
]

const ROOM_TYPE_LABELS = {
	boarding_house: 'Nhà trọ',
	apartment: 'Căn hộ',
	house: 'Nhà nguyên căn',
	studio: 'Studio',
}

const GENDER_LABELS = {
	male: 'Nam',
	female: 'Nữ',
	mixed: 'Không phân biệt',
}

interface FormData {
	title: string
	description: string
	images: File[]
	price: string
	deposit: string
	area: string
	address: {
		street: string
		ward: string
		district: string
		city: string
	}
	amenities: string[]
	rules: string[]
	roomType: 'boarding_house' | 'apartment' | 'house' | 'studio'
	availableFrom: string
	gender: 'male' | 'female' | 'mixed'
	maxOccupants: string
	electricityCost: string
	waterCost: string
	internetCost: string
	cleaningCost: string
	parkingCost: string
	contactInfo: {
		phone: string
		email: string
		facebook: string
		zalo: string
	}
	isPriority: boolean
	expiresAt: string
}

export function RentalPostForm({ onBack }: RentalPostFormProps) {
	const [currentStep, setCurrentStep] = useState(1)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const [formData, setFormData] = useState<FormData>({
		title: '',
		description: '',
		images: [],
		price: '',
		deposit: '',
		area: '',
		address: {
			street: '',
			ward: '',
			district: '',
			city: '',
		},
		amenities: [],
		rules: [],
		roomType: 'boarding_house',
		availableFrom: '',
		gender: 'mixed',
		maxOccupants: '',
		electricityCost: '',
		waterCost: '',
		internetCost: '',
		cleaningCost: '',
		parkingCost: '',
		contactInfo: {
			phone: '',
			email: '',
			facebook: '',
			zalo: '',
		},
		isPriority: false,
		expiresAt: '',
	})

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

	const updateNestedFormData = <T extends keyof Pick<FormData, 'address' | 'contactInfo'>>(
		parentField: T, 
		childField: keyof FormData[T], 
		value: FormData[T][keyof FormData[T]]
	) => {
		setFormData(prev => ({
			...prev,
			[parentField]: {
				...prev[parentField],
				[childField]: value
			}
		}))
		// Clear error when user starts typing
		const errorKey = `${String(parentField)}.${String(childField)}`
		if (errors[errorKey]) {
			setErrors(prev => ({
				...prev,
				[errorKey]: ''
			}))
		}
	}

	const validateCurrentStep = (): boolean => {
		const newErrors: Record<string, string> = {}

		switch (currentStep) {
			case 1:
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
				break
			case 2:
				if (formData.images.length === 0) {
					newErrors.images = 'Vui lòng tải lên ít nhất 1 ảnh'
				}
				break
			case 3:
				if (!formData.price) {
					newErrors.price = 'Giá thuê là bắt buộc'
				} else if (Number(formData.price) < 100000) {
					newErrors.price = 'Giá thuê phải từ 100,000 VNĐ'
				}
				if (!formData.area) {
					newErrors.area = 'Diện tích là bắt buộc'
				} else if (Number(formData.area) < 10) {
					newErrors.area = 'Diện tích phải từ 10m²'
				}
				break
			case 4:
				if (!formData.address.street.trim()) {
					newErrors['address.street'] = 'Vui lòng nhập địa chỉ'
				}
				if (!formData.address.ward) {
					newErrors['address.ward'] = 'Vui lòng chọn phường/xã'
				}
				if (!formData.address.district) {
					newErrors['address.district'] = 'Vui lòng chọn quận/huyện'
				}
				if (!formData.address.city) {
					newErrors['address.city'] = 'Vui lòng chọn tỉnh/thành phố'
				}
				break
			case 5:
				if (formData.amenities.length === 0) {
					newErrors.amenities = 'Vui lòng chọn ít nhất 1 tiện ích'
				}
				if (formData.rules.length === 0) {
					newErrors.rules = 'Vui lòng chọn ít nhất 1 quy định'
				}
				break
			case 6:
				if (!formData.availableFrom) {
					newErrors.availableFrom = 'Vui lòng chọn ngày có thể vào ở'
				}
				if (!formData.maxOccupants) {
					newErrors.maxOccupants = 'Số người tối đa là bắt buộc'
				} else if (Number(formData.maxOccupants) < 1) {
					newErrors.maxOccupants = 'Số người tối đa phải từ 1'
				}
				break
			case 7:
				// Optional costs validation
				if (formData.electricityCost && Number(formData.electricityCost) < 0) {
					newErrors.electricityCost = 'Tiền điện không được âm'
				}
				if (formData.waterCost && Number(formData.waterCost) < 0) {
					newErrors.waterCost = 'Tiền nước không được âm'
				}
				if (formData.internetCost && Number(formData.internetCost) < 0) {
					newErrors.internetCost = 'Tiền internet không được âm'
				}
				if (formData.cleaningCost && Number(formData.cleaningCost) < 0) {
					newErrors.cleaningCost = 'Phí vệ sinh không được âm'
				}
				if (formData.parkingCost && Number(formData.parkingCost) < 0) {
					newErrors.parkingCost = 'Phí gửi xe không được âm'
				}
				break
			case 8:
				if (!formData.contactInfo.phone.trim()) {
					newErrors['contactInfo.phone'] = 'Số điện thoại là bắt buộc'
				} else if (formData.contactInfo.phone.length < 10) {
					newErrors['contactInfo.phone'] = 'Số điện thoại không hợp lệ'
				}
				if (formData.contactInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
					newErrors['contactInfo.email'] = 'Email không hợp lệ'
				}
				if (!formData.expiresAt) {
					newErrors.expiresAt = 'Vui lòng chọn ngày hết hạn'
				}
				break
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleNext = () => {
		if (validateCurrentStep()) {
			setCurrentStep(prev => Math.min(prev + 1, steps.length))
		}
	}

	const handlePrevious = () => {
		setCurrentStep(prev => Math.max(prev - 1, 1))
	}

	const handleSubmit = async () => {
		if (!validateCurrentStep()) {
			return
		}

		setIsSubmitting(true)
		try {
			// Convert form data to CreateRentalPostData format
			const submitData: CreateRentalPostData = {
				title: formData.title,
				description: formData.description,
				images: formData.images.map((file, index) => ({
					file,
					preview: URL.createObjectURL(file),
					id: `${Date.now()}-${index}`
				})),
				price: Number(formData.price),
				deposit: Number(formData.deposit) || 0,
				area: Number(formData.area),
				address: formData.address,
				amenities: formData.amenities,
				rules: formData.rules,
				roomType: formData.roomType,
				availableFrom: formData.availableFrom,
				gender: formData.gender,
				maxOccupants: Number(formData.maxOccupants),
				electricityCost: formData.electricityCost ? Number(formData.electricityCost) : undefined,
				waterCost: formData.waterCost ? Number(formData.waterCost) : undefined,
				internetCost: formData.internetCost ? Number(formData.internetCost) : undefined,
				cleaningCost: formData.cleaningCost ? Number(formData.cleaningCost) : undefined,
				parkingCost: formData.parkingCost ? Number(formData.parkingCost) : undefined,
				contactInfo: formData.contactInfo,
				isPriority: formData.isPriority,
				expiresAt: formData.expiresAt,
			}

			// TODO: Call API to create rental post
			console.log('Submitting rental post:', submitData)
			
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000))
			
			// Success handling
			onBack()
		} catch (error) {
			console.error('Error creating rental post:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label htmlFor="title">Tiêu đề bài đăng *</Label>
								<Input
									id="title"
									placeholder="VD: Cho thuê phòng trọ gần trường ĐH Bách Khoa, đầy đủ tiện nghi"
									value={formData.title}
									onChange={(e) => updateFormData('title', e.target.value)}
									className={errors.title ? 'border-red-500' : ''}
								/>
								{errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
							</div>
							<div>
								<Label htmlFor="description">Mô tả chi tiết *</Label>
								<Textarea
									id="description"
									placeholder="Mô tả chi tiết về phòng, tiện ích, môi trường xung quanh, ưu điểm của phòng..."
									rows={6}
									value={formData.description}
									onChange={(e) => updateFormData('description', e.target.value)}
									className={errors.description ? 'border-red-500' : ''}
								/>
								{errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
							</div>
						</div>
					</div>
				)

			case 2:
				return (
					<div className="space-y-6">
						<div>
							<Label>Hình ảnh phòng *</Label>
							<ImageUpload
								value={formData.images.map(file => ({
									file,
									preview: URL.createObjectURL(file),
									id: `${Date.now()}-${Math.random()}`
								}))}
								onChange={(imageFiles) => updateFormData('images', imageFiles.map(img => img.file))}
								maxFiles={10}
							/>
							<p className="text-sm text-muted-foreground mt-2">
								Tải lên ít nhất 1 ảnh, tối đa 10 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.
							</p>
							{errors.images && (
								<p className="text-sm text-red-500 mt-1">{errors.images}</p>
							)}
						</div>
					</div>
				)

			case 3:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="price">Giá thuê hàng tháng (VNĐ) *</Label>
								<Input
									id="price"
									type="number"
									min="100000"
									placeholder="VD: 3000000"
									value={formData.price}
									onChange={(e) => updateFormData('price', e.target.value)}
									className={errors.price ? 'border-red-500' : ''}
								/>
								{errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
							</div>
							<div>
								<Label htmlFor="deposit">Tiền cọc (VNĐ)</Label>
								<Input
									id="deposit"
									type="number"
									min="0"
									placeholder="VD: 3000000"
									value={formData.deposit}
									onChange={(e) => updateFormData('deposit', e.target.value)}
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="area">Diện tích (m²) *</Label>
							<Input
								id="area"
								type="number"
								min="10"
								placeholder="VD: 25"
								value={formData.area}
								onChange={(e) => updateFormData('area', e.target.value)}
								className={errors.area ? 'border-red-500' : ''}
							/>
							{errors.area && <p className="text-sm text-red-500 mt-1">{errors.area}</p>}
						</div>
					</div>
				)

			case 4:
				return (
					<div className="space-y-6">
						<div>
							<Label>Địa chỉ phòng *</Label>
							<AddressSelector
								value={{
									street: formData.address.street,
									ward: null,
									district: null,
									province: null
								}}
								onChange={(addressData) => {
									updateFormData('address', {
										street: addressData.street,
										ward: addressData.ward?.name || '',
										district: addressData.district?.name || '',
										city: addressData.province?.name || ''
									})
								}}
								showStreetInput={false}
							/>
							<Input
								placeholder="Số nhà, tên đường"
								className={`mt-2 ${errors['address.street'] ? 'border-red-500' : ''}`}
								value={formData.address.street}
								onChange={(e) => updateNestedFormData('address', 'street', e.target.value)}
							/>
							{errors['address.street'] && <p className="text-sm text-red-500 mt-1">{errors['address.street']}</p>}
						</div>
					</div>
				)

			case 5:
				return (
					<div className="space-y-6">
						<div>
							<Label>Tiện ích có sẵn *</Label>
							<AmenityGrid
								selectedAmenities={formData.amenities}
								onSelectionChange={(amenities) => updateFormData('amenities', amenities as string[])}
							/>
							{errors.amenities && (
								<p className="text-sm text-red-500 mt-1">{errors.amenities}</p>
							)}
						</div>
						<div>
							<Label>Quy định của phòng *</Label>
							<RuleGrid
								selectedRules={formData.rules}
								onSelectionChange={(rules) => updateFormData('rules', rules as string[])}
							/>
							{errors.rules && (
								<p className="text-sm text-red-500 mt-1">{errors.rules}</p>
							)}
						</div>
					</div>
				)

			case 6:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="roomType">Loại phòng *</Label>
								<Select
									value={formData.roomType}
									onValueChange={(value) => updateFormData('roomType', value as FormData['roomType'])}
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
							</div>
							<div>
								<Label htmlFor="gender">Giới tính ưu tiên</Label>
								<Select
									value={formData.gender}
									onValueChange={(value) => updateFormData('gender', value as FormData['gender'])}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(GENDER_LABELS).map(([value, label]) => (
											<SelectItem key={value} value={value}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="maxOccupants">Số người tối đa *</Label>
								<Input
									id="maxOccupants"
									type="number"
									min="1"
									max="10"
									value={formData.maxOccupants}
									onChange={(e) => updateFormData('maxOccupants', e.target.value)}
									className={errors.maxOccupants ? 'border-red-500' : ''}
								/>
								{errors.maxOccupants && <p className="text-sm text-red-500 mt-1">{errors.maxOccupants}</p>}
							</div>
							<div>
								<Label htmlFor="availableFrom">Ngày có thể vào ở *</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												'w-full justify-start text-left font-normal',
												!formData.availableFrom && 'text-muted-foreground'
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{formData.availableFrom ? (
												format(new Date(formData.availableFrom), 'PPP', { locale: vi })
											) : (
												<span>Chọn ngày</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={formData.availableFrom ? new Date(formData.availableFrom) : undefined}
											onSelect={(date) => updateFormData('availableFrom', date?.toISOString() || '')}
											disabled={(date) => date < new Date()}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								{errors.availableFrom && (
									<p className="text-sm text-red-500 mt-1">{errors.availableFrom}</p>
								)}
							</div>
						</div>
					</div>
				)

			case 7:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="electricityCost">Tiền điện (VNĐ/kWh)</Label>
								<Input
									id="electricityCost"
									type="number"
									min="0"
									placeholder="VD: 3500"
									value={formData.electricityCost}
									onChange={(e) => updateFormData('electricityCost', e.target.value)}
								/>
								{errors.electricityCost && (
									<p className="text-sm text-red-500 mt-1">{errors.electricityCost}</p>
								)}
							</div>
							<div>
								<Label htmlFor="waterCost">Tiền nước (VNĐ/m³)</Label>
								<Input
									id="waterCost"
									type="number"
									min="0"
									placeholder="VD: 15000"
									value={formData.waterCost}
									onChange={(e) => updateFormData('waterCost', e.target.value)}
								/>
								{errors.waterCost && (
									<p className="text-sm text-red-500 mt-1">{errors.waterCost}</p>
								)}
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="internetCost">Tiền internet (VNĐ/tháng)</Label>
								<Input
									id="internetCost"
									type="number"
									min="0"
									placeholder="VD: 200000"
									value={formData.internetCost}
									onChange={(e) => updateFormData('internetCost', e.target.value)}
								/>
								{errors.internetCost && (
									<p className="text-sm text-red-500 mt-1">{errors.internetCost}</p>
								)}
							</div>
							<div>
								<Label htmlFor="cleaningCost">Phí vệ sinh (VNĐ/tháng)</Label>
								<Input
									id="cleaningCost"
									type="number"
									min="0"
									placeholder="VD: 100000"
									value={formData.cleaningCost}
									onChange={(e) => updateFormData('cleaningCost', e.target.value)}
								/>
								{errors.cleaningCost && (
									<p className="text-sm text-red-500 mt-1">{errors.cleaningCost}</p>
								)}
							</div>
						</div>
						<div>
							<Label htmlFor="parkingCost">Phí gửi xe (VNĐ/tháng)</Label>
							<Input
								id="parkingCost"
								type="number"
								min="0"
								placeholder="VD: 50000"
								value={formData.parkingCost}
								onChange={(e) => updateFormData('parkingCost', e.target.value)}
							/>
							{errors.parkingCost && (
								<p className="text-sm text-red-500 mt-1">{errors.parkingCost}</p>
							)}
						</div>
					</div>
				)

			case 8:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="phone">Số điện thoại *</Label>
								<Input
									id="phone"
									placeholder="0123456789"
									value={formData.contactInfo.phone}
									onChange={(e) => updateNestedFormData('contactInfo', 'phone', e.target.value)}
									className={errors['contactInfo.phone'] ? 'border-red-500' : ''}
								/>
								{errors['contactInfo.phone'] && <p className="text-sm text-red-500 mt-1">{errors['contactInfo.phone']}</p>}
							</div>
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="example@email.com"
									value={formData.contactInfo.email}
									onChange={(e) => updateNestedFormData('contactInfo', 'email', e.target.value)}
									className={errors['contactInfo.email'] ? 'border-red-500' : ''}
								/>
								{errors['contactInfo.email'] && <p className="text-sm text-red-500 mt-1">{errors['contactInfo.email']}</p>}
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="facebook">Facebook</Label>
								<Input
									id="facebook"
									placeholder="Tên Facebook hoặc link"
									value={formData.contactInfo.facebook}
									onChange={(e) => updateNestedFormData('contactInfo', 'facebook', e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="zalo">Zalo</Label>
								<Input
									id="zalo"
									placeholder="Số Zalo hoặc tên"
									value={formData.contactInfo.zalo}
									onChange={(e) => updateNestedFormData('contactInfo', 'zalo', e.target.value)}
								/>
							</div>
						</div>
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								<Switch
									id="isPriority"
									checked={formData.isPriority}
									onCheckedChange={(checked) => updateFormData('isPriority', checked)}
								/>
								<Label htmlFor="isPriority">Ưu tiên hiển thị (tính phí)</Label>
							</div>
							<div>
								<Label>Ngày hết hạn bài đăng *</Label>
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
								{errors.expiresAt && (
									<p className="text-sm text-red-500 mt-1">{errors.expiresAt}</p>
								)}
							</div>
						</div>
					</div>
				)

			default:
				return null
		}
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-6">
				<Button variant="ghost" onClick={onBack} className="mb-4">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Quay lại
				</Button>
				
				<div className="mb-6">
					<h1 className="text-2xl font-bold mb-2">Tạo bài đăng cho thuê trọ</h1>
					<p className="text-muted-foreground">
						Bước {currentStep} trong {steps.length}: {steps[currentStep - 1].description}
					</p>
				</div>

				<Progress value={((currentStep - 1) / (steps.length - 1)) * 100} className="mb-6" />

				<div className="flex items-center justify-between mb-6">
					{steps.map((step, index) => (
						<div key={step.id} className="flex items-center">
							<div
								className={cn(
									'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
									currentStep > step.id
										? 'bg-green-500 text-white'
										: currentStep === step.id
										? 'bg-blue-500 text-white'
										: 'bg-gray-200 text-gray-600'
								)}
							>
								{currentStep > step.id ? (
									<Check className="h-4 w-4" />
								) : (
									step.id
								)}
							</div>
							{index < steps.length - 1 && (
								<div
									className={cn(
										'w-16 h-0.5 mx-2',
										currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
									)}
								/>
							)}
						</div>
					))}
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{steps[currentStep - 1].title}</CardTitle>
					<CardDescription>{steps[currentStep - 1].description}</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
						{renderStepContent()}

						<Separator />

						<div className="flex justify-between">
							<Button
								type="button"
								variant="outline"
								onClick={handlePrevious}
								disabled={currentStep === 1}
							>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Quay lại
							</Button>

							{currentStep < steps.length ? (
								<Button type="button" onClick={handleNext}>
									Tiếp theo
									<ArrowRight className="h-4 w-4 ml-2" />
								</Button>
							) : (
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? 'Đang tạo...' : 'Tạo bài đăng'}
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
