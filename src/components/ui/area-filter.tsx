"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Ruler } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface AreaFilterProps {
  selectedAreas: string[];
  onSelectionChange: (areas: string[]) => void;
  className?: string;
}

const areaOptions = [
  { value: '0-20', label: 'Dưới 20m²' },
  { value: '20-30', label: '20-30m²' },
  { value: '30-50', label: '30-50m²' },
  { value: '50-999', label: 'Trên 50m²' },
];

export function AreaFilter({
  selectedAreas,
  onSelectionChange,
  className = ''
}: AreaFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAreaToggle = (value: string, checked: boolean) => {
    if (checked) {
      // Only allow one area selection at a time
      onSelectionChange([value]);
    } else {
      onSelectionChange([]);
    }
  };

  const selectedCount = selectedAreas.length;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 bg-whiterounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[120px] text-left"
      >
        <span className="text-sm text-gray-700 flex items-center">
          <Ruler className="h-4 w-4 mr-2" />
          {selectedCount > 0 ? (
            <span className="text-green-600 font-medium">
              {areaOptions.find(opt => opt.value === selectedAreas[0])?.label || 'Diện tích'}
            </span>
          ) : (
            'Diện tích'
          )}
        </span>
        <ChevronDown className={`h-4 w-4 ml-2 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-3">
            <div className="text-sm font-medium text-gray-900 mb-3">Chọn diện tích</div>
            
            <div className="space-y-2">
              {areaOptions.map((option) => {
                const isChecked = selectedAreas.includes(option.value);

                return (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => handleAreaToggle(option.value, !isChecked)}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleAreaToggle(option.value, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="border-2 border-gray-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">
                      {option.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected Count Footer */}
            {selectedCount > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Đã chọn {selectedCount} khoảng diện tích
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
