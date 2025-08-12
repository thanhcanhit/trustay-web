'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReferenceStore } from '@/stores/referenceStore';

export interface SearchFilter {
	id: string;
	label: string;
	type: 'checkbox' | 'select' | 'range';
	values: string[];
	options?: Array<{ value: string; label: string }>;
}

export interface ActiveFilter {
	id: string;
	label: string;
	values: string[];
	displayText: string;
}

export function useSearchFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { enums, translateEnum, loadReferenceData, isLoaded } = useReferenceStore();

	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
	const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

	// Load reference data if not loaded
	useEffect(() => {
		if (!isLoaded) {
			loadReferenceData();
		}
	}, [isLoaded, loadReferenceData]);

	// Initialize filters from URL params
	useEffect(() => {
		const filters: Record<string, string[]> = {};

		// Parse URL parameters into filters
		const roomType = searchParams.get('roomType');
		if (roomType) filters.roomType = [roomType];

		const provinceId = searchParams.get('provinceId');
		if (provinceId) filters.location = [provinceId];

		const minPrice = searchParams.get('minPrice');
		const maxPrice = searchParams.get('maxPrice');
		if (minPrice || maxPrice) {
			filters.price = [`${minPrice || 0}-${maxPrice || 999999999}`];
		}

		const minArea = searchParams.get('minArea');
		const maxArea = searchParams.get('maxArea');
		if (minArea || maxArea) {
			filters.area = [`${minArea || 0}-${maxArea || 999}`];
		}

		const amenities = searchParams.get('amenities');
		if (amenities) filters.amenities = amenities.split(',');

		setActiveFilters(filters);
	}, [searchParams]);

	// Available filter definitions
	const availableFilters: SearchFilter[] = useMemo(
		() => [
			{
				id: 'roomType',
				label: 'Loại phòng',
				type: 'checkbox',
				values: [],
				options:
					enums?.roomType?.map((type: string) => ({
						value: type,
						label: translateEnum('roomType', type),
					})) || [],
			},
			{
				id: 'location',
				label: 'Địa chỉ',
				type: 'select',
				values: [],
				options: [
					{ value: '1', label: 'Hà Nội' },
					{ value: '79', label: 'TP. Hồ Chí Minh' },
					{ value: '48', label: 'Đà Nẵng' },
					{ value: '92', label: 'Cần Thơ' },
				],
			},
			{
				id: 'price',
				label: 'Giá cả',
				type: 'checkbox',
				values: [],
				options: [
					{ value: '0-2000000', label: 'Dưới 2 triệu' },
					{ value: '2000000-5000000', label: '2-5 triệu' },
					{ value: '5000000-10000000', label: '5-10 triệu' },
					{ value: '10000000-999999999', label: 'Trên 10 triệu' },
				],
			},
			{
				id: 'area',
				label: 'Diện tích',
				type: 'checkbox',
				values: [],
				options: [
					{ value: '0-20', label: 'Dưới 20m²' },
					{ value: '20-30', label: '20-30m²' },
					{ value: '30-50', label: '30-50m²' },
					{ value: '50-999', label: 'Trên 50m²' },
				],
			},
			{
				id: 'amenities',
				label: 'Tiện ích',
				type: 'checkbox',
				values: [],
				options: [], // Will be populated from amenities store
			},
		],
		[enums, translateEnum],
	);

	// Get active filters for display
	const getActiveFilters = useCallback((): ActiveFilter[] => {
		const result: ActiveFilter[] = [];

		Object.entries(activeFilters).forEach(([filterId, values]) => {
			if (values.length === 0) return;

			const filter = availableFilters.find((f) => f.id === filterId);
			if (!filter) return;

			const displayTexts = values.map((value) => {
				const option = filter.options?.find((opt) => opt.value === value);
				return option?.label || value;
			});

			result.push({
				id: filterId,
				label: filter.label,
				values,
				displayText: displayTexts.join(', '),
			});
		});

		return result;
	}, [activeFilters, availableFilters]);

	// Add filter value
	const addFilterValue = useCallback((filterId: string, value: string) => {
		setActiveFilters((prev) => ({
			...prev,
			[filterId]: [...(prev[filterId] || []), value],
		}));
	}, []);

	// Remove filter value
	const removeFilterValue = useCallback((filterId: string, value: string) => {
		setActiveFilters((prev) => ({
			...prev,
			[filterId]: (prev[filterId] || []).filter((v) => v !== value),
		}));
	}, []);

	// Remove entire filter
	const removeFilter = useCallback((filterId: string) => {
		setActiveFilters((prev) => {
			const newFilters = { ...prev };
			delete newFilters[filterId];
			return newFilters;
		});
	}, []);

	// Clear all filters
	const clearAllFilters = useCallback(() => {
		setActiveFilters({});
		setSearchQuery('');
	}, []);

	// Apply filters to URL
	const applyFilters = useCallback(() => {
		const params = new URLSearchParams();

		// Add search query
		if (searchQuery.trim()) {
			params.set('search', searchQuery.trim());
		}

		// Add filter parameters
		Object.entries(activeFilters).forEach(([filterId, values]) => {
			if (values.length === 0) return;

			switch (filterId) {
				case 'roomType':
					if (values.length === 1) params.set('roomType', values[0]);
					break;
				case 'location':
					if (values.length === 1) params.set('provinceId', values[0]);
					break;
				case 'price':
					if (values.length === 1) {
						const [min, max] = values[0].split('-');
						if (min !== '0') params.set('minPrice', min);
						if (max !== '999999999') params.set('maxPrice', max);
					}
					break;
				case 'area':
					if (values.length === 1) {
						const [min, max] = values[0].split('-');
						if (min !== '0') params.set('minArea', min);
						if (max !== '999') params.set('maxArea', max);
					}
					break;
				case 'amenities':
					params.set('amenities', values.join(','));
					break;
			}
		});

		// Navigate to search page with filters
		const queryString = params.toString();
		router.push(`/search${queryString ? `?${queryString}` : ''}`);
	}, [searchQuery, activeFilters, router]);

	return {
		searchQuery,
		setSearchQuery,
		activeFilters,
		availableFilters,
		getActiveFilters,
		addFilterValue,
		removeFilterValue,
		removeFilter,
		clearAllFilters,
		applyFilters,
	};
}
