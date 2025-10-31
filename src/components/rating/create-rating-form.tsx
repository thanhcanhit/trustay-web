'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { RatingStars } from './rating-stars';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRatingStore } from '@/stores/ratingStore';
import type { RatingTargetType } from '@/types/types';
import { uploadBulkImages } from '@/actions';

interface CreateRatingFormProps {
	targetType: RatingTargetType;
	targetId: string;
	rentalId?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function CreateRatingForm({
	targetType,
	targetId,
	rentalId,
	onSuccess,
	onCancel,
}: CreateRatingFormProps) {
	const [rating, setRating] = useState(0);
	const [content, setContent] = useState('');
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	const { createRating, isLoading } = useRatingStore();

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const newFiles = Array.from(files);
		const totalFiles = imageFiles.length + newFiles.length;

		if (totalFiles > 5) {
			toast.error('Quá nhiều ảnh', {
				description: 'Bạn chỉ có thể tải lên tối đa 5 ảnh',
			});
			return;
		}

		// Create previews
		const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

		setImageFiles((prev) => [...prev, ...newFiles]);
		setImagePreviews((prev) => [...prev, ...newPreviews]);
	};

	const removeImage = (index: number) => {
		setImageFiles((prev) => prev.filter((_, i) => i !== index));
		setImagePreviews((prev) => {
			// Revoke the object URL to prevent memory leaks
			URL.revokeObjectURL(prev[index]);
			return prev.filter((_, i) => i !== index);
		});
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (rating === 0) {
			toast.error('Vui lòng chọn đánh giá', {
				description: 'Bạn cần chọn số sao trước khi gửi đánh giá',
			});
			return;
		}

		try {
			setIsUploading(true);

			// Upload images if any
			let imageUrls: string[] = [];
			if (imageFiles.length > 0) {
				const uploadResult = await uploadBulkImages(imageFiles);
				imageUrls = uploadResult.results.map((result) => result.imagePath);
			}

			// Create rating
			await createRating({
				targetType,
				targetId,
				rating,
				content: content.trim() || undefined,
				images: imageUrls.length > 0 ? imageUrls : undefined,
				rentalId,
			});

			toast.success('Thành công!', {
				description: 'Đánh giá của bạn đã được gửi',
			});

			// Reset form
			setRating(0);
			setContent('');
			setImageFiles([]);
			setImagePreviews([]);

			onSuccess?.();
		} catch (error) {
			toast.error('Lỗi', {
				description:
					error instanceof Error ? error.message : 'Không thể gửi đánh giá',
			});
		} finally {
			setIsUploading(false);
		}
	};

	const getTargetLabel = () => {
		switch (targetType) {
			case 'tenant':
				return 'người thuê';
			case 'landlord':
				return 'chủ trọ';
			case 'room':
				return 'phòng trọ';
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Rating Input */}
			<div className="space-y-2">
				<Label className="text-base font-semibold">
					Đánh giá của bạn <span className="text-red-500">*</span>
				</Label>
				<div className="flex items-center gap-4">
					<RatingStars
						rating={rating}
						size="large"
						interactive
						onChange={setRating}
						showValue={false}
					/>
					{rating > 0 && (
						<span className="text-lg font-semibold text-yellow-600">
							{rating} {rating === 1 ? 'sao' : 'sao'}
						</span>
					)}
				</div>
				<p className="text-sm text-gray-500">
					Nhấp vào các ngôi sao để đánh giá {getTargetLabel()} này
				</p>
			</div>

			{/* Content Input */}
			<div className="space-y-2">
				<Label htmlFor="content" className="text-base font-semibold">
					Nhận xét của bạn (Không bắt buộc)
				</Label>
				<Textarea
					id="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder={`Chia sẻ trải nghiệm của bạn về ${getTargetLabel()} này...`}
					rows={5}
					className="resize-none"
				/>
				<p className="text-sm text-gray-500">
					{content.length}/500 ký tự
				</p>
			</div>

			{/* Image Upload */}
			<div className="space-y-2">
				<Label className="text-base font-semibold">
					Thêm ảnh (Không bắt buộc)
				</Label>
				<div className="space-y-3">
					{/* Image Previews */}
					{imagePreviews.length > 0 && (
						<div className="grid grid-cols-5 gap-3">
							{imagePreviews.map((preview, index) => (
								<div key={index} className="relative group aspect-square">
									<Image
										src={preview}
										alt={`Preview ${index + 1}`}
										fill
										className="object-cover rounded-lg border-2 border-gray-200"
									/>
									<button
										type="button"
										onClick={() => removeImage(index)}
										className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							))}
						</div>
					)}

					{/* Upload Button */}
					{imageFiles.length < 5 && (
						<div>
							<input
								type="file"
								id="images"
								accept="image/*"
								multiple
								onChange={handleImageSelect}
								className="hidden"
							/>
							<label
								htmlFor="images"
								className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
							>
								<Upload className="w-5 h-5 text-gray-400" />
								<span className="text-sm text-gray-600">
									Tải ảnh lên ({imageFiles.length}/5)
								</span>
							</label>
						</div>
					)}
				</div>
				<p className="text-sm text-gray-500">
					Bạn có thể tải lên tối đa 5 ảnh để minh họa cho đánh giá
				</p>
			</div>

			{/* Actions */}
			<div className="flex gap-3 justify-end">
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						Hủy
					</Button>
				)}
				<Button
					type="submit"
					disabled={rating === 0 || isLoading || isUploading}
				>
					{isLoading || isUploading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{isUploading ? 'Đang tải...' : 'Đang gửi...'}
						</>
					) : (
						'Gửi đánh giá'
					)}
				</Button>
			</div>
		</form>
	);
}
