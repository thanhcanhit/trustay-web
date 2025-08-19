"use client";

import { useState, useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface PriceFilterProps {
  selectedPrices: string[];
  onSelectionChange: (prices: string[]) => void;
  className?: string;
}

const priceOptions = [
  { value: '0-2000000', label: 'Dưới 2 triệu' },
  { value: '2000000-5000000', label: '2-5 triệu' },
  { value: '5000000-8000000', label: '5-8 triệu' },
  { value: '8000000-15000000', label: '8-15 triệu' },
  { value: '15000000-999999999', label: 'Trên 15 triệu' },
];

export function PriceFilter({
  selectedPrices,
  onSelectionChange,
  className = ''
}: PriceFilterProps) {
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

  const handlePriceToggle = (value: string, checked: boolean) => {
    if (checked) {
      // Only allow one price selection at a time
      onSelectionChange([value]);
    } else {
      onSelectionChange([]);
    }
  };

  const selectedCount = selectedPrices.length;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 bg-whiterounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[120px] text-left"
      >
        <span className="text-sm text-gray-700 flex items-center">
          <span className="mr-2">💰</span>
          {selectedCount > 0 ? (
            <span className="text-green-600 font-medium">
              {priceOptions.find(opt => opt.value === selectedPrices[0])?.label || 'Giá cả'}
            </span>
          ) : (
            'Giá cả'
          )}
        </span>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-3">
            <div className="text-sm font-medium text-gray-900 mb-3">Chọn khoảng giá</div>
            
            <div className="space-y-2">
              {priceOptions.map((option) => {
                const isChecked = selectedPrices.includes(option.value);

                return (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => handlePriceToggle(option.value, !isChecked)}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handlePriceToggle(option.value, checked as boolean)
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
                  Đã chọn {selectedCount} khoảng giá
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
