"use client";

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { teachOrUpdateKnowledge, teachBatchKnowledge, reEmbedSchema } from '@/actions/admin-ai.action';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasscodeConfirmDialog } from './passcode-confirm-dialog';
import type { TeachOrUpdateResult, TeachBatchResult, TeachBatchItem, TeachBatchPayload } from '@/types/admin-ai';
import { TeachPanelHeader } from './teach/teach-panel-header';
import { TeachPanelSingleForm } from './teach/teach-panel-single-form';
import { TeachPanelBatchForm } from './teach/teach-panel-batch-form';
import { TeachPanelReembedForm } from './teach/teach-panel-reembed-form';

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
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	
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
			<TeachPanelHeader />

			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'single' | 'batch' | 'reembed')}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="single">Single</TabsTrigger>
					<TabsTrigger value="batch">Batch (JSON)</TabsTrigger>
					<TabsTrigger value="reembed">Re-embed Schema</TabsTrigger>
				</TabsList>

				<TabsContent value="single" className="flex flex-col gap-2">
					<TeachPanelSingleForm
						formData={formData}
						onChange={handleChange}
						onSubmit={handleSingleSubmit}
						onReset={handleReset}
						isPending={singleMutation.isPending}
					/>
				</TabsContent>

				<TabsContent value="batch" className="flex flex-col gap-2">
					<TeachPanelBatchForm
						jsonInput={jsonInput}
						onJsonInputChange={setJsonInput}
						failFast={failFast}
						onFailFastChange={setFailFast}
						onFileUpload={handleFileUpload}
						onPasteExample={handlePasteExample}
						onSubmit={handleBatchSubmit}
						batchResult={batchResult}
						isPending={batchMutation.isPending}
						fileInputRef={fileInputRef}
					/>
				</TabsContent>

				<TabsContent value="reembed" className="flex flex-col gap-2">
					<TeachPanelReembedForm
						form={reEmbedForm}
						onFormChange={(field, value) => setReEmbedForm((prev) => ({ ...prev, [field]: value }))}
						onSubmit={handleReEmbedSubmit}
						isPending={reEmbedMutation.isPending}
					/>
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
