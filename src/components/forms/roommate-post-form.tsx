'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { AddressSelector } from '@/components/ui/address-selector'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react'
import { CreateRoommatePostData } from '@/types'

interface RoommatePostFormProps {
	onBack: () => void
}

const steps = [
	{ id: 1, title: 'Thông tin cơ bản', description: 'Tiêu đề và mô tả' },
	{ id: 2, title: 'Thông tin cá nhân', description: 'Giới tính, tuổi và ngân sách' },
	{ id: 3, title: 'Yêu cầu về bạn cùng trọ', description: 'Giới tính và độ tuổi mong muốn' },
	{ id: 4, title: 'Địa điểm và thời gian', description: 'Nơi ở và thời gian thuê' },
	{ id: 5, title: 'Yêu cầu và lối sống', description: 'Yêu cầu và thông tin lối sống' },
	{ id: 6, title: 'Liên hệ và hoàn tất', description: 'Thông tin liên hệ và hết hạn' },
]

const lifestyleOptions = [
	'Thích yên tĩnh',
	'Thích giao lưu',
	'Hay về muộn',
	'Về sớm',
	'Nấu ăn thường xuyên',
	'Ít nấu ăn',
	'Không hút thuốc',
	'Không uống rượu bia',
	'Thích nuôi thú cưng',
	'Không thích thú cưng',
	'Thích dọn dẹp sạch sẽ',
	'Thích không gian thoáng đãng',
]

const requirementOptions = [
	'Sinh viên',
	'Đi làm',
	'Không hút thuốc',
	'Không uống rượu bia',
	'Sạch sẽ',
	'Yên tĩnh',
	'Thân thiện',
	'Có trách nhiệm',
	'Đúng giờ',
	'Tiết kiệm',
]

interface FormData {
	title: string
	description: string
	authorGender: 'male' | 'female'
	authorAge: string
	budget: string
	preferredGender: 'male' | 'female' | 'mixed'
	preferredAgeRange: {
		min: string
		max: string
	}
	moveInDate: string
	duration: string
	location: string
	address: {
		street: string
		ward: string
		district: string
		city: string
	}
	requirements: string[]
	lifestyle: string[]
	contactInfo: {
		phone: string
		email: string
		facebook: string
		zalo: string
	}
	expiresAt: string
}

export function RoommatePostForm({ onBack }: RoommatePostFormProps) {
	const [currentStep, setCurrentStep] = useState(1)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const [formData, setFormData] = useState<FormData>({
		title: '',
		description: '',
		authorGender: 'male',
		authorAge: '',
		budget: '',
		preferredGender: 'mixed',
		preferredAgeRange: {
			min: '',
			max: '',
		},
		moveInDate: '',
		duration: '',
		location: '',
		address: {
			street: '',
			ward: '',
			district: '',
			city: '',
		},
		requirements: [],
		lifestyle: [],
		contactInfo: {
			phone: '',
			email: '',
			facebook: '',
			zalo: '',
		},
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

	const updateNestedFormData = <T extends keyof FormData>(parentField: T, childField: keyof FormData[T], value: FormData[T][keyof FormData[T]]) => {
		setFormData(prev => ({
			...prev,
			[parentField]: {
				...(prev[parentField] as object || {}),
				[childField]: value
			} as unknown as FormData[T]
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
				if (!formData.authorAge) {
					newErrors.authorAge = 'Tuổi là bắt buộc'
				} else if (Number(formData.authorAge) < 18) {
					newErrors.authorAge = 'Tuổi phải từ 18'
				} else if (Number(formData.authorAge) > 100) {
					newErrors.authorAge = 'Tuổi không hợp lệ'
				}
				if (!formData.budget) {
					newErrors.budget = 'Ngân sách là bắt buộc'
				} else if (Number(formData.budget) < 100000) {
					newErrors.budget = 'Ngân sách phải từ 100,000 VNĐ'
				}
				break
			case 3:
				if (!formData.preferredAgeRange.min) {
					newErrors['preferredAgeRange.min'] = 'Tuổi tối thiểu là bắt buộc'
				} else if (Number(formData.preferredAgeRange.min) < 18) {
					newErrors['preferredAgeRange.min'] = 'Tuổi tối thiểu phải từ 18'
				}
				if (!formData.preferredAgeRange.max) {
					newErrors['preferredAgeRange.max'] = 'Tuổi tối đa là bắt buộc'
				} else if (Number(formData.preferredAgeRange.max) > 100) {
					newErrors['preferredAgeRange.max'] = 'Tuổi tối đa không hợp lệ'
				}
				if (Number(formData.preferredAgeRange.min) > Number(formData.preferredAgeRange.max)) {
					newErrors['preferredAgeRange.max'] = 'Tuổi tối đa phải lớn hơn tối thiểu'
				}
				break
			case 4:
				if (!formData.location.trim()) {
					newErrors.location = 'Địa điểm là bắt buộc'
				}
				if (!formData.duration) {
					newErrors.duration = 'Thời gian thuê là bắt buộc'
				} else if (Number(formData.duration) < 1) {
					newErrors.duration = 'Thời gian thuê phải từ 1 tháng'
				}
				if (!formData.moveInDate) {
					newErrors.moveInDate = 'Vui lòng chọn ngày dự định vào ở'
				}
				break
			case 5:
				if (formData.requirements.length === 0) {
					newErrors.requirements = 'Vui lòng thêm ít nhất 1 yêu cầu'
				}
				if (formData.lifestyle.length === 0) {
					newErrors.lifestyle = 'Vui lòng thêm ít nhất 1 thông tin về lối sống'
				}
				break
			case 6:
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
			// Convert form data to CreateRoommatePostData format
			const submitData: CreateRoommatePostData = {
				title: formData.title,
				description: formData.description,
				authorGender: formData.authorGender,
				authorAge: Number(formData.authorAge),
				budget: Number(formData.budget),
				preferredGender: formData.preferredGender,
				preferredAgeRange: {
					min: Number(formData.preferredAgeRange.min),
					max: Number(formData.preferredAgeRange.max),
				},
				moveInDate: formData.moveInDate,
				duration: Number(formData.duration),
				location: formData.location,
				address: formData.address,
				requirements: formData.requirements,
				lifestyle: formData.lifestyle,
				contactInfo: formData.contactInfo,
				expiresAt: formData.expiresAt,
			}

			// TODO: Call API to create roommate post
			console.log('Submitting roommate post:', submitData)
			
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000))
			
			// Success handling
			onBack()
		} catch (error) {
			console.error('Error creating roommate post:', error)
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
									placeholder="VD: Tìm bạn cùng trọ gần trường ĐH Bách Khoa, sinh viên ưu tiên"
									value={formData.title}
									onChange={(e) => updateFormData('title', e.target.value)}
									className={errors.title ? 'border-destructive' : ''}
								/>
								{errors.title && (
									<p className="text-sm text-destructive mt-1">{errors.title}</p>
								)}
							</div>
							<div>
								<Label htmlFor="description">Mô tả chi tiết *</Label>
								<Textarea
									id="description"
									placeholder="Giới thiệu về bản thân, lý do tìm bạn cùng trọ, mong muốn về môi trường sống..."
									rows={6}
									value={formData.description}
									onChange={(e) => updateFormData('description', e.target.value)}
									error={!!errors.description}
								/>
								{errors.description && (
									<p className="text-sm text-destructive mt-1">{errors.description}</p>
								)}
							</div>
						</div>
					</div>
				)

			case 2:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="authorGender">Giới tính *</Label>
								<Select
									value={formData.authorGender}
									onValueChange={(value) => updateFormData('authorGender', value as 'male' | 'female')}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">Nam</SelectItem>
										<SelectItem value="female">Nữ</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="authorAge">Tuổi *</Label>
								<Input
									id="authorAge"
									type="number"
									min="18"
									max="100"
									value={formData.authorAge}
									onChange={(e) => updateFormData('authorAge', e.target.value)}
									className={errors.authorAge ? 'border-destructive' : ''}
								/>
								{errors.authorAge && (
									<p className="text-sm text-destructive mt-1">{errors.authorAge}</p>
								)}
							</div>
						</div>
						<div>
							<Label htmlFor="budget">Ngân sách hàng tháng (VNĐ) *</Label>
							<Input
								id="budget"
								type="number"
								min="100000"
								placeholder="VD: 3000000"
								value={formData.budget}
								onChange={(e) => updateFormData('budget', e.target.value)}
								className={errors.budget ? 'border-destructive' : ''}
							/>
							{errors.budget && (
								<p className="text-sm text-destructive mt-1">{errors.budget}</p>
							)}
						</div>
					</div>
				)

			case 3:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="preferredGender">Giới tính mong muốn *</Label>
								<Select
									value={formData.preferredGender}
									onValueChange={(value) => updateFormData('preferredGender', value as 'male' | 'female' | 'mixed')}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">Nam</SelectItem>
										<SelectItem value="female">Nữ</SelectItem>
										<SelectItem value="mixed">Không quan trọng</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="ageMin">Độ tuổi tối thiểu *</Label>
								<Input
									id="ageMin"
									type="number"
									min="18"
									max="100"
									value={formData.preferredAgeRange.min}
									onChange={(e) => updateNestedFormData('preferredAgeRange', 'min', e.target.value)}
									className={errors['preferredAgeRange.min'] ? 'border-destructive' : ''}
								/>
								{errors['preferredAgeRange.min'] && (
									<p className="text-sm text-destructive mt-1">{errors['preferredAgeRange.min']}</p>
								)}
							</div>
							<div>
								<Label htmlFor="ageMax">Độ tuổi tối đa *</Label>
								<Input
									id="ageMax"
									type="number"
									min="18"
									max="100"
									value={formData.preferredAgeRange.max}
									onChange={(e) => updateNestedFormData('preferredAgeRange', 'max', e.target.value)}
									className={errors['preferredAgeRange.max'] ? 'border-destructive' : ''}
								/>
								{errors['preferredAgeRange.max'] && (
									<p className="text-sm text-destructive mt-1">{errors['preferredAgeRange.max']}</p>
								)}
							</div>
						</div>
					</div>
				)

			case 4:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="moveInDate">Ngày dự định vào ở *</Label>
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
								{errors.moveInDate && <p className="text-sm text-red-500 mt-1">{errors.moveInDate}</p>}
							</div>
							<div>
								<Label htmlFor="duration">Thời gian thuê (tháng) *</Label>
								<Input
									id="duration"
									type="number"
									min="1"
									max="60"
									value={formData.duration}
									onChange={(e) => updateFormData('duration', e.target.value)}
									className={errors.duration ? 'border-destructive' : ''}
								/>
								{errors.duration && (
									<p className="text-sm text-destructive mt-1">{errors.duration}</p>
								)}
							</div>
						</div>
						<div>
							<Label htmlFor="location">Địa điểm mong muốn *</Label>
							<Input
								id="location"
								placeholder="VD: Gần trường ĐH Bách Khoa, Quận 1"
								value={formData.location}
								onChange={(e) => updateFormData('location', e.target.value)}
								className={errors.location ? 'border-destructive' : ''}
							/>
							{errors.location && (
								<p className="text-sm text-destructive mt-1">{errors.location}</p>
							)}
						</div>
						<div>
							<Label>Địa chỉ cụ thể</Label>
							<AddressSelector
								onChange={(address) => {
									updateNestedFormData('address', 'city', address.province?.name || '');
									updateNestedFormData('address', 'district', address.district?.name || '');
									updateNestedFormData('address', 'ward', address.ward?.name || '');
								}}
							/>
							<Input
								placeholder="Số nhà, tên đường"
								className="mt-2"
								value={formData.address.street}
								onChange={(e) => updateNestedFormData('address', 'street', e.target.value)}
							/>
						</div>
					</div>
				)

			case 5:
				return (
					<div className="space-y-6">
						<div>
							<Label>Yêu cầu về bạn cùng trọ *</Label>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
								{requirementOptions.map((option) => (
									<Button
										key={option}
										type="button"
										variant={formData.requirements.includes(option) ? 'default' : 'outline'}
										size="sm"
										onClick={() => {
											const current = formData.requirements
											if (current.includes(option)) {
												updateFormData('requirements', current.filter(r => r !== option))
											} else {
												updateFormData('requirements', [...current, option])
											}
										}}
									>
										{option}
									</Button>
								))}
							</div>
							<div className="flex gap-2 mt-2">
								<Input
									placeholder="Thêm yêu cầu khác"
									value={formData.requirements.length > 0 ? formData.requirements[formData.requirements.length - 1] : ''}
									onChange={(e) => {
										if (e.target.value.trim() && !formData.requirements.includes(e.target.value.trim())) {
											updateFormData('requirements', [...formData.requirements, e.target.value.trim()])
										}
									}}
									onKeyPress={(e) => e.key === 'Enter' && formData.requirements.length > 0 && updateFormData('requirements', [...formData.requirements, formData.requirements[formData.requirements.length - 1]])}
								/>
								<Button type="button" onClick={() => updateFormData('requirements', [...formData.requirements, formData.requirements[formData.requirements.length - 1]])} size="sm">
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							{formData.requirements.length > 0 && (
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.requirements.map((req) => (
										<Badge key={req} variant="secondary">
											{req}
											<X
												className="h-3 w-3 ml-1 cursor-pointer"
												onClick={() => updateFormData('requirements', formData.requirements.filter(r => r !== req))}
											/>
										</Badge>
									))}
								</div>
							)}
							{errors.requirements && <p className="text-sm text-red-500 mt-1">{errors.requirements}</p>}
						</div>

						<div>
							<Label>Thông tin về lối sống *</Label>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
								{lifestyleOptions.map((option) => (
									<Button
										key={option}
										type="button"
										variant={formData.lifestyle.includes(option) ? 'default' : 'outline'}
										size="sm"
										onClick={() => {
											const current = formData.lifestyle
											if (current.includes(option)) {
												updateFormData('lifestyle', current.filter(l => l !== option))
											} else {
												updateFormData('lifestyle', [...current, option])
											}
										}}
									>
										{option}
									</Button>
								))}
							</div>
							<div className="flex gap-2 mt-2">
								<Input
									placeholder="Thêm thông tin khác"
									value={formData.lifestyle.length > 0 ? formData.lifestyle[formData.lifestyle.length - 1] : ''}
									onChange={(e) => {
										if (e.target.value.trim() && !formData.lifestyle.includes(e.target.value.trim())) {
											updateFormData('lifestyle', [...formData.lifestyle, e.target.value.trim()])
										}
									}}
									onKeyPress={(e) => e.key === 'Enter' && formData.lifestyle.length > 0 && updateFormData('lifestyle', [...formData.lifestyle, formData.lifestyle[formData.lifestyle.length - 1]])}
								/>
								<Button type="button" onClick={() => updateFormData('lifestyle', [...formData.lifestyle, formData.lifestyle[formData.lifestyle.length - 1]])} size="sm">
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							{formData.lifestyle.length > 0 && (
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.lifestyle.map((life) => (
										<Badge key={life} variant="secondary">
											{life}
											<X
												className="h-3 w-3 ml-1 cursor-pointer"
												onClick={() => updateFormData('lifestyle', formData.lifestyle.filter(l => l !== life))}
											/>
										</Badge>
									))}
								</div>
							)}
							{errors.lifestyle && <p className="text-sm text-red-500 mt-1">{errors.lifestyle}</p>}
						</div>
					</div>
				)

			case 6:
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
									className={errors['contactInfo.phone'] ? 'border-destructive' : ''}
								/>
								{errors['contactInfo.phone'] && (
									<p className="text-sm text-destructive mt-1">{errors['contactInfo.phone']}</p>
								)}
							</div>
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="example@email.com"
									value={formData.contactInfo.email}
									onChange={(e) => updateNestedFormData('contactInfo', 'email', e.target.value)}
									className={errors['contactInfo.email'] ? 'border-destructive' : ''}
								/>
								{errors['contactInfo.email'] && (
									<p className="text-sm text-destructive mt-1">{errors['contactInfo.email']}</p>
								)}
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
							{errors.expiresAt && <p className="text-sm text-red-500 mt-1">{errors.expiresAt}</p>}
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
					<h1 className="text-2xl font-bold mb-2">Tạo bài đăng tìm bạn cùng trọ</h1>
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
