import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
	getDistrictById as apiGetDistrictById,
	getWardById as apiGetWardById,
	getDistrictsByProvince,
	getProvinces,
	getWardsByDistrict,
} from '@/actions/location.action';
import { District, Province, Ward } from '@/types/types';

interface LocationState {
	// Data
	provinces: Province[];
	districts: Record<number, District[]>; // provinceId -> districts
	wards: Record<number, Ward[]>; // districtId -> wards

	// Loading states
	provincesLoading: boolean;
	districtsLoading: Record<number, boolean>; // provinceId -> loading state
	wardsLoading: Record<number, boolean>; // districtId -> loading state

	// Error states
	provincesError: string | null;
	districtsError: Record<number, string | null>;
	wardsError: Record<number, string | null>;

	// Actions
	loadProvinces: () => Promise<void>;
	loadDistrictsByProvince: (provinceId: number) => Promise<void>;
	loadWardsByDistrict: (districtId: number) => Promise<void>;
	loadDistrictById: (districtId: number) => Promise<District | null>;
	loadWardById: (wardId: number) => Promise<Ward | null>;
	getProvinceById: (id: number) => Province | undefined;
	getDistrictById: (id: number) => District | undefined;
	getWardById: (id: number) => Ward | undefined;
	getDistrictsByProvinceId: (provinceId: number) => District[];
	getWardsByDistrictId: (districtId: number) => Ward[];
	clearErrors: () => void;
}

export const useLocationStore = create<LocationState>()(
	persist(
		(set, get) => ({
			// Initial state
			provinces: [],
			districts: {},
			wards: {},
			provincesLoading: false,
			districtsLoading: {},
			wardsLoading: {},
			provincesError: null,
			districtsError: {},
			wardsError: {},

			// Load provinces
			loadProvinces: async () => {
				const { provinces, provincesLoading } = get();

				// Don't reload if already loaded or loading
				if (provinces.length > 0 || provincesLoading) {
					return;
				}

				set({ provincesLoading: true, provincesError: null });

				try {
					const provincesData = await getProvinces();
					set({
						provinces: provincesData,
						provincesLoading: false,
						provincesError: null,
					});
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Failed to load provinces';
					set({
						provincesLoading: false,
						provincesError: errorMessage,
					});
				}
			},

			// Load districts by province
			loadDistrictsByProvince: async (provinceId: number) => {
				const { districts, districtsLoading } = get();

				// Don't reload if already loaded or loading
				if (districts[provinceId] || districtsLoading[provinceId]) {
					return;
				}

				set((state) => ({
					districtsLoading: { ...state.districtsLoading, [provinceId]: true },
					districtsError: { ...state.districtsError, [provinceId]: null },
				}));

				try {
					const districtsData = await getDistrictsByProvince(provinceId.toString());
					set((state) => ({
						districts: { ...state.districts, [provinceId]: districtsData },
						districtsLoading: { ...state.districtsLoading, [provinceId]: false },
						districtsError: { ...state.districtsError, [provinceId]: null },
					}));
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Failed to load districts';
					set((state) => ({
						districtsLoading: { ...state.districtsLoading, [provinceId]: false },
						districtsError: { ...state.districtsError, [provinceId]: errorMessage },
					}));
				}
			},

			// Load wards by district
			loadWardsByDistrict: async (districtId: number) => {
				const { wards, wardsLoading } = get();

				// Don't reload if already loaded or loading
				if (wards[districtId] || wardsLoading[districtId]) {
					return;
				}

				set((state) => ({
					wardsLoading: { ...state.wardsLoading, [districtId]: true },
					wardsError: { ...state.wardsError, [districtId]: null },
				}));

				try {
					const wardsData = await getWardsByDistrict(districtId.toString());
					set((state) => ({
						wards: { ...state.wards, [districtId]: wardsData },
						wardsLoading: { ...state.wardsLoading, [districtId]: false },
						wardsError: { ...state.wardsError, [districtId]: null },
					}));
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Failed to load wards';
					set((state) => ({
						wardsLoading: { ...state.wardsLoading, [districtId]: false },
						wardsError: { ...state.wardsError, [districtId]: errorMessage },
					}));
				}
			},

			// Helper functions
			getProvinceById: (id: number) => {
				const { provinces } = get();
				return provinces.find((province) => province.id === id);
			},

			getDistrictById: (id: number) => {
				const { districts } = get();
				for (const provinceDistricts of Object.values(districts)) {
					const district = provinceDistricts.find((d) => d.id === id);
					if (district) return district;
				}
				return undefined;
			},

			getWardById: (id: number) => {
				const { wards } = get();
				for (const districtWards of Object.values(wards)) {
					const ward = districtWards.find((w) => w.id === id);
					if (ward) return ward;
				}
				return undefined;
			},

			getDistrictsByProvinceId: (provinceId: number) => {
				const { districts } = get();
				return districts[provinceId] || [];
			},

			getWardsByDistrictId: (districtId: number) => {
				const { wards } = get();
				return wards[districtId] || [];
			},

			// Load single district by ID
			loadDistrictById: async (districtId: number) => {
				try {
					const district = await apiGetDistrictById(districtId);
					// Add the district to the appropriate province's districts if not already there
					set((state) => {
						const provinceId = district.provinceId;
						const existingDistricts = state.districts[provinceId] || [];
						const districtExists = existingDistricts.find((d) => d.id === districtId);

						if (!districtExists) {
							return {
								districts: {
									...state.districts,
									[provinceId]: [...existingDistricts, district],
								},
							};
						}
						return state;
					});
					return district;
				} catch (error) {
					console.error('Error loading district by ID:', error);
					return null;
				}
			},

			// Load single ward by ID
			loadWardById: async (wardId: number) => {
				try {
					const ward = await apiGetWardById(wardId);
					// Add the ward to the appropriate district's wards if not already there
					set((state) => {
						const districtId = ward.districtId;
						const existingWards = state.wards[districtId] || [];
						const wardExists = existingWards.find((w) => w.id === wardId);

						if (!wardExists) {
							return {
								wards: {
									...state.wards,
									[districtId]: [...existingWards, ward],
								},
							};
						}
						return state;
					});
					return ward;
				} catch (error) {
					console.error('Error loading ward by ID:', error);
					return null;
				}
			},

			clearErrors: () => {
				set({
					provincesError: null,
					districtsError: {},
					wardsError: {},
				});
			},
		}),
		{
			name: 'location-store',
			// Only persist the data, not loading states or errors
			partialize: (state) => ({
				provinces: state.provinces,
				districts: state.districts,
				wards: state.wards,
			}),
		},
	),
);
