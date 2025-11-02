import type { Bill, BillItem } from '@/types/bill.types';
import type { BillStatus } from '@/types/types';

/**
 * Calculate proration percentage
 */
export function calculateProrationPercentage(
	rentalStartDate: string | Date | undefined,
	rentalEndDate: string | Date | undefined,
	periodStart: string | Date,
	periodEnd: string | Date,
): number {
	if (!rentalStartDate || !rentalEndDate) return 100;

	const start = new Date(rentalStartDate);
	const end = new Date(rentalEndDate);
	const pStart = new Date(periodStart);
	const pEnd = new Date(periodEnd);

	const totalDays = Math.ceil((pEnd.getTime() - pStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
	const rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

	return (rentalDays / totalDays) * 100;
}

/**
 * Check if bill is overdue
 */
export function isBillOverdue(bill: Bill): boolean {
	if (bill.status === 'paid') return false;
	return new Date(bill.dueDate) < new Date();
}

/**
 * Get days until due
 */
export function getDaysUntilDue(dueDate: string | Date): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const due = new Date(dueDate);
	due.setHours(0, 0, 0, 0);
	const diffTime = due.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
}

/**
 * Calculate total from bill items
 */
export function calculateBillTotal(items: BillItem[]): number {
	return items.reduce((sum, item) => sum + Number(item.amount), 0);
}

/**
 * Format billing period (2025-01 -> Tháng 1/2025)
 */
export function formatBillingPeriod(period: string): string {
	const [year, month] = period.split('-');
	return `Tháng ${parseInt(month)}/${year}`;
}

/**
 * Get status color for badges
 */
export function getBillStatusColor(
	status: BillStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
	const colors: Record<BillStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
		draft: 'outline',
		pending: 'default',
		paid: 'secondary',
		overdue: 'destructive',
		cancelled: 'outline',
	};
	return colors[status] || 'default';
}

/**
 * Get status label in Vietnamese
 */
export function getBillStatusLabel(status: BillStatus): string {
	const labels: Record<BillStatus, string> = {
		draft: 'Nháp',
		pending: 'Chờ thanh toán',
		paid: 'Đã thanh toán',
		overdue: 'Quá hạn',
		cancelled: 'Đã hủy',
	};
	return labels[status] || status;
}

/**
 * Format currency to VND
 */
export function formatCurrency(amount: number, currency = 'VND'): string {
	if (currency === 'VND') {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	}

	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency,
	}).format(amount);
}

/**
 * Format currency compact (5tr, 10tr)
 */
export function formatCurrencyCompact(amount: number): string {
	if (amount >= 1000000) {
		return `${(amount / 1000000).toFixed(1)}tr`;
	}
	if (amount >= 1000) {
		return `${(amount / 1000).toFixed(0)}k`;
	}
	return amount.toString();
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString('vi-VN');
}

/**
 * Get current billing period (YYYY-MM)
 */
export function getCurrentBillingPeriod(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	return `${year}-${month}`;
}

/**
 * Get period dates (first and last day of month)
 */
export function getPeriodDates(billingPeriod: string): { start: string; end: string } {
	const [year, month] = billingPeriod.split('-').map(Number);
	const start = new Date(year, month - 1, 1);
	const end = new Date(year, month, 0);

	return {
		start: start.toISOString().split('T')[0],
		end: end.toISOString().split('T')[0],
	};
}

/**
 * Get bill summary statistics
 */
export function getBillSummary(bills: Bill[]) {
	const total = bills.length;
	const paid = bills.filter((b) => b.status === 'paid').length;
	const pending = bills.filter((b) => b.status === 'pending').length;
	const overdue = bills.filter((b) => isBillOverdue(b)).length;
	const totalAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
	const paidAmount = bills.reduce((sum, b) => sum + b.paidAmount, 0);
	const remainingAmount = bills.reduce((sum, b) => sum + b.remainingAmount, 0);

	return {
		total,
		paid,
		pending,
		overdue,
		totalAmount,
		paidAmount,
		remainingAmount,
	};
}
