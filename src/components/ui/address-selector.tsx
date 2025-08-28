"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      {/* Row 1: Province and District */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="province" className="text-sm font-medium">
            Tỉnh/Thành phố {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={selectedProvince?.toString() || ''}
            onValueChange={(value) => {
              const provinceId = value ? Number(value) : null;
              handleProvinceChange(provinceId);
            }}
            disabled={disabled || provincesLoading}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder={provincesLoading ? 'Đang tải...' : 'Chọn tỉnh/thành phố'} />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.id} value={province.id.toString()}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="district" className="text-sm font-medium">
            Quận/Huyện {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={selectedDistrict?.toString() || ''}
            onValueChange={(value) => {
              const districtId = value ? Number(value) : null;
              handleDistrictChange(districtId);
            }}
            // disabled={disabled || !selectedProvince || districtsLoading[selectedProvince]}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder={
                !selectedProvince || districtsLoading[selectedProvince]
                  ? 'Chọn quận/huyện' 
                  : 'Chọn quận/huyện'
              } />
            </SelectTrigger>
            <SelectContent>
              {availableDistricts.map((district) => (
                <SelectItem key={district.id} value={district.id.toString()}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Ward and Street Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ward" className="text-sm font-medium">
            Phường/Xã {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={selectedWard?.toString() || ''}
            onValueChange={(value) => {
              const wardId = value ? Number(value) : null;
              setSelectedWard(wardId);
            }}
            // disabled={disabled || !selectedDistrict || wardsLoading[selectedDistrict]}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder={
                !selectedDistrict || wardsLoading[selectedDistrict]
                  ? 'Chọn phường/xã' 
                  : 'Chọn phường/xã'
              } />
            </SelectTrigger>
            <SelectContent>
              {availableWards.map((ward) => (
                <SelectItem key={ward.id} value={ward.id.toString()}>
                  {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="street" className="text-sm font-medium">
            Địa chỉ chi tiết {required && <span className="text-red-500">*</span>}
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
        </div>
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
