"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  onClick?: (id: string) => void;
  className?: string;
  asLink?: boolean; // Add option to render as link or div
}

export function RoomCard({
  room,
  //onSaveToggle,
  //isSaved = false,
  // onClick,
  className = '',
  asLink = true
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

  // const handleSaveClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (onSaveToggle) {
  //     onSaveToggle(room.id);
  //   }
  // };

  const { electricityCost, waterCost } = getElectricityWaterCost();
  const wifiAvailable = hasWifi();

  const cardClassName = `bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block ${className}`;

  const cardContent = (
    <>
      {/* Image Container */}
      <div className="relative h-32 md:h-40">
        <Image
          src={imageError ? "/images/error-image.jpg" : (room.images?.[0]?.url || "/images/error-image.jpg")}
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
      <div className="p-2 md:p-4">
        <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2 text-sm md:text-base">
          {room.name}
        </h3>
        {/* Location */}
        <div className="flex items-center text-xs md:text-sm text-gray-500 mb-1">
          <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{room.location.districtName}, {room.location.provinceName}</span>
        </div>

        {/* Price */}
        <div className="text-green-600 font-bold text-base md:text-lg mb-1 md:mb-2">
          {formatPrice(room.pricing.basePriceMonthly)}tr/tháng
        </div>

        {/* Room Type & Building */}
        <div className="flex text-xs md:text-sm text-gray-600 mb-1 md:mb-2 gap-1">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {room.maxOccupancy} người
          </span>
          <span className="text-gray-400">•</span>
          <span className="truncate">{getRoomTypeDisplayName(room.roomType)}</span>
        </div>

        {/* Amenities & Costs */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1 md:gap-2">
            {wifiAvailable && (
              <Badge className="bg-green-100 text-green-700 font-bold border border-green-200 px-1 md:px-2">
                <Wifi className="h-3 w-3" />
                <span className="hidden md:inline">Wifi</span>
              </Badge>
            )}
          </div>

          {(electricityCost || waterCost) && (
            <div className='flex flex-col gap-0.5 md:gap-1'>
              {electricityCost && (
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs">{new Intl.NumberFormat('vi-VN').format(parseInt(electricityCost.value))}đ</span>
                </div>
              )}
              {waterCost && (
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-blue-600" />
                  <span className="text-xs">{new Intl.NumberFormat('vi-VN').format(parseInt(waterCost.value))}đ</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (asLink) {
    return (
      <Link href={`/rooms/${room.id}`} className={cardClassName}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardClassName}>
      {cardContent}
    </div>
  );
}
