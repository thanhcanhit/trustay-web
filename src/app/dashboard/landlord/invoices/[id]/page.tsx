'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useBillStore } from '@/stores/billStore';
import { UpdateMeterDataDialog } from '@/components/billing/UpdateMeterDataDialog';
import {
	formatCurrency,
	formatBillingPeriod,
	getBillStatusColor,
	getBillStatusLabel,
	formatDate,
	isBillOverdue,
	getDaysUntilDue,
} from '@/utils/billUtils';
import {
	ArrowLeft,
	Calendar,
	Home,
	User,
	AlertCircle,
	CheckCircle2,
	Receipt,
	Gauge,
	Trash2,
	QrCode,
	ExternalLink,
	Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QRCode from 'react-qr-code';
import type { PayOSLinkResponse } from '@/types/bill.types';

export default function BillDetailPage() {
	const params = useParams();
	const router = useRouter();
	const billId = params.id as string;

	const {
		current: bill,
		loadingCurrent: loading,
		loadById,
		markPaid,
		remove,
		markingPaid,
		deleting,
	} = useBillStore();

	const [showMeterDialog, setShowMeterDialog] = useState(false);
	const [creatingPayLink, setCreatingPayLink] = useState(false);
	const [payOSInfo, setPayOSInfo] = useState<PayOSLinkResponse | null>(null);

	useEffect(() => {
		if (billId) {
			loadById(billId);
		}
	}, [billId, loadById]);

	const handleMarkAsPaid = async () => {
		if (!bill) return;

		const success = await markPaid(bill.id);
		if (success) {
			toast.success('Đã đánh dấu thanh toán');
			loadById(billId);
		} else {
			toast.error('Có lỗi khi đánh dấu thanh toán');
		}
	};

	const handleDelete = async () => {
		if (!bill) return;

		const success = await remove(bill.id);
		if (success) {
			toast.success('Đã xóa hóa đơn');
			router.push('/dashboard/landlord/invoices');
		} else {
			toast.error('Có lỗi khi xóa hóa đơn');
		}
	};

	const handleMeterDataUpdated = () => {
		// Reload bill after meter data is updated
		loadById(billId);
	};

	const buildPayOSUrls = (billIdentifier: string) => {
		const baseUrl = (process.env.NEXT_PUBLIC_PAYMENT_RETURN_BASE_URL || 'https://trustay.life').replace(/\/$/, '');
		const query = `billId=${encodeURIComponent(billIdentifier)}`;
		return {
			returnUrl: `${baseUrl}/payments/success?${query}`,
			cancelUrl: `${baseUrl}/payments/cancel?${query}`,
		};
	};

	const handleGeneratePayOSLink = async () => {
		if (!bill) return;
		if (creatingPayLink) return;

		try {
			setCreatingPayLink(true);
			const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
			if (!token) {
				toast.error('Bạn cần đăng nhập để tạo link thanh toán');
				return;
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bills/${bill.id}/payos-link`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(buildPayOSUrls(bill.id)),
			});

			if (!response.ok) {
				throw new Error('Không thể tạo liên kết PayOS');
			}

			const data: PayOSLinkResponse = await response.json();
			if (!data.checkoutUrl && !data.qrCode) {
				throw new Error('Không nhận được liên kết PayOS hợp lệ');
			}
			setPayOSInfo(data);
		} catch (error) {
			console.error('Error creating PayOS link:', error);
			toast.error('Có lỗi khi tạo liên kết PayOS');
		} finally {
			setCreatingPayLink(false);
		}
	};

	const copyCheckoutUrl = async () => {
		if (!payOSInfo?.checkoutUrl) return;
		try {
			await navigator.clipboard.writeText(payOSInfo.checkoutUrl);
			toast.success('Đã sao chép liên kết thanh toán');
		} catch {
			toast.error('Không thể sao chép liên kết, vui lòng thử lại');
		}
	};

	const formattedPayAmount = useMemo(() => {
		if (!payOSInfo?.amount) return null;
		return payOSInfo.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
	}, [payOSInfo]);

	if (loading) {
		return (
			<DashboardLayout userType="landlord">
				<div className="flex items-center justify-center h-screen">
					<div className="text-center">Đang tải...</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!bill) {
		return (
			<DashboardLayout userType="landlord">
				<div className="flex items-center justify-center h-screen">
					<div className="text-center">
						<p className="text-lg mb-4">Không tìm thấy hóa đơn</p>
						<Button onClick={() => router.push('/dashboard/landlord/invoices')}>
							Quay lại danh sách
						</Button>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	const isOverdue = isBillOverdue(bill);
	const daysUntilDue = getDaysUntilDue(bill.dueDate);
	const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 0 && bill.status === 'pending';

	return (
		<DashboardLayout userType="landlord">
			<div className="px-6 pb-6">
				<div className="flex items-center gap-4 mb-6">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push('/dashboard/landlord/invoices')}
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<PageHeader
						title="Chi tiết hóa đơn"
						subtitle={`Hóa đơn ${formatBillingPeriod(bill.billingPeriod)}`}
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Bill Details */}
					<div className="lg:col-span-2 space-y-6">
						{/* Bill Info */}
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div>
										<CardTitle className="text-2xl">
											{formatBillingPeriod(bill.billingPeriod)}
										</CardTitle>
										<div className="flex items-center gap-2 mt-2 text-muted-foreground">
											<Home className="w-4 h-4" />
											<span>
												Phòng {bill.rental?.roomInstance?.roomNumber} - {bill.rental?.roomInstance?.room?.name}
											</span>
										</div>
									</div>
									<Badge variant={getBillStatusColor(bill.status)} className="text-base px-3 py-1">
										{getBillStatusLabel(bill.status)}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4">
									<div className="flex items-center gap-2">
										<Calendar className="w-4 h-4 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">Kỳ thanh toán</p>
											<p className="font-medium">
												{formatDate(bill.periodStart)} - {formatDate(bill.periodEnd)}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Calendar className="w-4 h-4 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">Hạn thanh toán</p>
											<p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
												{formatDate(bill.dueDate)}
											</p>
										</div>
									</div>
									{bill.occupancyCount && (
										<div className="flex items-center gap-2">
											<User className="w-4 h-4 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">Số người ở</p>
												<p className="font-medium">{bill.occupancyCount} người</p>
											</div>
										</div>
									)}
									{bill.paidDate && (
										<div className="flex items-center gap-2">
											<CheckCircle2 className="w-4 h-4 text-green-600" />
											<div>
												<p className="text-sm text-muted-foreground">Ngày thanh toán</p>
												<p className="font-medium text-green-600">{formatDate(bill.paidDate)}</p>
											</div>
										</div>
									)}
								</div>

								{/* Warnings */}
								{isOverdue && (
									<div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
										<AlertCircle className="w-4 h-4" />
										<span>Quá hạn {Math.abs(daysUntilDue)} ngày</span>
									</div>
								)}
								{isDueSoon && (
									<div className="mt-4 flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
										<AlertCircle className="w-4 h-4" />
										<span>Còn {daysUntilDue} ngày đến hạn</span>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Bill Items */}
						<Card>
							<CardHeader>
								<CardTitle>Chi tiết thanh toán</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{bill.billItems && bill.billItems.length > 0 ? (
										bill.billItems.map((item) => (
											<div key={item.id} className="border-b last:border-0 pb-4 last:pb-0">
												<div className="flex justify-between items-start">
													<div className="flex-1">
														<p className="font-medium">{item.itemName}</p>
														{item.description && (
															<p className="text-sm text-muted-foreground">{item.description}</p>
														)}
														{item.meterReading && (
															<div className="mt-1 text-xs text-muted-foreground">
																<span>
																	Tiêu thụ: {item.meterReading.consumption} {item.meterReading.unit}
																</span>
																<span className="mx-2">•</span>
																<span>
																	Chỉ số: {item.meterReading.lastReading} → {item.meterReading.currentReading}
																</span>
															</div>
														)}
														{item.quantity && item.unitPrice && !item.meterReading && (
															<p className="text-sm text-muted-foreground">
																{item.quantity} × {formatCurrency(item.unitPrice)}
															</p>
														)}
													</div>
													<span className="font-semibold text-lg ml-4">
														{formatCurrency(item.amount)}
													</span>
												</div>
											</div>
										))
									) : (
										<div className="text-center py-8 text-muted-foreground">
											Chưa có chi tiết thanh toán
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Meter Data Input */}
						{bill.requiresMeterData && bill.meteredCostsToInput && bill.meteredCostsToInput.length > 0 && (
							<Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="flex items-center gap-2 text-blue-900">
												<AlertCircle className="w-5 h-5 text-blue-600" />
												Cần nhập số đồng hồ
											</CardTitle>
											<p className="text-sm text-muted-foreground mt-1">
												Hóa đơn sẽ tự động chuyển sang trạng thái <span className="font-medium">Chờ thanh toán</span> sau khi nhập đủ số đồng hồ
											</p>
										</div>
										<Button
											size="sm"
											onClick={() => setShowMeterDialog(true)}
											className="bg-blue-600 hover:bg-blue-700"
										>
											<Gauge className="w-4 h-4 mr-2" />
											Nhập ngay
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{bill.meteredCostsToInput.map((cost) => (
											<div
												key={cost.roomCostId}
												className="flex items-center gap-2 text-sm p-2 bg-white rounded border border-blue-200"
											>
												<Receipt className="w-4 h-4 text-blue-600" />
												<span className="font-medium">
													{cost.name} ({cost.unit})
												</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Update button for draft bills without requiresMeterData */}
						{!bill.requiresMeterData && bill.status === 'draft' && (
							<Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="flex items-center gap-2 text-blue-900">
												<AlertCircle className="w-5 h-5 text-blue-600" />
												Hóa đơn chưa hoàn thành
											</CardTitle>
											<p className="text-sm text-muted-foreground mt-1">
												Cập nhật số đồng hồ (nếu có) và số người ở để hoàn thành hóa đơn
											</p>
										</div>
										<Button
											size="sm"
											onClick={() => setShowMeterDialog(true)}
											className="bg-blue-600 hover:bg-blue-700"
										>
											<Gauge className="w-4 h-4 mr-2" />
											Cập nhật ngay
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-sm text-muted-foreground">
										<p>Hóa đơn này đang ở trạng thái nháp. Vui lòng cập nhật thông tin để chuyển sang trạng thái chờ thanh toán.</p>
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Right Column - Summary & Actions */}
					<div className="lg:col-span-1 space-y-6">
						{/* Summary */}
						<Card>
							<CardHeader>
								<CardTitle>Tổng kết</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Tạm tính:</span>
										<span className="font-medium">{formatCurrency(bill.subtotal)}</span>
									</div>

									{bill.discountAmount > 0 && (
										<div className="flex justify-between text-sm text-green-600">
											<span>Giảm giá:</span>
											<span>-{formatCurrency(bill.discountAmount)}</span>
										</div>
									)}

									{bill.taxAmount > 0 && (
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Thuế:</span>
											<span>{formatCurrency(bill.taxAmount)}</span>
										</div>
									)}

									<Separator />

									<div className="flex justify-between items-center bg-primary text-primary-foreground p-3 rounded-lg">
										<span className="font-bold">Tổng cộng:</span>
										<span className="text-2xl font-bold">{formatCurrency(bill.totalAmount)}</span>
									</div>

									{bill.paidAmount > 0 && (
										<>
											<div className="flex justify-between text-sm text-green-600 bg-green-50 p-2 rounded">
												<span>Đã thanh toán:</span>
												<span className="font-semibold">{formatCurrency(bill.paidAmount)}</span>
											</div>
											{bill.remainingAmount > 0 && (
												<div className="flex justify-between text-base font-bold text-red-600 bg-red-50 p-2 rounded">
													<span>Còn lại:</span>
													<span>{formatCurrency(bill.remainingAmount)}</span>
												</div>
											)}
										</>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Actions */}
						<Card>
							<CardHeader>
								<CardTitle>Thao tác</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Button
									variant="outline"
									className="w-full"
									onClick={handleGeneratePayOSLink}
									disabled={creatingPayLink}
								>
									<QrCode className="w-4 h-4 mr-2" />
									{creatingPayLink ? 'Đang tạo link PayOS...' : 'Tạo link/QR PayOS'}
								</Button>
								{bill.status === 'pending' && (
									<Button
										className="w-full"
										onClick={handleMarkAsPaid}
										disabled={markingPaid}
									>
										{markingPaid ? 'Đang xử lý...' : 'Đánh dấu đã thanh toán'}
									</Button>
								)}

							{(bill.status === 'draft' || bill.status === 'pending') && (
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="destructive"
											className="w-full"
											disabled={deleting}
										>
											<Trash2 className="w-4 h-4 mr-2" />
											{deleting ? 'Đang xóa...' : 'Xóa hóa đơn'}
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Xác nhận xóa hóa đơn</AlertDialogTitle>
											<AlertDialogDescription>
												Bạn có chắc chắn muốn xóa hóa đơn này? Hành động này không thể hoàn tác.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Hủy</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleDelete}
												className="bg-red-600 hover:bg-red-700"
											>
												Xóa
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}								<Button
									variant="outline"
									className="w-full"
									onClick={() => router.push('/dashboard/landlord/invoices')}
								>
									Quay lại danh sách
								</Button>
							</CardContent>
						</Card>

						{/* Notes */}
						{bill.notes && (
							<Card>
								<CardHeader>
									<CardTitle>Ghi chú</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">{bill.notes}</p>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>

			{/* Meter Data Dialog - Show for bills with requiresMeterData or draft status */}
			{bill && (bill.requiresMeterData || bill.status === 'draft') && (
				<UpdateMeterDataDialog
					bill={bill}
					open={showMeterDialog}
					onOpenChange={setShowMeterDialog}
					onSuccess={handleMeterDataUpdated}
				/>
			)}

			<Dialog open={!!payOSInfo} onOpenChange={(open) => !open && setPayOSInfo(null)}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Chia sẻ thanh toán PayOS</DialogTitle>
						<DialogDescription>
							Gửi QR hoặc liên kết cho tenant để thanh toán online. Trạng thái hóa đơn sẽ cập nhật tự động.
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col items-center gap-4">
						<div className="p-4 bg-white rounded-lg border">
							{payOSInfo?.qrCode ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={payOSInfo.qrCode} alt="QR PayOS" className="w-56 h-56 object-contain" />
							) : (
								payOSInfo?.checkoutUrl && (
									<QRCode
										value={payOSInfo.checkoutUrl}
										size={224}
										style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
									/>
								)
							)}
						</div>

						{formattedPayAmount && (
							<div className="text-center">
								<p className="text-sm text-gray-500">Số tiền</p>
								<p className="text-xl font-semibold text-gray-900">{formattedPayAmount}</p>
							</div>
						)}

						<div className="w-full space-y-2">
							{payOSInfo?.checkoutUrl && (
								<>
									<Button
										className="w-full gap-2"
										onClick={() =>
											payOSInfo.checkoutUrl && window.open(payOSInfo.checkoutUrl, '_blank', 'noopener,noreferrer')
										}
									>
										<ExternalLink className="h-4 w-4" />
										Mở trang thanh toán
									</Button>
									<Button variant="outline" className="w-full gap-2" onClick={copyCheckoutUrl}>
										<Copy className="h-4 w-4" />
										Sao chép liên kết
									</Button>
								</>
							)}
							<Button variant="ghost" className="w-full" onClick={() => setPayOSInfo(null)}>
								Đóng
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</DashboardLayout>
	);
}
