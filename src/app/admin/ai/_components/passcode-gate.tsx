"use client";

import { useState, useContext } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	InputOTP,
	InputOTPGroup,
} from '@/components/ui/input-otp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PASSCODE, PASS_STORAGE_KEY } from './constants';
import { OTPInputContext } from 'input-otp';
import { cn } from '@/lib/utils';

interface PasscodeGateProps {
	onVerified: () => void;
}

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

export function PasscodeGate({ onVerified }: PasscodeGateProps) {
	const [value, setValue] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (value === PASSCODE) {
			setError('');
			if (typeof window !== 'undefined') {
				sessionStorage.setItem(PASS_STORAGE_KEY, 'true');
			}
			onVerified();
		} else {
			setError('Passcode không chính xác');
		}
	};

	const handleClear = () => {
		setValue('');
		setError('');
	};

	return (
		<div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
			<Card className="max-w-xl w-full shadow-md border border-slate-200">
				<CardHeader className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="bg-emerald-50 text-emerald-700 rounded-lg p-2.5">
							<KeyRound className="size-6" />
						</div>
						<div>
							<CardTitle className="text-xl">Admin AI</CardTitle>
							<CardDescription>Nhập passcode 6 số để tiếp tục.</CardDescription>
						</div>
					</div>
					<div className="text-xs text-muted-foreground flex items-center gap-2">
						<ShieldCheck className="size-3.5" />
						Passcode chỉ lưu trong session hiện tại.
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="flex flex-col items-center gap-4">
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
						<div className="flex items-center justify-center gap-3">
							<Button type="submit" className="px-6">
								Mở khóa
							</Button>
							<Button type="button" variant="ghost" onClick={handleClear}>
								Xóa
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
