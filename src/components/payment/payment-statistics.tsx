'use client';

import { useEffect } from 'react';
import { usePaymentStore } from '@/stores/paymentStore';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Loader2, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface PaymentStatisticsProps {
	rentalId?: string;
	contractId?: string;
	year?: number;
	month?: number;
}

export function PaymentStatistics({
	rentalId,
	contractId,
	year,
	month,
}: PaymentStatisticsProps) {
	const { statistics, loadingStats, errorStats, loadStatistics } = usePaymentStore();

	useEffect(() => {
		loadStatistics({
			rentalId,
			contractId,
			year,
			month,
		});
	}, [rentalId, contractId, year, month, loadStatistics]);

	if (loadingStats) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-green-600" />
			</div>
		);
	}

	if (errorStats) {
		return (
			<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
				{errorStats}
			</div>
		);
	}

	if (!statistics) {
		return null;
	}

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-gray-900">Thống kê thanh toán</h2>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
						<DollarSign className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{formatCurrency(statistics.totalPaid)}
						</div>
						<p className="text-xs text-gray-500 mt-1">Tổng số tiền đã thanh toán</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Chờ thanh toán</CardTitle>
						<Clock className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-600">
							{formatCurrency(statistics.totalPending)}
						</div>
						<p className="text-xs text-gray-500 mt-1">Tổng số tiền chưa thanh toán</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
						<TrendingDown className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{formatCurrency(statistics.totalOverdue)}
						</div>
						<p className="text-xs text-gray-500 mt-1">Tổng số tiền quá hạn</p>
					</CardContent>
				</Card>
			</div>

			{/* Monthly Breakdown */}
			{statistics.monthlyBreakdown && statistics.monthlyBreakdown.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Theo tháng</CardTitle>
						<CardDescription>Phân tích thanh toán theo từng tháng</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{statistics.monthlyBreakdown.map((item) => (
								<div
									key={item.month}
									className="flex items-center justify-between pb-4 border-b last:border-0"
								>
									<div className="flex-1">
										<p className="font-medium">{item.month}</p>
										<p className="text-sm text-gray-500">{item.count} giao dịch</p>
									</div>
									<div className="text-right">
										<p className="font-bold text-green-600">
											{formatCurrency(item.amount)}
										</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Payment Type Breakdown */}
			{statistics.paymentTypeBreakdown &&
				statistics.paymentTypeBreakdown.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Theo loại thanh toán</CardTitle>
							<CardDescription>
								Phân tích theo từng loại hình thanh toán
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{statistics.paymentTypeBreakdown.map((item) => (
									<div
										key={item.type}
										className="flex items-center justify-between pb-4 border-b last:border-0"
									>
										<div className="flex-1">
											<p className="font-medium capitalize">{item.type}</p>
											<p className="text-sm text-gray-500">{item.count} giao dịch</p>
										</div>
										<div className="text-right">
											<p className="font-bold text-green-600">
												{formatCurrency(item.amount)}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
		</div>
	);
}
