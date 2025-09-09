'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Users, Home, Plus } from 'lucide-react'
import { RoomSeekingForm } from '../forms/room-seeking-form'
import { RoommatePostForm } from '../forms/roommate-post-form'
import { RentalPostForm } from '../forms/rental-post-form'
import { useUserStore } from '@/stores/userStore'

type PostType = 'room-seeking' | 'roommate' | 'rental'

interface PostTypeOption {
	id: PostType
	title: string
	description: string
	icon: React.ReactNode
	color: string
}

const postTypes: PostTypeOption[] = [
	{
		id: 'room-seeking',
		title: 'Tìm trọ',
		description: 'Đăng bài tìm phòng trọ phù hợp với nhu cầu của bạn',
		icon: <Search className="h-6 w-6" />,
		color: 'bg-blue-500',
	},
	{
		id: 'roommate',
		title: 'Tìm bạn cùng trọ',
		description: 'Tìm người ở cùng để chia sẻ chi phí và không gian',
		icon: <Users className="h-6 w-6" />,
		color: 'bg-green-500',
	},
	{
		id: 'rental',
		title: 'Cho thuê trọ',
		description: 'Đăng bài cho thuê phòng trọ của bạn',
		icon: <Home className="h-6 w-6" />,
		color: 'bg-orange-500',
	},
]

export function PostCreationWizard() {
	const searchParams = useSearchParams()
	const [selectedType, setSelectedType] = useState<PostType | null>(null)
	const [currentStep, setCurrentStep] = useState(1)
	const { user } = useUserStore()

	// Handle URL parameters to auto-select post type
	useEffect(() => {
		const typeParam = searchParams.get('type') as PostType
		if (typeParam && ['room-seeking', 'roommate', 'rental'].includes(typeParam)) {
			setSelectedType(typeParam)
			setCurrentStep(2)
		}
	}, [searchParams])

	const handleTypeSelect = (type: PostType) => {
		setSelectedType(type)
		setCurrentStep(2)
	}

	const handleBack = () => {
		if (currentStep === 2) {
			setSelectedType(null)
			setCurrentStep(1)
		}
	}

	const renderForm = () => {
		if (!selectedType) return null

		switch (selectedType) {
			case 'room-seeking':
				return <RoomSeekingForm onBack={handleBack} />
			case 'roommate':
				return <RoommatePostForm onBack={handleBack} />
			case 'rental':
				return <RentalPostForm onBack={handleBack} />
			default:
				return null
		}
	}

	if (currentStep === 2) {
		return renderForm()
	}

	return (
		<div className="max-w-4xl mx-auto">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Tạo bài đăng mới</h1>
				<p className="text-muted-foreground">
					Chọn loại bài đăng bạn muốn tạo để bắt đầu
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{postTypes
					.filter((type) => (type.id === 'rental' ? user?.role === 'landlord' : true))
					.map((type) => {
						const isDisabled = type.id === 'roommate'
						const cardClasses = isDisabled
							? 'h-full flex flex-col cursor-not-allowed opacity-60'
							: 'h-full flex flex-col cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105'

						return (
							<Card
								key={type.id}
								className={cardClasses}
								onClick={() => {
									if (isDisabled) return
									handleTypeSelect(type.id)
								}}
							>
								<CardHeader className="text-center">
									<div className={`mx-auto w-16 h-16 rounded-full ${type.color} flex items-center justify-center text-white mb-4`}>
										{type.icon}
									</div>
									<CardTitle className="text-xl">{type.title}</CardTitle>
									<CardDescription className="text-sm">
										{type.description}
									</CardDescription>
								</CardHeader>
								<CardContent className="mt-auto">
									<Button className="w-full" variant="outline" disabled={isDisabled}>
										<Plus className="h-4 w-4 mr-2" />
										Tạo bài đăng
									</Button>
								</CardContent>
							</Card>
						)
					})}
			</div>

			<div className="mt-8 text-center">
				<p className="text-sm text-muted-foreground">
					Bạn có thể chỉnh sửa hoặc xóa bài đăng sau khi tạo
				</p>
			</div>
		</div>
	)
}
