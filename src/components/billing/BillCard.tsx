import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	formatCurrency,
	formatBillingPeriod,
	getBillStatusColor,
	getBillStatusLabel,
	isBillOverdue,
	getDaysUntilDue,
	formatDate,
} from '@/utils/billUtils';
import type { Bill } from '@/types/bill.types';
import { Calendar, Home, AlertCircle, Receipt, Gauge } from 'lucide-react';

interface BillCardProps {
	bill: Bill;
	onViewDetail: (bill: Bill) => void;
	onMarkAsPaid?: (bill: Bill) => void;
	onDelete?: (billId: string) => void;
	userRole: 'landlord' | 'tenant';
}

export function BillCard({ bill, onViewDetail, onMarkAsPaid, onDelete, userRole }: BillCardProps) {
	const isOverdue = isBillOverdue(bill);
	const daysUntilDue = getDaysUntilDue(bill.dueDate);
	const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 0 && bill.status === 'pending';

	return (
		<Card className={isOverdue ? 'border-red-500' : ''}>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<h3 className="font-semibold text-lg">{formatBillingPeriod(bill.billingPeriod)}</h3>
						{bill.rental?.roomInstance && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Home className="w-4 h-4" />
								<span>Phòng {bill.rental.roomInstance.roomNumber}</span>
							</div>
						)}
					</div>
					<div className="flex flex-col gap-1 items-end">
						<Badge variant={getBillStatusColor(bill.status)}>
							{getBillStatusLabel(bill.status)}
						</Badge>
						{bill.requiresMeterData && (
							<Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
								Cần nhập đồng hồ
							</Badge>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div className="space-y-3">
					{/* Amount Info */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Tổng tiền:</span>
							<span className="font-semibold text-lg">{formatCurrency(bill.totalAmount)}</span>
						</div>

						{bill.paidAmount > 0 && (
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Đã thanh toán:</span>
								<span className="text-green-600">{formatCurrency(bill.paidAmount)}</span>
							</div>
						)}

						{bill.remainingAmount > 0 && (
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Còn lại:</span>
								<span className="font-semibold">{formatCurrency(bill.remainingAmount)}</span>
							</div>
						)}
					</div>

					{/* Due Date */}
					<div className="flex items-center gap-2 text-sm pt-2 border-t">
						<Calendar className="w-4 h-4 text-muted-foreground" />
						<span className="text-muted-foreground">Hạn thanh toán:</span>
						<span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
							{formatDate(bill.dueDate)}
						</span>
					</div>

					{/* Overdue Warning */}
					{isOverdue && (
						<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
							<AlertCircle className="w-4 h-4" />
							<span>Quá hạn {Math.abs(daysUntilDue)} ngày</span>
						</div>
					)}

					{/* Due Soon Warning */}
					{isDueSoon && (
						<div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
							<AlertCircle className="w-4 h-4" />
							<span>Còn {daysUntilDue} ngày đến hạn</span>
						</div>
					)}

					{/* Meter Data Required */}
					{bill.requiresMeterData && bill.meteredCostsToInput && bill.meteredCostsToInput.length > 0 && (
						<div className="flex items-start gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
							<Gauge className="w-4 h-4 mt-0.5 flex-shrink-0" />
							<div>
								<p className="font-medium">Cần nhập số đồng hồ:</p>
								<p className="text-xs mt-0.5">
									{bill.meteredCostsToInput.map(c => c.name).join(', ')}
								</p>
							</div>
						</div>
					)}

					{/* Paid Date */}
					{bill.status === 'paid' && bill.paidDate && (
						<div className="flex items-center gap-2 text-sm text-green-600">
							<Receipt className="w-4 h-4" />
							<span>Đã thanh toán: {formatDate(bill.paidDate)}</span>
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter className="gap-2 flex-col">
				{bill.requiresMeterData && userRole === 'landlord' && (
					<Button
						variant="default"
						onClick={() => onViewDetail(bill)}
						className="w-full bg-blue-600 hover:bg-blue-700"
					>
						<Gauge className="w-4 h-4 mr-2" />
						Nhập số đồng hồ
					</Button>
				)}
				<div className="flex gap-2 w-full">
					<Button variant="outline" onClick={() => onViewDetail(bill)} className="flex-1">
						Xem chi tiết
					</Button>
					{userRole === 'landlord' && bill.status === 'pending' && onMarkAsPaid && (
						<Button variant="default" onClick={() => onMarkAsPaid(bill)} className="flex-1">
							Đánh dấu đã thanh toán
						</Button>
					)}
					{userRole === 'landlord' && bill.status === 'draft' && !bill.requiresMeterData && onDelete && (
						<Button
							variant="destructive"
							onClick={() => onDelete(bill.id)}
							className="flex-1"
						>
							Xóa
						</Button>
					)}
				</div>
			</CardFooter>
		</Card>
	);
}
