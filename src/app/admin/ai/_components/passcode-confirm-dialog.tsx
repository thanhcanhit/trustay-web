"use client";

import { useState, useContext } from 'react';
import { KeyRound, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	InputOTP,
	InputOTPGroup,
} from '@/components/ui/input-otp';
import { PASSCODE } from './constants';
import { OTPInputContext } from 'input-otp';
import { cn } from '@/lib/utils';

// Custom slot component that masks the input
function MaskedOTPSlot({
	index,
	className,
	...props
}: React.ComponentProps<"div"> & {
	index: number
}) {
	const inputOTPContext = useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			className={cn(
				"data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
				className
			)}
			{...props}
		>
			{char ? '●' : ''}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
				</div>
			)}
		</div>
	);
}

interface PasscodeConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	title: string;
	description: string;
	dangerous?: boolean;
}

export function PasscodeConfirmDialog({
	open,
	onOpenChange,
	onConfirm,
	title,
	description,
	dangerous = true,
}: PasscodeConfirmDialogProps) {
	const [value, setValue] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (value === PASSCODE) {
			setError('');
			setValue('');
			onConfirm();
			onOpenChange(false);
		} else {
			setError('Passcode không chính xác');
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setValue('');
			setError('');
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className={`${dangerous ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'} rounded-lg p-2.5`}>
							{dangerous ? <AlertTriangle className="size-6" /> : <KeyRound className="size-6" />}
						</div>
						<div>
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription>{description}</DialogDescription>
						</div>
					</div>
					{dangerous && (
						<div className="text-xs text-red-600 flex items-center gap-2 mt-2">
							<ShieldCheck className="size-3.5" />
							Thao tác này không thể hoàn tác. Vui lòng nhập passcode để xác nhận.
						</div>
					)}
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex flex-col items-center gap-4 py-4">
						<InputOTP
							value={value}
							onChange={setValue}
							maxLength={6}
							containerClassName="justify-center"
							autoFocus
						>
							<InputOTPGroup>
								{Array.from({ length: 6 }).map((_, index) => (
									<MaskedOTPSlot key={index} index={index} />
								))}
							</InputOTPGroup>
						</InputOTP>
						{error && <p className="text-sm text-red-600">{error}</p>}
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
							Hủy
						</Button>
						<Button type="submit" variant={dangerous ? 'destructive' : 'default'}>
							Xác nhận
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

