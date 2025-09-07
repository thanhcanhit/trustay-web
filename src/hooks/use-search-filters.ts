'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { type RoomSearchParams } from '@/actions/listings.action';
import { parseSearchParams } from '@/utils/search-params';

export interface SearchFilters extends RoomSearchParams {
	// Additional UI-specific filters for the UI components
	location?: string;
	area?: string;
	price?: string;
}

export function useSearchFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

	// Get current filters from URL
	const getCurrentFilters = useCallback((): SearchFilters => {
		return parseSearchParams(searchParams);
	}, [searchParams]);

	// Get active filters for display
	const getActiveFilters = useCallback(() => {
		const filters = getCurrentFilters();
		const activeFilters: Array<{
			key: string;
			value: unknown;
			label: string;
			id: string;
			values: string[];
		}> = [];

		if (filters.roomType) {
			activeFilters.push({
				key: 'roomType',
				value: filters.roomType,
				label: `Loại: ${filters.roomType}`,
				id: 'roomType',
				values: [filters.roomType],
			});
		}
		if (filters.minPrice || filters.maxPrice) {
			const priceValues: string[] = [];
			if (filters.minPrice) priceValues.push(filters.minPrice.toString());
			if (filters.maxPrice) priceValues.push(filters.maxPrice.toString());
			const priceLabel =
				filters.minPrice && filters.maxPrice
					? `Giá: ${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()} VNĐ`
					: filters.minPrice
						? `Giá từ: ${filters.minPrice.toLocaleString()} VNĐ`
						: `Giá đến: ${filters.maxPrice!.toLocaleString()} VNĐ`;
			activeFilters.push({
				key: 'price',
				value: priceValues,
				label: priceLabel,
				id: 'price',
				values: priceValues,
			});
		}
		if (filters.minArea || filters.maxArea) {
			const areaValues: string[] = [];
			if (filters.minArea) areaValues.push(filters.minArea.toString());
			if (filters.maxArea) areaValues.push(filters.maxArea.toString());
			const areaLabel =
				filters.minArea && filters.maxArea
					? `Diện tích: ${filters.minArea} - ${filters.maxArea}m²`
					: filters.minArea
						? `Diện tích từ: ${filters.minArea}m²`
						: `Diện tích đến: ${filters.maxArea}m²`;
			activeFilters.push({
				key: 'area',
				value: areaValues,
				label: areaLabel,
				id: 'area',
				values: areaValues,
			});
		}
		if (filters.amenities) {
			const amenityValues = filters.amenities.split(',').filter(Boolean);
			activeFilters.push({
				key: 'amenities',
				value: amenityValues,
				label: `Tiện nghi (${amenityValues.length})`,
				id: 'amenities',
				values: amenityValues,
			});
		}
		if (filters.provinceId || filters.districtId || filters.wardId) {
			const locationValue = `${filters.provinceId || ''}-${filters.districtId || ''}-${filters.wardId || ''}`;
			activeFilters.push({
				key: 'location',
				value: locationValue,
				label: 'Vị trí',
				id: 'location',
				values: [locationValue],
			});
		}
		if (filters.maxOccupancy) {
			activeFilters.push({
				key: 'maxOccupancy',
				value: filters.maxOccupancy,
				label: `Sức chứa: ${filters.maxOccupancy} người`,
				id: 'maxOccupancy',
				values: [filters.maxOccupancy.toString()],
			});
		}
		if (filters.isVerified) {
			activeFilters.push({
				key: 'isVerified',
				value: filters.isVerified,
				label: 'Đã xác thực',
				id: 'isVerified',
				values: [filters.isVerified.toString()],
			});
		}

		return activeFilters;
	}, [getCurrentFilters]);

	// Update filters and navigate
	const updateFilters = useCallback(
		(newFilters: Partial<SearchFilters>) => {
			const current = new URLSearchParams(Array.from(searchParams.entries()));

			// Update with new filters
			Object.entries(newFilters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== '') {
					current.set(key, value.toString());
				} else {
					current.delete(key);
				}
			});

			// Reset page to 1 when filters change
			if (Object.keys(newFilters).some((key) => key !== 'page' && key !== 'limit')) {
				current.set('page', '1');
			}

			// Ensure search parameter is always present - use '.' if empty
			if (!current.has('search')) {
				current.set('search', '.');
			}

			const search = current.toString();
			router.push(`/search?${search}`);
		},
		[searchParams, router],
	);

	// Add filter value
	const addFilterValue = useCallback(
		(key: keyof SearchFilters, value: unknown) => {
			// Handle virtual keys
			if (key === 'location') {
				// Location value should be in format like "province-district-ward"
				const locationParts = String(value).split('-');
				const updates: Partial<SearchFilters> = {};
				if (locationParts[0]) updates.provinceId = parseInt(locationParts[0]);
				if (locationParts[1]) updates.districtId = parseInt(locationParts[1]);
				if (locationParts[2]) updates.wardId = parseInt(locationParts[2]);
				updateFilters(updates);
			} else {
				updateFilters({ [key]: value });
			}
		},
		[updateFilters],
	);

	// Remove filter value
	const removeFilterValue = useCallback(
		(key: keyof SearchFilters) => {
			const current = new URLSearchParams(Array.from(searchParams.entries()));

			// Handle virtual keys
			if (key === 'location') {
				current.delete('provinceId');
				current.delete('districtId');
				current.delete('wardId');
			} else if (key === 'area') {
				current.delete('minArea');
				current.delete('maxArea');
			} else if (key === 'price') {
				current.delete('minPrice');
				current.delete('maxPrice');
			} else if (key === 'amenities') {
				current.delete('amenities');
			} else {
				current.delete(key);
			}

			current.set('page', '1');

			// Ensure search parameter is always present - use '.' if empty
			if (!current.has('search')) {
				current.set('search', '.');
			}

			const search = current.toString();
			router.push(`/search?${search}`);
		},
		[searchParams, router],
	);

	// Clear specific filter
	const clearFilter = useCallback(
		(key: keyof SearchFilters) => {
			const current = new URLSearchParams(Array.from(searchParams.entries()));

			// Handle virtual keys
			if (key === 'location') {
				current.delete('provinceId');
				current.delete('districtId');
				current.delete('wardId');
			} else if (key === 'area') {
				current.delete('minArea');
				current.delete('maxArea');
			} else if (key === 'price') {
				current.delete('minPrice');
				current.delete('maxPrice');
			} else {
				current.delete(key);
			}

			current.set('page', '1');

			// Ensure search parameter is always present - use '.' if empty
			if (!current.has('search')) {
				current.set('search', '.');
			}

			const search = current.toString();
			router.push(`/search?${search}`);
		},
		[searchParams, router],
	);

	// Remove filter
	const removeFilter = useCallback(
		(key: keyof SearchFilters) => {
			clearFilter(key);
		},
		[clearFilter],
	);

	// Apply filters (navigate to search page)
	const applyFilters = useCallback(() => {
		const current = new URLSearchParams();
		// Use '.' if search is empty, otherwise use the search query
		current.set('search', searchQuery || '.');
		current.set('page', '1');

		const query = current.toString();
		router.push(`/search?${query}`);
	}, [searchQuery, router]);

	// Update single filter
	const updateFilter = useCallback(
		(key: keyof SearchFilters, value: unknown) => {
			updateFilters({ [key]: value });
		},
		[updateFilters],
	);

	// Clear all filters except search
	const clearFilters = useCallback(() => {
		const current = new URLSearchParams();
		const search = searchParams.get('search') || '.';
		// Use '.' if search is empty, otherwise use the current search
		current.set('search', search);
		current.set('page', '1');

		const query = current.toString();
		router.push(`/search?${query}`);
	}, [searchParams, router]);

	return {
		searchQuery,
		setSearchQuery,
		filters: getCurrentFilters(),
		getActiveFilters,
		addFilterValue,
		removeFilterValue,
		removeFilter,
		applyFilters,
		updateFilters,
		updateFilter,
		clearFilters,
		clearFilter,
		getCurrentFilters,
	};
}
