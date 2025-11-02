'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
	confirmRoommateApplication, 
	getRoommateApplicationById,
	type RoommateApplication 
} from '@/actions/roommate-applications.action';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationConfirmDialogProps {
	application: RoommateApplication;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	token?: string;
	onConfirmed?: () => void;
}

export function ApplicationConfirmDialog({
	application,
	open,
	onOpenChange,
	token,
	onConfirmed,
}: ApplicationConfirmDialogProps) {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [loading, setLoading] = useState(false);
	const [detailedApplication, setDetailedApplication] = useState<RoommateApplication | null>(null);

	// Fetch detailed application data when dialog opens
	useEffect(() => {
		if (open && application.id) {
			const fetchDetail = async () => {
				setLoading(true);
				try {
					const result = await getRoommateApplicationById(application.id, token);
					if (result.success) {
						setDetailedApplication(result.data);
					} else {
						// Fallback to the passed application
						setDetailedApplication(application);
					}
				} catch {
					setDetailedApplication(application);
				} finally {
					setLoading(false);
				}
			};
			fetchDetail();
		}
	}, [open, application.id, application, token]);

	const displayApplication = detailedApplication || application;

	const handleConfirm = async () => {
		setSubmitting(true);
		try {
			const result = await confirmRoommateApplication(application.id, token);

			if (result.success) {
				toast.success('Đã xác nhận đơn ứng tuyển thành công!');
				onOpenChange(false);
				onConfirmed?.();
				
				// Redirect to rental or contract page if needed
				if (result.data.rental) {
					router.push(`/dashboard/rentals/${result.data.rental.id}`);
				}
			} else {
				toast.error(result.error);
			}
		} catch {
			toast.error('Có lỗi xảy ra khi xác nhận đơn ứng tuyển');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CheckCircle className="h-5 w-5 text-green-500" />
						Xác nhận đơn ứng tuyển
					</DialogTitle>
					<DialogDescription>
						Xác nhận bạn đồng ý thuê phòng này và hoàn tất quy trình ứng tuyển
					</DialogDescription>
				</DialogHeader>

				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					</div>
				) : (
					<div className="space-y-4">
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Sau khi xác nhận, hợp đồng thuê phòng sẽ được tạo tự động và bạn sẽ trở thành
								người thuê chính thức.
							</AlertDescription>
						</Alert>

						<div className="space-y-2 rounded-md border p-4">
							<h4 className="font-medium">Thông tin phòng</h4>
							<div className="grid gap-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Tiêu đề:</span>
									<span className="font-medium">
										{displayApplication.roommateSeekingPost?.title}
									</span>
								</div>
								{displayApplication.roommateSeekingPost?.roomInstance && (
									<>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Tên phòng:</span>
											<span className="font-medium">
												{displayApplication.roommateSeekingPost.roomInstance.room.name}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Tòa nhà:</span>
											<span className="font-medium">
												{displayApplication.roommateSeekingPost.roomInstance.room.building.name}
											</span>
										</div>
									</>
								)}
								{displayApplication.roommateSeekingPost?.tenant && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Tenant hiện tại:</span>
										<span className="font-medium">
											{`${displayApplication.roommateSeekingPost.tenant.firstName} ${displayApplication.roommateSeekingPost.tenant.lastName}`}
										</span>
									</div>
								)}
								<div className="flex justify-between">
									<span className="text-muted-foreground">Giá thuê:</span>
									<span className="font-medium">
										{displayApplication.roommateSeekingPost?.monthlyRent?.toLocaleString('vi-VN')} VNĐ/tháng
									</span>
								</div>
								{displayApplication.roommateSeekingPost?.depositAmount && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Tiền đặt cọc:</span>
										<span className="font-medium">
											{displayApplication.roommateSeekingPost.depositAmount.toLocaleString('vi-VN')} VNĐ
										</span>
									</div>
								)}
								<div className="flex justify-between">
									<span className="text-muted-foreground">Ngày chuyển vào:</span>
									<span className="font-medium">
										{new Date(displayApplication.moveInDate).toLocaleDateString('vi-VN')}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Thời gian thuê:</span>
									<span className="font-medium">{displayApplication.intendedStayMonths} tháng</span>
								</div>
							</div>
						</div>

						{displayApplication.tenantResponse && (
							<div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
								<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
									Phản hồi từ Tenant:
								</span>
								<p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
									{displayApplication.tenantResponse}
								</p>
							</div>
						)}

						{displayApplication.landlordResponse && (
							<div className="rounded-md bg-purple-50 p-3 dark:bg-purple-950">
								<span className="text-sm font-medium text-purple-700 dark:text-purple-300">
									Phản hồi từ Landlord:
								</span>
								<p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
									{displayApplication.landlordResponse}
								</p>
							</div>
						)}
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
						Hủy
					</Button>
					<Button onClick={handleConfirm} disabled={submitting}>
						{submitting ? 'Đang xử lý...' : 'Xác nhận thuê phòng'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
