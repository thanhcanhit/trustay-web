'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePaymentStore } from '@/stores/paymentStore';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Eye, Download, QrCode, CreditCard } from 'lucide-react';
import Image from 'next/image';
import type { Payment } from '@/types/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PaymentDetail } from './payment-detail';
import { CreatePaymentDialog } from './create-payment-dialog';

interface PaymentListProps {
	rentalId?: string;
	contractId?: string;
}

export function PaymentList({ rentalId, contractId }: PaymentListProps) {
	const {
		payments,
		loading,
		error,
		meta,
		loadPayments,
		generateQR,
		qrCodeUrl,
		generating,
		clearQRCode,
	} = usePaymentStore();

	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [typeFilter, setTypeFilter] = useState<string>('all');
	const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
	const [showQRDialog, setShowQRDialog] = useState(false);
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	const loadPaymentsCallback = useCallback(() => {
		loadPayments({
			page: 1,
			limit: 20,
			rentalId,
			contractId,
			status: statusFilter !== 'all' ? statusFilter : undefined,
			paymentType: typeFilter !== 'all' ? typeFilter : undefined,
		});
	}, [loadPayments, statusFilter, typeFilter, rentalId, contractId]);

	useEffect(() => {
		loadPaymentsCallback();
	}, [loadPaymentsCallback]);

	const handleViewDetail = (payment: Payment) => {
		setSelectedPayment(payment);
	};

	const handleGenerateQR = async (paymentId: string) => {
		const success = await generateQR(paymentId);
		if (success) {
			setShowQRDialog(true);
		}
	};

	const handleCloseQRDialog = () => {
		setShowQRDialog(false);
		clearQRCode();
	};

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

	if (loading && payments.length === 0) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-green-600" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h2>
					<p className="text-sm text-gray-500 mt-1">
						Quản lý tất cả các giao dịch thanh toán của bạn
					</p>
				</div>
				<Button onClick={() => setShowCreateDialog(true)}>
					<CreditCard className="mr-2 h-4 w-4" />
					Tạo thanh toán
				</Button>
			</div>

			{/* Filters */}
			<div className="flex gap-4">
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Trạng thái" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="pending">Chờ xử lý</SelectItem>
						<SelectItem value="completed">Đã hoàn thành</SelectItem>
						<SelectItem value="failed">Thất bại</SelectItem>
						<SelectItem value="cancelled">Đã hủy</SelectItem>
						<SelectItem value="refunded">Đã hoàn tiền</SelectItem>
					</SelectContent>
				</Select>

				<Select value={typeFilter} onValueChange={setTypeFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Loại thanh toán" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="rent">Tiền thuê</SelectItem>
						<SelectItem value="deposit">Tiền cọc</SelectItem>
						<SelectItem value="utility">Tiền tiện ích</SelectItem>
						<SelectItem value="maintenance">Bảo trì</SelectItem>
						<SelectItem value="penalty">Phạt</SelectItem>
						<SelectItem value="refund">Hoàn tiền</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
					{error}
				</div>
			)}

			{/* Payment List */}
			{payments.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<CreditCard className="h-12 w-12 text-gray-400 mb-4" />
						<p className="text-gray-500 text-center">
							Chưa có giao dịch thanh toán nào
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{payments.map((payment) => (
						<Card key={payment.id} className="hover:shadow-md transition-shadow">
							<CardHeader>
								<div className="flex justify-between items-start">
									<div className="space-y-1">
										<CardTitle className="text-lg">
											{getPaymentTypeLabel(payment.paymentType)}
										</CardTitle>
										<CardDescription>
											Mã GD: {payment.transactionId || payment.id.slice(0, 8)}
										</CardDescription>
									</div>
									<div className="text-right space-y-2">
										<div className="text-2xl font-bold text-green-600">
											{formatCurrency(payment.amount)}
										</div>
										{getStatusBadge(payment.status)}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4 mb-4">
									<div>
										<p className="text-sm text-gray-500">Phương thức</p>
										<p className="text-sm font-medium">
											{getPaymentMethodLabel(payment.paymentMethod)}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">Ngày thanh toán</p>
										<p className="text-sm font-medium">
											{payment.paidDate
												? formatDate(payment.paidDate)
												: 'Chưa thanh toán'}
										</p>
									</div>
									{payment.dueDate && (
										<div>
											<p className="text-sm text-gray-500">Hạn thanh toán</p>
											<p className="text-sm font-medium">
												{formatDate(payment.dueDate)}
											</p>
										</div>
									)}
									{payment.description && (
										<div className="col-span-2">
											<p className="text-sm text-gray-500">Mô tả</p>
											<p className="text-sm font-medium">{payment.description}</p>
										</div>
									)}
								</div>

								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleViewDetail(payment)}
									>
										<Eye className="mr-2 h-4 w-4" />
										Chi tiết
									</Button>
									{payment.status === 'pending' && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleGenerateQR(payment.id)}
											disabled={generating}
										>
											{generating ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<QrCode className="mr-2 h-4 w-4" />
											)}
											Tạo mã QR
										</Button>
									)}
									{payment.receiptNumber && (
										<Button variant="outline" size="sm">
											<Download className="mr-2 h-4 w-4" />
											Tải biên lai
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Pagination */}
			{meta && meta.totalPages > 1 && (
				<div className="flex justify-center gap-2">
					<Button
						variant="outline"
						onClick={() =>
							loadPayments({
								page: (meta.page || 1) - 1,
								limit: meta.limit,
								rentalId,
								contractId,
								status: statusFilter !== 'all' ? statusFilter : undefined,
								paymentType: typeFilter !== 'all' ? typeFilter : undefined,
							})
						}
						disabled={!meta.page || meta.page <= 1}
					>
						Trang trước
					</Button>
					<span className="py-2 px-4">
						Trang {meta.page} / {meta.totalPages}
					</span>
					<Button
						variant="outline"
						onClick={() =>
							loadPayments({
								page: (meta.page || 1) + 1,
								limit: meta.limit,
								rentalId,
								contractId,
								status: statusFilter !== 'all' ? statusFilter : undefined,
								paymentType: typeFilter !== 'all' ? typeFilter : undefined,
							})
						}
						disabled={meta.page >= meta.totalPages}
					>
						Trang sau
					</Button>
				</div>
			)}

			{/* Payment Detail Dialog */}
			{selectedPayment && (
				<PaymentDetail
					payment={selectedPayment}
					open={!!selectedPayment}
					onClose={() => setSelectedPayment(null)}
				/>
			)}

			{/* QR Code Dialog */}
			<Dialog open={showQRDialog} onOpenChange={handleCloseQRDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Mã QR thanh toán</DialogTitle>
						<DialogDescription>
							Quét mã QR để thanh toán nhanh chóng
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-center py-6">
						{qrCodeUrl ? (
							<Image
								src={qrCodeUrl}
								alt="QR Code"
								width={256}
								height={256}
								className="w-64 h-64"
							/>
						) : (
							<div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
								<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Create Payment Dialog */}
			<CreatePaymentDialog
				open={showCreateDialog}
				onClose={() => setShowCreateDialog(false)}
				rentalId={rentalId}
				contractId={contractId}
			/>
		</div>
	);
}
