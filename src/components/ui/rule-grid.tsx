"use client";

import { useEffect } from 'react';
import { Check, Shield, ShieldCheck } from 'lucide-react';
import { useReferenceStore } from '@/stores/referenceStore';
import { Switch } from '@/components/ui/switch';

interface RoomRule {
  systemRuleId: string;
  customValue?: string;
  isEnforced: boolean;
  notes?: string;
}

interface RuleGridProps {
  selectedRules: string[] | RoomRule[];
  onSelectionChange: (rules: string[] | RoomRule[]) => void;
  category?: string;
  className?: string;
}

export function RuleGrid({
  selectedRules,
  onSelectionChange,
  category,
  className = ''
}: RuleGridProps) {
  const { rules, getRulesByCategory, loadReferenceData, isLoading } = useReferenceStore();

  // Load reference data if not loaded
  useEffect(() => {
    if (rules.length === 0) {
      loadReferenceData();
    }
  }, [rules.length, loadReferenceData]);

  const filteredRules = category ? getRulesByCategory(category) : rules;
  
  // Handle both string[] and RoomRule[] inputs
  const selectedRuleIds = Array.isArray(selectedRules)
    ? selectedRules
        .filter(item => item != null)
        .map(item =>
          typeof item === 'string' ? item : item?.systemRuleId
        )
        .filter(id => id != null && id !== '')
    : [];

  const selectedRuleObjects = Array.isArray(selectedRules)
    ? selectedRules.filter(item =>
        item != null && typeof item !== 'string'
      ) as RoomRule[]
    : [];

  const handleRuleToggle = (ruleId: string) => {
    const isCurrentlySelected = selectedRuleIds.includes(ruleId);
    
    if (isCurrentlySelected) {
      // Remove the rule
      const newSelection = selectedRuleObjects.filter(rule => rule.systemRuleId !== ruleId);
      onSelectionChange(newSelection);
    } else {
      // Add the rule with default enforcement
      const newRule: RoomRule = {
        systemRuleId: ruleId,
        isEnforced: true,
        notes: ''
      };
      const newSelection = [...selectedRuleObjects, newRule];
      onSelectionChange(newSelection);
    }
  };

  const handleEnforcementToggle = (ruleId: string, isEnforced: boolean) => {
    const newSelection = selectedRuleObjects.map(rule => 
      rule.systemRuleId === ruleId ? { ...rule, isEnforced } : rule
    );
    onSelectionChange(newSelection);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="w-32 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="w-10 h-6 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredRules.map((rule) => {
          const isSelected = selectedRuleIds.includes(rule.id);
          const selectedRule = selectedRuleObjects.find(r => r.systemRuleId === rule.id);
          const isEnforced = selectedRule?.isEnforced ?? true;
          
          return (
            <div
              key={rule.id}
              className={`
                border rounded-lg p-4 transition-all cursor-pointer
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => handleRuleToggle(rule.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Selection indicator */}
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                    }
                  `}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  
                  {/* Rule content */}
                  <div className="flex-1">
                    <p className={`text-sm font-medium leading-tight ${
                      isSelected ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {rule.name}
                    </p>
                    {rule.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {rule.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Enforcement toggle */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isEnforced ? (
                        <ShieldCheck className="w-4 h-4 text-red-500" />
                      ) : (
                        <Shield className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-xs font-medium">
                        {isEnforced ? 'Bắt buộc' : 'Khuyến khích'}
                      </span>
                    </div>
                    <Switch
                      checked={isEnforced}
                      onCheckedChange={(checked) => handleEnforcementToggle(rule.id, checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {filteredRules.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 py-8">
          Không có quy định nào để hiển thị
        </div>
      )}
    </div>
  );
}
