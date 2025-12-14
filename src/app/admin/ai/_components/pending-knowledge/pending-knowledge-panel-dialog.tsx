"use client";

import { useRouter } from 'next/navigation';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { PendingKnowledge } from '@/types/admin-ai';
import { PendingKnowledgeStatusBadge } from '../badges';
import { formatDateTime } from '../utils';

interface PendingKnowledgePanelDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedItem: PendingKnowledge | null;
	actionNote: string;
	onActionNoteChange: (value: string) => void;
	onApprove: () => void;
	onReject: () => void;
	isApproving: boolean;
	isRejecting: boolean;
}

export function PendingKnowledgePanelDialog({
	open,
	onOpenChange,
	selectedItem,
	actionNote,
	onActionNoteChange,
	onApprove,
	onReject,
	isApproving,
	isRejecting,
}: PendingKnowledgePanelDialogProps) {
	const router = useRouter();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[90vw] min-w-[80vw] max-h-[95vh] top-4 overflow-hidden flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle>Chi tiết Pending Knowledge</DialogTitle>
					<DialogDescription>
						Xem toàn bộ thông tin chi tiết và approve/reject entry này
					</DialogDescription>
				</DialogHeader>
				{selectedItem && (
					<div className="flex-1 overflow-y-auto space-y-4 pr-2">
						{/* Session Information - Compact */}
						<div className="bg-slate-50 border rounded-md p-4">
							<div className="flex items-start justify-between gap-4">
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm flex-1">
									<div>
										<span className="text-xs text-muted-foreground">ID:</span>
										<p className="font-mono text-foreground mt-0.5">{selectedItem.id}</p>
									</div>
									<div>
										<span className="text-xs text-muted-foreground">Status:</span>
										<div className="mt-0.5">
											<PendingKnowledgeStatusBadge status={selectedItem.status} />
										</div>
									</div>
									<div>
										<span className="text-xs text-muted-foreground">Created:</span>
										<p className="text-foreground mt-0.5">{formatDateTime(selectedItem.createdAt)}</p>
									</div>
									<div>
										<span className="text-xs text-muted-foreground">Updated:</span>
										<p className="text-foreground mt-0.5">{formatDateTime(selectedItem.updatedAt)}</p>
									</div>
									{selectedItem.sessionId && (
										<div>
											<span className="text-xs text-muted-foreground">Session ID:</span>
											<p className="text-xs font-mono text-foreground mt-0.5 break-all">{selectedItem.sessionId}</p>
										</div>
									)}
									{selectedItem.userId && (
										<div>
											<span className="text-xs text-muted-foreground">User ID:</span>
											<p className="text-xs font-mono text-foreground mt-0.5 break-all">{selectedItem.userId}</p>
										</div>
									)}
								</div>
								{selectedItem.processingLogId && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => router.push(`/admin/ai/process/${selectedItem.processingLogId}`)}
										className="shrink-0"
									>
										<FileText className="size-4 mr-2" />
										Xem Log
									</Button>
								)}
							</div>
						</div>

						{/* Main Content - Grid 2 columns */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{/* Left Column */}
							<div className="space-y-4">
								<div className="space-y-2">
									<Label className="text-sm font-semibold">Câu hỏi</Label>
									<div className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4 max-h-[200px] overflow-y-auto">
										{selectedItem.question}
									</div>
								</div>

								<div className="space-y-2">
									<Label className="text-sm font-semibold">SQL</Label>
									{selectedItem.sql ? (
										<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto">
											{selectedItem.sql}
										</pre>
									) : (
										<p className="text-sm text-muted-foreground bg-slate-50 border rounded-md p-4">
											Không có SQL
										</p>
									)}
								</div>

								{selectedItem.response && (
									<div className="space-y-2">
										<Label className="text-sm font-semibold">Response</Label>
										<div className="text-sm text-foreground whitespace-pre-wrap bg-green-50 border border-green-200 rounded-md p-4 max-h-[300px] overflow-y-auto">
											{selectedItem.response}
										</div>
									</div>
								)}
							</div>

							{/* Right Column */}
							<div className="space-y-4">
								{selectedItem.evaluation && (
									<div className="space-y-2">
										<Label className="text-sm font-semibold">Evaluation</Label>
										<div className="text-sm text-foreground whitespace-pre-wrap bg-blue-50 border border-blue-200 rounded-md p-4 max-h-[400px] overflow-y-auto">
											{selectedItem.evaluation}
										</div>
									</div>
								)}

								{selectedItem.validatorData && (
									<div className="space-y-2">
										<Label className="text-sm font-semibold">Validator Data</Label>
										<div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-3 max-h-[400px] overflow-y-auto">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<span className="text-xs font-medium">Valid:</span>{' '}
													<span
														className={`text-xs font-semibold ${
															selectedItem.validatorData.isValid
																? 'text-green-600'
																: 'text-red-600'
														}`}
													>
														{String(selectedItem.validatorData.isValid)}
													</span>
												</div>
												{selectedItem.validatorData.severity && (
													<div>
														<span className="text-xs font-medium">Severity:</span>{' '}
														<span className="text-xs">{selectedItem.validatorData.severity}</span>
													</div>
												)}
											</div>
											{selectedItem.validatorData.reason && (
												<div>
													<span className="text-xs font-medium">Reason:</span>
													<p className="text-xs mt-1 whitespace-pre-wrap">
														{selectedItem.validatorData.reason}
													</p>
												</div>
											)}
											{selectedItem.validatorData.violations &&
												selectedItem.validatorData.violations.length > 0 && (
													<div>
														<span className="text-xs font-medium">Violations:</span>
														<ul className="list-disc list-inside mt-1 space-y-1">
															{selectedItem.validatorData.violations.map((v, idx) => (
																<li key={idx} className="text-xs">
																	{v}
																</li>
															))}
														</ul>
													</div>
												)}
											{selectedItem.validatorData.tokenUsage && (
												<div className="pt-2 border-t border-amber-300">
													<span className="text-xs font-medium">Token Usage:</span>
													<div className="text-xs mt-1 space-y-1">
														<div>
															Prompt: {selectedItem.validatorData.tokenUsage.promptTokens || 0}
														</div>
														<div>
															Completion:{' '}
															{selectedItem.validatorData.tokenUsage.completionTokens || 0}
														</div>
														<div className="font-semibold">
															Total: {selectedItem.validatorData.tokenUsage.totalTokens || 0} tokens
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>

						{selectedItem.approvedAt && (
							<div className="space-y-2">
								<Label className="text-sm font-semibold">Approved At</Label>
								<p className="text-sm text-foreground bg-green-50 border border-green-200 rounded-md p-3">
									{formatDateTime(selectedItem.approvedAt)}
									{selectedItem.approvedBy && (
										<span className="text-muted-foreground ml-2">
											by {selectedItem.approvedBy}
										</span>
									)}
								</p>
							</div>
						)}

						{selectedItem.rejectedAt && (
							<div className="space-y-2">
								<Label className="text-sm font-semibold">Rejected At</Label>
								<p className="text-sm text-foreground bg-red-50 border border-red-200 rounded-md p-3">
									{formatDateTime(selectedItem.rejectedAt)}
									{selectedItem.rejectedBy && (
										<span className="text-muted-foreground ml-2">
											by {selectedItem.rejectedBy}
										</span>
									)}
								</p>
								{selectedItem.rejectionReason && (
									<div className="mt-2">
										<Label className="text-sm font-semibold">Rejection Reason</Label>
										<p className="text-sm text-foreground whitespace-pre-wrap bg-red-50 border border-red-200 rounded-md p-3 mt-1">
											{selectedItem.rejectionReason}
										</p>
									</div>
								)}
							</div>
						)}

						{/* Action Form - Only show for pending status */}
						{selectedItem.status === 'pending' && (
							<div className="space-y-2 pt-4 border-t">
								<Label htmlFor="action-note" className="text-sm font-semibold">
									Note / Reason <span className="text-muted-foreground text-xs">(optional for approve, required for reject)</span>
								</Label>
								<Textarea
									id="action-note"
									value={actionNote}
									onChange={(e) => onActionNoteChange(e.target.value)}
									placeholder="Nhập note khi approve hoặc lý do khi reject..."
									rows={3}
									maxLength={1000}
								/>
								<p className="text-xs text-muted-foreground">
									{actionNote.length}/1000 ký tự
								</p>
							</div>
						)}
					</div>
				)}
				<DialogFooter className="flex-shrink-0">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Đóng
					</Button>
					{selectedItem?.status === 'pending' && (
						<>
							<Button
								onClick={onApprove}
								disabled={!selectedItem.sql || isApproving}
								className="text-green-600 hover:text-green-700 hover:bg-green-50"
							>
								<CheckCircle2 className="size-4 mr-2" />
								{isApproving ? 'Đang xử lý...' : 'Accept'}
							</Button>
							<Button
								onClick={onReject}
								variant="destructive"
								disabled={!actionNote.trim() || isRejecting}
							>
								<XCircle className="size-4 mr-2" />
								{isRejecting ? 'Đang xử lý...' : 'Reject'}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
