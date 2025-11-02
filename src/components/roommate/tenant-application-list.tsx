'use client';

import { useEffect, useState, useCallback } from 'react';
import {
	getApplicationsForMyPosts,
	respondToRoommateApplication,
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, AlertCircle, Hourglass } from 'lucide-react';
import { toast } from 'sonner';

interface TenantApplicationListProps {
	token?: string;
}

export function TenantApplicationList({ token }: TenantApplicationListProps) {
	const [applications, setApplications] = useState<RoommateApplication[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedApplication, setSelectedApplication] = useState<RoommateApplication | null>(
		null,
	);
	const [actionType, setActionType] = useState<'accepted' | 'rejected' | null>(null);
	const [response, setResponse] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const fetchApplications = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getApplicationsForMyPosts(
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
	}, [fetchApplications]);

	const handleOpenDialog = (
		application: RoommateApplication,
		type: 'accepted' | 'rejected',
	) => {
		setSelectedApplication(application);
		setActionType(type);
		setResponse('');
	};

	const handleCloseDialog = () => {
		setSelectedApplication(null);
		setActionType(null);
		setResponse('');
	};

	const handleSubmit = async () => {
		if (!selectedApplication || !actionType || !response.trim()) {
			toast.error('Vui lòng nhập lý do');
			return;
		}

		setSubmitting(true);
		try {
			const result = await respondToRoommateApplication(
				selectedApplication.id,
				{
					status: actionType,
					response,
				},
				token,
			);

			if (result.success) {
				toast.success(
					actionType === 'accepted' ? 'Đã phê duyệt đơn ứng tuyển' : 'Đã từ chối đơn ứng tuyển',
				);
				handleCloseDialog();
				fetchApplications();
			} else {
				toast.error(result.error);
			}
		} catch {
			toast.error('Có lỗi xảy ra');
		} finally {
			setSubmitting(false);
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
						Chờ Landlord duyệt
					</Badge>
				);
			case 'awaiting_confirmation':
				return (
					<Badge variant="default" className="bg-green-500">
						<CheckCircle className="mr-1 h-3 w-3" />
						Chờ ứng viên xác nhận
					</Badge>
				);
			case 'rejected':
				return (
					<Badge variant="destructive">
						<XCircle className="mr-1 h-3 w-3" />
						Đã từ chối
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
					<p className="text-muted-foreground">Chưa có đơn ứng tuyển nào</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{applications.map((application) => (
				<Card key={application.id}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div>
								<CardTitle>{application.fullName}</CardTitle>
								<CardDescription>
									{application.roommateSeekingPost?.title}
								</CardDescription>
							</div>
							{getStatusBadge(application.status)}
						</div>
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium">Email:</span> {application.email}
							</div>
							<div>
								<span className="font-medium">Điện thoại:</span> {application.phoneNumber}
							</div>
							<div>
								<span className="font-medium">Nghề nghiệp:</span> {application.occupation}
							</div>
							<div>
								<span className="font-medium">Thu nhập:</span>{' '}
								{application.monthlyIncome?.toLocaleString('vi-VN')} VNĐ/tháng
							</div>
							<div>
								<span className="font-medium">Ngày chuyển vào:</span>{' '}
								{new Date(application.moveInDate).toLocaleDateString('vi-VN')}
							</div>
							<div>
								<span className="font-medium">Thời gian thuê:</span>{' '}
								{application.intendedStayMonths} tháng
							</div>
						</div>
						<div>
							<span className="font-medium">Lời nhắn:</span>
							<p className="mt-1 text-sm text-muted-foreground">
								{application.applicationMessage}
							</p>
						</div>
						{application.tenantResponse && (
							<div className="rounded-md bg-muted p-3">
								<span className="text-sm font-medium">Phản hồi của bạn:</span>
								<p className="mt-1 text-sm text-muted-foreground">
									{application.tenantResponse}
								</p>
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
							</div>
						)}
					</CardContent>
					<CardFooter className="flex gap-2">
						<Button
							variant="default"
							onClick={() => handleOpenDialog(application, 'accepted')}
							disabled={application.status !== 'pending'}
						>
							<CheckCircle className="mr-2 h-4 w-4" />
							Phê duyệt
						</Button>
						<Button
							variant="destructive"
							onClick={() => handleOpenDialog(application, 'rejected')}
							disabled={application.status !== 'pending'}
						>
							<XCircle className="mr-2 h-4 w-4" />
							Từ chối
						</Button>
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

			{/* Dialog for approve/reject */}
			<Dialog open={!!selectedApplication} onOpenChange={handleCloseDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{actionType === 'accepted' ? 'Phê duyệt' : 'Từ chối'} đơn ứng tuyển
						</DialogTitle>
						<DialogDescription>
							{actionType === 'accepted'
								? 'Vui lòng nhập lý do phê duyệt cho ứng viên'
								: 'Vui lòng nhập lý do từ chối ứng viên'}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="response">Lý do</Label>
							<Textarea
								id="response"
								value={response}
								onChange={(e) => setResponse(e.target.value)}
								placeholder={
									actionType === 'accepted'
										? 'Ví dụ: Ứng viên phù hợp với yêu cầu của phòng...'
										: 'Ví dụ: Ứng viên chưa đáp ứng yêu cầu về thu nhập...'
								}
								rows={4}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
							Hủy
						</Button>
						<Button
							variant={actionType === 'accepted' ? 'default' : 'destructive'}
							onClick={handleSubmit}
							disabled={submitting || !response.trim()}
						>
							{submitting ? 'Đang xử lý...' : 'Xác nhận'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
