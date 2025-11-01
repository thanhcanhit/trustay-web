'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Label } from '@/components/ui/label'
import { getCleanTextLength } from '@/utils/textProcessing'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { AddressSelector } from '@/components/ui/address-selector'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, ArrowLeft, ArrowRight, Check, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRoommateSeekingPostsStore } from '@/stores/roommate-seeking-posts.store'
import { toast } from 'sonner'
import { CreateRoommateSeekingPostRequest } from '@/actions/roommate-seeking-posts.action'

interface RoommatePostFormProps {
	onBack?: () => void
	postId?: string
	initialData?: Partial<FormData>
	mode?: 'create' | 'edit'
}

const steps = [
	{ id: 1, title: 'Thông tin cơ bản', description: 'Tiêu đề và mô tả bài đăng' },
	{ id: 2, title: 'Vị trí phòng', description: 'Địa chỉ và thông tin vị trí' },
	{ id: 3, title: 'Chi phí', description: 'Giá thuê và các khoản phí' },
	{ id: 4, title: 'Số lượng người', description: 'Số người cần tìm và tối đa' },
	{ id: 5, title: 'Yêu cầu & Thời gian', description: 'Yêu cầu về người ở ghép' },
]

interface FormData {
	// Thông tin cơ bản
	title: string
	description: string
	
	// Phòng trong platform (tùy chọn)
	roomInstanceId: string
	rentalId: string
	
	// Phòng ngoài platform (tùy chọn)
	externalAddress: string
	externalProvinceId: string
	externalDistrictId: string
	externalWardId: string
	
	// Chi phí
	monthlyRent: string
	currency: 'VND' | 'USD'
	depositAmount: string
	utilityCostPerPerson: string
	
	// Số lượng
	seekingCount: string
	maxOccupancy: string
	currentOccupancy: string
	
	// Yêu cầu
	preferredGender: 'other' | 'male' | 'female'
	additionalRequirements: string
	
	// Thời gian
	availableFromDate: string
	minimumStayMonths: string
	maximumStayMonths: string
	
	// Khác
	requiresLandlordApproval: boolean
	expiresAt: string
	
	// UI control
	isExternalRoom: boolean // true = phòng ngoài, false = phòng trong platform
}

export function RoommatePostForm({ onBack, postId, initialData, mode = 'create' }: RoommatePostFormProps) {
	const router = useRouter()
	const { createPost, updatePost, isLoading, error: storeError, clearError } = useRoommateSeekingPostsStore()
	const [currentStep, setCurrentStep] = useState(1)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const [formData, setFormData] = useState<FormData>({
		title: initialData?.title ?? '',
		description: initialData?.description ?? '',
		
		roomInstanceId: initialData?.roomInstanceId ?? '',
		rentalId: initialData?.rentalId ?? '',
		
		externalAddress: initialData?.externalAddress ?? '',
		externalProvinceId: initialData?.externalProvinceId?.toString() ?? '',
		externalDistrictId: initialData?.externalDistrictId?.toString() ?? '',
		externalWardId: initialData?.externalWardId?.toString() ?? '',
		
		monthlyRent: initialData?.monthlyRent?.toString() ?? '',
		currency: (initialData?.currency as FormData['currency']) ?? 'VND',
		depositAmount: initialData?.depositAmount?.toString() ?? '',
		utilityCostPerPerson: initialData?.utilityCostPerPerson?.toString() ?? '',
		
		seekingCount: initialData?.seekingCount?.toString() ?? '1',
		maxOccupancy: initialData?.maxOccupancy?.toString() ?? '2',
		currentOccupancy: initialData?.currentOccupancy?.toString() ?? '1',
		
		preferredGender: (initialData?.preferredGender as FormData['preferredGender']) ?? 'other',
		additionalRequirements: initialData?.additionalRequirements ?? '',
		
		availableFromDate: initialData?.availableFromDate ?? '',
		minimumStayMonths: initialData?.minimumStayMonths?.toString() ?? '1',
		maximumStayMonths: initialData?.maximumStayMonths?.toString() ?? '',
		
		requiresLandlordApproval: initialData?.requiresLandlordApproval ?? false,
		expiresAt: initialData?.expiresAt ?? '',
		
		isExternalRoom: initialData?.isExternalRoom ?? true,
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
			case 1: // Thông tin cơ bản
				if (!formData.title.trim()) {
					newErrors.title = 'Tiêu đề là bắt buộc'
				} else if (formData.title.trim().length < 10) {
					newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự'
				} else if (formData.title.trim().length > 200) {
					newErrors.title = 'Tiêu đề không được quá 200 ký tự'
				}
				
				const descriptionLength = getCleanTextLength(formData.description)
				if (descriptionLength === 0) {
					newErrors.description = 'Mô tả là bắt buộc'
				} else if (descriptionLength < 50) {
					newErrors.description = 'Mô tả phải có ít nhất 50 ký tự'
				} else if (descriptionLength > 2000) {
					newErrors.description = 'Mô tả không được quá 2000 ký tự'
				}
				break

			case 2: // Vị trí
				if (formData.isExternalRoom) {
					// Phòng ngoài platform
					if (!formData.externalAddress.trim()) {
						newErrors.externalAddress = 'Địa chỉ là bắt buộc'
					}
					if (!formData.externalProvinceId) {
						newErrors.externalProvinceId = 'Vui lòng chọn tỉnh/thành phố'
					}
					if (!formData.externalDistrictId) {
						newErrors.externalDistrictId = 'Vui lòng chọn quận/huyện'
					}
					if (!formData.externalWardId) {
						newErrors.externalWardId = 'Vui lòng chọn phường/xã'
					}
				} else {
					// Phòng trong platform
					if (!formData.roomInstanceId.trim()) {
						newErrors.roomInstanceId = 'Vui lòng chọn phòng'
					}
				}
				break

			case 3: // Chi phí
				if (!formData.monthlyRent) {
					newErrors.monthlyRent = 'Giá thuê hàng tháng là bắt buộc'
				} else if (Number(formData.monthlyRent) < 100000) {
					newErrors.monthlyRent = 'Giá thuê phải từ 100,000 VNĐ'
				}
				
				if (!formData.depositAmount) {
					newErrors.depositAmount = 'Tiền đặt cọc là bắt buộc'
				} else if (Number(formData.depositAmount) < 0) {
					newErrors.depositAmount = 'Tiền đặt cọc không được âm'
				}
				
				if (formData.utilityCostPerPerson && Number(formData.utilityCostPerPerson) < 0) {
					newErrors.utilityCostPerPerson = 'Chi phí tiện ích không được âm'
				}
				break

			case 4: // Số lượng
				if (!formData.seekingCount) {
					newErrors.seekingCount = 'Số người cần tìm là bắt buộc'
				} else if (Number(formData.seekingCount) < 1) {
					newErrors.seekingCount = 'Số người cần tìm phải từ 1'
				} else if (Number(formData.seekingCount) > 10) {
					newErrors.seekingCount = 'Số người cần tìm không được quá 10'
				}
				
				if (!formData.maxOccupancy) {
					newErrors.maxOccupancy = 'Số người tối đa là bắt buộc'
				} else if (Number(formData.maxOccupancy) < 1) {
					newErrors.maxOccupancy = 'Số người tối đa phải từ 1'
				} else if (Number(formData.maxOccupancy) < Number(formData.currentOccupancy)) {
					newErrors.maxOccupancy = 'Số người tối đa phải lớn hơn hoặc bằng số người hiện tại'
				}
				
				if (!formData.currentOccupancy) {
					newErrors.currentOccupancy = 'Số người hiện tại là bắt buộc'
				} else if (Number(formData.currentOccupancy) < 1) {
					newErrors.currentOccupancy = 'Số người hiện tại phải từ 1'
				}
				break

			case 5: // Yêu cầu & Thời gian
				if (!formData.availableFromDate) {
					newErrors.availableFromDate = 'Vui lòng chọn ngày có thể vào ở'
				}
				
				if (formData.minimumStayMonths && Number(formData.minimumStayMonths) < 1) {
					newErrors.minimumStayMonths = 'Thời gian ở tối thiểu phải từ 1 tháng'
				}
				
				if (formData.maximumStayMonths && formData.minimumStayMonths) {
					if (Number(formData.maximumStayMonths) < Number(formData.minimumStayMonths)) {
						newErrors.maximumStayMonths = 'Thời gian tối đa phải lớn hơn tối thiểu'
					}
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

		// Clear previous store error
		clearError()
		setIsSubmitting(true)
		try {
			const submitData: CreateRoommateSeekingPostRequest = {
				// Thông tin cơ bản
				title: formData.title.trim(),
				description: formData.description.trim(),
				
				// Chi phí
				monthlyRent: Number(formData.monthlyRent),
				currency: formData.currency,
				depositAmount: Number(formData.depositAmount),
				utilityCostPerPerson: formData.utilityCostPerPerson ? Number(formData.utilityCostPerPerson) : undefined,
				
				// Số lượng
				seekingCount: Number(formData.seekingCount),
				maxOccupancy: Number(formData.maxOccupancy),
				currentOccupancy: Number(formData.currentOccupancy),
				
				// Yêu cầu
				preferredGender: formData.preferredGender,
				additionalRequirements: formData.additionalRequirements.trim() || undefined,
				
				// Thời gian
				availableFromDate: formData.availableFromDate ? new Date(formData.availableFromDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
				minimumStayMonths: formData.minimumStayMonths ? Number(formData.minimumStayMonths) : undefined,
				maximumStayMonths: formData.maximumStayMonths ? Number(formData.maximumStayMonths) : undefined,
				
				// Khác
				requiresLandlordApproval: formData.requiresLandlordApproval,
				expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
			}

			// Thêm thông tin phòng (chọn 1 trong 2 loại)
			if (formData.isExternalRoom) {
				// Phòng ngoài platform
				submitData.externalAddress = formData.externalAddress.trim()
				submitData.externalProvinceId = Number(formData.externalProvinceId)
				submitData.externalDistrictId = Number(formData.externalDistrictId)
				submitData.externalWardId = Number(formData.externalWardId)
			} else {
				// Phòng trong platform
				submitData.roomInstanceId = formData.roomInstanceId.trim()
				submitData.rentalId = formData.rentalId.trim() || undefined
			}

			let success
			if (mode === 'edit' && postId) {
				success = await updatePost(postId, submitData)
			} else {
				success = await createPost(submitData)
			}

		if (success) {
			toast.success(mode === 'edit' ? 'Cập nhật bài đăng thành công!' : 'Tạo bài đăng tìm người ở ghép thành công!')
			if (onBack) onBack()
			else router.push('/profile/posts?tab=roommate')
		} else {
				// Show error from store if available
				const errorMessage = storeError || (mode === 'edit' ? 'Có lỗi khi cập nhật' : 'Có lỗi xảy ra khi tạo bài đăng')
				toast.error(errorMessage)
			}
		} catch (error) {
			console.error('Error creating roommate seeking post:', error)
			toast.error('Có lỗi xảy ra khi tạo bài đăng')
		} finally {
			setIsSubmitting(false)
		}
	}

	const renderStepContent = () => {
		switch (currentStep) {
			case 1: // Thông tin cơ bản
				return (
					<div className="space-y-6">
						<div className="space-y-4">
							<div>
								<Label htmlFor="title">Tiêu đề bài đăng *</Label>
								<Input
									id="title"
									placeholder="VD: Tìm bạn nữ ở ghép căn hộ cao cấp Quận 1"
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
								<RichTextEditor
									value={formData.description}
									onChange={(value) => updateFormData('description', value)}
									placeholder="Mô tả chi tiết về phòng, yêu cầu, tiện ích, môi trường sống..."
									error={!!errors.description}
									maxLength={2000}
									showCharCount={true}
								/>
								{errors.description && (
									<p className="text-sm text-destructive mt-1">{errors.description}</p>
								)}
							</div>
						</div>
					</div>
				)

			case 2: // Vị trí
				return (
					<div className="space-y-6">
						<div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
							<Switch
								id="isExternalRoom"
								checked={formData.isExternalRoom}
								onCheckedChange={(checked) => updateFormData('isExternalRoom', checked)}
							/>
							<Label htmlFor="isExternalRoom" className="cursor-pointer">
								Phòng ngoài hệ thống (không phải phòng đang thuê trên Trustay)
							</Label>
						</div>

						{formData.isExternalRoom ? (
							// Phòng ngoài platform
							<>
								<div>
									<Label htmlFor="externalAddress">Địa chỉ cụ thể *</Label>
									<Input
										id="externalAddress"
										placeholder="VD: 123 Nguyễn Văn Cừ"
										value={formData.externalAddress}
										onChange={(e) => updateFormData('externalAddress', e.target.value)}
										className={errors.externalAddress ? 'border-destructive' : ''}
									/>
									{errors.externalAddress && (
										<p className="text-sm text-destructive mt-1">{errors.externalAddress}</p>
									)}
								</div>
								
								<div>
									<Label>Khu vực *</Label>
									<AddressSelector
										onChange={(address) => {
											if (address.province) updateFormData('externalProvinceId', address.province.id.toString());
											if (address.district) updateFormData('externalDistrictId', address.district.id.toString());
											if (address.ward) updateFormData('externalWardId', address.ward.id.toString());
										}}
									/>
									{(errors.externalProvinceId || errors.externalDistrictId || errors.externalWardId) && (
										<div className="mt-1 space-y-1">
											{errors.externalProvinceId && (
												<p className="text-sm text-destructive">{errors.externalProvinceId}</p>
											)}
											{errors.externalDistrictId && (
												<p className="text-sm text-destructive">{errors.externalDistrictId}</p>
											)}
											{errors.externalWardId && (
												<p className="text-sm text-destructive">{errors.externalWardId}</p>
											)}
										</div>
									)}
								</div>
							</>
						) : (
							// Phòng trong platform
							<>
								<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
									<div className="flex items-start space-x-2">
										<Info className="h-5 w-5 text-blue-600 mt-0.5" />
										<div className="text-sm text-blue-800">
											<p className="font-medium mb-1">Phòng trong hệ thống Trustay</p>
											<p>Vui lòng chọn phòng bạn đang thuê. Hệ thống sẽ tự động lấy thông tin địa chỉ.</p>
										</div>
									</div>
								</div>
								
								<div>
									<Label htmlFor="roomInstanceId">Chọn phòng *</Label>
									<Select
										value={formData.roomInstanceId}
										onValueChange={(value) => updateFormData('roomInstanceId', value)}
									>
										<SelectTrigger className={errors.roomInstanceId ? 'border-destructive' : ''}>
											<SelectValue placeholder="Chọn phòng bạn đang thuê" />
										</SelectTrigger>
										<SelectContent>
											{/* TODO: Load danh sách phòng đang thuê từ API */}
											<SelectItem value="placeholder">Chưa có phòng nào</SelectItem>
										</SelectContent>
									</Select>
									{errors.roomInstanceId && (
										<p className="text-sm text-destructive mt-1">{errors.roomInstanceId}</p>
									)}
								</div>
							</>
						)}
					</div>
				)

			case 3: // Chi phí
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="monthlyRent">Giá thuê hàng tháng (VNĐ) *</Label>
								<Input
									id="monthlyRent"
									type="number"
									min="100000"
									placeholder="VD: 3000000"
									value={formData.monthlyRent}
									onChange={(e) => updateFormData('monthlyRent', e.target.value)}
									className={errors.monthlyRent ? 'border-destructive' : ''}
								/>
								{errors.monthlyRent && (
									<p className="text-sm text-destructive mt-1">{errors.monthlyRent}</p>
								)}
								<p className="text-sm text-muted-foreground mt-1">
									{formData.monthlyRent && `≈ ${Number(formData.monthlyRent).toLocaleString('vi-VN')} VNĐ`}
								</p>
							</div>

							<div>
								<Label htmlFor="depositAmount">Tiền đặt cọc (VNĐ) *</Label>
								<Input
									id="depositAmount"
									type="number"
									min="0"
									placeholder="VD: 6000000"
									value={formData.depositAmount}
									onChange={(e) => updateFormData('depositAmount', e.target.value)}
									className={errors.depositAmount ? 'border-destructive' : ''}
								/>
								{errors.depositAmount && (
									<p className="text-sm text-destructive mt-1">{errors.depositAmount}</p>
								)}
								<p className="text-sm text-muted-foreground mt-1">
									{formData.depositAmount && `≈ ${Number(formData.depositAmount).toLocaleString('vi-VN')} VNĐ`}
								</p>
							</div>
						</div>

						<div>
							<Label htmlFor="utilityCostPerPerson">Chi phí tiện ích/người/tháng (VNĐ)</Label>
							<Input
								id="utilityCostPerPerson"
								type="number"
								min="0"
								placeholder="VD: 500000 (không bắt buộc)"
								value={formData.utilityCostPerPerson}
								onChange={(e) => updateFormData('utilityCostPerPerson', e.target.value)}
								className={errors.utilityCostPerPerson ? 'border-destructive' : ''}
							/>
							{errors.utilityCostPerPerson && (
								<p className="text-sm text-destructive mt-1">{errors.utilityCostPerPerson}</p>
							)}
							<p className="text-sm text-muted-foreground mt-1">
								Bao gồm: điện, nước, internet, vệ sinh (nếu có)
							</p>
						</div>
					</div>
				)

			case 4: // Số lượng người
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div>
								<Label htmlFor="seekingCount">Số người cần tìm *</Label>
								<Input
									id="seekingCount"
									type="number"
									min="1"
									max="10"
									value={formData.seekingCount}
									onChange={(e) => updateFormData('seekingCount', e.target.value)}
									className={errors.seekingCount ? 'border-destructive' : ''}
								/>
								{errors.seekingCount && (
									<p className="text-sm text-destructive mt-1">{errors.seekingCount}</p>
								)}
								<p className="text-sm text-muted-foreground mt-1">
									Số người bạn muốn tìm để ở ghép
								</p>
							</div>

							<div>
								<Label htmlFor="currentOccupancy">Số người hiện tại *</Label>
								<Input
									id="currentOccupancy"
									type="number"
									min="1"
									max="10"
									value={formData.currentOccupancy}
									onChange={(e) => updateFormData('currentOccupancy', e.target.value)}
									className={errors.currentOccupancy ? 'border-destructive' : ''}
								/>
								{errors.currentOccupancy && (
									<p className="text-sm text-destructive mt-1">{errors.currentOccupancy}</p>
								)}
								<p className="text-sm text-muted-foreground mt-1">
									Bao gồm cả bạn
								</p>
							</div>

							<div>
								<Label htmlFor="maxOccupancy">Số người tối đa *</Label>
								<Input
									id="maxOccupancy"
									type="number"
									min="1"
									max="10"
									value={formData.maxOccupancy}
									onChange={(e) => updateFormData('maxOccupancy', e.target.value)}
									className={errors.maxOccupancy ? 'border-destructive' : ''}
								/>
								{errors.maxOccupancy && (
									<p className="text-sm text-destructive mt-1">{errors.maxOccupancy}</p>
								)}
								<p className="text-sm text-muted-foreground mt-1">
									Tổng số người có thể ở
								</p>
							</div>
						</div>

						<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
							<div className="flex items-start space-x-2">
								<Info className="h-5 w-5 text-amber-600 mt-0.5" />
								<div className="text-sm text-amber-800">
									<p className="font-medium">Lưu ý:</p>
									<ul className="list-disc list-inside mt-1 space-y-1">
										<li>Số người tối đa ≥ Số người hiện tại</li>
										<li>Số chỗ trống = Số người tối đa - Số người hiện tại</li>
										<li>Ví dụ: Tối đa 3 người, hiện tại 1 người → Còn 2 chỗ trống</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				)

			case 5: // Yêu cầu & Thời gian
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="preferredGender">Giới tính mong muốn *</Label>
								<Select
									value={formData.preferredGender}
									onValueChange={(value) => updateFormData('preferredGender', value as FormData['preferredGender'])}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="other">Không quan trọng</SelectItem>
										<SelectItem value="male">Nam</SelectItem>
										<SelectItem value="female">Nữ</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div>
							<Label htmlFor="additionalRequirements">Yêu cầu khác (không bắt buộc)</Label>
							<RichTextEditor
								value={formData.additionalRequirements}
								onChange={(value) => updateFormData('additionalRequirements', value)}
								placeholder="VD: Không hút thuốc, sạch sẽ, yên tĩnh. Ưu tiên sinh viên hoặc nhân viên văn phòng."
								maxLength={500}
								showCharCount={true}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label>Ngày có thể vào ở *</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												'w-full justify-start text-left font-normal',
												!formData.availableFromDate && 'text-muted-foreground',
												errors.availableFromDate && 'border-destructive'
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{formData.availableFromDate ? (
												format(new Date(formData.availableFromDate), 'PPP', { locale: vi })
											) : (
												<span>Chọn ngày</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={formData.availableFromDate ? new Date(formData.availableFromDate) : undefined}
											onSelect={(date) => updateFormData('availableFromDate', date?.toISOString() || '')}
											disabled={(date) => date < new Date()}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								{errors.availableFromDate && (
									<p className="text-sm text-destructive mt-1">{errors.availableFromDate}</p>
								)}
							</div>

							<div>
								<Label>Ngày hết hạn bài đăng</Label>
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
												<span>Chọn ngày (không bắt buộc)</span>
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
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="minimumStayMonths">Thời gian ở tối thiểu (tháng)</Label>
								<Input
									id="minimumStayMonths"
									type="number"
									min="1"
									placeholder="VD: 3"
									value={formData.minimumStayMonths}
									onChange={(e) => updateFormData('minimumStayMonths', e.target.value)}
									className={errors.minimumStayMonths ? 'border-destructive' : ''}
								/>
								{errors.minimumStayMonths && (
									<p className="text-sm text-destructive mt-1">{errors.minimumStayMonths}</p>
								)}
							</div>

							<div>
								<Label htmlFor="maximumStayMonths">Thời gian ở tối đa (tháng)</Label>
								<Input
									id="maximumStayMonths"
									type="number"
									min="1"
									placeholder="VD: 12"
									value={formData.maximumStayMonths}
									onChange={(e) => updateFormData('maximumStayMonths', e.target.value)}
									className={errors.maximumStayMonths ? 'border-destructive' : ''}
								/>
								{errors.maximumStayMonths && (
									<p className="text-sm text-destructive mt-1">{errors.maximumStayMonths}</p>
								)}
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<Switch
								id="requiresLandlordApproval"
								checked={formData.requiresLandlordApproval}
								onCheckedChange={(checked) => updateFormData('requiresLandlordApproval', checked)}
							/>
							<Label htmlFor="requiresLandlordApproval">
								Cần sự chấp thuận của chủ nhà
							</Label>
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
				<Button variant="ghost" onClick={() => (onBack ? onBack() : router.back())} className="mb-4">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Quay lại
				</Button>
				
				<div className="mb-6">
					<h1 className="text-2xl font-bold mb-2">
						{mode === 'edit' ? 'Cập nhật bài đăng tìm người ở ghép' : 'Tạo bài đăng tìm người ở ghép'}
					</h1>
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
								<Button type="submit" disabled={isSubmitting || isLoading}>
									{isSubmitting || isLoading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											{mode === 'edit' ? 'Đang cập nhật...' : 'Đang tạo...'}
										</>
									) : (
										mode === 'edit' ? 'Cập nhật bài đăng' : 'Tạo bài đăng'
									)}
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
