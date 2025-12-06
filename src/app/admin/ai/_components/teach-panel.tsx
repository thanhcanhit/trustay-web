"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, TerminalSquare, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

import { teachOrUpdateKnowledge } from '@/actions/admin-ai.action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { TeachOrUpdateResult } from '@/types/admin-ai';

interface TeachFormState {
	id: string;
	question: string;
	sql: string;
}

export function TeachPanel() {
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState<TeachFormState>({
		id: '',
		question: '',
		sql: '',
	});

	const mutation = useMutation<TeachOrUpdateResult, Error>({
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

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!formData.question || !formData.sql) {
			toast.error('Vui lòng nhập đủ Question và SQL');
			return;
		}
		mutation.mutate();
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
			<form onSubmit={handleSubmit} className="flex flex-col gap-2">
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
							<Button type="button" variant="ghost" onClick={handleReset} disabled={mutation.isPending}>
								Làm mới
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending && <span className="mr-2">...</span>}
								{formData.id ? 'Update' : 'Add new'}
							</Button>
						</div>
					</div>
				</form>
		</div>
	);
}
