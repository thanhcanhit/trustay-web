'use client';

import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
	onSignatureChange?: (signature: string | null) => void;
	width?: number;
	height?: number;
	backgroundColor?: string;
	penColor?: string;
	disabled?: boolean;
	className?: string;
}

export interface SignaturePadRef {
	clear: () => void;
	getSignatureData: () => string | null;
	isEmpty: () => boolean;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({
	onSignatureChange,
	width = 500,
	height = 200,
	backgroundColor = '#ffffff',
	penColor = '#000000',
	disabled = false,
	className = ''
}, ref) => {
	const signatureRef = useRef<SignatureCanvas>(null);
	const [hasSignature, setHasSignature] = useState(false);

	useImperativeHandle(ref, () => ({
		clear: () => {
			signatureRef.current?.clear();
			setHasSignature(false);
			onSignatureChange?.(null);
		},
		getSignatureData: () => {
			if (!signatureRef.current || signatureRef.current.isEmpty()) {
				return null;
			}
			return signatureRef.current.toDataURL('image/png');
		},
		isEmpty: () => {
			return !signatureRef.current || signatureRef.current.isEmpty();
		}
	}));

	const handleSignatureEnd = () => {
		if (signatureRef.current && !signatureRef.current.isEmpty()) {
			const signature = signatureRef.current.toDataURL('image/png');
			setHasSignature(true);
			onSignatureChange?.(signature);
		}
	};

	const handleClear = () => {
		signatureRef.current?.clear();
		setHasSignature(false);
		onSignatureChange?.(null);
	};

	return (
		<div className={`signature-pad-container ${className}`}>
			<div className="signature-pad-wrapper border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
				<SignatureCanvas
					ref={signatureRef}
					canvasProps={{
						width,
						height,
						className: 'signature-canvas',
						style: {
							backgroundColor,
							cursor: disabled ? 'not-allowed' : 'crosshair'
						}
					}}
					backgroundColor={backgroundColor}
					penColor={penColor}
					onEnd={handleSignatureEnd}
					clearOnResize={false}
				/>
			</div>

			<div className="signature-controls mt-4 flex justify-between items-center">
				<div className="signature-info text-sm text-gray-600">
					{hasSignature ? (
						<span className="text-green-600 flex items-center">
							<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							Đã ký
						</span>
					) : (
						<span className="text-gray-500">
							Vui lòng ký vào khung bên trên
						</span>
					)}
				</div>

				<button
					type="button"
					onClick={handleClear}
					disabled={disabled || !hasSignature}
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Xóa chữ ký
				</button>
			</div>

			{disabled && (
				<div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
					<span className="text-gray-600 font-medium">Không thể chỉnh sửa</span>
				</div>
			)}
		</div>
	);
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;