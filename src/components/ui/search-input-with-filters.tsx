"use client";

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useReferenceStore } from '@/stores/referenceStore';

interface SelectedFilter {
  id: string;
  label: string;
  type: 'amenity' | 'price' | 'location' | 'area';
}

interface SearchInputWithFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  selectedAmenities?: string[];
  selectedPrices?: string[];
  selectedLocation?: string;
  selectedAreas?: string[];
  onRemoveFilter?: (type: string, value: string) => void;
  className?: string;
}

export function SearchInputWithFilters({
  searchQuery,
  onSearchChange,
  onSearch,
  selectedAmenities = [],
  selectedPrices = [],
  selectedLocation = '',
  selectedAreas = [],
  onRemoveFilter,
  className = ''
}: SearchInputWithFiltersProps) {
  const { amenities } = useReferenceStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Create list of selected filters for display
  const getSelectedFilters = (): SelectedFilter[] => {
    const filters: SelectedFilter[] = [];

    // Add amenities
    selectedAmenities.forEach(amenityId => {
      const amenity = amenities.find(a => a.id === amenityId);
      if (amenity) {
        filters.push({
          id: amenityId,
          label: amenity.name,
          type: 'amenity'
        });
      }
    });

    // Add prices
    selectedPrices.forEach(price => {
      const priceLabels: Record<string, string> = {
        '0-2000000': 'Dưới 2 triệu',
        '2000000-5000000': '2-5 triệu',
        '5000000-8000000': '5-8 triệu',
        '8000000-15000000': '8-15 triệu',
        '15000000-999999999': 'Trên 15 triệu',
      };
      
      filters.push({
        id: price,
        label: priceLabels[price] || price,
        type: 'price'
      });
    });

    // Add location
    if (selectedLocation) {
      filters.push({
        id: 'location',
        label: selectedLocation,
        type: 'location'
      });
    }

    // Add areas
    selectedAreas.forEach(area => {
      const areaLabels: Record<string, string> = {
        '0-20': 'Dưới 20m²',
        '20-30': '20-30m²',
        '30-50': '30-50m²',
        '50-999': 'Trên 50m²',
      };
      
      filters.push({
        id: area,
        label: areaLabels[area] || area,
        type: 'area'
      });
    });

    return filters;
  };

  const selectedFilters = getSelectedFilters();
 // const displayFilters = isExpanded ? selectedFilters : selectedFilters.slice(0, 2);
  const remainingCount = selectedFilters.length - 2;

  const handleRemoveFilter = (filter: SelectedFilter) => {
    if (onRemoveFilter) {
      if (filter.type === 'location') {
        onRemoveFilter('location', '');
      } else {
        onRemoveFilter(filter.type, filter.id);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
        
        <Input
          type="text"
          placeholder={
            selectedFilters.length > 0 && !isFocused && !isExpanded
              ? ""
              : "Bạn muốn tìm trọ ở đâu?"
          }
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          onFocus={() => {
            setIsFocused(true);
            setIsExpanded(false); // Collapse when focusing
          }}
          onBlur={() => setIsFocused(false)}
          className={`w-full h-12 pb-4 bg-white border-gray-200 focus:border-green-500 transition-all duration-200 pl-10 pr-4`}
          style={{
            paddingTop: selectedFilters.length > 0 && !isFocused ? '32px' : '12px'
          }}
        />

        {/* Selected Filters Display Inside Input */}
        {selectedFilters.length > 0 && (
          <div className={`absolute left-10 right-4 top-2 h-6 flex flex-wrap gap-1 items-center ${
            isFocused ? 'opacity-50' : ''
          }`}>
            {selectedFilters.slice(0, 2).map((filter) => (
              <Badge
                key={`${filter.type}-${filter.id}`}
                variant="secondary"
                className="text-xs bg-green-100 text-green-700 border-green-200 flex items-center gap-1 max-w-[140px] h-6"
              >
                <span className="truncate">{filter.label}</span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFilter(filter);
                  }}
                />
              </Badge>
            ))}

            {remainingCount > 0 && (
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200 h-6 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? 'Thu gọn' : `+${remainingCount}`}
              </Badge>
            )}
          </div>
        )}

        {/* Expanded filters dropdown */}
        {selectedFilters.length > 2 && isExpanded && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map((filter) => (
                <Badge
                  key={`${filter.type}-${filter.id}-expanded`}
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-700 border-green-200 flex items-center gap-1 max-w-[140px] h-6"
                >
                  <span className="truncate">{filter.label}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFilter(filter);
                    }}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
