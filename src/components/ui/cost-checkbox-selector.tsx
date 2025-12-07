"use client";

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReferenceStore, type CostType } from '@/stores/referenceStore';
import { getCostTypeIcon } from '@/utils/icon-mapping';
import { type RoomCost } from '@/types/types';

// Extended interface to handle API response data
interface ExtendedRoomCost extends Omit<RoomCost, 'fixedAmount' | 'unitPrice' | 'baseRate'> {
  fixedAmount?: number;
  unitPrice?: number;
  // baseRate?: number;
}

interface CostCheckboxSelectorProps {
  selectedCosts: RoomCost[];
  onSelectionChange: (costs: RoomCost[]) => void;
  category?: string;
  className?: string;
}

export function CostCheckboxSelector({
  selectedCosts,
  onSelectionChange,
  category,
  className = ''
}: CostCheckboxSelectorProps) {
  const { costTypes, getCostTypesByCategory, loadReferenceData, isLoading } = useReferenceStore();
  const [costValues, setCostValues] = useState<Record<string, number>>({});

  // Load reference data if not loaded
  useEffect(() => {
    if (costTypes.length === 0) {
      loadReferenceData();
    }
  }, [costTypes.length, loadReferenceData]);

  // Initialize cost values from selected costs
  useEffect(() => {
    if (!selectedCosts || selectedCosts.length === 0) {
      return;
    }

    const initialValues: Record<string, number> = {};
    selectedCosts.forEach(cost => {
      if (!cost || !cost.systemCostTypeId) return;

      // Lấy giá trị từ cost, có thể là từ API response với fixedAmount, unitPrice, baseRate
      const extendedCost = cost as ExtendedRoomCost;
      let value = 0;

      // Try different fields that might contain the value
      if (extendedCost.fixedAmount) {
        value = typeof extendedCost.fixedAmount === 'string'
          ? parseFloat(extendedCost.fixedAmount)
          : extendedCost.fixedAmount;
      } else if (extendedCost.unitPrice) {
        value = typeof extendedCost.unitPrice === 'string'
          ? parseFloat(extendedCost.unitPrice)
          : extendedCost.unitPrice;
      } else if (cost.value) {
        value = typeof cost.value === 'string'
          ? parseFloat(cost.value)
          : cost.value;
      }

      initialValues[cost.systemCostTypeId] = value || 0;
    });

    setCostValues(prev => {
      // Only update if different to prevent infinite loops
      const hasChanged = Object.keys(initialValues).some(key =>
        prev[key] !== initialValues[key]
      ) || Object.keys(prev).length !== Object.keys(initialValues).length;

      return hasChanged ? initialValues : prev;
    });
  }, [selectedCosts]);

  const filteredCostTypes = category ? getCostTypesByCategory(category) : costTypes;

  // Helper function to determine cost type based on name or category
  const determineCostTypeAndMetered = (costType: CostType): { 
    type: 'fixed' | 'per_person' | 'metered', 
    isMetered: boolean 
  } => {
    // If backend provides costType, use it
    if (costType.costType) {
      return {
        type: costType.costType,
        isMetered: costType.costType === 'metered' || costType.isMetered === true
      };
    }

    // Otherwise, determine by name
    const nameLower = costType.name?.toLowerCase() || '';
    
    // Metered costs (electricity, water)
    if (nameLower.includes('điện') || nameLower.includes('electric') || 
        nameLower.includes('nước') || nameLower.includes('water')) {
      return { type: 'metered', isMetered: true };
    }
    
    // Per person costs (người)
    if (nameLower.includes('người')) {
      return { type: 'per_person', isMetered: false };
    }
    
    // Fixed costs (internet, parking, cleaning, etc.)
    return { type: 'fixed', isMetered: false };
  };

  const handleCostToggle = (costType: CostType, checked: boolean) => {
    if (checked) {
      const { type: determinedCostType, isMetered } = determineCostTypeAndMetered(costType);
      
      // Add cost type
      const newCost: RoomCost = {
        id: '', // Will be set by API
        roomId: '', // Will be set by API
        systemCostTypeId: costType.id,
        value: costValues[costType.id] || 0,
        costType: determinedCostType,
        currency: 'VND',
        unit: costType.unit || 'VND',
        isMetered: isMetered,
        billingCycle: 'monthly',
        includedInRent: false,
        isOptional: true,
        isActive: true,
        notes: costType.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        systemCostType: {
          name: costType.name,
          nameEn: costType.name,
          category: costType.category
        }
      };
      
      const newCosts = [...selectedCosts, newCost];
      onSelectionChange(newCosts);
    } else {
      // Remove cost type
      const newCosts = selectedCosts.filter(cost => cost.systemCostTypeId !== costType.id);
      onSelectionChange(newCosts);
      
      // Remove from local state
      const newValues = { ...costValues };
      delete newValues[costType.id];
      setCostValues(newValues);
    }
  };

  const handleValueChange = (costTypeId: string, value: number) => {
    setCostValues(prev => ({ ...prev, [costTypeId]: value }));
    
    // Update the cost in selectedCosts
    const newCosts = selectedCosts.map(cost => 
      cost.systemCostTypeId === costTypeId 
        ? { ...cost, value }
        : cost
    );
    onSelectionChange(newCosts);
  };

  const isSelected = (costTypeId: string) => {
    return selectedCosts.some(cost => cost.systemCostTypeId === costTypeId);
  };

  const formatAmount = (amount: number, unit: string) => {
    if (unit === 'VND') {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
    }
    return `${amount} ${unit}`;
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center text-gray-500 py-4">Đang tải...</div>
      </div>
    );
  }

  if (filteredCostTypes.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center text-gray-500 py-4">Không có loại chi phí nào</div>
      </div>
    );
  }

  const handleCostTypeChange = (costTypeId: string, newCostType: 'fixed' | 'per_person' | 'metered') => {
    const newCosts = selectedCosts.map(cost =>
      cost.systemCostTypeId === costTypeId
        ? { ...cost, costType: newCostType, isMetered: newCostType === 'metered' }
        : cost
    );
    onSelectionChange(newCosts);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <FormField>
        <FormLabel>Chi phí phát sinh</FormLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredCostTypes.map((costType) => {
            const IconComponent = getCostTypeIcon(costType.name);
            const checked = isSelected(costType.id);
            const currentValue = costValues[costType.id] || 0;
            const selectedCost = selectedCosts.find(c => c.systemCostTypeId === costType.id);

            return (
              <div
                key={costType.id}
                className="flex flex-col space-y-2 p-3 border rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`cost-${costType.id}`}
                    checked={checked}
                    onCheckedChange={(checked) => handleCostToggle(costType, !!checked)}
                  />

                  <div className="flex items-center space-x-2 flex-1">
                    <IconComponent className="h-3.5 w-3.5 text-gray-600" />
                    <Label
                      htmlFor={`cost-${costType.id}`}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {costType.name}
                    </Label>
                  </div>
                </div>

                {checked && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs text-gray-600 min-w-[70px]">Loại chi phí:</Label>
                      <Select
                        value={selectedCost?.costType || 'fixed'}
                        onValueChange={(value) => handleCostTypeChange(costType.id, value as 'fixed' | 'per_person' | 'metered')}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Cố định</SelectItem>
                          <SelectItem value="per_person">Theo người</SelectItem>
                          <SelectItem value="metered">Theo đồng hồ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs text-gray-600 min-w-[70px]">Số tiền:</Label>
                      <Input
                        type="number"
                        value={currentValue}
                        onChange={(e) => handleValueChange(costType.id, parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                        min="0"
                        step="1000"
                      />
                      <span className="text-xs text-gray-500 min-w-[40px]">
                        {costType.unit || 'VND'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </FormField>

      {/* Selected costs summary */}
      {selectedCosts.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium mb-3">Tóm tắt chi phí đã chọn:</h5>
          <div className="space-y-2">
            {selectedCosts.map((cost) => {
              const costType = costTypes.find(ct => ct.id === cost.systemCostTypeId);
              if (!costType) return null;

              const IconComponent = getCostTypeIcon(costType.name);
              const costTypeLabel = cost.costType === 'fixed' ? 'Cố định' :
                                    cost.costType === 'per_person' ? 'Theo người' : 'Theo đồng hồ';

              return (
                <div key={cost.systemCostTypeId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">{costType.name}</span>
                    <span className="text-xs text-gray-500">({costTypeLabel})</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatAmount(cost.value || 0, cost.unit || 'VND')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
