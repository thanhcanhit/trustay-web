'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { usePaymentStore } from '@/stores/paymentStore';
import type { CreatePaymentRequest } from '@/types/types';

interface CreatePaymentDialogProps {
	open: boolean;
	onClose: () => void;
	rentalId?: string;
	contractId?: string;
}

export function CreatePaymentDialog({
	open,
	onClose,
	rentalId,
	contractId,
}: CreatePaymentDialogProps) {
	const { create, submitting, submitError } = usePaymentStore();

	const [formData, setFormData] = useState<CreatePaymentRequest>({
		rentalId: rentalId || '',
		contractId: contractId || '',
		amount: 0,
		paymentType: 'rent',
		paymentMethod: 'bank_transfer',
		currency: 'VND',
		description: '',
		dueDate: '',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const success = await create(formData);
		if (success) {
			onClose();
			// Reset form
			setFormData({
				rentalId: rentalId || '',
				contractId: contractId || '',
				amount: 0,
				paymentType: 'rent',
				paymentMethod: 'bank_transfer',
				currency: 'VND',
				description: '',
				dueDate: '',
			});
		}
	};

	const handleChange = (field: keyof CreatePaymentRequest, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Tạo thanh toán mới</DialogTitle>
					<DialogDescription>
						Nhập thông tin thanh toán để tạo giao dịch mới
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Rental ID / Contract ID */}
					<div className="grid grid-cols-2 gap-4">
						{!rentalId && (
							<div>
								<Label htmlFor="rentalId">Rental ID</Label>
								<Input
									id="rentalId"
									value={formData.rentalId}
									onChange={(e) => handleChange('rentalId', e.target.value)}
									placeholder="Nhập rental ID"
								/>
							</div>
						)}
						{!contractId && (
							<div>
								<Label htmlFor="contractId">Contract ID (tùy chọn)</Label>
								<Input
									id="contractId"
									value={formData.contractId}
									onChange={(e) => handleChange('contractId', e.target.value)}
									placeholder="Nhập contract ID"
								/>
							</div>
						)}
					</div>

					{/* Payment Type */}
					<div>
						<Label htmlFor="paymentType">Loại thanh toán</Label>
						<Select
							value={formData.paymentType}
							onValueChange={(value) => handleChange('paymentType', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn loại thanh toán" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="rent">Tiền thuê</SelectItem>
								<SelectItem value="deposit">Tiền cọc</SelectItem>
								<SelectItem value="utility">Tiền tiện ích</SelectItem>
								<SelectItem value="maintenance">Bảo trì</SelectItem>
								<SelectItem value="penalty">Phạt</SelectItem>
								<SelectItem value="refund">Hoàn tiền</SelectItem>
								<SelectItem value="other">Khác</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Amount */}
					<div>
						<Label htmlFor="amount">Số tiền</Label>
						<Input
							id="amount"
							type="number"
							value={formData.amount}
							onChange={(e) => handleChange('amount', Number.parseFloat(e.target.value))}
							placeholder="Nhập số tiền"
							min={0}
							step={1000}
							required
						/>
					</div>

					{/* Payment Method */}
					<div>
						<Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
						<Select
							value={formData.paymentMethod}
							onValueChange={(value) => handleChange('paymentMethod', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn phương thức" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
								<SelectItem value="cash">Tiền mặt</SelectItem>
								<SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
								<SelectItem value="e_wallet">Ví điện tử</SelectItem>
								<SelectItem value="qr_code">Mã QR</SelectItem>
								<SelectItem value="other">Khác</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Due Date */}
					<div>
						<Label htmlFor="dueDate">Hạn thanh toán (tùy chọn)</Label>
						<Input
							id="dueDate"
							type="date"
							value={formData.dueDate}
							onChange={(e) => handleChange('dueDate', e.target.value)}
						/>
					</div>

					{/* Description */}
					<div>
						<Label htmlFor="description">Mô tả (tùy chọn)</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => handleChange('description', e.target.value)}
							placeholder="Nhập mô tả thanh toán"
							rows={3}
						/>
					</div>

					{/* Error Message */}
					{submitError && (
						<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
							{submitError}
						</div>
					)}

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Hủy
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Đang tạo...
								</>
							) : (
								'Tạo thanh toán'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
