"use client";

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useReferenceStore, type CostType } from '@/stores/referenceStore';
import { getCostTypeIcon } from '@/utils/icon-mapping';

interface SelectedCostType {
  id: string;
  name: string;
  amount: number;
  category: string;
  unit: string;
}

interface RoomCost {
  systemCostTypeId: string;
  value: number;
  costType: 'fixed' | 'per_unit' | 'percentage' | 'metered' | 'tiered';
  unit?: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  includedInRent: boolean;
  isOptional: boolean;
  notes?: string;
}

interface CostTypeSelectorProps {
  selectedCostTypes: SelectedCostType[] | RoomCost[];
  onSelectionChange: (costTypes: SelectedCostType[] | RoomCost[]) => void;
  category?: string;
  mode?: 'select' | 'display';
  className?: string;
}

export function CostTypeSelector({
  selectedCostTypes,
  onSelectionChange,
  category,
  mode = 'select',
  className = ''
}: CostTypeSelectorProps) {
  const { costTypes, getCostTypesByCategory, loadReferenceData, isLoading } = useReferenceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  // Load reference data if not loaded
  useEffect(() => {
    if (costTypes.length === 0) {
      loadReferenceData();
    }
  }, [costTypes.length, loadReferenceData]);

  // Normalize selected cost types to work with both input types
  const normalizedSelectedCostTypes = selectedCostTypes.map(item => {
    if ('systemCostTypeId' in item) {
      // RoomCost type
      return {
        id: item.systemCostTypeId,
        name: costTypes.find(ct => ct.id === item.systemCostTypeId)?.name || '',
        amount: item.value,
        category: costTypes.find(ct => ct.id === item.systemCostTypeId)?.category || '',
        unit: item.unit || 'VND'
      };
    } else {
      // SelectedCostType
      return item;
    }
  });

  // Initialize amounts from selected cost types
  useEffect(() => {
    const initialAmounts: Record<string, number> = {};
    selectedCostTypes.forEach(item => {
      const id = 'systemCostTypeId' in item ? item.systemCostTypeId : item.id;
      const amount = 'value' in item ? item.value : item.amount;
      initialAmounts[id] = amount;
    });
    setAmounts(prev => {
      // Only update if actually different to prevent infinite loops
      const hasChanged = Object.keys(initialAmounts).some(key => 
        prev[key] !== initialAmounts[key]
      ) || Object.keys(prev).length !== Object.keys(initialAmounts).length;
      
      return hasChanged ? initialAmounts : prev;
    });
  }, [selectedCostTypes]);

  const filteredCostTypes = category ? getCostTypesByCategory(category) : costTypes;

  const handleCostTypeToggle = (costType: CostType) => {
    const isSelected = normalizedSelectedCostTypes.some(selected => selected.id === costType.id);
    
    if (isSelected) {
      // Remove cost type
      const newSelection = normalizedSelectedCostTypes.filter(selected => selected.id !== costType.id);
      onSelectionChange(newSelection);
      
      // Remove amount
      const newAmounts = { ...amounts };
      delete newAmounts[costType.id];
      setAmounts(newAmounts);
    } else {
      // Add cost type with default amount
      const defaultAmount = 0;
      const newSelection = [...normalizedSelectedCostTypes, {
        id: costType.id,
        name: costType.name,
        amount: defaultAmount,
        category: costType.category,
        unit: costType.unit || 'VND'
      }];
      onSelectionChange(newSelection);
      
      // Set default amount
      setAmounts(prev => ({ ...prev, [costType.id]: defaultAmount }));
    }
  };

  const handleAmountChange = (costTypeId: string, amount: number) => {
    setAmounts(prev => ({ ...prev, [costTypeId]: amount }));
    
    // Update selected cost types
    const newSelection = normalizedSelectedCostTypes.map(costType => 
      costType.id === costTypeId ? { ...costType, amount } : costType
    );
    onSelectionChange(newSelection);
  };

  const removeCostType = (costTypeId: string) => {
    const newSelection = normalizedSelectedCostTypes.filter(costType => costType.id !== costTypeId);
    onSelectionChange(newSelection);
    
    const newAmounts = { ...amounts };
    delete newAmounts[costTypeId];
    setAmounts(newAmounts);
  };

  const formatAmount = (amount: number, unit: string) => {
    if (unit === 'VND') {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
    }
    return `${amount} ${unit}`;
  };

  // Display mode - just show selected cost types
  if (mode === 'display') {
    return (
      <div className={`space-y-2 ${className}`}>
        {normalizedSelectedCostTypes.map((costType) => {
          const IconComponent = getCostTypeIcon(costType.name);
          return (
            <div key={costType.id} className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{costType.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatAmount(costType.amount, costType.unit)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Select mode - interactive selector
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected cost types display */}
      {normalizedSelectedCostTypes.length > 0 && (
        <div className="space-y-2">
          {normalizedSelectedCostTypes.map((costType) => {
            const IconComponent = getCostTypeIcon(costType.name);
            return (
              <div key={costType.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <IconComponent className="h-4 w-4 text-gray-600" />
                <span className="text-sm flex-1">{costType.name}</span>
                <Input
                  type="number"
                  value={amounts[costType.id] || 0}
                  onChange={(e) => handleAmountChange(costType.id, parseInt(e.target.value) || 0)}
                  className="w-24 h-8 text-xs"
                  min="0"
                />
                <span className="text-xs text-gray-500">{costType.unit}</span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeCostType(costType.id)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Selector button */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
          disabled={isLoading}
        >
          <span>
            {normalizedSelectedCostTypes.length > 0 
              ? `Đã chọn ${normalizedSelectedCostTypes.length} loại chi phí`
              : 'Chọn loại chi phí'
            }
          </span>
          <Plus className="h-4 w-4" />
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              {filteredCostTypes.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  {isLoading ? 'Đang tải...' : 'Không có loại chi phí nào'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCostTypes.map((costType) => {
                    const IconComponent = getCostTypeIcon(costType.name);
                    const isSelected = normalizedSelectedCostTypes.some(selected => selected.id === costType.id);
                    
                    return (
                      <div
                        key={costType.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleCostTypeToggle(costType)}
                      >
                        <Checkbox checked={isSelected} />
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <span className="text-sm flex-1">{costType.name}</span>
                        <span className="text-xs text-gray-500">({costType.unit})</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
