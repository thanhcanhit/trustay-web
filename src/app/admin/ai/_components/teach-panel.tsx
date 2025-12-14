"use client";

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, TerminalSquare, Wand2, Upload, FileText, CheckCircle2, XCircle, Database } from 'lucide-react';
import { toast } from 'sonner';

import { teachOrUpdateKnowledge, teachBatchKnowledge, reEmbedSchema } from '@/actions/admin-ai.action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PasscodeConfirmDialog } from './passcode-confirm-dialog';
import type { TeachOrUpdateResult, TeachBatchResult, TeachBatchItem, TeachBatchPayload } from '@/types/admin-ai';

interface TeachFormState {
	id: string;
	question: string;
	sql: string;
}

interface TeachPanelProps {
	initialData?: {
		id: number;
		question: string;
		sql: string;
	};
}

export function TeachPanel({ initialData }: TeachPanelProps = {}) {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'reembed'>('single');
	const [formData, setFormData] = useState<TeachFormState>({
		id: initialData?.id.toString() || '',
		question: initialData?.question || '',
		sql: initialData?.sql || '',
	});
	const [jsonInput, setJsonInput] = useState('');
	const [failFast, setFailFast] = useState(false);
	const [batchResult, setBatchResult] = useState<TeachBatchResult | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	// Re-embed schema form
	const [reEmbedForm, setReEmbedForm] = useState({
		tenantId: '',
		dbKey: 'default',
		schemaName: 'public',
	});
	const [reEmbedConfirmOpen, setReEmbedConfirmOpen] = useState(false);

	// Update form data when initialData changes
	useEffect(() => {
		if (initialData) {
			setFormData({
				id: initialData.id.toString(),
				question: initialData.question,
				sql: initialData.sql,
			});
			setActiveTab('single');
		}
	}, [initialData]);

	const singleMutation = useMutation<TeachOrUpdateResult, Error>({
		mutationFn: () =>
			teachOrUpdateKnowledge({
				id: formData.id ? Number(formData.id) : undefined,
				question: formData.question,
				sql: formData.sql,
			}),
		onSuccess: (data) => {
			toast.success(data.message || 'Đã cập nhật knowledge');
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-canonical'] });
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-chunks'] });
		},
		onError: (err) => {
			const message = err instanceof Error ? err.message : 'Không thể cập nhật knowledge';
			toast.error(message);
		},
	});

	const batchMutation = useMutation<TeachBatchResult, Error, TeachBatchPayload>({
		mutationFn: (payload: TeachBatchPayload) => teachBatchKnowledge(payload),
		onSuccess: (data) => {
			setBatchResult(data);
			const successCount = data.successful;
			const failCount = data.failed;
			if (failCount === 0) {
				toast.success(`Đã thêm thành công ${successCount} items`);
			} else {
				toast.warning(`Thành công: ${successCount}, Thất bại: ${failCount}`);
			}
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-canonical'] });
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-chunks'] });
		},
		onError: (err) => {
			const message = err instanceof Error ? err.message : 'Không thể batch teach knowledge';
			toast.error(message);
		},
	});

	const reEmbedMutation = useMutation({
		mutationFn: () => reEmbedSchema(reEmbedForm),
		onSuccess: () => {
			toast.success('Đã re-embed schema thành công');
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-chunks'] });
			setReEmbedForm({
				tenantId: '',
				dbKey: 'default',
				schemaName: 'public',
			});
		},
		onError: (err) => {
			const message = err instanceof Error ? err.message : 'Không thể re-embed schema';
			toast.error(message);
		},
	});

	const handleReEmbedSubmit = () => {
		if (!reEmbedForm.tenantId.trim()) {
			toast.error('Vui lòng nhập Tenant ID');
			return;
		}
		setReEmbedConfirmOpen(true);
	};

	const handleConfirmReEmbed = () => {
		reEmbedMutation.mutate();
	};

	const handleSingleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!formData.question || !formData.sql) {
			toast.error('Vui lòng nhập đủ Question và SQL');
			return;
		}
		singleMutation.mutate();
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleReset = () => {
		setFormData({
			id: '',
			question: '',
			sql: '',
		});
	};

	const validateJson = (jsonStr: string): { valid: boolean; items?: TeachBatchItem[]; error?: string } => {
		try {
			const parsed = JSON.parse(jsonStr);
			
			// Nếu là object đơn lẻ, chuyển thành array
			const items = Array.isArray(parsed) ? parsed : [parsed];
			
			// Validate từng item
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				if (!item || typeof item !== 'object') {
					return { valid: false, error: `Item ${i + 1}: Phải là object` };
				}
				if (!item.question || typeof item.question !== 'string') {
					return { valid: false, error: `Item ${i + 1}: Thiếu hoặc sai kiểu field "question"` };
				}
				if (!item.sql || typeof item.sql !== 'string') {
					return { valid: false, error: `Item ${i + 1}: Thiếu hoặc sai kiểu field "sql"` };
				}
			}
			
			return { valid: true, items };
		} catch (error) {
			return { valid: false, error: `JSON không hợp lệ: ${error instanceof Error ? error.message : 'Unknown error'}` };
		}
	};

	const handleBatchSubmit = () => {
		if (!jsonInput.trim()) {
			toast.error('Vui lòng nhập hoặc upload JSON');
			return;
		}

		const validation = validateJson(jsonInput);
		if (!validation.valid || !validation.items) {
			toast.error(validation.error || 'JSON không hợp lệ');
			return;
		}

		batchMutation.mutate({
			items: validation.items,
			failFast,
		});
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			setJsonInput(content);
			toast.success('Đã tải file thành công');
		};
		reader.onerror = () => {
			toast.error('Không thể đọc file');
		};
		reader.readAsText(file);
	};

	const handlePasteExample = () => {
		const example = `[
  {
    "question": "Tìm cho tôi các phòng trọ ở Quận 9 giá dưới 3 triệu.",
    "sql": "SELECT b.name AS building_name, rm.name AS room_type_name, ri.room_number, rp.base_price_monthly\\nFROM rooms rm\\nJOIN buildings b ON b.id = rm.building_id\\nJOIN districts d ON d.id = b.district_id\\nJOIN room_pricing rp ON rp.room_id = rm.id\\nJOIN room_instances ri ON ri.room_id = rm.id\\nWHERE d.name ILIKE '%Quận 9%'\\n  AND rp.base_price_monthly < 3000000\\n  AND ri.status IN ('available', 'reserved');"
  }
]`;
		setJsonInput(example);
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<div className="bg-indigo-50 text-indigo-700 p-2 rounded-lg border border-indigo-100">
						<Wand2 className="size-4" />
					</div>
					<div>
						<h2 className="text-base sm:text-lg font-semibold">Teach / Update</h2>
						<p className="text-sm text-muted-foreground">Thêm mới hoặc chỉnh sửa canonical SQL QA.</p>
					</div>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<ShieldCheck className="size-4" />
					Token JWT tự đính kèm qua TokenManager.
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'single' | 'batch' | 'reembed')}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="single">Single</TabsTrigger>
					<TabsTrigger value="batch">Batch (JSON)</TabsTrigger>
					<TabsTrigger value="reembed">Re-embed Schema</TabsTrigger>
				</TabsList>

				<TabsContent value="single" className="flex flex-col gap-2">
					<form onSubmit={handleSingleSubmit} className="flex flex-col gap-2">
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium text-foreground">ID (optional - update)</label>
							<Input
								type="number"
								name="id"
								value={formData.id}
								onChange={handleChange}
								placeholder="Nhập ID nếu muốn update"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium text-foreground">Question</label>
							<Textarea
								name="question"
								value={formData.question}
								onChange={handleChange}
								placeholder="Câu hỏi tiếng Việt..."
								className="min-h-[100px]"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium text-foreground flex items-center gap-2">
								SQL
								<Badge variant="outline" className="uppercase">
									required
								</Badge>
							</label>
							<Textarea
								name="sql"
								value={formData.sql}
								onChange={handleChange}
								placeholder="SQL canonical..."
								className="font-mono text-sm min-h-[160px]"
							/>
						</div>
						<Separator />
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div className="text-sm text-muted-foreground flex items-center gap-2">
								<TerminalSquare className="size-4" />
								Gửi tới endpoint <code>/api/admin/ai/teach-or-update</code> (POST).
							</div>
							<div className="flex items-center gap-2">
								<Button type="button" variant="ghost" onClick={handleReset} disabled={singleMutation.isPending}>
									Làm mới
								</Button>
								<Button type="submit" disabled={singleMutation.isPending}>
									{singleMutation.isPending && <span className="mr-2">...</span>}
									{formData.id ? 'Update' : 'Add new'}
								</Button>
							</div>
						</div>
					</form>
				</TabsContent>

				<TabsContent value="batch" className="flex flex-col gap-2">
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
								onChange={handleFileUpload}
								className="hidden"
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handlePasteExample}
								className="sm:w-auto"
							>
								<FileText className="size-4 mr-2" />
								Paste Example
							</Button>
						</div>
						<Textarea
							value={jsonInput}
							onChange={(e) => setJsonInput(e.target.value)}
							placeholder='[{"question": "...", "sql": "..."}, ...]'
							className="font-mono text-sm min-h-[300px]"
						/>
					</div>

					<div className="flex items-center gap-2">
						<Checkbox
							id="failFast"
							checked={failFast}
							onCheckedChange={(checked) => setFailFast(checked === true)}
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
						<Button
							type="button"
							onClick={handleBatchSubmit}
							disabled={batchMutation.isPending || !jsonInput.trim()}
						>
							{batchMutation.isPending && <span className="mr-2">...</span>}
							Submit Batch
						</Button>
					</div>
				</TabsContent>

				<TabsContent value="reembed" className="flex flex-col gap-2">
					<div className="bg-amber-50 border border-amber-200 rounded-md p-4">
						<div className="flex items-start gap-2">
							<ShieldCheck className="size-4 text-amber-700 mt-0.5" />
							<div className="text-sm text-amber-800">
								<strong>Thao tác nguy hiểm:</strong> Re-embed schema sẽ xóa và tạo lại toàn bộ embeddings cho schema được chỉ định. 
								Thao tác này có thể mất thời gian và yêu cầu nhập passcode để xác nhận.
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label htmlFor="tenant-id" className="text-sm font-medium text-foreground">
								Tenant ID <span className="text-red-500">*</span>
							</Label>
							<Input
								id="tenant-id"
								value={reEmbedForm.tenantId}
								onChange={(e) => setReEmbedForm((prev) => ({ ...prev, tenantId: e.target.value }))}
								placeholder="Nhập Tenant ID..."
								required
							/>
						</div>

						<div className="flex flex-col gap-2">
							<Label htmlFor="db-key" className="text-sm font-medium text-foreground">
								Database Key
							</Label>
							<Input
								id="db-key"
								value={reEmbedForm.dbKey}
								onChange={(e) => setReEmbedForm((prev) => ({ ...prev, dbKey: e.target.value }))}
								placeholder="default"
							/>
							<p className="text-xs text-muted-foreground">Mặc định: default</p>
						</div>

						<div className="flex flex-col gap-2">
							<Label htmlFor="schema-name" className="text-sm font-medium text-foreground">
								Schema Name
							</Label>
							<Input
								id="schema-name"
								value={reEmbedForm.schemaName}
								onChange={(e) => setReEmbedForm((prev) => ({ ...prev, schemaName: e.target.value }))}
								placeholder="public"
							/>
							<p className="text-xs text-muted-foreground">Mặc định: public</p>
						</div>

						<Separator />

						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div className="text-sm text-muted-foreground flex items-center gap-2">
								<TerminalSquare className="size-4" />
								Gửi tới endpoint <code>/api/ai/knowledge/re-embed-schema</code> (POST).
							</div>
							<Button
								type="button"
								onClick={handleReEmbedSubmit}
								disabled={!reEmbedForm.tenantId.trim() || reEmbedMutation.isPending}
								variant="destructive"
							>
								<Database className="size-4 mr-2" />
								{reEmbedMutation.isPending ? 'Đang xử lý...' : 'Re-embed Schema'}
							</Button>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			<PasscodeConfirmDialog
				open={reEmbedConfirmOpen}
				onOpenChange={setReEmbedConfirmOpen}
				onConfirm={handleConfirmReEmbed}
				title="Re-embed Schema"
				description={`Bạn có chắc chắn muốn re-embed schema "${reEmbedForm.schemaName}" cho tenant "${reEmbedForm.tenantId}"? Thao tác này sẽ xóa và tạo lại toàn bộ embeddings và có thể mất thời gian.`}
				dangerous={true}
			/>
		</div>
	);
}
