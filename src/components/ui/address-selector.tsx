"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocationStore } from '@/stores/locationStore';
import { Province, District, Ward } from '@/types/types';

export interface AddressData {
  street: string;
  ward: Ward | null;
  district: District | null;
  province: Province | null;
}

interface AddressSelectorProps {
  value?: AddressData;
  onChange?: (address: AddressData) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  showStreetInput?: boolean;
}

export function AddressSelector({
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  showStreetInput = true
}: AddressSelectorProps) {
  const [selectedProvince, setSelectedProvince] = useState<number | null>(value?.province?.id || null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(value?.district?.id || null);
  const [selectedWard, setSelectedWard] = useState<number | null>(value?.ward?.id || null);
  const [street, setStreet] = useState(value?.street || '');

  // Location store
  const {
    provinces,
    loadProvinces,
    loadDistrictsByProvince,
    loadWardsByDistrict,
    getDistrictsByProvinceId,
    getWardsByDistrictId,
    getProvinceById,
    getDistrictById,
    getWardById,
    provincesLoading,
    districtsLoading,
    wardsLoading
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

  // Load wards when district is selected
  useEffect(() => {
    if (selectedDistrict) {
      loadWardsByDistrict(selectedDistrict);
    }
  }, [selectedDistrict, loadWardsByDistrict]);

  // Update parent when any field changes
  useEffect(() => {
    const province = selectedProvince ? getProvinceById(selectedProvince) : null;
    const district = selectedDistrict ? getDistrictById(selectedDistrict) : null;
    const ward = selectedWard ? getWardById(selectedWard) : null;

    const addressData: AddressData = {
      street,
      ward: ward || null,
      district: district || null,
      province: province || null
    };

    onChange?.(addressData);
  }, [selectedProvince, selectedDistrict, selectedWard, street, getProvinceById, getDistrictById, getWardById, onChange]);

  const handleProvinceChange = (provinceId: number | null) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    setSelectedWard(null);
  };

  const handleDistrictChange = (districtId: number | null) => {
    setSelectedDistrict(districtId);
    setSelectedWard(null);
  };

  const availableDistricts = selectedProvince ? getDistrictsByProvinceId(selectedProvince) : [];
  const availableWards = selectedDistrict ? getWardsByDistrictId(selectedDistrict) : [];

  return (
    <div className={`space-y-4 ${className}`}>
      {showStreetInput && (
        <div>
          <Label htmlFor="street" className="text-sm font-medium">
            Địa chỉ cụ thể {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="street"
            type="text"
            placeholder="Số nhà, tên đường..."
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            disabled={disabled}
            className="mt-1"
          />
        </div>
      )}

      <div>
        <Label htmlFor="province" className="text-sm font-medium">
          Tỉnh/Thành phố {required && <span className="text-red-500">*</span>}
        </Label>
        <select
          id="province"
          value={selectedProvince || ''}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : null;
            handleProvinceChange(value);
          }}
          disabled={disabled || provincesLoading}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
          <Label htmlFor="district" className="text-sm font-medium">
            Quận/Huyện {required && <span className="text-red-500">*</span>}
          </Label>
          <select
            id="district"
            value={selectedDistrict || ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              handleDistrictChange(value);
            }}
            disabled={disabled || districtsLoading[selectedProvince]}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

      {selectedDistrict && (
        <div>
          <Label htmlFor="ward" className="text-sm font-medium">
            Phường/Xã {required && <span className="text-red-500">*</span>}
          </Label>
          <select
            id="ward"
            value={selectedWard || ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              setSelectedWard(value);
            }}
            disabled={disabled || wardsLoading[selectedDistrict]}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {wardsLoading[selectedDistrict] ? 'Đang tải...' : 'Chọn phường/xã'}
            </option>
            {availableWards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to format address data into a readable string
 */
export const formatAddress = (address: AddressData): string => {
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.ward) parts.push(address.ward.name);
  if (address.district) parts.push(address.district.name);
  if (address.province) parts.push(address.province.name);
  
  return parts.join(', ');
};

/**
 * Helper function to check if address is complete
 */
export const isAddressComplete = (address: AddressData, requireStreet = true): boolean => {
  if (requireStreet && !address.street?.trim()) return false;
  return !!(address.province && address.district && address.ward);
};
