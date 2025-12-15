"use client";

import { ShieldCheck, TerminalSquare, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface ReEmbedForm {
	tenantId: string;
	dbKey: string;
	schemaName: string;
}

interface TeachPanelReembedFormProps {
	form: ReEmbedForm;
	onFormChange: (field: keyof ReEmbedForm, value: string) => void;
	onSubmit: () => void;
	isPending: boolean;
}

export function TeachPanelReembedForm({
	form,
	onFormChange,
	onSubmit,
	isPending,
}: TeachPanelReembedFormProps) {
	return (
		<>
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
						value={form.tenantId}
						onChange={(e) => onFormChange('tenantId', e.target.value)}
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
						value={form.dbKey}
						onChange={(e) => onFormChange('dbKey', e.target.value)}
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
						value={form.schemaName}
						onChange={(e) => onFormChange('schemaName', e.target.value)}
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
						onClick={onSubmit}
						disabled={!form.tenantId.trim() || isPending}
						variant="destructive"
					>
						<Database className="size-4 mr-2" />
						{isPending ? 'Đang xử lý...' : 'Re-embed Schema'}
					</Button>
				</div>
			</div>
		</>
	);
}
