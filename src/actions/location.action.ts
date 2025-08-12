'use server';

// Location services actions for Trustay API
import { createServerApiCall } from '../lib/api-client';
import { District, Province, Ward } from '../types/types';

// Create API call function for server actions (no auth needed for location services)
const apiCall = createServerApiCall(() => null);

// Get all provinces
export const getProvinces = async (): Promise<Province[]> => {
	return await apiCall<Province[]>('/api/provinces', {
		method: 'GET',
	});
};

// Get districts by province
export const getDistrictsByProvince = async (provinceId: string): Promise<District[]> => {
	return await apiCall<District[]>(`/api/districts?provinceId=${provinceId}`, {
		method: 'GET',
	});
};

// Get wards by district
export const getWardsByDistrict = async (districtId: string): Promise<Ward[]> => {
	return await apiCall<Ward[]>(`/api/wards?districtId=${districtId}`, {
		method: 'GET',
	});
};
