'use client';

import { PaymentList } from '@/components/payment/payment-list';
import { PaymentMethodManagement } from '@/components/payment/payment-method-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PaymentPage() {
	return (
		<div className="p-6">
			<Tabs defaultValue="history" className="w-full">
				<TabsList className="grid w-full max-w-md grid-cols-2">
					<TabsTrigger value="history">Lịch sử thanh toán</TabsTrigger>
					<TabsTrigger value="methods">Phương thức</TabsTrigger>
				</TabsList>
				<TabsContent value="history" className="mt-6">
					<PaymentList />
				</TabsContent>
				<TabsContent value="methods" className="mt-6">
					<PaymentMethodManagement />
				</TabsContent>
			</Tabs>
		</div>
	);
}
