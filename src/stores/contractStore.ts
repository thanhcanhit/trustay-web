import { create } from 'zustand';
import {
	autoGenerateContract,
	createContractAmendment,
	downloadContractPDF,
	getContractById,
	getLandlordContracts,
	getMyContracts,
	getTenantContracts,
	requestSignatures,
	signContract,
	updateContract,
	verifySignature,
} from '@/actions/contract.action';
import { TokenManager } from '@/lib/api-client';
import type {
	Contract,
	ContractListResponse,
	CreateContractAmendmentRequest,
	UpdateContractRequest,
} from '@/types/types';

interface ContractState {
	// Data
	contracts: Contract[];
	landlordContracts: Contract[];
	tenantContracts: Contract[];
	current: Contract | null;

	// Loading states
	loading: boolean;
	loadingLandlord: boolean;
	loadingTenant: boolean;
	loadingCurrent: boolean;
	submitting: boolean;
	downloading: boolean;
	signing: boolean;
	verifying: boolean;

	// Error states
	error: string | null;
	errorLandlord: string | null;
	errorTenant: string | null;
	errorCurrent: string | null;
	submitError: string | null;
	downloadError: string | null;
	signError: string | null;
	verifyError: string | null;

	// Metadata
	meta: ContractListResponse['meta'] | null;
	landlordMeta: ContractListResponse['meta'] | null;
	tenantMeta: ContractListResponse['meta'] | null;

	// Actions
	loadContracts: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
	loadLandlordContracts: (params?: { page?: number; limit?: number }) => Promise<void>;
	loadTenantContracts: (params?: { page?: number; limit?: number }) => Promise<void>;
	loadById: (id: string) => Promise<void>;
	loadContractById: (id: string) => Promise<Contract | null>;
	autoGenerate: (rentalId: string, additionalTerms?: string) => Promise<boolean>;
	update: (id: string, data: UpdateContractRequest) => Promise<boolean>;
	createAmendment: (contractId: string, data: CreateContractAmendmentRequest) => Promise<boolean>;
	downloadPDF: (id: string) => Promise<Blob | null>;
	sign: (
		contractId: string,
		signatureData: string,
		signatureMethod?: 'canvas' | 'upload',
	) => Promise<boolean>;
	requestSignatures: (contractId: string, signatureDeadline?: string) => Promise<boolean>;
	verifySignature: (
		contractId: string,
		signatureId: string,
	) => Promise<{ isValid: boolean; details: string } | null>;
	clearCurrent: () => void;
	clearErrors: () => void;
}

export const useContractStore = create<ContractState>((set, get) => ({
	// Initial state
	contracts: [],
	landlordContracts: [],
	tenantContracts: [],
	current: null,

	loading: false,
	loadingLandlord: false,
	loadingTenant: false,
	loadingCurrent: false,
	submitting: false,
	downloading: false,
	signing: false,
	verifying: false,

	error: null,
	errorLandlord: null,
	errorTenant: null,
	errorCurrent: null,
	submitError: null,
	downloadError: null,
	signError: null,
	verifyError: null,

	meta: null,
	landlordMeta: null,
	tenantMeta: null,

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

	// Load landlord contracts
	loadLandlordContracts: async (params) => {
		set({ loadingLandlord: true, errorLandlord: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getLandlordContracts(params, token);
			if (result.success) {
				set({
					landlordContracts: result.data.data,
					landlordMeta: result.data.meta,
					loadingLandlord: false,
				});
			} else {
				set({
					errorLandlord: result.error,
					loadingLandlord: false,
				});
			}
		} catch (error) {
			set({
				errorLandlord: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingLandlord: false,
			});
		}
	},

	// Load tenant contracts
	loadTenantContracts: async (params) => {
		set({ loadingTenant: true, errorTenant: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getTenantContracts(params, token);
			if (result.success) {
				set({
					tenantContracts: result.data.data,
					tenantMeta: result.data.meta,
					loadingTenant: false,
				});
			} else {
				set({
					errorTenant: result.error,
					loadingTenant: false,
				});
			}
		} catch (error) {
			set({
				errorTenant: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingTenant: false,
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

	// Update contract
	update: async (id, data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updateContract(id, data, token);
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

	// Create contract amendment
	createAmendment: async (contractId, data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createContractAmendment(contractId, data, token);
			if (result.success) {
				set({ submitting: false });
				// Reload current contract to get updated amendments
				await get().loadById(contractId);
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

	// Clear current contract
	clearCurrent: () => {
		set({ current: null, errorCurrent: null });
	},

	// Sign contract
	sign: async (contractId, signatureData, signatureMethod = 'canvas') => {
		set({ signing: true, signError: null });
		try {
			const token = TokenManager.getAccessToken();
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

	// Request signatures from both parties
	requestSignatures: async (contractId, signatureDeadline) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await requestSignatures(contractId, signatureDeadline, token);
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

	// Verify signature
	verifySignature: async (contractId, signatureId) => {
		set({ verifying: true, verifyError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await verifySignature(contractId, signatureId, token);
			if (result.success) {
				set({ verifying: false });
				return result.data;
			} else {
				set({
					verifyError: result.error,
					verifying: false,
				});
				return null;
			}
		} catch (error) {
			set({
				verifyError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				verifying: false,
			});
			return null;
		}
	},

	// Clear all errors
	clearErrors: () => {
		set({
			error: null,
			errorLandlord: null,
			errorTenant: null,
			errorCurrent: null,
			submitError: null,
			downloadError: null,
			signError: null,
			verifyError: null,
		});
	},
}));
