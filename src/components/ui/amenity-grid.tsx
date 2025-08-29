"use client";

import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useReferenceStore } from '@/stores/referenceStore';
import { getAmenityIcon } from '@/utils/icon-mapping';

interface RoomAmenity {
  systemAmenityId: string;
  customValue?: string;
  notes?: string;
}

interface AmenityGridProps {
  selectedAmenities: string[] | RoomAmenity[];
  onSelectionChange: (amenityIds: string[] | RoomAmenity[]) => void;
  category?: string;
  className?: string;
}

export function AmenityGrid({
  selectedAmenities,
  onSelectionChange,
  category,
  className = ''
}: AmenityGridProps) {
  const { amenities, getAmenitiesByCategory, loadReferenceData, isLoading } = useReferenceStore();

  // Load reference data if not loaded
  useEffect(() => {
    if (amenities.length === 0) {
      loadReferenceData();
    }
  }, [amenities.length, loadReferenceData]);

  const filteredAmenities = category ? getAmenitiesByCategory(category) : amenities;
  
  // Handle both string[] and RoomAmenity[] inputs
  const selectedAmenityIds = Array.isArray(selectedAmenities) 
    ? selectedAmenities.map(item => 
        typeof item === 'string' ? item : item.systemAmenityId
      )
    : [];

  const handleAmenityToggle = (amenityId: string) => {
    const isCurrentlySelected = selectedAmenityIds.includes(amenityId);
    
    if (isCurrentlySelected) {
      // Remove the amenity
      const newSelection = selectedAmenityIds.filter(id => id !== amenityId);
      onSelectionChange(newSelection);
    } else {
      // Add the amenity
      const newSelection = [...selectedAmenityIds, amenityId];
      onSelectionChange(newSelection);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
              <div className="w-6 h-6 bg-gray-300 rounded mb-2"></div>
              <div className="w-16 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 ${className}`}>
      {filteredAmenities.map((amenity) => {
        const IconComponent = getAmenityIcon(amenity.name);
        const isSelected = selectedAmenityIds.includes(amenity.id);
        
        return (
          <div
            key={amenity.id}
            onClick={() => handleAmenityToggle(amenity.id)}
            className={`
              relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all
              ${isSelected 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            
            {/* Icon */}
            <IconComponent className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
            
            {/* Name */}
            <span className={`text-sm text-center font-medium leading-tight ${
              isSelected ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {amenity.name}
            </span>
          </div>
        );
      })}
      
      {filteredAmenities.length === 0 && !isLoading && (
        <div className="col-span-full text-center text-gray-500 py-8">
          Không có tiện nghi nào để hiển thị
        </div>
      )}
    </div>
  );
}
