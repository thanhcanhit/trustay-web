'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBillStore } from '@/stores/billStore';
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
	Download,
	CreditCard,
	FileText,
} from 'lucide-react';

export default function TenantBillDetailPage() {
	const params = useParams();
	const router = useRouter();
	const billId = params.id as string;

	const {
		current: bill,
		loadingCurrent: loading,
		loadById,
	} = useBillStore();

	useEffect(() => {
		if (billId) {
			loadById(billId);
		}
	}, [billId, loadById]);

	if (loading) {
		return (
			<DashboardLayout userType="tenant">
				<div className="flex items-center justify-center h-screen">
					<div className="text-center">Đang tải...</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!bill) {
		return (
			<DashboardLayout userType="tenant">
				<div className="flex items-center justify-center h-screen">
					<div className="text-center">
						<p className="text-lg mb-4">Không tìm thấy hóa đơn</p>
						<Button onClick={() => router.push('/dashboard/tenant/invoices')}>
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
	const roomNumber = bill.rental?.roomInstance?.roomNumber || 'N/A';
	const roomName = bill.rental?.roomInstance?.room?.name || '';

	return (
		<DashboardLayout userType="tenant">
			<div className="px-6 pb-6">
				{/* Header */}
				<div className="mb-6">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push('/dashboard/tenant/invoices')}
						className="mb-4"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Quay lại
					</Button>

					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">
								Hóa đơn {formatBillingPeriod(bill.billingPeriod)}
							</h1>
							<div className="flex items-center gap-2 text-muted-foreground">
								<Home className="w-4 h-4" />
								<span>Phòng {roomNumber}{roomName && ` - ${roomName}`}</span>
							</div>
						</div>
						<Badge variant={getBillStatusColor(bill.status)} className="text-base px-4 py-1.5">
							{getBillStatusLabel(bill.status)}
						</Badge>
					</div>
				</div>

				{/* Warnings */}
				{isOverdue && (
					<div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
						<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
						<div>
							<p className="font-semibold text-red-900">Hóa đơn đã quá hạn</p>
							<p className="text-sm text-red-700">
								Quá hạn {Math.abs(daysUntilDue)} ngày. Vui lòng thanh toán sớm để tránh phát sinh phí!
							</p>
						</div>
					</div>
				)}

				{isDueSoon && (
					<div className="mb-6 flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
						<AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
						<div>
							<p className="font-semibold text-yellow-900">Sắp đến hạn thanh toán</p>
							<p className="text-sm text-yellow-700">Còn {daysUntilDue} ngày đến hạn thanh toán</p>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column */}
					<div className="lg:col-span-2 space-y-6">
						{/* Bill Info */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg">Thông tin hóa đơn</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="flex gap-3">
										<Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
										<div>
											<p className="text-sm text-muted-foreground mb-0.5">Kỳ thanh toán</p>
											<p className="font-medium">
												{formatDate(bill.periodStart)} - {formatDate(bill.periodEnd)}
											</p>
										</div>
									</div>

									<div className="flex gap-3">
										<Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
										<div>
											<p className="text-sm text-muted-foreground mb-0.5">Hạn thanh toán</p>
											<p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
												{formatDate(bill.dueDate)}
											</p>
										</div>
									</div>

									{bill.occupancyCount && (
										<div className="flex gap-3">
											<User className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
											<div>
												<p className="text-sm text-muted-foreground mb-0.5">Số người ở</p>
												<p className="font-medium">{bill.occupancyCount} người</p>
											</div>
										</div>
									)}

									{bill.paidDate && (
										<div className="flex gap-3">
											<CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
											<div>
												<p className="text-sm text-muted-foreground mb-0.5">Đã thanh toán</p>
												<p className="font-medium text-green-600">{formatDate(bill.paidDate)}</p>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Bill Items */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg">Chi tiết thanh toán</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{bill.billItems && bill.billItems.length > 0 ? (
										bill.billItems.map((item, index) => (
											<div key={item.id} className={index !== 0 ? 'pt-3 border-t' : ''}>
												<div className="flex justify-between items-start gap-4">
													<div className="flex-1 min-w-0">
														<p className="font-medium mb-1">{item.itemName}</p>

														{item.description && (
															<p className="text-sm text-muted-foreground mb-1">{item.description}</p>
														)}

														{item.meterReading && (
															<div className="text-xs text-muted-foreground space-y-0.5">
																<p>
																	Tiêu thụ: <span className="font-medium">{item.meterReading.consumption} {item.meterReading.unit}</span>
																</p>
																<p>
																	Chỉ số: {item.meterReading.lastReading} → {item.meterReading.currentReading}
																</p>
															</div>
														)}

														{item.quantity && item.unitPrice && !item.meterReading && (
															<p className="text-sm text-muted-foreground">
																{item.quantity} × {formatCurrency(item.unitPrice)}
															</p>
														)}
													</div>
													<span className="font-semibold text-lg whitespace-nowrap">
														{formatCurrency(item.amount)}
													</span>
												</div>
											</div>
										))
									) : (
										<div className="text-center py-8 text-muted-foreground">
											<FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
											<p>Chưa có chi tiết thanh toán</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Payment Instructions */}
						{bill.status === 'pending' && (
							<Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-blue-900">
										<CreditCard className="w-5 h-5" />
										Hướng dẫn thanh toán
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
										<div className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 text-sm">
											<span className="text-muted-foreground">Ngân hàng:</span>
											<span className="font-medium">Vietcombank</span>

											<span className="text-muted-foreground">Số tài khoản:</span>
											<span className="font-mono font-semibold">0123456789</span>

											<span className="text-muted-foreground">Chủ tài khoản:</span>
											<span className="font-medium">Chủ trọ</span>

											<span className="text-muted-foreground">Nội dung CK:</span>
											<span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded">
												Thanh toan {bill.billingPeriod} Phong {roomNumber}
											</span>
										</div>
									</div>
									<p className="text-sm text-blue-700 flex items-start gap-2">
										<span className="text-lg">💡</span>
										<span>Sau khi chuyển khoản, vui lòng liên hệ chủ trọ để xác nhận thanh toán</span>
									</p>
								</CardContent>
							</Card>
						)}

						{/* Notes */}
						{bill.notes && (
							<Card className="bg-gray-50 border-gray-200">
								<CardHeader className="pb-3">
									<CardTitle className="text-lg">Ghi chú</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground leading-relaxed">{bill.notes}</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Right Column - Summary */}
					<div className="lg:col-span-1">
						<div className="sticky top-6 space-y-4">
							{/* Summary */}
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-lg">Tổng kết thanh toán</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2.5 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Tạm tính:</span>
											<span className="font-medium">{formatCurrency(bill.subtotal)}</span>
										</div>

										{bill.discountAmount > 0 && (
											<div className="flex justify-between text-green-600">
												<span>Giảm giá:</span>
												<span className="font-medium">-{formatCurrency(bill.discountAmount)}</span>
											</div>
										)}

										{bill.taxAmount > 0 && (
											<div className="flex justify-between">
												<span className="text-muted-foreground">Thuế:</span>
												<span className="font-medium">{formatCurrency(bill.taxAmount)}</span>
											</div>
										)}
									</div>

									<Separator />

									<div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
										<div className="flex justify-between items-center">
											<span className="font-semibold">Tổng cộng:</span>
											<span className="text-2xl font-bold">{formatCurrency(bill.totalAmount)}</span>
										</div>
									</div>

									{bill.paidAmount > 0 && (
										<div className="space-y-2 pt-2">
											<div className="flex justify-between text-sm bg-green-50 text-green-700 p-2.5 rounded">
												<span className="font-medium">Đã thanh toán:</span>
												<span className="font-semibold">{formatCurrency(bill.paidAmount)}</span>
											</div>
											{bill.remainingAmount > 0 && (
												<div className="flex justify-between bg-red-50 text-red-700 p-2.5 rounded">
													<span className="font-semibold">Còn lại:</span>
													<span className="text-lg font-bold">{formatCurrency(bill.remainingAmount)}</span>
												</div>
											)}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Actions */}
							<Card>
								<CardContent className="pt-6 space-y-2">
									<Button variant="outline" className="w-full" disabled>
										<Download className="w-4 h-4 mr-2" />
										Tải hóa đơn (PDF)
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
