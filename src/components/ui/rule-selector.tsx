"use client";

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useReferenceStore } from '@/stores/referenceStore';
import { getRuleIcon } from '@/utils/icon-mapping';

interface RuleSelectorProps {
  selectedRules: string[];
  onSelectionChange: (ruleIds: string[]) => void;
  category?: string;
  mode?: 'select' | 'display';
  className?: string;
}

export function RuleSelector({
  selectedRules,
  onSelectionChange,
  category,
  mode = 'select',
  className = ''
}: RuleSelectorProps) {
  const { rules, getRulesByCategory, loadReferenceData, isLoading } = useReferenceStore();
  const [isOpen, setIsOpen] = useState(false);

  // Load reference data if not loaded
  useEffect(() => {
    if (rules.length === 0) {
      loadReferenceData();
    }
  }, [rules.length, loadReferenceData]);

  const filteredRules = category ? getRulesByCategory(category) : rules;
  const selectedRuleObjects = filteredRules.filter(rule => 
    selectedRules.includes(rule.id)
  );

  const handleRuleToggle = (ruleId: string) => {
    const newSelection = selectedRules.includes(ruleId)
      ? selectedRules.filter(id => id !== ruleId)
      : [...selectedRules, ruleId];
    
    onSelectionChange(newSelection);
  };

  const removeRule = (ruleId: string) => {
    onSelectionChange(selectedRules.filter(id => id !== ruleId));
  };

  // Display mode - just show selected rules
  if (mode === 'display') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {selectedRuleObjects.map((rule) => {
          const IconComponent = getRuleIcon(rule.name);
          return (
            <div key={rule.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <IconComponent className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">{rule.name}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Select mode - interactive selector
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected rules display */}
      {selectedRules.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRuleObjects.map((rule) => {
            const IconComponent = getRuleIcon(rule.name);
            return (
              <Badge key={rule.id} variant="secondary" className="flex items-center gap-2">
                <IconComponent className="h-3 w-3" />
                <span>{rule.name}</span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeRule(rule.id)}
                />
              </Badge>
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
            {selectedRules.length > 0 
              ? `Đã chọn ${selectedRules.length} quy định`
              : 'Chọn quy định'
            }
          </span>
          <Check className="h-4 w-4" />
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              {filteredRules.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  {isLoading ? 'Đang tải...' : 'Không có quy định nào'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRules.map((rule) => {
                    const IconComponent = getRuleIcon(rule.name);
                    const isSelected = selectedRules.includes(rule.id);
                    
                    return (
                      <div
                        key={rule.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleRuleToggle(rule.id)}
                      >
                        <Checkbox checked={isSelected} />
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <div className="flex-1">
                          <span className="text-sm">{rule.name}</span>
                          {rule.description && (
                            <p className="text-xs text-gray-500 mt-1">{rule.description}</p>
                          )}
                        </div>
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
