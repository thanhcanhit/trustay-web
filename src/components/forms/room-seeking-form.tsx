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
import { AmenityGrid } from '@/components/ui/amenity-grid'
import { AddressSelector } from '@/components/ui/address-selector'
import { PriceFilter } from '@/components/ui/price-filter'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRoomSeekingStore } from '@/stores/roomSeekingStore'
import { toast } from 'sonner'
import { 
	//	RoomSeekingFormData, 
	ROOM_TYPE_LABELS,
	CreateRoomSeekingPostRequest
} from '@/types'

interface RoomSeekingFormProps {
	onBack?: () => void
	postId?: string
	initialData?: Partial<FormData>
	mode?: 'create' | 'edit'
}

const steps = [
	{ id: 1, title: 'Thông tin cơ bản', description: 'Tiêu đề và mô tả' },
	{ id: 2, title: 'Địa điểm', description: 'Khu vực mong muốn' },
	{ id: 3, title: 'Ngân sách', description: 'Khoảng giá và loại phòng' },
	{ id: 4, title: 'Yêu cầu', description: 'Số người và tiện ích' },
	{ id: 5, title: 'Thời gian', description: 'Ngày vào ở và hết hạn' },
]

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

export function RoomSeekingForm({ onBack, postId, initialData, mode = 'create' }: RoomSeekingFormProps) {
	const router = useRouter()
	const { createPost, updatePost } = useRoomSeekingStore()
	const [currentStep, setCurrentStep] = useState(1)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const [formData, setFormData] = useState<FormData>({
		title: initialData?.title ?? '',
		description: initialData?.description ?? '',
		preferredProvinceId: initialData?.preferredProvinceId ?? '',
		preferredDistrictId: initialData?.preferredDistrictId ?? '',
		preferredWardId: initialData?.preferredWardId ?? '',
		minBudget: initialData?.minBudget ?? '',
		maxBudget: initialData?.maxBudget ?? '',
		currency: (initialData?.currency as FormData['currency']) ?? 'VND',
		preferredRoomType: (initialData?.preferredRoomType as FormData['preferredRoomType']) ?? 'boarding_house',
		occupancy: initialData?.occupancy ?? '',
		moveInDate: initialData?.moveInDate ?? '',
		isPublic: initialData?.isPublic ?? true,
		expiresAt: initialData?.expiresAt ?? '',
		amenityIds: initialData?.amenityIds ?? [],
	})

	const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}))
		if (errors[field]) {
			setErrors(prev => ({
				...prev,
				[field]: ''
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
				} else if (formData.title.trim().length > 200) {
					newErrors.title = 'Tiêu đề không được quá 200 ký tự'
				}
				if (!formData.description.trim()) {
					newErrors.description = 'Mô tả là bắt buộc'
				} else if (formData.description.trim().length < 50) {
					newErrors.description = 'Mô tả phải có ít nhất 50 ký tự'
				} else if (formData.description.trim().length > 2000) {
					newErrors.description = 'Mô tả không được quá 2000 ký tự'
				}
				break
			case 2:
				if (!formData.preferredProvinceId) {
					newErrors.preferredProvinceId = 'Vui lòng chọn tỉnh/thành phố'
				}
				if (!formData.preferredDistrictId) {
					newErrors.preferredDistrictId = 'Vui lòng chọn quận/huyện'
				}
				if (!formData.preferredWardId) {
					newErrors.preferredWardId = 'Vui lòng chọn phường/xã'
				}
				if (formData.preferredProvinceId && !formData.preferredDistrictId) {
					newErrors.preferredDistrictId = 'Vui lòng chọn quận/huyện'
				}
				if (formData.preferredDistrictId && !formData.preferredWardId) {
					newErrors.preferredWardId = 'Vui lòng chọn phường/xã'
				}
				break
			case 3:
				if (!formData.minBudget) {
					newErrors.minBudget = 'Ngân sách tối thiểu là bắt buộc'
				} else if (Number(formData.minBudget) < 100000) {
					newErrors.minBudget = 'Ngân sách tối thiểu phải từ 100,000 VNĐ'
				} else if (Number(formData.minBudget) > 1000000000) {
					newErrors.minBudget = 'Ngân sách tối thiểu không được quá 1 tỷ VNĐ'
				}
				if (!formData.maxBudget) {
					newErrors.maxBudget = 'Ngân sách tối đa là bắt buộc'
				} else if (Number(formData.maxBudget) < 100000) {
					newErrors.maxBudget = 'Ngân sách tối đa phải từ 100,000 VNĐ'
				} else if (Number(formData.maxBudget) > 1000000000) {
					newErrors.maxBudget = 'Ngân sách tối đa không được quá 1 tỷ VNĐ'
				}
				if (Number(formData.minBudget) > Number(formData.maxBudget)) {
					newErrors.maxBudget = 'Ngân sách tối đa phải lớn hơn tối thiểu'
				}
				break
			case 4:
				if (!formData.occupancy) {
					newErrors.occupancy = 'Số người ở là bắt buộc'
				} else if (Number(formData.occupancy) < 1) {
					newErrors.occupancy = 'Số người ở phải từ 1'
				} else if (Number(formData.occupancy) > 10) {
					newErrors.occupancy = 'Số người ở không được quá 10'
				}
				if (formData.amenityIds.length === 0) {
					newErrors.amenityIds = 'Vui lòng chọn ít nhất 1 tiện ích'
				}
				break
			case 5:
				if (!formData.moveInDate) {
					newErrors.moveInDate = 'Vui lòng chọn ngày dự định vào ở'
				}
				if (!formData.expiresAt) {
					newErrors.expiresAt = 'Vui lòng chọn ngày hết hạn'
				}
				if (formData.expiresAt && new Date(formData.expiresAt) <= new Date()) {
					newErrors.expiresAt = 'Ngày hết hạn phải sau ngày hiện tại'
				}
				if (formData.moveInDate && new Date(formData.moveInDate) < new Date(new Date().setDate(new Date().getDate() - 30))) {
					newErrors.moveInDate = 'Ngày vào ở không được quá 30 ngày trong quá khứ'
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
			const submitData: CreateRoomSeekingPostRequest = {
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

			let success
			if (mode === 'edit' && postId) {
				success = await updatePost(postId, submitData)
			} else {
				success = await createPost(submitData)
			}

			if (success) {
				toast.success(mode === 'edit' ? 'Cập nhật bài đăng thành công!' : 'Tạo bài đăng tìm trọ thành công!')
				if (onBack) onBack()
				else router.push('/profile/posts/room-seeking')
			} else {
				toast.error(mode === 'edit' ? 'Có lỗi khi cập nhật' : 'Có lỗi xảy ra khi tạo bài đăng')
			}
		} catch (error) {
			console.error('Error creating room seeking post:', error)
			toast.error('Có lỗi xảy ra khi tạo bài đăng')
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
									placeholder="VD: Tìm phòng trọ gần trường ĐH Bách Khoa, giá 3-5 triệu"
									value={formData.title}
									onChange={(e) => updateFormData('title', e.target.value)}
									className={errors.title ? 'border-destructive' : ''}
									maxLength={200}
								/>
								<div className="flex justify-between items-center mt-1">
									{errors.title && (
										<p className="text-sm text-destructive">{errors.title}</p>
									)}
									<p className="text-sm text-muted-foreground ml-auto">
										{formData.title.length}/200
									</p>
								</div>
							</div>
							<div>
								<Label htmlFor="description">Mô tả chi tiết *</Label>
								<Textarea
									id="description"
									placeholder="Mô tả chi tiết về nhu cầu tìm phòng của bạn, yêu cầu về vị trí, tiện ích, môi trường sống..."
									rows={6}
									value={formData.description}
									onChange={(e) => updateFormData('description', e.target.value)}
									error={!!errors.description}
									maxLength={2000}
								/>
								<div className="flex justify-between items-center mt-1">
									{errors.description && (
										<p className="text-sm text-destructive">{errors.description}</p>
									)}
									<p className="text-sm text-muted-foreground ml-auto">
										{formData.description.length}/2000
									</p>
								</div>
							</div>
						</div>
					</div>
				)

			case 2:
				return (
					<div className="space-y-6">
						<div>
							<Label>Khu vực mong muốn *</Label>
							<AddressSelector
								onChange={(address) => {
									if (address.province) updateFormData('preferredProvinceId', address.province.id.toString());
									if (address.district) updateFormData('preferredDistrictId', address.district.id.toString());
									if (address.ward) updateFormData('preferredWardId', address.ward.id.toString());
								}}
							/>
							{(errors.preferredProvinceId || errors.preferredDistrictId || errors.preferredWardId) && (
								<div className="mt-1 space-y-1">
									{errors.preferredProvinceId && (
										<p className="text-sm text-destructive">{errors.preferredProvinceId}</p>
									)}
									{errors.preferredDistrictId && (
										<p className="text-sm text-destructive">{errors.preferredDistrictId}</p>
									)}
									{errors.preferredWardId && (
										<p className="text-sm text-destructive">{errors.preferredWardId}</p>
									)}
								</div>
							)}
						</div>
					</div>
				)

			case 3:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label>Khoảng giá *</Label>
								<PriceFilter
									minPrice={formData.minBudget}
									maxPrice={formData.maxBudget}
									currency={formData.currency}
									onMinPriceChange={(value) => updateFormData('minBudget', value)}
									onMaxPriceChange={(value) => updateFormData('maxBudget', value)}
									onCurrencyChange={(value) => updateFormData('currency', value as 'VND' | 'USD')}
									error={!!errors.minBudget || !!errors.maxBudget}
									helperText={errors.minBudget || errors.maxBudget}
								/>
							</div>
							<div>
								<Label htmlFor="roomType">Loại phòng mong muốn *</Label>
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
							</div>
						</div>
					</div>
				)

			case 4:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="occupancy">Số người sẽ ở *</Label>
								<Input
									id="occupancy"
									type="number"
									min="1"
									max="10"
									value={formData.occupancy}
									onChange={(e) => updateFormData('occupancy', e.target.value)}
									className={errors.occupancy ? 'border-destructive' : ''}
								/>
								{errors.occupancy && (
									<p className="text-sm text-destructive mt-1">{errors.occupancy}</p>
								)}
							</div>
						</div>
						<div>
							<Label>Tiện ích mong muốn *</Label>
							<AmenityGrid
								selectedAmenities={formData.amenityIds}
								onSelectionChange={(amenityIds) => updateFormData('amenityIds', amenityIds as string[])}
							/>
							{errors.amenityIds && (
								<p className="text-sm text-destructive mt-1">{errors.amenityIds}</p>
							)}
							{!errors.amenityIds && formData.amenityIds.length > 0 && (
								<p className="text-sm text-muted-foreground mt-1">
									Đã chọn {formData.amenityIds.length} tiện ích
								</p>
							)}
						</div>
					</div>
				)

			case 5:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label>Ngày dự định vào ở *</Label>
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
								{errors.moveInDate && (
									<p className="text-sm text-destructive mt-1">{errors.moveInDate}</p>
								)}
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
									<p className="text-sm text-destructive mt-1">{errors.expiresAt}</p>
								)}
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								id="isPublic"
								checked={formData.isPublic}
								onCheckedChange={(checked) => updateFormData('isPublic', checked)}
							/>
							<Label htmlFor="isPublic">Công khai bài đăng</Label>
						</div>
					</div>
				)

			default:
				return null
		}
	}

	const PreviewCard = () => {
		const minBudgetLabel = formData.minBudget ? Number(formData.minBudget).toLocaleString() : '—'
		const maxBudgetLabel = formData.maxBudget ? Number(formData.maxBudget).toLocaleString() : '—'
		const budgetRange = formData.minBudget && formData.maxBudget
			? `${minBudgetLabel} - ${maxBudgetLabel} ${formData.currency}`
			: 'Chưa thiết lập'

		return (
			<Card className="sticky top-4">
				<CardHeader>
					<CardTitle className="text-base">Xem trước bài đăng</CardTitle>
					<CardDescription>Thông tin sẽ hiển thị như người dùng thấy</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<p className="text-sm text-muted-foreground">Tiêu đề</p>
						<p className="font-medium line-clamp-1">{formData.title || 'Tiêu đề bài đăng'}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Mô tả</p>
						<p className="text-sm line-clamp-5">
							{formData.description || 'Mô tả chi tiết về nhu cầu tìm phòng của bạn sẽ hiển thị tại đây.'}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<p className="text-sm text-muted-foreground">Khu vực</p>
							<p className="text-sm">{formData.preferredProvinceId && formData.preferredDistrictId && formData.preferredWardId ? 'Đã chọn' : 'Chưa chọn'}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Khoảng giá</p>
							<p className="text-sm">{budgetRange}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Loại phòng</p>
							<p className="text-sm">{ROOM_TYPE_LABELS[formData.preferredRoomType]}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Số người</p>
							<p className="text-sm">{formData.occupancy || '—'}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Ngày vào ở</p>
							<p className="text-sm">{formData.moveInDate ? format(new Date(formData.moveInDate), 'dd/MM/yyyy', { locale: vi }) : 'Chưa chọn'}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Hết hạn</p>
							<p className="text-sm">{formData.expiresAt ? format(new Date(formData.expiresAt), 'dd/MM/yyyy', { locale: vi }) : 'Chưa chọn'}</p>
						</div>
					</div>
					<div className="flex items-center justify-between text-sm">
						<p className="text-muted-foreground">Tiện ích đã chọn</p>
						<p>{formData.amenityIds.length}</p>
					</div>
					<div className="flex items-center justify-between text-sm">
						<p className="text-muted-foreground">Chế độ</p>
						<p>{formData.isPublic ? 'Công khai' : 'Riêng tư'}</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="max-w-6xl mx-auto pb-6">
			<div className="mb-2">
				<Button variant="ghost" onClick={() => (onBack ? onBack() : router.back())} className="cursor-pointer">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Quay lại
				</Button>
				
				<div className="mb-4">
					<h1 className="text-2xl font-bold mb-2">{mode === 'edit' ? 'Cập nhật bài đăng tìm trọ' : 'Tạo bài đăng tìm trọ'}</h1>
					<p className="text-muted-foreground">
						Bước {currentStep} trong {steps.length}: {steps[currentStep - 1].description}
					</p>
				</div>

				<Progress value={((currentStep - 1) / (steps.length - 1)) * 100} className="mb-4" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-xl">{steps[currentStep - 1].title}</CardTitle>
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
											{isSubmitting ? (
												<>
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
													Đang tạo...
												</>
											) : (
												'Tạo bài đăng'
											)}
										</Button>
									)}
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
				<div className="md:col-span-1">
					<PreviewCard />
				</div>
			</div>
		</div>
	)
}

