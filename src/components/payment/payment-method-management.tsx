'use client';

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Edit } from 'lucide-react';

interface PaymentMethod {
	id: string;
	type: 'bank_transfer' | 'e_wallet' | 'card';
	name: string;
	accountNumber?: string;
	accountName?: string;
	bankName?: string;
	isDefault: boolean;
}

export function PaymentMethodManagement() {
	const [methods, setMethods] = useState<PaymentMethod[]>([
		{
			id: '1',
			type: 'bank_transfer',
			name: 'Tài khoản ngân hàng',
			accountNumber: '1234567890',
			accountName: 'NGUYEN VAN A',
			bankName: 'Vietcombank',
			isDefault: true,
		},
	]);

	const [showAddDialog, setShowAddDialog] = useState(false);
	const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

	const [formData, setFormData] = useState<{
		type: 'bank_transfer' | 'e_wallet' | 'card';
		name: string;
		accountNumber: string;
		accountName: string;
		bankName: string;
	}>({
		type: 'bank_transfer',
		name: '',
		accountNumber: '',
		accountName: '',
		bankName: '',
	});

	const handleAdd = () => {
		const newMethod: PaymentMethod = {
			id: Date.now().toString(),
			...formData,
			isDefault: methods.length === 0,
		};
		setMethods([...methods, newMethod]);
		setShowAddDialog(false);
		resetForm();
	};

	const handleEdit = (method: PaymentMethod) => {
		setEditingMethod(method);
		setFormData({
			type: method.type,
			name: method.name,
			accountNumber: method.accountNumber || '',
			accountName: method.accountName || '',
			bankName: method.bankName || '',
		});
		setShowAddDialog(true);
	};

	const handleUpdate = () => {
		if (editingMethod) {
			setMethods(
				methods.map((m) =>
					m.id === editingMethod.id ? { ...editingMethod, ...formData } : m,
				),
			);
			setShowAddDialog(false);
			setEditingMethod(null);
			resetForm();
		}
	};

	const handleDelete = (id: string) => {
		setMethods(methods.filter((m) => m.id !== id));
	};

	const handleSetDefault = (id: string) => {
		setMethods(
			methods.map((m) => ({
				...m,
				isDefault: m.id === id,
			})),
		);
	};

	const resetForm = () => {
		setFormData({
			type: 'bank_transfer',
			name: '',
			accountNumber: '',
			accountName: '',
			bankName: '',
		});
	};

	const getMethodIcon = () => {
		return <CreditCard className="h-5 w-5" />;
	};

	const getMethodTypeLabel = (type: string) => {
		const labels = {
			bank_transfer: 'Chuyển khoản ngân hàng',
			e_wallet: 'Ví điện tử',
			card: 'Thẻ tín dụng/ghi nợ',
		};
		return labels[type as keyof typeof labels] || type;
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">Phương thức thanh toán</h2>
					<p className="text-sm text-gray-500 mt-1">
						Quản lý các phương thức thanh toán của bạn
					</p>
				</div>
				<Button onClick={() => setShowAddDialog(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Thêm phương thức
				</Button>
			</div>

			{methods.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<CreditCard className="h-12 w-12 text-gray-400 mb-4" />
						<p className="text-gray-500 text-center mb-4">
							Chưa có phương thức thanh toán nào
						</p>
						<Button onClick={() => setShowAddDialog(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Thêm phương thức đầu tiên
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{methods.map((method) => (
						<Card key={method.id} className="relative">
							<CardHeader>
								<div className="flex justify-between items-start">
									<div className="flex items-center gap-3">
										{getMethodIcon()}
										<div>
											<CardTitle className="text-lg">{method.name}</CardTitle>
											<CardDescription>
												{getMethodTypeLabel(method.type)}
											</CardDescription>
										</div>
									</div>
									{method.isDefault && (
										<Badge variant="default" className="ml-2">
											Mặc định
										</Badge>
									)}
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 mb-4">
									{method.bankName && (
										<div>
											<p className="text-sm text-gray-500">Ngân hàng</p>
											<p className="text-sm font-medium">{method.bankName}</p>
										</div>
									)}
									{method.accountNumber && (
										<div>
											<p className="text-sm text-gray-500">Số tài khoản</p>
											<p className="text-sm font-medium">
												{method.accountNumber}
											</p>
										</div>
									)}
									{method.accountName && (
										<div>
											<p className="text-sm text-gray-500">Tên tài khoản</p>
											<p className="text-sm font-medium">{method.accountName}</p>
										</div>
									)}
								</div>

								<div className="flex gap-2">
									{!method.isDefault && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleSetDefault(method.id)}
										>
											Đặt làm mặc định
										</Button>
									)}
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleEdit(method)}
									>
										<Edit className="mr-2 h-4 w-4" />
										Sửa
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDelete(method.id)}
										disabled={method.isDefault}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Xóa
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Add/Edit Dialog */}
			<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingMethod ? 'Sửa phương thức thanh toán' : 'Thêm phương thức thanh toán'}
						</DialogTitle>
						<DialogDescription>
							Nhập thông tin phương thức thanh toán của bạn
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label htmlFor="name">Tên phương thức</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="VD: Tài khoản chính"
							/>
						</div>

						<div>
							<Label htmlFor="bankName">Tên ngân hàng</Label>
							<Input
								id="bankName"
								value={formData.bankName}
								onChange={(e) =>
									setFormData({ ...formData, bankName: e.target.value })
								}
								placeholder="VD: Vietcombank"
							/>
						</div>

						<div>
							<Label htmlFor="accountNumber">Số tài khoản</Label>
							<Input
								id="accountNumber"
								value={formData.accountNumber}
								onChange={(e) =>
									setFormData({ ...formData, accountNumber: e.target.value })
								}
								placeholder="VD: 1234567890"
							/>
						</div>

						<div>
							<Label htmlFor="accountName">Tên chủ tài khoản</Label>
							<Input
								id="accountName"
								value={formData.accountName}
								onChange={(e) =>
									setFormData({ ...formData, accountName: e.target.value })
								}
								placeholder="VD: NGUYEN VAN A"
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowAddDialog(false)}>
							Hủy
						</Button>
						<Button onClick={editingMethod ? handleUpdate : handleAdd}>
							{editingMethod ? 'Cập nhật' : 'Thêm'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
