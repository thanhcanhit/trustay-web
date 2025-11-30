'use client';

import { useState, useEffect } from 'react';
import { useRoomIssueStore } from '@/stores/roomIssueStore';
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
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Clock,
	FileText,
	Plus,
	Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { RoomIssueCategory, RoomIssueStatus } from '@/types/types';

interface RoomIssuesSectionProps {
	roomInstanceId: string;
	rentalId: string;
}

const categoryLabels: Record<RoomIssueCategory, string> = {
	facility: 'Cơ sở vật chất',
	utility: 'Tiện ích',
	neighbor: 'Hàng xóm',
	noise: 'Tiếng ồn',
	security: 'An ninh',
	other: 'Khác',
};

const categoryIcons: Record<RoomIssueCategory, React.ReactNode> = {
	facility: <Wrench className="h-4 w-4" />,
	utility: <AlertCircle className="h-4 w-4" />,
	neighbor: <AlertTriangle className="h-4 w-4" />,
	noise: <AlertTriangle className="h-4 w-4" />,
	security: <AlertCircle className="h-4 w-4" />,
	other: <FileText className="h-4 w-4" />,
};

const statusColors: Record<RoomIssueStatus, string> = {
	new: 'bg-red-100 text-red-700 border-red-300',
	in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-300',
	resolved: 'bg-green-100 text-green-700 border-green-300',
};

const statusLabels: Record<RoomIssueStatus, string> = {
	new: 'Mới',
	in_progress: 'Đang xử lý',
	resolved: 'Đã giải quyết',
};

const statusIcons: Record<RoomIssueStatus, React.ReactNode> = {
	new: <AlertCircle className="h-3 w-3" />,
	in_progress: <Clock className="h-3 w-3" />,
	resolved: <CheckCircle2 className="h-3 w-3" />,
};

export function RoomIssuesSection({ roomInstanceId }: RoomIssuesSectionProps) {
	const { issues, loading, loadMyIssues, create, submitting, submitError } =
		useRoomIssueStore();

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showAllIssues, setShowAllIssues] = useState(false);
	const [newIssue, setNewIssue] = useState({
		title: '',
		category: 'other' as RoomIssueCategory,
		imageUrls: [] as string[],
	});

	// Load issues on mount
	useEffect(() => {
		loadMyIssues({ roomInstanceId });
	}, [roomInstanceId, loadMyIssues]);

	const handleCreateIssue = async () => {
		if (!newIssue.title.trim()) {
			toast.error('Vui lòng nhập tiêu đề');
			return;
		}

		const success = await create({
			roomInstanceId,
			title: newIssue.title.trim(),
			category: newIssue.category,
			imageUrls: newIssue.imageUrls.length > 0 ? newIssue.imageUrls : undefined,
		});

		if (success) {
			toast.success('Đã gửi báo cáo sự cố');
			setShowCreateDialog(false);
			setNewIssue({ title: '', category: 'other', imageUrls: [] });
			// Reload issues
			loadMyIssues({ roomInstanceId });
		}
	};

	// Filter issues based on showAllIssues
	const displayedIssues = showAllIssues
		? issues
		: issues.filter((issue) => issue.status !== 'resolved');

	const openIssuesCount = issues.filter((issue) => issue.status !== 'resolved').length;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Wrench className="h-5 w-5" />
						<CardTitle>Sự cố phòng</CardTitle>
						{openIssuesCount > 0 && (
							<Badge variant="destructive">{openIssuesCount} chưa giải quyết</Badge>
						)}
					</div>
					<Button onClick={() => setShowCreateDialog(true)} size="sm">
						<Plus className="h-4 w-4 mr-2" />
						Báo cáo sự cố
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{loading ? (
					<div className="text-center py-8 text-muted-foreground">Đang tải...</div>
				) : displayedIssues.length > 0 ? (
					<>
						<div className="space-y-3">
							{displayedIssues.map((issue) => (
								<div
									key={issue.id}
									className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-2">
												{categoryIcons[issue.category]}
												<h4 className="font-medium">{issue.title}</h4>
											</div>
											<div className="flex items-center gap-2 flex-wrap">
												<Badge
													variant="outline"
													className={statusColors[issue.status]}
												>
													{statusIcons[issue.status]}
													<span className="ml-1">
														{statusLabels[issue.status]}
													</span>
												</Badge>
												<Badge variant="outline">
													{categoryLabels[issue.category]}
												</Badge>
												<span className="text-xs text-muted-foreground">
													{formatDistanceToNow(new Date(issue.createdAt), {
														addSuffix: true,
														locale: vi,
													})}
												</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						{issues.length > displayedIssues.length && (
							<Button
								variant="outline"
								onClick={() => setShowAllIssues(!showAllIssues)}
								className="w-full"
							>
								{showAllIssues
									? 'Ẩn sự cố đã giải quyết'
									: `Xem tất cả (${issues.length})`}
							</Button>
						)}
					</>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						{showAllIssues
							? 'Chưa có sự cố nào'
							: 'Không có sự cố đang chờ xử lý'}
					</div>
				)}
			</CardContent>

			{/* Create Issue Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Báo cáo sự cố phòng</DialogTitle>
						<DialogDescription>
							Mô tả sự cố bạn đang gặp phải để chủ trọ có thể xử lý
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="category">Loại sự cố</Label>
							<Select
								value={newIssue.category}
								onValueChange={(value) =>
									setNewIssue({ ...newIssue, category: value as RoomIssueCategory })
								}
							>
								<SelectTrigger id="category">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(categoryLabels).map(([key, label]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="title">Tiêu đề</Label>
							<Input
								id="title"
								placeholder="VD: Rò rỉ nước ở phòng tắm"
								value={newIssue.title}
								onChange={(e) =>
									setNewIssue({ ...newIssue, title: e.target.value })
								}
								maxLength={120}
							/>
							<div className="text-xs text-muted-foreground">
								{newIssue.title.length}/120 ký tự
							</div>
						</div>

						{submitError && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{submitError}</AlertDescription>
							</Alert>
						)}

						<div className="flex gap-2 justify-end">
							<Button
								variant="outline"
								onClick={() => setShowCreateDialog(false)}
								disabled={submitting}
							>
								Hủy
							</Button>
							<Button onClick={handleCreateIssue} disabled={submitting}>
								{submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
