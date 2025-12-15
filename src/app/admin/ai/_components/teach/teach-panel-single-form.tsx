"use client";

import { TerminalSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface TeachFormState {
	id: string;
	question: string;
	sql: string;
}

interface TeachPanelSingleFormProps {
	formData: TeachFormState;
	onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	onReset: () => void;
	isPending: boolean;
}

export function TeachPanelSingleForm({
	formData,
	onChange,
	onSubmit,
	onReset,
	isPending,
}: TeachPanelSingleFormProps) {
	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-2">
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium text-foreground">ID (optional - update)</label>
				<Input
					type="number"
					name="id"
					value={formData.id}
					onChange={onChange}
					placeholder="Nhập ID nếu muốn update"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium text-foreground">Question</label>
				<Textarea
					name="question"
					value={formData.question}
					onChange={onChange}
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
					onChange={onChange}
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
					<Button type="button" variant="ghost" onClick={onReset} disabled={isPending}>
						Làm mới
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending && <span className="mr-2">...</span>}
						{formData.id ? 'Update' : 'Add new'}
					</Button>
				</div>
			</div>
		</form>
	);
}
