'use client';

import { useState, useRef } from 'react';
import { Contract } from '@/types/types';
import { useContractStore } from '@/stores/contractStore';
import SignaturePad, { SignaturePadRef } from './SignaturePad';
import SignatureDisplay from './SignatureDisplay';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContractSigningWorkflowProps {
	contract: Contract;
	currentUserId: string;
	currentUserRole: 'landlord' | 'tenant';
	onSigningComplete?: () => void;
}

const ContractSigningWorkflow: React.FC<ContractSigningWorkflowProps> = ({
	contract,
	currentUserRole,
	onSigningComplete
}) => {
	const signaturePadRef = useRef<SignaturePadRef>(null);
	const [showSignaturePad, setShowSignaturePad] = useState(false);
	const [isConfirming, setIsConfirming] = useState(false);
	const [otpCode, setOtpCode] = useState('');

	const { sign, signing, signError } = useContractStore();

	// Kiểm tra trạng thái ký của từng bên
	const isLandlordSigned = !!contract.landlordSignature;
	const isTenantSigned = !!contract.tenantSignature;
	const isFullySigned = isLandlordSigned && isTenantSigned;

	// Kiểm tra xem user hiện tại đã ký chưa
	const hasCurrentUserSigned = currentUserRole === 'landlord' ? isLandlordSigned : isTenantSigned;

	// Kiểm tra xem có thể ký không
	const canSign = contract.status === 'pending_signatures' && !hasCurrentUserSigned;

	// Lấy thông tin chữ ký của user hiện tại
	const currentUserSignature = currentUserRole === 'landlord'
		? contract.landlordSignature
		: contract.tenantSignature;

	const handleStartSigning = () => {
		setShowSignaturePad(true);
	};

	const handleCancelSigning = () => {
		setShowSignaturePad(false);
		signaturePadRef.current?.clear();
		setOtpCode('');
	};

	const handleConfirmSigning = async () => {
		if (!signaturePadRef.current) return;

		const signatureData = signaturePadRef.current.getSignatureData();
		if (!signatureData) {
			toast.error('Vui lòng ký vào khung chữ ký');
			return;
		}

		if (!otpCode || otpCode.length !== 6) {
			toast.error('Vui lòng nhập mã OTP (6 chữ số)');
			return;
		}

		setIsConfirming(true);

		try {
			// TODO: Backend cần update API để nhận OTP
			// Tạm thời vẫn gọi API cũ, cần update khi backend sẵn sàng
			const success = await sign(contract.id, signatureData, 'canvas', otpCode);

			if (success) {
				toast.success('Ký hợp đồng thành công!');
				setShowSignaturePad(false);
				setOtpCode('');
				onSigningComplete?.();
			} else {
				toast.error(signError || 'Không thể ký hợp đồng');
			}
		} catch {
			toast.error('Đã có lỗi xảy ra khi ký hợp đồng');
		} finally {
			setIsConfirming(false);
		}
	};

	// Render contract status badge
	const renderStatusBadge = () => {
		const statusConfig = {
			draft: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-800' },
			pending_signatures: { label: 'Chờ ký', color: 'bg-yellow-100 text-yellow-800' },
			active: { label: 'Đang hiệu lực', color: 'bg-green-100 text-green-800' },
			expired: { label: 'Hết hạn', color: 'bg-red-100 text-red-800' },
			terminated: { label: 'Đã chấm dứt', color: 'bg-red-100 text-red-800' }
		};

		const config = statusConfig[contract.status];
		return (
			<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
				{config.label}
			</span>
		);
	};

	return (
		<div className="contract-signing-workflow space-y-6">
			{/* Contract Status */}
			<div className="bg-white p-6 rounded-lg border">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-medium">Trạng thái hợp đồng</h3>
					{renderStatusBadge()}
				</div>

				{/* Signing Progress */}
				<div className="space-y-4">
					<div className="flex items-center space-x-4">
						<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
							isLandlordSigned ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
						}`}>
							{isLandlordSigned ? '✓' : '1'}
						</div>
						<div>
							<p className="font-medium">Chủ nhà</p>
							<p className="text-sm text-gray-600">
								{isLandlordSigned ? 'Đã ký' : 'Chưa ký'}
							</p>
						</div>
					</div>

					<div className="flex items-center space-x-4">
						<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
							isTenantSigned ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
						}`}>
							{isTenantSigned ? '✓' : '2'}
						</div>
						<div>
							<p className="font-medium">Người thuê</p>
							<p className="text-sm text-gray-600">
								{isTenantSigned ? 'Đã ký' : 'Chưa ký'}
							</p>
						</div>
					</div>
				</div>

				{isFullySigned && (
					<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
						<div className="flex items-center">
							<svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							<span className="text-green-800 font-medium">
								Hợp đồng đã được ký đầy đủ và có hiệu lực!
							</span>
						</div>
						{contract.fullySignedAt && (
							<p className="text-sm text-green-600 mt-1">
								Hoàn thành lúc: {new Date(contract.fullySignedAt).toLocaleString('vi-VN')}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Current User's Signature Status */}
			{hasCurrentUserSigned && currentUserSignature && (
				<div className="bg-white p-6 rounded-lg border">
					<h3 className="text-lg font-medium mb-4">Chữ ký của bạn</h3>
					<SignatureDisplay
						signature={currentUserSignature}
						signerName="Bạn"
						signerRole={currentUserRole}
					/>
				</div>
			)}

			{/* Signing Section */}
			{canSign && (
				<div className="bg-white p-6 rounded-lg border">
					<h3 className="text-lg font-medium mb-4">Ký hợp đồng</h3>

					{!showSignaturePad ? (
						<div>
							<p className="text-gray-600 mb-4">
								Hãy đọc kỹ nội dung hợp đồng và ký để xác nhận đồng ý với các điều khoản.
							</p>
							<button
								onClick={handleStartSigning}
								className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
							>
								Bắt đầu ký
							</button>
						</div>
					) : (
						<div>
							<p className="text-gray-600 mb-4">
								Vui lòng ký vào khung bên dưới và nhập mã OTP để xác nhận:
							</p>

							<SignaturePad
								ref={signaturePadRef}
								width={500}
								height={200}
								className="mb-4"
							/>

							<div className="mb-4">
								<Label htmlFor="otpCode" className="block text-sm font-medium mb-2">
									Mã OTP (6 chữ số)
								</Label>
								<Input
									id="otpCode"
									type="text"
									placeholder="Nhập mã OTP"
									value={otpCode}
									onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
									maxLength={6}
									className="max-w-xs"
									disabled={signing || isConfirming}
								/>
								<p className="text-xs text-gray-500 mt-1">
									Mã OTP đã được gửi đến email/số điện thoại của bạn
								</p>
							</div>

							<div className="flex space-x-4">
								<button
									onClick={handleConfirmSigning}
									disabled={signing || isConfirming}
									className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
								>
									{signing || isConfirming ? 'Đang ký...' : 'Xác nhận ký'}
								</button>

								<button
									onClick={handleCancelSigning}
									disabled={signing || isConfirming}
									className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
								>
									Hủy
								</button>
							</div>

							{signError && (
								<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
									<p className="text-red-800 text-sm">{signError}</p>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* All Signatures Display */}
			{(isLandlordSigned || isTenantSigned) && (
				<div className="bg-white p-6 rounded-lg border">
					<h3 className="text-lg font-medium mb-4">Tất cả chữ ký</h3>
					<div className="grid md:grid-cols-2 gap-6">
						{contract.landlordSignature && (
							<SignatureDisplay
								signature={contract.landlordSignature}
								signerName={contract.landlord?.firstName + ' ' + contract.landlord?.lastName || 'Chủ nhà'}
								signerRole="landlord"
							/>
						)}

						{contract.tenantSignature && (
							<SignatureDisplay
								signature={contract.tenantSignature}
								signerName={contract.tenant?.firstName + ' ' + contract.tenant?.lastName || 'Người thuê'}
								signerRole="tenant"
							/>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default ContractSigningWorkflow;