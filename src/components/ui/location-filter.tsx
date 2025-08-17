"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocationStore } from '@/stores/locationStore';

interface LocationFilterProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  className?: string;
}

export function LocationFilter({
  selectedLocation,
  onLocationChange,
  className = ''
}: LocationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'select'>('search');
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Location store
  const {
    provinces,
    loadProvinces,
    loadDistrictsByProvince,
    getDistrictsByProvinceId,
    getProvinceById,
    getDistrictById,
    provincesLoading,
    districtsLoading
  } = useLocationStore();

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, [loadProvinces]);

  // Load districts when province is selected
  useEffect(() => {
    if (selectedProvince) {
      loadDistrictsByProvince(selectedProvince);
    }
  }, [selectedProvince, loadDistrictsByProvince]);

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

  const handleSearchSubmit = () => {
    if (searchAddress.trim()) {
      onLocationChange(searchAddress.trim());
      setIsOpen(false);
    }
  };

  const handleSelectSubmit = () => {
    if (selectedProvince && selectedDistrict) {
      const province = getProvinceById(selectedProvince);
      const district = getDistrictById(selectedDistrict);
      if (province && district) {
        onLocationChange(`${district.name}, ${province.name}`);
        setIsOpen(false);
      }
    }
  };

  const handleReset = () => {
    setSearchAddress('');
    setSelectedProvince(null);
    setSelectedDistrict(null);
    onLocationChange('');
  };

  const availableDistricts = selectedProvince ? getDistrictsByProvinceId(selectedProvince) : [];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 bg-white  rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[120px] text-left"
      >
        <span className="text-sm text-gray-700 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Địa chỉ
          {selectedLocation && (
            <span className="ml-1 text-green-600 font-medium">(1)</span>
          )}
        </span>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Tìm kiếm theo vị trí
              </button>
              <button
                onClick={() => setActiveTab('select')}
                className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'select'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MapPin className="h-4 w-4 inline mr-2" />
                Chọn khu vực
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'search' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ hoặc tên địa điểm
                  </label>
                  <Input
                    type="text"
                    placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bán kính tìm kiếm
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="5">5 km - Khu vực rộng</option>
                    <option value="3">3 km - Khu vực vừa</option>
                    <option value="1">1 km - Khu vực gần</option>
                  </select>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={handleReset} size="sm">
                    Đặt lại
                  </Button>
                  <Button onClick={handleSearchSubmit} size="sm" className="bg-blue-500 hover:bg-blue-600">
                    Tìm ngay
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    value={selectedProvince || ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      setSelectedProvince(value);
                      setSelectedDistrict(null); // Reset district when province changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={provincesLoading}
                  >
                    <option value="">
                      {provincesLoading ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProvince && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện
                    </label>
                    <select
                      value={selectedDistrict || ''}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : null;
                        setSelectedDistrict(value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={districtsLoading[selectedProvince]}
                    >
                      <option value="">
                        {districtsLoading[selectedProvince] ? 'Đang tải...' : 'Chọn quận/huyện'}
                      </option>
                      {availableDistricts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={handleReset} size="sm">
                    Đặt lại
                  </Button>
                  <Button 
                    onClick={handleSelectSubmit} 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600"
                    disabled={!selectedProvince || !selectedDistrict}
                  >
                    Tìm ngay
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
