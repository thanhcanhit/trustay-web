import { useReferenceStore } from '@/stores/referenceStore';

/**
 * Validate if selected IDs exist in reference data
 */
export function validateReferenceIds(
	selectedAmenityIds: string[],
	selectedCostTypeIds: string[],
	selectedRuleIds: string[],
) {
	const store = useReferenceStore.getState();

	const availableAmenityIds = store.amenities.map((a) => a.id);
	const availableCostTypeIds = store.costTypes.map((c) => c.id);
	const availableRuleIds = store.rules.map((r) => r.id);

	const invalidAmenityIds = selectedAmenityIds.filter((id) => !availableAmenityIds.includes(id));
	const invalidCostTypeIds = selectedCostTypeIds.filter((id) => !availableCostTypeIds.includes(id));
	const invalidRuleIds = selectedRuleIds.filter((id) => !availableRuleIds.includes(id));

	return {
		invalidAmenityIds,
		invalidCostTypeIds,
		invalidRuleIds,
		hasErrors:
			invalidAmenityIds.length > 0 || invalidCostTypeIds.length > 0 || invalidRuleIds.length > 0,
	};
}
