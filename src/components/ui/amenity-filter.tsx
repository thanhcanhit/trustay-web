"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useReferenceStore } from '@/stores/referenceStore';
import { getAmenityIcon } from '@/utils/icon-mapping';

interface AmenityFilterProps {
  selectedAmenities: string[];
  onSelectionChange: (amenityIds: string[]) => void;
  className?: string;
}

export function AmenityFilter({
  selectedAmenities,
  onSelectionChange,
  className = ''
}: AmenityFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { amenities, loadReferenceData, isLoading } = useReferenceStore();

  // Load amenities data if not loaded
  useEffect(() => {
    if (amenities.length === 0) {
      loadReferenceData();
    }
  }, [amenities.length, loadReferenceData]);

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

  const handleAmenityToggle = (amenityId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedAmenities, amenityId]);
    } else {
      onSelectionChange(selectedAmenities.filter(id => id !== amenityId));
    }
  };

  const selectedCount = selectedAmenities.length;

  // Group amenities by category with ordered categories
  const groupAmenitiesByCategory = () => {
    const categoryOrder = ['basic', 'kitchen', 'bathroom', 'entertainment', 'safety', 'connectivity', 'building'];
    const grouped: Record<string, typeof amenities> = {};

    // Initialize categories in order
    categoryOrder.forEach(category => {
      grouped[category] = [];
    });

    // Group amenities
    amenities.forEach(amenity => {
      if (!grouped[amenity.category]) {
        grouped[amenity.category] = [];
      }
      grouped[amenity.category].push(amenity);
    });

    // Return only categories that have amenities, in order
    const result: Record<string, typeof amenities> = {};
    categoryOrder.forEach(category => {
      if (grouped[category] && grouped[category].length > 0) {
        result[category] = grouped[category];
      }
    });

    // Add any remaining categories not in the predefined order
    Object.keys(grouped).forEach(category => {
      if (!categoryOrder.includes(category) && grouped[category].length > 0) {
        result[category] = grouped[category];
      }
    });

    return result;
  };

  // Get category label in Vietnamese with icon
  const getCategoryLabel = (category: string): string => {
    const categoryLabels: Record<string, string> = {
      basic: '🏠 Cơ bản',
      kitchen: '🍳 Nhà bếp',
      bathroom: '🚿 Phòng tắm',
      entertainment: '📺 Giải trí',
      safety: '🔒 An toàn',
      connectivity: '📶 Kết nối',
      building: '🏢 Tòa nhà'
    };
    return categoryLabels[category] || category;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[120px] text-left"
      >
        <span className="text-sm text-gray-700 flex items-center">
          <span className="mr-2">🏠</span>
          Tiện ích
          {selectedCount > 0 && (
            <span className="ml-1 text-green-600 font-medium">({selectedCount})</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 ml-2 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full -right-50 mt-1 max-w-[600px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          <div className="p-3">
            <div className="text-sm font-medium text-gray-900 mb-3">Chọn tiện ích</div>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Đang tải...</div>
              </div>
            ) : (
              <div className="space-y-4 flex flex-row">
                {/* Group amenities by category */}
                {Object.entries(groupAmenitiesByCategory()).map(([category, categoryAmenities], index) => (
                  <div key={category}>
                    {index >= 0 && <div className="border-t border-gray-100 my-3"></div>}
                    <div className="text-sm font-medium text-gray-700 mb-2 px-2 py-1 bg-gray-50 rounded-md">
                      {getCategoryLabel(category)}
                    </div>
                    <div className="space-y-1">
                      {categoryAmenities.map((amenity) => {
                        const isChecked = selectedAmenities.includes(amenity.id);
                        const IconComponent = getAmenityIcon(amenity.name);

                        return (
                          <div
                            key={amenity.id}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            onClick={() => handleAmenityToggle(amenity.id, !isChecked)}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleAmenityToggle(amenity.id, checked as boolean)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="border-2 border-gray-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            />
                            <IconComponent className="h-4 w-4 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-700 block truncate">
                                {amenity.name}
                              </span>
                              {amenity.description && (
                                <span className="text-xs text-gray-500 block truncate">
                                  {amenity.description}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Count Footer */}
            {selectedCount > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Đã chọn {selectedCount} tiện ích
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
