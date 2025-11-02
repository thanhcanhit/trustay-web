'use client';

import { useEffect, useState, useCallback } from 'react';
import {
	getMyRoommateApplications,
	cancelRoommateApplication,
	type RoommateApplication,
} from '@/actions/roommate-applications.action';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApplicationConfirmDialog } from './application-confirm-dialog';
import {
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	Ban,
	Hourglass,
	RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MyApplicationListProps {
	token?: string;
}

export function MyApplicationList({ token }: MyApplicationListProps) {
	const [applications, setApplications] = useState<RoommateApplication[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedApplication, setSelectedApplication] = useState<RoommateApplication | null>(
		null,
	);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [cancelling, setCancelling] = useState(false);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const fetchApplications = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getMyRoommateApplications(
				{
					page,
					limit: 10,
					sortBy: 'createdAt',
					sortOrder: 'desc',
				},
				token,
			);

			if (result.success) {
				setApplications(result.data.data);
				setTotalPages(result.data.meta.totalPages);
				
				// Debug: Log applications with their statuses
				console.log('Fetched applications:', result.data.data.map(app => ({
					id: app.id,
					status: app.status,
					tenantResponse: app.tenantResponse,
					landlordResponse: app.landlordResponse,
					roomInstanceId: app.roommateSeekingPost?.roomInstanceId
				})));
			} else {
				toast.error(result.error);
			}
		} catch {
			toast.error('Không thể tải danh sách đơn ứng tuyển');
		} finally {
			setLoading(false);
		}
	}, [page, token]);

	useEffect(() => {
		fetchApplications();

		// Setup auto-refresh every 30 seconds to check for status updates
		const interval = setInterval(() => {
			fetchApplications();
		}, 30000);

		return () => {
			clearInterval(interval);
		};
	}, [fetchApplications]);

	const handleCancelApplication = async () => {
		if (!selectedApplication) return;

		setCancelling(true);
		try {
			const result = await cancelRoommateApplication(selectedApplication.id, token);

			if (result.success) {
				toast.success('Đã hủy đơn ứng tuyển');
				setCancelDialogOpen(false);
				setSelectedApplication(null);
				fetchApplications();
			} else {
				toast.error(result.error);
			}
		} catch {
			toast.error('Có lỗi xảy ra');
		} finally {
			setCancelling(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'pending':
				return (
					<Badge variant="default" className="bg-yellow-500">
						<Clock className="mr-1 h-3 w-3" />
						Chờ xử lý
					</Badge>
				);
			case 'accepted':
				return (
					<Badge variant="default" className="bg-blue-500">
						<Hourglass className="mr-1 h-3 w-3" />
						Đã phê duyệt (Chờ Landlord)
					</Badge>
				);
			case 'awaiting_confirmation':
				return (
					<Badge variant="default" className="bg-green-500">
						<CheckCircle className="mr-1 h-3 w-3" />
						Chờ xác nhận
					</Badge>
				);
			case 'rejected':
				return (
					<Badge variant="destructive">
						<XCircle className="mr-1 h-3 w-3" />
						Đã từ chối
					</Badge>
				);
			case 'cancelled':
				return (
					<Badge variant="secondary">
						<Ban className="mr-1 h-3 w-3" />
						Đã hủy
					</Badge>
				);
			case 'expired':
				return (
					<Badge variant="secondary">
						<AlertCircle className="mr-1 h-3 w-3" />
						Đã hết hạn
					</Badge>
				);
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (applications.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-8">
					<AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
					<p className="text-muted-foreground">Bạn chưa có đơn ứng tuyển nào</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with Refresh Button */}
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Đơn ứng tuyển của bạn</h2>
				<Button
					variant="outline"
					size="sm"
					onClick={() => fetchApplications()}
					disabled={loading}
				>
					<RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
					Làm mới
				</Button>
			</div>

			{/* Alert for pending confirmations */}
			{applications.some(app => app.status === 'awaiting_confirmation') && (
				<Alert className="border-green-500 bg-green-50 dark:bg-green-950">
					<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
					<AlertDescription className="text-green-800 dark:text-green-200">
						Bạn có {applications.filter(app => app.status === 'awaiting_confirmation').length} đơn ứng tuyển đang chờ xác nhận! 
						Vui lòng xác nhận để hoàn tất quy trình thuê phòng.
					</AlertDescription>
				</Alert>
			)}

			{applications.map((application) => (
				<Card key={application.id}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<CardTitle>{application.roommateSeekingPost?.title}</CardTitle>
								<CardDescription>
									Phòng trên nền tảng TruStay
								</CardDescription>
							</div>
							{getStatusBadge(application.status)}
						</div>
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium">Người cho thuê:</span>{' '}
								{application.roommateSeekingPost?.tenant 
									? `${application.roommateSeekingPost.tenant.firstName} ${application.roommateSeekingPost.tenant.lastName}`
									: 'N/A'}
							</div>
							<div>
								<span className="font-medium">Nghề nghiệp:</span>{' '}
								{application.occupation || 'Chưa cập nhật'}
							</div>
							<div>
								<span className="font-medium">Ngày chuyển vào:</span>{' '}
								{new Date(application.moveInDate).toLocaleDateString('vi-VN')}
							</div>
							<div>
								<span className="font-medium">Thời gian thuê:</span>{' '}
								{application.intendedStayMonths} tháng
							</div>
							<div>
								<span className="font-medium">Giá thuê:</span>{' '}
								{application.roommateSeekingPost?.monthlyRent?.toLocaleString('vi-VN')} VNĐ/tháng
							</div>
							<div>
								<span className="font-medium">Ngày nộp:</span>{' '}
								{new Date(application.createdAt).toLocaleDateString('vi-VN')}
							</div>
						</div>

						{application.applicationMessage && (
							<div className="rounded-md bg-muted p-3">
								<span className="text-sm font-medium">Tin nhắn ứng tuyển:</span>
								<p className="mt-1 text-sm text-muted-foreground">
									{application.applicationMessage}
								</p>
							</div>
						)}

						{application.tenantResponse && (
							<div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
								<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
									Phản hồi từ Tenant:
								</span>
								<p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
									{application.tenantResponse}
								</p>
								{application.tenantRespondedAt && (
									<p className="mt-1 text-xs text-blue-500 dark:text-blue-500">
										{new Date(application.tenantRespondedAt).toLocaleString('vi-VN')}
									</p>
								)}
							</div>
						)}

						{application.landlordResponse && (
							<div className="rounded-md bg-purple-50 p-3 dark:bg-purple-950">
								<span className="text-sm font-medium text-purple-700 dark:text-purple-300">
									Phản hồi từ Landlord:
								</span>
								<p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
									{application.landlordResponse}
								</p>
								{application.landlordRespondedAt && (
									<p className="mt-1 text-xs text-purple-500 dark:text-purple-500">
										{new Date(application.landlordRespondedAt).toLocaleString('vi-VN')}
									</p>
								)}
							</div>
						)}

						{application.status === 'rejected' && (
							<div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
								<span className="text-sm font-medium text-red-700 dark:text-red-300">
									Lý do từ chối:
								</span>
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{application.landlordResponse || application.tenantResponse || 'Không phù hợp'}
								</p>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex flex-col gap-2">
						{/* Status explanation */}
						{application.status === 'awaiting_confirmation' && (
							<div className="w-full rounded-md bg-green-50 p-3 dark:bg-green-950">
								<p className="text-sm font-medium text-green-700 dark:text-green-300">
									✅ Cả Tenant và Landlord đã chấp nhận đơn của bạn!
								</p>
								<p className="mt-1 text-xs text-green-600 dark:text-green-400">
									Vui lòng xác nhận để hoàn tất quy trình và chính thức trở thành người thuê.
								</p>
							</div>
						)}

						{application.status === 'accepted' && !application.landlordResponse && (
							<div className="w-full rounded-md bg-blue-50 p-3 dark:bg-blue-950">
								<p className="text-sm font-medium text-blue-700 dark:text-blue-300">
									✅ Tenant đã chấp nhận đơn của bạn
								</p>
								<p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
									Đang chờ Landlord phê duyệt...
								</p>
							</div>
						)}

						{application.status === 'pending' && (
							<div className="w-full rounded-md bg-yellow-50 p-3 dark:bg-yellow-950">
								<p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
									⏳ Đang chờ Tenant xem xét đơn của bạn
								</p>
								<p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
									Hãy kiên nhẫn chờ phản hồi nhé!
								</p>
							</div>
						)}

						{/* Action buttons */}
						<div className="flex w-full gap-2">
							{application.status === 'awaiting_confirmation' && (
								<Button
									variant="default"
									className="flex-1"
									onClick={() => {
										setSelectedApplication(application);
										setConfirmDialogOpen(true);
									}}
								>
									<CheckCircle className="mr-2 h-4 w-4" />
									Xác nhận thuê phòng
								</Button>
							)}
							{application.status === 'pending' && (
								<Button
									variant="destructive"
									className="flex-1"
									onClick={() => {
										setSelectedApplication(application);
										setCancelDialogOpen(true);
									}}
								>
									<Ban className="mr-2 h-4 w-4" />
									Hủy đơn
								</Button>
							)}
						</div>
					</CardFooter>
				</Card>
			))}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						variant="outline"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						Trang trước
					</Button>
					<span className="text-sm">
						Trang {page} / {totalPages}
					</span>
					<Button
						variant="outline"
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={page === totalPages}
					>
						Trang sau
					</Button>
				</div>
			)}

			{/* Confirm Dialog */}
			{selectedApplication && (
				<ApplicationConfirmDialog
					application={selectedApplication}
					open={confirmDialogOpen}
					onOpenChange={setConfirmDialogOpen}
					token={token}
					onConfirmed={fetchApplications}
				/>
			)}

			{/* Cancel Confirmation Dialog */}
			<AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hủy đơn ứng tuyển?</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn hủy đơn ứng tuyển này? Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={cancelling}>Không</AlertDialogCancel>
						<AlertDialogAction onClick={handleCancelApplication} disabled={cancelling}>
							{cancelling ? 'Đang hủy...' : 'Có, hủy đơn'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
