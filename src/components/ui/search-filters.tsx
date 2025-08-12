"use client";

import { useState } from 'react';
import { AmenityFilter } from '@/components/ui/amenity-filter';
import { PriceFilter } from '@/components/ui/price-filter';
import { LocationFilter } from '@/components/ui/location-filter';
import { AreaFilter } from '@/components/ui/area-filter';
import { SearchInputWithFilters } from '@/components/ui/search-input-with-filters';



interface SearchFiltersProps {
  className?: string;
}

export function SearchFilters({ className = '' }: SearchFiltersProps) {
  // State for all filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);

  const handleSearch = () => {
    console.log('Search:', { searchQuery, locationFilter, priceFilter, areaFilter, amenityFilter });
  };

  const handleRemoveFilter = (type: string, value: string) => {
    switch (type) {
      case 'amenity':
        setAmenityFilter(prev => prev.filter(id => id !== value));
        break;
      case 'price':
        setPriceFilter(prev => prev.filter(id => id !== value));
        break;
      case 'location':
        setLocationFilter('');
        break;
      case 'area':
        setAreaFilter(prev => prev.filter(id => id !== value));
        break;
    }
  };



  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input with Selected Filters */}
      <SearchInputWithFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        selectedAmenities={amenityFilter}
        selectedPrices={priceFilter}
        selectedLocation={locationFilter}
        selectedAreas={areaFilter}
        onRemoveFilter={handleRemoveFilter}
      />

      {/* Filter Buttons */}
      <div className="flex items-center space-x-3 flex-wrap">
        <LocationFilter
          selectedLocation={locationFilter}
          onLocationChange={setLocationFilter}
        />

        <AreaFilter
          selectedAreas={areaFilter}
          onSelectionChange={setAreaFilter}
        />

        <PriceFilter
          selectedPrices={priceFilter}
          onSelectionChange={setPriceFilter}
        />

        <AmenityFilter
          selectedAmenities={amenityFilter}
          onSelectionChange={setAmenityFilter}
        />
      </div>
    </div>
  );
}
