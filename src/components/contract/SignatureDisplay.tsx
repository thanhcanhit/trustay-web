'use client';

import Image from 'next/image';
import { ContractSignature } from '@/types/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SignatureDisplayProps {
	signature: string | ContractSignature;
	signerName: string;
	signerRole: 'landlord' | 'tenant';
	className?: string;
}

const SignatureDisplay: React.FC<SignatureDisplayProps> = ({
	signature,
	signerName,
	signerRole,
	className = ''
}) => {
	const roleLabels = {
		landlord: 'Chủ nhà',
		tenant: 'Người thuê'
	};

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
		} catch {
			return dateString;
		}
	};

	// Handle both string and ContractSignature types
	const signatureData = typeof signature === 'string' ? signature : signature.signatureData;
	const signedAt = typeof signature === 'string' ? null : signature.signedAt;
	const signatureMethod = typeof signature === 'string' ? null : signature.signatureMethod;
	const ipAddress = typeof signature === 'string' ? null : signature.ipAddress;
	const isValid = typeof signature === 'string' ? true : signature.isValid;

	return (
		<div className={`signature-display bg-gray-50 rounded-lg p-4 ${className}`}>
			<div className="signature-header mb-3">
				<h4 className="text-sm font-semibold text-gray-800 mb-1">
					Chữ ký {roleLabels[signerRole]}
				</h4>
				<p className="text-xs text-gray-600">
					{signerName}
				</p>
			</div>

			<div className="signature-image mb-3">
				<div className="border border-gray-200 rounded bg-white p-2 max-w-xs">
					<Image
						src={signatureData}
						alt={`Chữ ký của ${signerName}`}
						width={200}
						height={100}
						className="max-w-full h-auto"
						style={{ maxHeight: '100px' }}
					/>
				</div>
			</div>

			{typeof signature !== 'string' && (
				<div className="signature-metadata space-y-1 text-xs text-gray-500">
					{signedAt && (
						<div className="flex justify-between">
							<span>Thời gian ký:</span>
							<span className="font-medium">{formatDate(signedAt)}</span>
						</div>
					)}

					{signatureMethod && (
						<div className="flex justify-between">
							<span>Phương thức:</span>
							<span className="font-medium">
								{signatureMethod === 'canvas' ? 'Ký điện tử' : 'Tải lên'}
							</span>
						</div>
					)}

					{ipAddress && (
						<div className="flex justify-between">
							<span>IP Address:</span>
							<span className="font-medium">{ipAddress}</span>
						</div>
					)}

					<div className="flex justify-between items-center">
						<span>Trạng thái:</span>
						<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
							isValid
								? 'bg-green-100 text-green-800'
								: 'bg-red-100 text-red-800'
						}`}>
							{isValid ? (
								<>
									<svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
									Hợp lệ
								</>
							) : (
								<>
									<svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
									</svg>
									Không hợp lệ
								</>
							)}
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default SignatureDisplay;