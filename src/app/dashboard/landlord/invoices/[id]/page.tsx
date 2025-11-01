'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
	Receipt,
	Edit,
	Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Bill } from '@/types/bill.types';

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
		updateWithMeterData,
		markingPaid,
		deleting,
		updatingMeter,
	} = useBillStore();

	const [isEditingMeter, setIsEditingMeter] = useState(false);
	const [meterData, setMeterData] = useState<Record<string, { current: number; last: number }>>(
		{},
	);

	useEffect(() => {
		if (billId) {
			loadById(billId);
		}
	}, [billId, loadById]);

	// Initialize meter data when bill loads
	useEffect(() => {
		if (bill?.meteredCostsToInput) {
			const initialData: Record<string, { current: number; last: number }> = {};
			bill.meteredCostsToInput.forEach((cost) => {
				initialData[cost.roomCostId] = {
					current: 0,
					last: 0,
				};
			});
			setMeterData(initialData);
		}
	}, [bill]);

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

		if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
			return;
		}

		const success = await remove(bill.id);
		if (success) {
			toast.success('Đã xóa hóa đơn');
			router.push('/dashboard/landlord/invoices');
		} else {
			toast.error('Có lỗi khi xóa hóa đơn');
		}
	};

	const handleUpdateMeterData = async () => {
		if (!bill) return;

		const meterDataArray = Object.entries(meterData).map(([roomCostId, values]) => ({
			roomCostId,
			currentReading: values.current,
			lastReading: values.last,
		}));

		const success = await updateWithMeterData({
			billId: bill.id,
			occupancyCount: bill.occupancyCount || 1,
			meterData: meterDataArray,
		});

		if (success) {
			toast.success('Đã cập nhật số đồng hồ');
			setIsEditingMeter(false);
			loadById(billId);
		} else {
			toast.error('Có lỗi khi cập nhật số đồng hồ');
		}
	};

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
				<PageHeader
					title={
						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => router.push('/dashboard/landlord/invoices')}
							>
								<ArrowLeft className="h-5 w-5" />
							</Button>
							<span>Chi tiết hóa đơn</span>
						</div>
					}
					subtitle={`Hóa đơn ${formatBillingPeriod(bill.billingPeriod)}`}
				/>

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
										{!isEditingMeter && (
											<Button size="sm" onClick={() => setIsEditingMeter(true)} className="bg-blue-600 hover:bg-blue-700">
												<Edit className="w-4 h-4 mr-2" />
												Nhập ngay
											</Button>
										)}
									</div>
								</CardHeader>
								<CardContent>
									{isEditingMeter ? (
										<div className="space-y-4">
											<div className="p-3 bg-blue-100 border border-blue-200 rounded text-sm text-blue-800">
												💡 <strong>Hướng dẫn:</strong> Nhập chỉ số cũ (kỳ trước) và chỉ số mới (hiện tại) cho mỗi loại chi phí. Hệ thống sẽ tự động tính tiêu thụ và cập nhật tổng tiền.
											</div>
											{bill.meteredCostsToInput.map((cost) => {
												const consumption = (meterData[cost.roomCostId]?.current || 0) - (meterData[cost.roomCostId]?.last || 0);
												return (
													<div key={cost.roomCostId} className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
														<p className="font-semibold mb-3 text-blue-900">{cost.name}</p>
														<div className="grid grid-cols-2 gap-3 mb-2">
															<div>
																<Label className="text-xs font-medium">Chỉ số cũ ({cost.unit})</Label>
																<Input
																	type="number"
																	step="0.01"
																	min={0}
																	placeholder="0"
																	value={meterData[cost.roomCostId]?.last || ''}
																	onChange={(e) =>
																		setMeterData((prev) => ({
																			...prev,
																			[cost.roomCostId]: {
																				...prev[cost.roomCostId],
																				last: parseFloat(e.target.value) || 0,
																			},
																		}))
																	}
																	className="mt-1"
																/>
															</div>
															<div>
																<Label className="text-xs font-medium">Chỉ số mới ({cost.unit})</Label>
																<Input
																	type="number"
																	step="0.01"
																	min={0}
																	placeholder="0"
																	value={meterData[cost.roomCostId]?.current || ''}
																	onChange={(e) =>
																		setMeterData((prev) => ({
																			...prev,
																			[cost.roomCostId]: {
																				...prev[cost.roomCostId],
																				current: parseFloat(e.target.value) || 0,
																			},
																		}))
																	}
																	className="mt-1"
																/>
															</div>
														</div>
														{consumption > 0 && (
															<div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
																Tiêu thụ: <span className="font-semibold">{consumption.toFixed(2)} {cost.unit}</span>
															</div>
														)}
													</div>
												);
											})}
											<div className="flex gap-2 pt-2">
												<Button
													onClick={handleUpdateMeterData}
													disabled={updatingMeter}
													className="bg-blue-600 hover:bg-blue-700"
												>
													{updatingMeter ? 'Đang cập nhật...' : 'Lưu và hoàn thành hóa đơn'}
												</Button>
												<Button variant="outline" onClick={() => setIsEditingMeter(false)}>
													Hủy
												</Button>
											</div>
										</div>
									) : (
										<div className="space-y-2">
											{bill.meteredCostsToInput.map((cost) => (
												<div key={cost.roomCostId} className="flex items-center gap-2 text-sm p-2 bg-white rounded border border-blue-200">
													<Receipt className="w-4 h-4 text-blue-600" />
													<span className="font-medium">
														{cost.name} ({cost.unit})
													</span>
												</div>
											))}
										</div>
									)}
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
									<Button
										variant="destructive"
										className="w-full"
										onClick={handleDelete}
										disabled={deleting}
									>
										<Trash2 className="w-4 h-4 mr-2" />
										{deleting ? 'Đang xóa...' : 'Xóa hóa đơn'}
									</Button>
								)}

								<Button
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
		</DashboardLayout>
	);
}
