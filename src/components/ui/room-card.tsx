"use client";

import { useState } from 'react';
import Image from 'next/image';
import { 
  Droplets,
  //Heart, 
  MapPin, 
  Users, 
  Wifi,
  Zap} from 'lucide-react';
import type { RoomListing } from '@/types/types';
import { Badge } from './badge';
// import { getOptimizedImageUrl } from '@/lib/utils';
import { getRoomTypeDisplayName } from '@/utils/room-types';

interface RoomCardProps {
  room: RoomListing;
  onSaveToggle?: (roomId: string) => void;
  isSaved?: boolean;
  onClick?: (slug: string) => void;
  className?: string;
}

export function RoomCard({
  room,
  //onSaveToggle,
  //isSaved = false,
  onClick,
  className = ''
}: RoomCardProps) {
  const [imageError, setImageError] = useState(false);
  const formatPrice = (priceString: string) => {
    const price = parseInt(priceString);
    return new Intl.NumberFormat('vi-VN').format(price / 1000000);
  };

  const getElectricityWaterCost = () => {
    // Add defensive check for costs
    if (!room.costs || !Array.isArray(room.costs)) {
      return { electricityCost: undefined, waterCost: undefined };
    }

    const electricityCost = room.costs.find((cost: RoomListing['costs'][number]) =>
      cost.name.toLowerCase().includes('điện')
    );
    const waterCost = room.costs.find((cost: RoomListing['costs'][number]) =>
      cost.name.toLowerCase().includes('nước')
    );

    return { electricityCost, waterCost };
  };

  const hasWifi = () => {
    // Add defensive check for amenities
    if (!room.amenities || !Array.isArray(room.amenities)) {
      return false;
    }

    return room.amenities.some((amenity: RoomListing['amenities'][number]) =>
      amenity.name.toLowerCase().includes('wifi') ||
      amenity.name.toLowerCase().includes('internet')
    );
  };

  const handleClick = () => {
    if (onClick) {
      onClick(room.slug);
    }
  };

  // const handleSaveClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (onSaveToggle) {
  //     onSaveToggle(room.id);
  //   }
  // };

  const { electricityCost, waterCost } = getElectricityWaterCost();
  const wifiAvailable = hasWifi();

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative h-40">
        <Image
          src={imageError ? "/images/error-image.jpg" : room.images?.[0]?.url}
          alt={room.name || "Room image"}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          unoptimized={!imageError && room.images?.[0]?.url?.includes('pt123.cdn.static123.com')}
        />

        {/* Verified Badge */}
        {room.isVerified && (
          <div className="absolute top-2 left-2">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              ĐÃ XÁC MINH
            </span>
          </div>
        )}
        

        {/* Save Button
        {onSaveToggle && (
          <button
            onClick={handleSaveClick}
            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        )} */}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {room.name}
        </h3>
        {/* Location */}
        <div className="flex items-center text-xsm text-gray-500">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{room.location.districtName}, {room.location.provinceName}</span>
        </div>

        {/* Price */}
        <div className="text-green-600 font-bold text-lg mb-2">
          {formatPrice(room.pricing.basePriceMonthly)}tr/tháng
        </div>

        {/* Room Type & Building */}
        <div className="flex text-xsm text-gray-600 mb-2 gap-1">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {room.maxOccupancy} người
          </span>
          <span className="text-gray-400">•</span>
          {getRoomTypeDisplayName(room.roomType)}
        </div>

        {/* Amenities & Costs */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            {wifiAvailable && (
              <Badge className="bg-green-100 text-green-700 font-bold border border-green-200">
                <Wifi className="h-3 w-3" />
                Wifi
              </Badge>
            )}
          </div>

          {(electricityCost || waterCost) && (
            <div className='flex flex-col gap-1'>
              {electricityCost && (
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-600" />
                  <span>{new Intl.NumberFormat('vi-VN').format(parseInt(electricityCost.value))}đ</span>
                </div>
              )}
              {waterCost && (
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-blue-600" />
                  <span>{new Intl.NumberFormat('vi-VN').format(parseInt(waterCost.value))}đ</span>
                </div>
              )}
            </div>
          )}
        </div>        
      </div>
    </div>
  );
}
