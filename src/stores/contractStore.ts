import { create } from 'zustand';
import {
	activateContract,
	autoGenerateContract,
	createContract,
	deleteContract,
	downloadContractPDF,
	generateContractPDF,
	getContractById,
	getContractPreview,
	getContractStatus,
	getMyContracts,
	requestSigningOTP,
	signContract,
	verifyPDFIntegrity,
} from '@/actions/contract.action';
import { TokenManager } from '@/lib/api-client';
import type { Contract, ContractListResponse } from '@/types/types';

// Helper function to convert base64 to Blob (client-side only)
const base64ToBlob = (base64: string, contentType: string): Blob => {
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return new Blob([bytes], { type: contentType });
};

interface ContractState {
	// Data
	contracts: Contract[];
	current: Contract | null;
	contractStatus: { status: string; details: Record<string, unknown> } | null;
	pdfPreviewUrl: string | null;
	pdfIntegrity: { isValid: boolean; hash: string; details: string } | null;

	// Loading states
	loading: boolean;
	loadingCurrent: boolean;
	submitting: boolean;
	downloading: boolean;
	generating: boolean;
	loadingPreview: boolean;
	signing: boolean;
	verifying: boolean;
	requestingOTP: boolean;
	deleting: boolean;

	// Error states
	error: string | null;
	errorCurrent: string | null;
	submitError: string | null;
	downloadError: string | null;
	generateError: string | null;
	signError: string | null;
	verifyError: string | null;
	otpError: string | null;
	deleteError: string | null;

	// Metadata
	meta: ContractListResponse['meta'] | null;

	// Actions
	loadContracts: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
	loadAll: () => Promise<void>;
	loadById: (id: string) => Promise<void>;
	loadContractById: (id: string) => Promise<Contract | null>;
	create: (data: {
		landlordId: string;
		tenantId: string;
		roomInstanceId: string;
		contractType: string;
		startDate: string;
		endDate: string;
		contractData: {
			monthlyRent: number;
			depositAmount: number;
			additionalTerms?: string;
			rules?: string[];
			amenities?: string[];
		};
	}) => Promise<boolean>;
	autoGenerate: (rentalId: string, additionalContractData?: string | object) => Promise<boolean>;
	getStatus: (id: string) => Promise<boolean>;
	generatePDF: (
		contractId: string,
		options?: { includeSignatures?: boolean; format?: string; printBackground?: boolean },
	) => Promise<string | null>;
	downloadPDF: (id: string) => Promise<Blob | null>;
	getPreview: (contractId: string) => Promise<string | null>;
	verifyPDF: (contractId: string) => Promise<boolean>;
	requestOTP: (contractId: string) => Promise<boolean>;
	sign: (contractId: string, signatureData: string, otpCode?: string) => Promise<boolean>;
	activate: (contractId: string) => Promise<boolean>;
	delete: (contractId: string) => Promise<boolean>;
	clearCurrent: () => void;
	clearErrors: () => void;
}

export const useContractStore = create<ContractState>((set, get) => ({
	// Initial state
	contracts: [],
	current: null,
	contractStatus: null,
	pdfPreviewUrl: null,
	pdfIntegrity: null,

	loading: false,
	loadingCurrent: false,
	submitting: false,
	downloading: false,
	generating: false,
	loadingPreview: false,
	signing: false,
	verifying: false,
	requestingOTP: false,
	deleting: false,

	error: null,
	errorCurrent: null,
	submitError: null,
	downloadError: null,
	generateError: null,
	signError: null,
	verifyError: null,
	otpError: null,
	deleteError: null,

	meta: null,

	// Load all contracts (shorthand for loadContracts without params)
	loadAll: async () => {
		return get().loadContracts();
	},

	// Load general contracts
	loadContracts: async (params) => {
		set({ loading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getMyContracts(params, token);
			if (result.success) {
				set({
					contracts: result.data.data,
					meta: result.data.meta,
					loading: false,
				});
			} else {
				set({
					error: result.error,
					loading: false,
				});
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loading: false,
			});
		}
	},

	// Load contract by ID
	loadById: async (id) => {
		set({ loadingCurrent: true, errorCurrent: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getContractById(id, token);
			if (result.success) {
				set({
					current: result.data.data,
					loadingCurrent: false,
				});
			} else {
				set({
					errorCurrent: result.error,
					loadingCurrent: false,
				});
			}
		} catch (error) {
			set({
				errorCurrent: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingCurrent: false,
			});
		}
	},

	// Load contract by ID and return it
	loadContractById: async (id) => {
		set({ loading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getContractById(id, token);
			if (result.success) {
				set({ loading: false });
				return result.data.data;
			} else {
				set({
					error: result.error,
					loading: false,
				});
				return null;
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loading: false,
			});
			return null;
		}
	},

	// Auto-generate contract from rental
	autoGenerate: async (rentalId, additionalContractData) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await autoGenerateContract(rentalId, additionalContractData, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload contracts lists
				await get().loadContracts();
				return true;
			} else {
				set({
					submitError: result.error,
					submitting: false,
				});
				return false;
			}
		} catch (error) {
			set({
				submitError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				submitting: false,
			});
			return false;
		}
	},

	// Create contract manually
	create: async (data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createContract(data, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload contracts lists
				await get().loadContracts();
				return true;
			} else {
				set({
					submitError: result.error,
					submitting: false,
				});
				return false;
			}
		} catch (error) {
			set({
				submitError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				submitting: false,
			});
			return false;
		}
	},

	// Get contract status
	getStatus: async (id) => {
		set({ loading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getContractStatus(id, token);
			if (result.success) {
				set({
					contractStatus: result.data,
					loading: false,
				});
				return true;
			} else {
				set({
					error: result.error,
					loading: false,
				});
				return false;
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loading: false,
			});
			return false;
		}
	},

	// Generate contract PDF
	generatePDF: async (contractId, options) => {
		set({ generating: true, generateError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await generateContractPDF(contractId, options, token);
			if (result.success) {
				set({ generating: false });
				return result.data.downloadUrl || result.data.pdfUrl || null;
			} else {
				set({
					generateError: result.error,
					generating: false,
				});
				return null;
			}
		} catch (error) {
			set({
				generateError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				generating: false,
			});
			return null;
		}
	},

	// Download contract PDF
	downloadPDF: async (id) => {
		set({ downloading: true, downloadError: null });
		try {
			const token = TokenManager.getAccessToken();
			console.log('[downloadPDF] Attempting to download PDF for contract:', id);
			let result = await downloadContractPDF(id, token);

			// If 404 (PDF not found), generate it first then use downloadUrl
			if (!result.success && result.status === 404) {
				console.log('[downloadPDF] PDF not found (404), generating PDF first...');
				// Generate PDF
				const generateResult = await generateContractPDF(
					id,
					{
						includeSignatures: true,
						format: 'A4',
						printBackground: true,
					},
					token,
				);

				if (generateResult.success) {
					console.log('[downloadPDF] PDF generated successfully');
					// Use downloadUrl from generate response instead of retrying GET
					const downloadUrl = generateResult.data.downloadUrl || generateResult.data.pdfUrl;
					if (downloadUrl) {
						console.log('[downloadPDF] Using downloadUrl from generate response:', downloadUrl);
						// Fetch the PDF from the download URL
						const response = await fetch(downloadUrl);
						if (response.ok) {
							const blob = await response.blob();
							console.log('[downloadPDF] Blob created successfully from URL, size:', blob.size);
							set({ downloading: false });
							return blob;
						} else {
							console.error('[downloadPDF] Failed to fetch from downloadUrl:', response.statusText);
						}
					}
					// Fallback: retry download after a short delay
					console.log('[downloadPDF] Waiting 1s before retrying download...');
					await new Promise((resolve) => setTimeout(resolve, 1000));
					result = await downloadContractPDF(id, token);
				} else {
					console.error('[downloadPDF] Failed to generate PDF:', generateResult.error);
					set({
						downloadError: generateResult.error,
						downloading: false,
					});
					return null;
				}
			}

			if (result.success) {
				console.log('[downloadPDF] PDF downloaded successfully as base64');
				// Convert base64 to Blob (client-side)
				const blob = base64ToBlob(result.data.base64, result.data.contentType);
				console.log('[downloadPDF] Blob created successfully, size:', blob.size);
				set({ downloading: false });
				return blob;
			} else {
				console.error(
					'[downloadPDF] Failed to download PDF:',
					result.error,
					'Status:',
					result.status,
				);
				set({
					downloadError: result.error,
					downloading: false,
				});
				return null;
			}
		} catch (error) {
			console.error('[downloadPDF] Exception occurred:', error);
			set({
				downloadError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				downloading: false,
			});
			return null;
		}
	},

	// Get contract preview (PNG blob)
	getPreview: async (contractId) => {
		set({ loadingPreview: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			console.log('[getPreview] Attempting to fetch preview for contract:', contractId);
			let result = await getContractPreview(contractId, token);

			// If 404 (PDF not found), generate it first then retry
			if (!result.success && result.status === 404) {
				console.log('[getPreview] Preview not found (404), generating PDF first...');
				// Generate PDF
				const generateResult = await generateContractPDF(
					contractId,
					{
						includeSignatures: true,
						format: 'A4',
						printBackground: true,
					},
					token,
				);

				if (generateResult.success) {
					console.log('[getPreview] PDF generated successfully');
					// Wait a bit for the preview to be generated
					console.log('[getPreview] Waiting 1.5s before retrying preview...');
					await new Promise((resolve) => setTimeout(resolve, 1500));
					// Retry preview after generation
					result = await getContractPreview(contractId, token);
				} else {
					console.error('[getPreview] Failed to generate PDF:', generateResult.error);
					set({
						error: generateResult.error,
						loadingPreview: false,
					});
					return null;
				}
			}

			if (result.success) {
				console.log('[getPreview] Preview fetched successfully as base64');

				// Convert base64 to Blob (client-side)
				const blob = base64ToBlob(result.data.base64, result.data.contentType);

				// Convert blob to URL
				const url = URL.createObjectURL(blob);
				console.log('[getPreview] Blob URL created successfully:', url);
				set({
					pdfPreviewUrl: url,
					loadingPreview: false,
				});
				return url;
			} else {
				console.error(
					'[getPreview] Failed to fetch preview:',
					result.error,
					'Status:',
					result.status,
				);
				set({
					error: result.error,
					loadingPreview: false,
				});
				return null;
			}
		} catch (error) {
			console.error('[getPreview] Exception occurred:', error);
			set({
				error: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingPreview: false,
			});
			return null;
		}
	},

	// Verify PDF integrity
	verifyPDF: async (contractId) => {
		set({ verifying: true, verifyError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await verifyPDFIntegrity(contractId, token);
			if (result.success) {
				set({
					pdfIntegrity: result.data,
					verifying: false,
				});
				return true;
			} else {
				set({
					verifyError: result.error,
					verifying: false,
				});
				return false;
			}
		} catch (error) {
			set({
				verifyError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				verifying: false,
			});
			return false;
		}
	},

	// Request OTP for signing
	requestOTP: async (contractId) => {
		set({ requestingOTP: true, otpError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await requestSigningOTP(contractId, token);
			if (result.success) {
				set({
					requestingOTP: false,
				});
				return true;
			} else {
				set({
					otpError: result.error,
					requestingOTP: false,
				});
				return false;
			}
		} catch (error) {
			set({
				otpError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				requestingOTP: false,
			});
			return false;
		}
	},

	// Sign contract
	sign: async (contractId, signatureData, otpCode) => {
		set({ signing: true, signError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await signContract(contractId, signatureData, otpCode, token);
			if (result.success) {
				set({
					current: result.data.data,
					signing: false,
				});
				// Reload contracts lists to reflect changes
				await get().loadContracts();
				return true;
			} else {
				set({
					signError: result.error,
					signing: false,
				});
				return false;
			}
		} catch (error) {
			set({
				signError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				signing: false,
			});
			return false;
		}
	},

	// Activate contract
	activate: async (contractId) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await activateContract(contractId, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload contracts lists to reflect changes
				await get().loadContracts();
				return true;
			} else {
				set({
					submitError: result.error,
					submitting: false,
				});
				return false;
			}
		} catch (error) {
			set({
				submitError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				submitting: false,
			});
			return false;
		}
	},

	// Delete contract (Landlord only - draft status only)
	delete: async (contractId) => {
		set({ deleting: true, deleteError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await deleteContract(contractId, token);
			if (result.success) {
				set({ deleting: false });
				// Reload contracts lists to reflect changes
				await get().loadContracts();
				return true;
			} else {
				set({
					deleteError: result.error,
					deleting: false,
				});
				return false;
			}
		} catch (error) {
			set({
				deleteError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				deleting: false,
			});
			return false;
		}
	},

	// Clear current contract
	clearCurrent: () => {
		set({
			current: null,
			errorCurrent: null,
			contractStatus: null,
			pdfPreviewUrl: null,
			pdfIntegrity: null,
		});
	},

	// Clear all errors
	clearErrors: () => {
		set({
			error: null,
			errorCurrent: null,
			submitError: null,
			downloadError: null,
			generateError: null,
			signError: null,
			verifyError: null,
		});
	},
}));
