"use client";

import { Upload, FileText, TerminalSquare, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { TeachBatchResult } from '@/types/admin-ai';

interface TeachPanelBatchFormProps {
	jsonInput: string;
	onJsonInputChange: (value: string) => void;
	failFast: boolean;
	onFailFastChange: (checked: boolean) => void;
	onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onPasteExample: () => void;
	onSubmit: () => void;
	batchResult: TeachBatchResult | null;
	isPending: boolean;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function TeachPanelBatchForm({
	jsonInput,
	onJsonInputChange,
	failFast,
	onFailFastChange,
	onFileUpload,
	onPasteExample,
	onSubmit,
	batchResult,
	isPending,
	fileInputRef,
}: TeachPanelBatchFormProps) {
	return (
		<>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<Label className="text-sm font-medium">JSON Input</Label>
					<Badge variant="outline" className="uppercase text-xs">
						Array or Single Object
					</Badge>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => fileInputRef.current?.click()}
						className="sm:w-auto"
					>
						<Upload className="size-4 mr-2" />
						Upload File
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".json,application/json"
						onChange={onFileUpload}
						className="hidden"
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onPasteExample}
						className="sm:w-auto"
					>
						<FileText className="size-4 mr-2" />
						Paste Example
					</Button>
				</div>
				<Textarea
					value={jsonInput}
					onChange={(e) => onJsonInputChange(e.target.value)}
					placeholder='[{"question": "...", "sql": "..."}, ...]'
					className="font-mono text-sm min-h-[300px]"
				/>
			</div>

			<div className="flex items-center gap-2">
				<Checkbox
					id="failFast"
					checked={failFast}
					onCheckedChange={(checked) => onFailFastChange(checked === true)}
				/>
				<Label htmlFor="failFast" className="text-sm cursor-pointer">
					Fail Fast (dừng sớm khi gặp lỗi)
				</Label>
			</div>

			<Separator />

			{batchResult && (
				<div className="flex flex-col gap-2 p-4 border rounded-lg bg-slate-50">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold">Kết quả Batch</h3>
						<div className="flex items-center gap-4 text-xs">
							<span className="text-green-600">✓ {batchResult.successful}</span>
							<span className="text-red-600">✗ {batchResult.failed}</span>
							<span className="text-muted-foreground">Tổng: {batchResult.total}</span>
						</div>
					</div>
					<div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
						{batchResult.results.map((result, idx) => (
							<div
								key={idx}
								className={`flex items-center gap-2 p-2 rounded text-xs ${
									result.success ? 'bg-green-50' : 'bg-red-50'
								}`}
							>
								{result.success ? (
									<CheckCircle2 className="size-4 text-green-600" />
								) : (
									<XCircle className="size-4 text-red-600" />
								)}
								<span className="font-medium">Item {result.index + 1}:</span>
								<span className={result.success ? 'text-green-700' : 'text-red-700'}>
									{result.message}
								</span>
								{result.error && (
									<span className="text-red-600 ml-auto">({result.error})</span>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-sm text-muted-foreground flex items-center gap-2">
					<TerminalSquare className="size-4" />
					Gửi tới endpoint <code>/api/admin/ai/teach-json</code> (POST).
				</div>
				<Button type="button" onClick={onSubmit} disabled={isPending || !jsonInput.trim()}>
					{isPending && <span className="mr-2">...</span>}
					Submit Batch
				</Button>
			</div>
		</>
	);
}
