"use client";

import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PASSCODE, PASS_STORAGE_KEY } from './constants';

interface PasscodeGateProps {
	onVerified: () => void;
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
										<InputOTPSlot key={index} index={index} />
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
