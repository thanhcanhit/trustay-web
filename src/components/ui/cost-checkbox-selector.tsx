"use client";

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormLabel } from '@/components/ui/form';
import { useReferenceStore, type CostType } from '@/stores/referenceStore';
import { getCostTypeIcon } from '@/utils/icon-mapping';
import { type RoomCost } from '@/types/types';

// Extended interface to handle API response data
interface ExtendedRoomCost extends Omit<RoomCost, 'fixedAmount' | 'unitPrice' | 'baseRate'> {
  fixedAmount?: number;
  unitPrice?: number;
  baseRate?: number;
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
    const initialValues: Record<string, number> = {};
          selectedCosts.forEach(cost => {
        // Lấy giá trị từ cost, có thể là từ API response với fixedAmount, unitPrice, baseRate
        const extendedCost = cost as ExtendedRoomCost;
        const value = extendedCost.fixedAmount || extendedCost.unitPrice || extendedCost.baseRate || cost.value || 0;
        initialValues[cost.systemCostTypeId] = value;
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

  const handleCostToggle = (costType: CostType, checked: boolean) => {
    if (checked) {
      // Add cost type
      const newCost: RoomCost = {
        id: '', // Will be set by API
        roomId: '', // Will be set by API
        systemCostTypeId: costType.id,
        value: costValues[costType.id] || 0,
        costType: 'fixed',
        currency: 'VND',
        unit: costType.unit || 'VND',
        isMetered: false,
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

  return (
    <div className={`space-y-4 ${className}`}>
      <FormField>
        <FormLabel>Chi phí phát sinh</FormLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 space-x-2">
          {filteredCostTypes.map((costType) => {
            const IconComponent = getCostTypeIcon(costType.name);
            const checked = isSelected(costType.id);
            const currentValue = costValues[costType.id] || 0;
            
            return (
              <div
                key={costType.id}
                className="flex items-center space-x-2 p-2 border-b border-gray-200"
              >
                  <Checkbox
                  id={`cost-${costType.id}`}
                  checked={checked}
                  onCheckedChange={(checked) => handleCostToggle(costType, !!checked)}
                  />
                  
                  <div className="flex items-center space-x-2 flex-1">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                    <Label
                      htmlFor={`cost-${costType.id}`}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {costType.name}
                    </Label>
                  </div>
                  
                  {checked && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={currentValue}
                        onChange={(e) => handleValueChange(costType.id, parseFloat(e.target.value) || 0)}
                        className="w-24 h-8 text-xs border-none"
                        min="0"
                        step="1000"
                      />
                      <span className="text-xs text-gray-500 min-w-[30px]">
                        {costType.unit || 'VND'}
                      </span>
                    </div>
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
              
              return (
                <div key={cost.systemCostTypeId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">{costType.name}</span>
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
