'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBuildingStore } from '@/stores/buildingStore';
import { useBillStore } from '@/stores/billStore';
import { getCurrentBillingPeriod, getPeriodDates } from '@/utils/billUtils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Building2, Calendar } from 'lucide-react';

export default function CreateBillPage() {
	const router = useRouter();
	const { buildings, fetchAllBuildings } = useBuildingStore();
	const { generateMonthlyBills, generating, generateError, generateResult } = useBillStore();

	const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
	const [billingPeriod, setBillingPeriod] = useState(getCurrentBillingPeriod());

	// Load buildings on mount
	useEffect(() => {
		fetchAllBuildings();
	}, [fetchAllBuildings]);

	// Helper function to translate message to Vietnamese
	const translateMessage = (message: string): string => {
		// Check if message is in English format
		if (message.includes('Successfully created')) {
			const match = message.match(/Successfully created (\d+) bill\(s\) and found (\d+) existing bill\(s\) for billing period (.+)/);
			if (match) {
				const [, created, existed, period] = match;
				return `Đã tạo thành công ${created} hóa đơn và tìm thấy ${existed} hóa đơn đã tồn tại cho kỳ thanh toán ${period}`;
			}
		}
		return message;
	};

	const handleGenerateBills = async () => {
		if (!selectedBuildingId) {
			toast.error('Vui lòng chọn toà nhà');
			return;
		}

		const { start, end } = getPeriodDates(billingPeriod);
		const [year, month] = billingPeriod.split('-').map(Number);

		const result = await generateMonthlyBills({
			buildingId: selectedBuildingId,
			billingPeriod,
			billingMonth: month,
			billingYear: year,
			periodStart: start,
			periodEnd: end,
		});

		if (result) {
			const translatedMessage = translateMessage(result.message);
			toast.success(translatedMessage);
			// Navigate to bills list after successful generation
			setTimeout(() => {
				router.push('/dashboard/landlord/invoices');
			}, 1500);
		} else {
			toast.error(generateError || 'Có lỗi khi tạo hóa đơn');
		}
	};

	return (
		<DashboardLayout userType="landlord">
			<div className="px-6 pb-6">
				<PageHeader
					title="Tạo hóa đơn hàng tháng"
					subtitle="Tạo hóa đơn tự động cho tất cả phòng trong toà nhà"
				/>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Card */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle>Tạo hóa đơn tự động cho toà nhà</CardTitle>
								<p className="text-sm text-muted-foreground mt-2">
									Hệ thống sẽ tự động tạo hóa đơn cho tất cả phòng đang có người thuê trong toà nhà đã chọn
								</p>
							</CardHeader>
						<CardContent className="space-y-6">
							{/* Building Selection */}
							<div className="space-y-2">
								<Label htmlFor="building" className="flex items-center gap-2">
									<Building2 className="w-4 h-4" />
									Chọn toà nhà
								</Label>
								<Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
									<SelectTrigger id="building">
										<SelectValue placeholder="Chọn toà nhà để tạo hóa đơn" />
									</SelectTrigger>
									<SelectContent>
										{buildings.map((building) => (
											<SelectItem key={building.id} value={building.id}>
												{building.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Billing Period */}
							<div className="space-y-2">
								<Label htmlFor="period" className="flex items-center gap-2">
									<Calendar className="w-4 h-4" />
									Kỳ thanh toán
								</Label>
								<Input
									id="period"
									type="month"
									value={billingPeriod}
									onChange={(e) => setBillingPeriod(e.target.value)}
								/>
								<p className="text-xs text-muted-foreground">
									Chọn tháng để tạo hóa đơn cho kỳ thanh toán tương ứng
								</p>
							</div>

							{/* Info Alert */}
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									<div className="space-y-2 text-sm">
										<p className="font-semibold">Lưu ý quan trọng:</p>
										<ul className="list-disc list-inside space-y-1 ml-2">
											<li>Chỉ tạo hóa đơn cho phòng đang có hợp đồng thuê hoạt động</li>
											<li>Hóa đơn sẽ được tạo ở trạng thái <span className="font-semibold">draft</span></li>
											<li>Cần cập nhật số đồng hồ (điện, nước) sau khi tạo</li>
											<li>Mỗi phòng chỉ có 1 hóa đơn cho mỗi kỳ thanh toán</li>
										</ul>
									</div>
								</AlertDescription>
							</Alert>

							{/* Error Display */}
							{generateError && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{generateError}</AlertDescription>
								</Alert>
							)}

							{/* Success Result */}
							{generateResult && (
								<Alert className="bg-green-50 border-green-200">
									<CheckCircle2 className="h-4 w-4 text-green-600" />
									<AlertDescription>
										<div className="space-y-2">
											<p className="font-semibold text-green-800">{generateResult.message}</p>
											<div className="flex gap-4 text-sm">
												<span className="text-green-700">
													✓ Đã tạo: <span className="font-bold">{generateResult.billsCreated}</span> hóa đơn
												</span>
												{generateResult.billsExisted > 0 && (
													<span className="text-orange-700">
														⚠ Đã tồn tại: <span className="font-bold">{generateResult.billsExisted}</span> hóa đơn
													</span>
												)}
											</div>
										</div>
									</AlertDescription>
								</Alert>
							)}

							{/* Action Buttons */}
							<div className="flex gap-4 pt-4">
								<Button
									onClick={handleGenerateBills}
									disabled={generating || !selectedBuildingId}
									className="flex-1"
									size="lg"
								>
									{generating ? 'Đang tạo hóa đơn...' : 'Tạo hóa đơn tự động'}
								</Button>
								<Button
									variant="outline"
									onClick={() => router.push('/dashboard/landlord/invoices')}
									size="lg"
								>
									Hủy
								</Button>
							</div>
						</CardContent>
					</Card>
					</div>

					{/* How it works - Right Side */}
					<div className="lg:col-span-1">
						<Card className="sticky top-6">
							<CardHeader>
								<CardTitle className="text-base">Quy trình tạo hóa đơn</CardTitle>
							</CardHeader>
						<CardContent>
							<ol className="space-y-3 text-sm">
								<li className="flex gap-3">
									<span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
										1
									</span>
									<div>
										<p className="font-semibold">Chọn toà nhà và kỳ thanh toán</p>
										<p className="text-muted-foreground">Hệ thống sẽ tìm tất cả phòng có người thuê trong toà nhà</p>
									</div>
								</li>
								<li className="flex gap-3">
									<span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
										2
									</span>
									<div>
										<p className="font-semibold">Tạo hóa đơn tự động</p>
										<p className="text-muted-foreground">
											Tính toán chi phí dựa trên: tiền phòng, chi phí cố định, chi phí theo người
										</p>
									</div>
								</li>
								<li className="flex gap-3">
									<span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
										3
									</span>
									<div>
										<p className="font-semibold">Cập nhật số đồng hồ</p>
										<p className="text-muted-foreground">
											Vào danh sách hóa đơn để cập nhật số điện, nước cho từng phòng
										</p>
									</div>
								</li>
								<li className="flex gap-3">
									<span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
										4
									</span>
									<div>
										<p className="font-semibold">Hoàn tất và gửi cho khách</p>
										<p className="text-muted-foreground">
											Kiểm tra lại và chuyển trạng thái sang &ldquo;Chờ thanh toán&rdquo;
										</p>
									</div>
								</li>
							</ol>
						</CardContent>
					</Card>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
