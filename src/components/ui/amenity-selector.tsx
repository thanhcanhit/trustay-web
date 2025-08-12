"use client";

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useReferenceStore } from '@/stores/referenceStore';
import { getAmenityIcon } from '@/utils/icon-mapping';

interface AmenitySelectorProps {
  selectedAmenities: string[];
  onSelectionChange: (amenityIds: string[]) => void;
  category?: string;
  mode?: 'select' | 'display';
  className?: string;
}

export function AmenitySelector({
  selectedAmenities,
  onSelectionChange,
  category,
  mode = 'select',
  className = ''
}: AmenitySelectorProps) {
  const { amenities, getAmenitiesByCategory, loadReferenceData, isLoading } = useReferenceStore();
  const [isOpen, setIsOpen] = useState(false);

  // Load reference data if not loaded
  useEffect(() => {
    if (amenities.length === 0) {
      loadReferenceData();
    }
  }, [amenities.length, loadReferenceData]);

  const filteredAmenities = category ? getAmenitiesByCategory(category) : amenities;
  const selectedAmenityObjects = filteredAmenities.filter(amenity => 
    selectedAmenities.includes(amenity.id)
  );

  const handleAmenityToggle = (amenityId: string) => {
    const newSelection = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId];
    
    onSelectionChange(newSelection);
  };

  const removeAmenity = (amenityId: string) => {
    onSelectionChange(selectedAmenities.filter(id => id !== amenityId));
  };

  // Display mode - just show selected amenities
  if (mode === 'display') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {selectedAmenityObjects.map((amenity) => {
          const IconComponent = getAmenityIcon(amenity.name);
          return (
            <div key={amenity.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <IconComponent className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">{amenity.name}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Select mode - interactive selector
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected amenities display */}
      {selectedAmenities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAmenityObjects.map((amenity) => {
            const IconComponent = getAmenityIcon(amenity.name);
            return (
              <Badge key={amenity.id} variant="secondary" className="flex items-center gap-2">
                <IconComponent className="h-3 w-3" />
                <span>{amenity.name}</span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeAmenity(amenity.id)}
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
            {selectedAmenities.length > 0 
              ? `Đã chọn ${selectedAmenities.length} tiện ích`
              : 'Chọn tiện ích'
            }
          </span>
          <Check className="h-4 w-4" />
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              {filteredAmenities.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  {isLoading ? 'Đang tải...' : 'Không có tiện ích nào'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAmenities.map((amenity) => {
                    const IconComponent = getAmenityIcon(amenity.name);
                    const isSelected = selectedAmenities.includes(amenity.id);
                    
                    return (
                      <div
                        key={amenity.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleAmenityToggle(amenity.id)}
                      >
                        <Checkbox checked={isSelected} />
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <span className="text-sm flex-1">{amenity.name}</span>
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
