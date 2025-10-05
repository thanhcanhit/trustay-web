import { create } from 'zustand';
import {
	autoGenerateContract,
	createContract,
	downloadContractPDF,
	generateContractPDF,
	getContractById,
	getContractPreview,
	getContractStatus,
	getMyContracts,
	signContract,
	verifyPDFIntegrity,
} from '@/actions/contract.action';
import { TokenManager } from '@/lib/api-client';
import type { Contract, ContractListResponse } from '@/types/types';

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
	signing: boolean;
	verifying: boolean;

	// Error states
	error: string | null;
	errorCurrent: string | null;
	submitError: string | null;
	downloadError: string | null;
	generateError: string | null;
	signError: string | null;
	verifyError: string | null;

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
	autoGenerate: (rentalId: string, additionalTerms?: string) => Promise<boolean>;
	getStatus: (id: string) => Promise<boolean>;
	generatePDF: (
		contractId: string,
		options?: { includeSignatures?: boolean; format?: string; printBackground?: boolean },
	) => Promise<string | null>;
	downloadPDF: (id: string) => Promise<Blob | null>;
	getPreview: (contractId: string) => Promise<boolean>;
	verifyPDF: (contractId: string) => Promise<boolean>;
	sign: (
		contractId: string,
		signatureData: string,
		signatureMethod?: 'canvas' | 'upload',
		otpCode?: string,
	) => Promise<boolean>;
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
	signing: false,
	verifying: false,

	error: null,
	errorCurrent: null,
	submitError: null,
	downloadError: null,
	generateError: null,
	signError: null,
	verifyError: null,

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
	autoGenerate: async (rentalId, additionalTerms) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await autoGenerateContract(rentalId, additionalTerms, token);
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
				return result.data.pdfUrl;
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
			const result = await downloadContractPDF(id, token);
			if (result.success) {
				set({ downloading: false });
				return result.data;
			} else {
				set({
					downloadError: result.error,
					downloading: false,
				});
				return null;
			}
		} catch (error) {
			set({
				downloadError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				downloading: false,
			});
			return null;
		}
	},

	// Get contract preview
	getPreview: async (contractId) => {
		set({ loading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getContractPreview(contractId, token);
			if (result.success) {
				set({
					pdfPreviewUrl: result.data.previewUrl,
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

	// Sign contract
	sign: async (contractId, signatureData, signatureMethod = 'canvas', otpCode) => {
		set({ signing: true, signError: null });
		try {
			const token = TokenManager.getAccessToken();
			// TODO: Update signContract action to accept otpCode when backend is ready
			// For now, pass otpCode as comment but don't use it yet
			console.log('OTP Code (not sent to backend yet):', otpCode);
			const result = await signContract(contractId, signatureData, signatureMethod, token);
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
