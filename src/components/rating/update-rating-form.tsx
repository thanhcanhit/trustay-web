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
import type { RatingResponseDto } from '@/types/types';
import { uploadBulkImages } from '@/actions';

interface UpdateRatingFormProps {
	rating: RatingResponseDto;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function UpdateRatingForm({
	rating,
	onSuccess,
	onCancel,
}: UpdateRatingFormProps) {
	const [newRating, setNewRating] = useState(rating.rating);
	const [content, setContent] = useState(rating.content || '');
	const [existingImages, setExistingImages] = useState<string[]>(
		rating.images || [],
	);
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	const { updateRating, isLoading } = useRatingStore();

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const newFiles = Array.from(files);
		const totalImages =
			existingImages.length + imageFiles.length + newFiles.length;

		if (totalImages > 5) {
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

	const removeExistingImage = (index: number) => {
		setExistingImages((prev) => prev.filter((_, i) => i !== index));
	};

	const removeNewImage = (index: number) => {
		setImageFiles((prev) => prev.filter((_, i) => i !== index));
		setImagePreviews((prev) => {
			// Revoke the object URL to prevent memory leaks
			URL.revokeObjectURL(prev[index]);
			return prev.filter((_, i) => i !== index);
		});
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (newRating === 0) {
			toast.error('Vui lòng chọn đánh giá', {
				description: 'Bạn cần chọn số sao trước khi gửi đánh giá',
			});
			return;
		}

		try {
			setIsUploading(true);

			// Upload new images if any
			let newImageUrls: string[] = [];
			if (imageFiles.length > 0) {
				const uploadResult = await uploadBulkImages(imageFiles);
				newImageUrls = uploadResult.results.map((result) => result.imagePath);
			}

			// Combine existing and new images
			const allImages = [...existingImages, ...newImageUrls];

			// Update rating
			await updateRating(rating.id, {
				rating: newRating,
				content: content.trim() || undefined,
				images: allImages.length > 0 ? allImages : undefined,
			});

			toast.success('Thành công!', {
				description: 'Đánh giá của bạn đã được cập nhật',
			});

			onSuccess?.();
		} catch (error) {
			toast.error('Lỗi', {
				description:
					error instanceof Error ? error.message : 'Không thể cập nhật đánh giá',
			});
		} finally {
			setIsUploading(false);
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
						rating={newRating}
						size="large"
						interactive
						onChange={setNewRating}
						showValue={false}
					/>
					{newRating > 0 && (
						<span className="text-lg font-semibold text-yellow-600">
							{newRating} {newRating === 1 ? 'sao' : 'sao'}
						</span>
					)}
				</div>
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
					placeholder="Chia sẻ trải nghiệm của bạn..."
					rows={5}
					className="resize-none"
				/>
				<p className="text-sm text-gray-500">
					{content.length}/500 ký tự
				</p>
			</div>

			{/* Image Management */}
			<div className="space-y-2">
				<Label className="text-base font-semibold">
					Ảnh (Không bắt buộc)
				</Label>
				<div className="space-y-3">
					{/* Existing Images */}
					{existingImages.length > 0 && (
						<div>
							<p className="text-sm text-gray-500 mb-2">Ảnh hiện tại:</p>
							<div className="grid grid-cols-5 gap-3">
								{existingImages.map((imageUrl, index) => (
									<div key={index} className="relative group aspect-square">
										<Image
											src={imageUrl}
											alt={`Existing ${index + 1}`}
											fill
											className="object-cover rounded-lg border-2 border-gray-200"
										/>
										<button
											type="button"
											onClick={() => removeExistingImage(index)}
											className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* New Image Previews */}
					{imagePreviews.length > 0 && (
						<div>
							<p className="text-sm text-gray-500 mb-2">Ảnh mới:</p>
							<div className="grid grid-cols-5 gap-3">
								{imagePreviews.map((preview, index) => (
									<div key={index} className="relative group aspect-square">
										<Image
											src={preview}
											alt={`New ${index + 1}`}
											fill
											className="object-cover rounded-lg border-2 border-blue-200"
										/>
										<button
											type="button"
											onClick={() => removeNewImage(index)}
											className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Upload Button */}
					{existingImages.length + imageFiles.length < 5 && (
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
									Tải ảnh lên (
									{existingImages.length + imageFiles.length}/5)
								</span>
							</label>
						</div>
					)}
				</div>
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
					disabled={newRating === 0 || isLoading || isUploading}
				>
					{isLoading || isUploading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{isUploading ? 'Đang tải...' : 'Đang cập nhật...'}
						</>
					) : (
						'Cập nhật đánh giá'
					)}
				</Button>
			</div>
		</form>
	);
}
