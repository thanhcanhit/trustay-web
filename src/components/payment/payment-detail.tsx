'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Download, Edit } from 'lucide-react';
import Image from 'next/image';
import type { Payment } from '@/types/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { usePaymentStore } from '@/stores/paymentStore';

interface PaymentDetailProps {
	payment: Payment;
	open: boolean;
	onClose: () => void;
}

export function PaymentDetail({ payment, open, onClose }: PaymentDetailProps) {
	const { update, submitting } = usePaymentStore();

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			pending: { label: 'Chờ xử lý', variant: 'secondary' as const },
			completed: { label: 'Đã hoàn thành', variant: 'default' as const },
			failed: { label: 'Thất bại', variant: 'destructive' as const },
			cancelled: { label: 'Đã hủy', variant: 'outline' as const },
			refunded: { label: 'Đã hoàn tiền', variant: 'secondary' as const },
		};

		const config = statusConfig[status as keyof typeof statusConfig] || {
			label: status,
			variant: 'outline' as const,
		};
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	const getPaymentTypeLabel = (type: string) => {
		const labels = {
			rent: 'Tiền thuê',
			deposit: 'Tiền cọc',
			utility: 'Tiền tiện ích',
			maintenance: 'Bảo trì',
			penalty: 'Phạt',
			refund: 'Hoàn tiền',
			other: 'Khác',
		};
		return labels[type as keyof typeof labels] || type;
	};

	const getPaymentMethodLabel = (method: string) => {
		const labels = {
			bank_transfer: 'Chuyển khoản',
			cash: 'Tiền mặt',
			credit_card: 'Thẻ tín dụng',
			e_wallet: 'Ví điện tử',
			qr_code: 'Mã QR',
			other: 'Khác',
		};
		return labels[method as keyof typeof labels] || method;
	};

	const handleMarkAsCompleted = async () => {
		const success = await update(payment.id, {
			status: 'completed',
			paidDate: new Date().toISOString(),
		});
		if (success) {
			onClose();
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Chi tiết thanh toán
						{getStatusBadge(payment.status)}
					</DialogTitle>
					<DialogDescription>
						Mã giao dịch: {payment.transactionId || payment.id}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Amount */}
					<div className="bg-green-50 border border-green-200 rounded-lg p-4">
						<p className="text-sm text-gray-600 mb-1">Số tiền</p>
						<p className="text-3xl font-bold text-green-600">
							{formatCurrency(payment.amount, payment.currency)}
						</p>
					</div>

					{/* Basic Info */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-500 mb-1">Loại thanh toán</p>
							<p className="text-sm font-medium">
								{getPaymentTypeLabel(payment.paymentType)}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500 mb-1">Phương thức</p>
							<p className="text-sm font-medium">
								{getPaymentMethodLabel(payment.paymentMethod)}
							</p>
						</div>
						{payment.dueDate && (
							<div>
								<p className="text-sm text-gray-500 mb-1">Hạn thanh toán</p>
								<p className="text-sm font-medium">{formatDate(payment.dueDate)}</p>
							</div>
						)}
						{payment.paidDate && (
							<div>
								<p className="text-sm text-gray-500 mb-1">Ngày thanh toán</p>
								<p className="text-sm font-medium">{formatDate(payment.paidDate)}</p>
							</div>
						)}
					</div>

					<Separator />

					{/* Payer & Receiver Info */}
					{payment.payer && (
						<div>
							<p className="text-sm text-gray-500 mb-1">Người thanh toán</p>
							<div className="flex items-center gap-2">
								<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
									{payment.payer.avatarUrl ? (
										<Image
											src={payment.payer.avatarUrl}
											alt={`${payment.payer.firstName} ${payment.payer.lastName}`}
											width={40}
											height={40}
											className="rounded-full object-cover"
										/>
									) : (
										<span className="text-gray-600 font-medium">
											{payment.payer.firstName?.charAt(0)}
										</span>
									)}
								</div>
								<div>
									<p className="text-sm font-medium">
										{payment.payer.firstName} {payment.payer.lastName}
									</p>
									<p className="text-xs text-gray-500">{payment.payer.email}</p>
								</div>
							</div>
						</div>
					)}

					{payment.receiver && (
						<div>
							<p className="text-sm text-gray-500 mb-1">Người nhận</p>
							<div className="flex items-center gap-2">
								<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
									{payment.receiver.avatarUrl ? (
										<Image
											src={payment.receiver.avatarUrl}
											alt={`${payment.receiver.firstName} ${payment.receiver.lastName}`}
											width={40}
											height={40}
											className="rounded-full object-cover"
										/>
									) : (
										<span className="text-gray-600 font-medium">
											{payment.receiver.firstName?.charAt(0)}
										</span>
									)}
								</div>
								<div>
									<p className="text-sm font-medium">
										{payment.receiver.firstName} {payment.receiver.lastName}
									</p>
									<p className="text-xs text-gray-500">{payment.receiver.email}</p>
								</div>
							</div>
						</div>
					)}

					<Separator />

					{/* Receipt Info */}
					{payment.receiptNumber && (
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
							<p className="text-sm font-medium mb-2">Thông tin biên lai</p>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Số biên lai:</span>
									<span className="text-sm font-medium">{payment.receiptNumber}</span>
								</div>
								{payment.receiptDate && (
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Ngày biên lai:</span>
										<span className="text-sm font-medium">
											{formatDate(payment.receiptDate)}
										</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Description & Notes */}
					{payment.description && (
						<div>
							<p className="text-sm text-gray-500 mb-1">Mô tả</p>
							<p className="text-sm">{payment.description}</p>
						</div>
					)}

					{payment.notes && (
						<div>
							<p className="text-sm text-gray-500 mb-1">Ghi chú</p>
							<p className="text-sm">{payment.notes}</p>
						</div>
					)}

					<Separator />

					{/* Timestamps */}
					<div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
						<div>
							<p>Tạo lúc: {formatDate(payment.createdAt, 'long')}</p>
						</div>
						<div>
							<p>Cập nhật: {formatDate(payment.updatedAt, 'long')}</p>
						</div>
					</div>
				</div>

				<DialogFooter>
					<div className="flex gap-2">
						{payment.receiptNumber && (
							<Button variant="outline">
								<Download className="mr-2 h-4 w-4" />
								Tải biên lai
							</Button>
						)}
						{payment.status === 'pending' && (
							<Button onClick={handleMarkAsCompleted} disabled={submitting}>
								{submitting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Edit className="mr-2 h-4 w-4" />
								)}
								Đánh dấu đã thanh toán
							</Button>
						)}
						<Button variant="outline" onClick={onClose}>
							Đóng
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
