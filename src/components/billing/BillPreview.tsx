import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
	formatCurrency,
	formatBillingPeriod,
} from '@/utils/billUtils';
import type { Bill } from '@/types/bill.types';

interface BillPreviewProps {
	bill: Bill | null;
}

export function BillPreview({ bill }: BillPreviewProps) {
	if (!bill) {
		return (
			<Card className="h-full">
				<CardHeader>
					<CardTitle>Preview Hóa Đơn</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-64 text-muted-foreground">
						Chọn một phòng để xem preview hóa đơn
					</div>
				</CardContent>
			</Card>
		);
	}

	// Separate bill items by type
	const rentItem = bill.billItems?.find(item => item.itemType === 'rent');
	const electricityItem = bill.billItems?.find(item => 
		item.itemName?.toLowerCase().includes('điện') || 
		item.itemName?.toLowerCase().includes('electric')
	);
	const waterItem = bill.billItems?.find(item => 
		item.itemName?.toLowerCase().includes('nước') || 
		item.itemName?.toLowerCase().includes('water')
	);
	const otherItems = bill.billItems?.filter(item => 
		item.itemType !== 'rent' && 
		item !== electricityItem && 
		item !== waterItem
	) || [];

	return (
		<Card className="h-full shadow-lg">
			<CardHeader className="bg-primary/5 border-b">
				<div className="text-center space-y-2">
					<CardTitle className="text-2xl">Hóa Đơn</CardTitle>
					<div className="space-y-1">
						<p className="text-sm font-semibold text-primary">
							Chu kỳ: {formatBillingPeriod(bill.billingPeriod)}
						</p>
						{bill.rental?.roomInstance && (
							<p className="text-sm font-medium">
								Phòng {bill.rental.roomInstance.roomNumber}
							</p>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4 pt-6">
				{/* Rent */}
				{rentItem && (
					<div className="space-y-2">
						<div className="flex justify-between items-center py-2 border-b">
							<div>
								<p className="font-medium">{rentItem.itemName}</p>
								<p className="text-xs text-muted-foreground">Cố định hàng tháng</p>
							</div>
							<span className="font-semibold text-lg">{formatCurrency(rentItem.amount)}</span>
						</div>
					</div>
				)}

				{/* Electricity */}
				{electricityItem && (
					<div className="space-y-2">
						<div className="flex justify-between items-start py-2 border-b">
							<div className="flex-1">
								<p className="font-medium">⚡ Tiền điện</p>
								{electricityItem.quantity && electricityItem.unitPrice ? (
									<p className="text-xs text-muted-foreground mt-1">
										{electricityItem.quantity} kWh × {formatCurrency(electricityItem.unitPrice)} = {formatCurrency(electricityItem.amount)}
									</p>
								) : (
									<p className="text-xs text-muted-foreground mt-1">{electricityItem.description}</p>
								)}
							</div>
							<span className="font-semibold text-lg text-amber-600">
								{formatCurrency(electricityItem.amount)}
							</span>
						</div>
					</div>
				)}

				{/* Water */}
				{waterItem && (
					<div className="space-y-2">
						<div className="flex justify-between items-start py-2 border-b">
							<div className="flex-1">
								<p className="font-medium">💧 Tiền nước</p>
								{waterItem.quantity && waterItem.unitPrice ? (
									<p className="text-xs text-muted-foreground mt-1">
										{waterItem.quantity} m³ × {formatCurrency(waterItem.unitPrice)} = {formatCurrency(waterItem.amount)}
									</p>
								) : (
									<p className="text-xs text-muted-foreground mt-1">{waterItem.description}</p>
								)}
							</div>
							<span className="font-semibold text-lg text-blue-600">
								{formatCurrency(waterItem.amount)}
							</span>
						</div>
					</div>
				)}

				{/* Other costs */}
				{otherItems.length > 0 && (
					<div className="space-y-2">
						<p className="text-sm font-semibold text-muted-foreground">Các chi phí khác</p>
						{otherItems.map((item) => (
							<div key={item.id} className="flex justify-between items-start py-1.5 pl-4 border-l-2 border-muted">
								<div className="flex-1">
									<p className="text-sm font-medium">{item.itemName}</p>
									{item.description && (
										<p className="text-xs text-muted-foreground">{item.description}</p>
									)}
									{item.quantity && item.unitPrice && (
										<p className="text-xs text-muted-foreground">
											{item.quantity} × {formatCurrency(item.unitPrice)}
										</p>
									)}
								</div>
								<span className="text-sm font-semibold">{formatCurrency(item.amount)}</span>
							</div>
						))}
					</div>
				)}

				{bill.billItems && bill.billItems.length === 0 && (
					<div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
						Chưa có chi tiết hóa đơn
					</div>
				)}

				<Separator className="my-4" />

				{/* Totals */}
				<div className="space-y-3 bg-muted/30 p-4 rounded-lg">
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

					<div className="flex justify-between items-center bg-primary text-primary-foreground p-3 rounded-lg -mx-4 -mb-4">
						<span className="text-lg font-bold">Tổng cộng:</span>
						<span className="text-2xl font-bold">{formatCurrency(bill.totalAmount)}</span>
					</div>
				</div>

				{/* Payment Status */}
				{bill.paidAmount > 0 && (
					<div className="space-y-2 pt-2">
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
					</div>
				)}
			</CardContent>
		</Card>
	);
}
