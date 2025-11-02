'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Gauge, AlertCircle, Info } from 'lucide-react';
import { useBillStore } from '@/stores/billStore';
import { toast } from 'sonner';
import type { Bill, MeterReading } from '@/types/bill.types';

interface UpdateMeterDataDialogProps {
	bill: Bill;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function UpdateMeterDataDialog({
	bill,
	open,
	onOpenChange,
	onSuccess,
}: UpdateMeterDataDialogProps) {
	const { updateWithMeterData, updatingMeter } = useBillStore();

	const [meterData, setMeterData] = useState<Record<string, { current: number; last: number }>>(
		{},
	);
	const [occupancyCount, setOccupancyCount] = useState(bill.occupancyCount || 1);

	// Initialize meter data when dialog opens or bill changes
	useEffect(() => {
		if (open && bill?.meteredCostsToInput) {
			const initialData: Record<string, { current: number; last: number }> = {};
			bill.meteredCostsToInput.forEach((cost) => {
				initialData[cost.roomCostId] = {
					current: 0,
					last: 0,
				};
			});
			setMeterData(initialData);
			setOccupancyCount(bill.occupancyCount || 1);
		}
	}, [open, bill]);

	const handleSubmit = async () => {
		// Validate meter data only if there are metered costs
		if (hasMeteredCosts) {
			const hasInvalidData = Object.entries(meterData).some(([, values]) => {
				return values.current < values.last || values.current === 0;
			});

			if (hasInvalidData) {
				toast.error('Vui lòng nhập chỉ số mới lớn hơn chỉ số cũ và khác 0');
				return;
			}
		}

		const meterDataArray: MeterReading[] = Object.entries(meterData).map(
			([roomCostId, values]) => ({
				roomCostId,
				currentReading: values.current,
				lastReading: values.last,
			}),
		);

		const success = await updateWithMeterData({
			billId: bill.id,
			occupancyCount,
			meterData: meterDataArray,
		});

		if (success) {
			toast.success('Đã cập nhật số đồng hồ thành công');
			onOpenChange(false);
			onSuccess?.();
		} else {
			toast.error('Có lỗi khi cập nhật số đồng hồ');
		}
	};

	const hasMeteredCosts = bill.meteredCostsToInput && bill.meteredCostsToInput.length > 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl">
						<Gauge className="w-6 h-6 text-blue-600" />
						Cập nhật số đồng hồ
					</DialogTitle>
					<DialogDescription>
						{hasMeteredCosts ? (
							<>
								Nhập chỉ số cũ và chỉ số mới cho mỗi loại chi phí. Hệ thống sẽ tự động tính tiêu thụ và
								cập nhật tổng tiền.
							</>
						) : (
							<>
								Hóa đơn này không có chi phí theo đồng hồ. Vui lòng kiểm tra lại cấu hình chi phí của
								phòng hoặc chỉ cần xác nhận số người ở để hoàn thành hóa đơn.
							</>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Occupancy Count */}
					<div className="space-y-2">
						<Label htmlFor="occupancyCount" className="text-base font-semibold">
							Số người ở <span className="text-red-500">*</span>
						</Label>
						<Input
							id="occupancyCount"
							type="number"
							min={1}
							value={occupancyCount}
							onChange={(e) => setOccupancyCount(parseInt(e.target.value) || 1)}
							placeholder="Nhập số người ở"
							className="text-base"
						/>
					</div>

					{/* Info Box */}
					<div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
						<Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
						<div className="text-blue-800">
							<p className="font-medium mb-1">💡 Hướng dẫn nhập số đồng hồ:</p>
							<ul className="list-disc list-inside space-y-1 text-xs">
								<li>Chỉ số cũ: Số ghi trên đồng hồ kỳ trước</li>
								<li>Chỉ số mới: Số ghi trên đồng hồ hiện tại</li>
								<li>Chỉ số mới phải lớn hơn chỉ số cũ</li>
								<li>Sau khi lưu, hóa đơn sẽ tự động chuyển sang trạng thái &ldquo;Chờ thanh toán&rdquo;</li>
							</ul>
						</div>
					</div>

					{/* Meter Data Inputs */}
					{hasMeteredCosts && (
						<div className="space-y-4">
							<h4 className="font-semibold text-base">Chi phí theo đồng hồ</h4>
							{bill.meteredCostsToInput!.map((cost) => {
							const consumption =
								(meterData[cost.roomCostId]?.current || 0) -
								(meterData[cost.roomCostId]?.last || 0);
							const hasConsumption = consumption > 0;

							return (
								<div
									key={cost.roomCostId}
									className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm space-y-3"
								>
									<div className="flex items-center justify-between">
										<p className="font-semibold text-base text-gray-900">{cost.name}</p>
										<Badge variant="outline" className="text-xs">
											{cost.unit}
										</Badge>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor={`last-${cost.roomCostId}`} className="text-sm font-medium">
												Chỉ số cũ ({cost.unit}) <span className="text-red-500">*</span>
											</Label>
											<Input
												id={`last-${cost.roomCostId}`}
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
												className="text-base"
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor={`current-${cost.roomCostId}`}
												className="text-sm font-medium"
											>
												Chỉ số mới ({cost.unit}) <span className="text-red-500">*</span>
											</Label>
											<Input
												id={`current-${cost.roomCostId}`}
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
												className="text-base"
											/>
										</div>
									</div>

									{/* Consumption Display */}
									{hasConsumption && (
										<div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
											<AlertCircle className="w-4 h-4 text-green-600" />
											<span className="text-green-800">
												Tiêu thụ:{' '}
												<span className="font-bold">
													{consumption.toFixed(2)} {cost.unit}
												</span>
											</span>
										</div>
									)}
									{!hasConsumption && meterData[cost.roomCostId]?.current > 0 && (
										<div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
											<AlertCircle className="w-4 h-4 text-yellow-600" />
											<span className="text-yellow-800">
												Chỉ số mới phải lớn hơn chỉ số cũ
											</span>
										</div>
									)}
								</div>
							);
						})}
						</div>
					)}

					{/* Message when no metered costs */}
					{!hasMeteredCosts && (
						<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
							<div className="flex items-start gap-3">
								<AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
								<div className="text-sm text-yellow-800">
									<p className="font-medium mb-1">Không có chi phí theo đồng hồ</p>
									<p>
										Hóa đơn này chỉ có các chi phí cố định. Bạn chỉ cần xác nhận số người ở và lưu để
										hoàn thành hóa đơn.
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={updatingMeter}>
						Hủy
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={updatingMeter}
						className="bg-blue-600 hover:bg-blue-700"
					>
						{updatingMeter ? 'Đang cập nhật...' : 'Lưu và hoàn thành hóa đơn'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
