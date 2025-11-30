'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useBillStore } from '@/stores/billStore';
import { RoomInstanceSearchDialog } from '@/components/billing/RoomInstanceSearchDialog';
import { getCurrentBillingPeriod, getPeriodDates } from '@/utils/billUtils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
	AlertCircle,
	CheckCircle2,
	Search,
	Building2,
	Users,
	Calendar,
	DollarSign,
	Zap,
} from 'lucide-react';
import type { RoomInstanceSearchResult } from '@/types/types';
import type { MeterReading } from '@/types/bill.types';

export default function CreateSingleBillPage() {
	const router = useRouter();
	const { createForRoomInstance, submitting, submitError } = useBillStore();

	const [showSearch, setShowSearch] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState<RoomInstanceSearchResult | null>(null);
	const [billingPeriod, setBillingPeriod] = useState(getCurrentBillingPeriod());
	const [occupancyCount, setOccupancyCount] = useState(1);
	const [notes, setNotes] = useState('');
	const [meterReadings, setMeterReadings] = useState<
		Array<{ costId: string; costName: string; lastReading: string; currentReading: string }>
	>([]);

	const handleRoomSelect = (room: RoomInstanceSearchResult) => {
		setSelectedRoom(room);
		// Initialize meter readings if needed (you can fetch room costs here)
		setMeterReadings([
			{ costId: 'electric', costName: 'Điện', lastReading: '', currentReading: '' },
			{ costId: 'water', costName: 'Nước', lastReading: '', currentReading: '' },
		]);
	};

	const updateMeterReading = (
		index: number,
		field: 'lastReading' | 'currentReading',
		value: string,
	) => {
		const updated = [...meterReadings];
		updated[index][field] = value;
		setMeterReadings(updated);
	};

	const handleCreateBill = async () => {
		if (!selectedRoom) {
			toast.error('Vui lòng chọn phòng');
			return;
		}

		const { start, end } = getPeriodDates(billingPeriod);
		const [year, month] = billingPeriod.split('-').map(Number);

		// Validate meter readings
		const validMeterReadings: MeterReading[] = [];
		for (const reading of meterReadings) {
			if (reading.currentReading && reading.lastReading) {
				const current = parseFloat(reading.currentReading);
				const last = parseFloat(reading.lastReading);

				if (isNaN(current) || isNaN(last)) {
					toast.error(`Chỉ số ${reading.costName} không hợp lệ`);
					return;
				}

				if (current < last) {
					toast.error(`Chỉ số hiện tại của ${reading.costName} phải lớn hơn chỉ số cũ`);
					return;
				}

				validMeterReadings.push({
					roomCostId: reading.costId,
					currentReading: current,
					lastReading: last,
				});
			}
		}

		const success = await createForRoomInstance({
			roomInstanceId: selectedRoom.id,
			billingPeriod,
			billingMonth: month,
			billingYear: year,
			periodStart: start,
			periodEnd: end,
			occupancyCount,
			meterReadings: validMeterReadings,
			notes: notes.trim() || undefined,
		});

		if (success) {
			toast.success('Đã tạo hóa đơn thành công');
			setTimeout(() => {
				router.push('/dashboard/landlord/invoices');
			}, 1500);
		}
	};

	return (
		<DashboardLayout userType="landlord">
			<div className="px-6 pb-6">
				<PageHeader
					title="Tạo hóa đơn cho phòng"
					subtitle="Tạo hóa đơn cho một phòng cụ thể"
				/>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Card */}
					<div className="lg:col-span-2 space-y-6">
						{/* Room Selection */}
						<Card>
							<CardHeader>
								<CardTitle>Chọn phòng</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{selectedRoom ? (
									<div className="space-y-4">
										<div className="flex items-start justify-between p-4 border rounded-lg bg-accent/50">
											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<h4 className="font-semibold text-lg">
														Phòng {selectedRoom.roomNumber}
													</h4>
													{selectedRoom.status && (
														<Badge variant="outline">
															{selectedRoom.status === 'occupied'
																? 'Đang thuê'
																: selectedRoom.status}
														</Badge>
													)}
												</div>
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<Building2 className="h-4 w-4" />
													<span>{selectedRoom.buildingName}</span>
												</div>
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<Users className="h-4 w-4" />
													<span>{selectedRoom.roomName}</span>
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setShowSearch(true)}
											>
												<Search className="h-4 w-4 mr-2" />
												Đổi phòng
											</Button>
										</div>
									</div>
								) : (
									<Button onClick={() => setShowSearch(true)} className="w-full">
										<Search className="h-4 w-4 mr-2" />
										Chọn phòng
									</Button>
								)}
							</CardContent>
						</Card>

						{/* Billing Information */}
						{selectedRoom && (
							<>
								<Card>
									<CardHeader>
										<CardTitle>Thông tin hóa đơn</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="billingPeriod">
													<Calendar className="h-4 w-4 inline mr-2" />
													Kỳ thanh toán
												</Label>
												<Input
													id="billingPeriod"
													type="month"
													value={billingPeriod}
													onChange={(e) => setBillingPeriod(e.target.value)}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="occupancyCount">
													<Users className="h-4 w-4 inline mr-2" />
													Số người ở
												</Label>
												<Input
													id="occupancyCount"
													type="number"
													min="1"
													value={occupancyCount}
													onChange={(e) =>
														setOccupancyCount(parseInt(e.target.value) || 1)
													}
												/>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Meter Readings */}
								<Card>
									<CardHeader>
										<CardTitle>
											<Zap className="h-5 w-5 inline mr-2" />
											Chỉ số đồng hồ
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										{meterReadings.map((reading, index) => (
											<div key={index} className="space-y-2">
												<Label>{reading.costName}</Label>
												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-1">
														<Label
															htmlFor={`last-${index}`}
															className="text-xs text-muted-foreground"
														>
															Chỉ số cũ
														</Label>
														<Input
															id={`last-${index}`}
															type="number"
															step="0.1"
															placeholder="0"
															value={reading.lastReading}
															onChange={(e) =>
																updateMeterReading(
																	index,
																	'lastReading',
																	e.target.value,
																)
															}
														/>
													</div>
													<div className="space-y-1">
														<Label
															htmlFor={`current-${index}`}
															className="text-xs text-muted-foreground"
														>
															Chỉ số mới
														</Label>
														<Input
															id={`current-${index}`}
															type="number"
															step="0.1"
															placeholder="0"
															value={reading.currentReading}
															onChange={(e) =>
																updateMeterReading(
																	index,
																	'currentReading',
																	e.target.value,
																)
															}
														/>
													</div>
												</div>
												{reading.currentReading &&
													reading.lastReading &&
													parseFloat(reading.currentReading) >
														parseFloat(reading.lastReading) && (
														<div className="text-sm text-muted-foreground">
															Tiêu thụ:{' '}
															{(
																parseFloat(reading.currentReading) -
																parseFloat(reading.lastReading)
															).toFixed(1)}{' '}
															đơn vị
														</div>
													)}
											</div>
										))}
									</CardContent>
								</Card>

								{/* Notes */}
								<Card>
									<CardHeader>
										<CardTitle>Ghi chú (không bắt buộc)</CardTitle>
									</CardHeader>
									<CardContent>
										<Textarea
											placeholder="Ghi chú về hóa đơn..."
											value={notes}
											onChange={(e) => setNotes(e.target.value)}
											rows={3}
										/>
									</CardContent>
								</Card>
							</>
						)}
					</div>

					{/* Summary Sidebar */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Tóm tắt</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{selectedRoom ? (
									<>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Phòng:</span>
											<span className="font-medium">
												{selectedRoom.roomNumber}
											</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Toà nhà:</span>
											<span className="font-medium">
												{selectedRoom.buildingName}
											</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Kỳ thanh toán:</span>
											<span className="font-medium">{billingPeriod}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Số người ở:</span>
											<span className="font-medium">{occupancyCount}</span>
										</div>

										{submitError && (
											<Alert variant="destructive">
												<AlertCircle className="h-4 w-4" />
												<AlertDescription>{submitError}</AlertDescription>
											</Alert>
										)}

										<Button
											onClick={handleCreateBill}
											disabled={submitting || !selectedRoom}
											className="w-full"
											size="lg"
										>
											{submitting ? (
												<>
													<CheckCircle2 className="mr-2 h-4 w-4 animate-spin" />
													Đang tạo...
												</>
											) : (
												<>
													<DollarSign className="mr-2 h-4 w-4" />
													Tạo hóa đơn
												</>
											)}
										</Button>
									</>
								) : (
									<div className="text-center text-sm text-muted-foreground py-8">
										Chọn phòng để bắt đầu
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-sm">Hướng dẫn</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-xs text-muted-foreground">
								<p>1. Chọn phòng cần tạo hóa đơn</p>
								<p>2. Nhập kỳ thanh toán và số người ở</p>
								<p>3. Nhập chỉ số đồng hồ điện, nước (nếu có)</p>
								<p>4. Kiểm tra thông tin và tạo hóa đơn</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Room Search Dialog */}
			<RoomInstanceSearchDialog
				open={showSearch}
				onOpenChange={setShowSearch}
				onSelect={handleRoomSelect}
				title="Chọn phòng để tạo hóa đơn"
				description="Tìm kiếm phòng theo tenant, địa chỉ hoặc ghi chú"
				filterStatus="occupied"
			/>
		</DashboardLayout>
	);
}
