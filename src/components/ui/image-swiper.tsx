"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
// import { getOptimizedImageUrl } from '@/lib/utils'
import { PhotoProvider, PhotoView } from 'react-photo-view'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'
import 'swiper/css/free-mode'
import 'react-photo-view/dist/react-photo-view.css'

interface ImageSwiperProps {
  images: string[] | { url: string }[]
  title?: string
  className?: string
  height?: string
  showThumbs?: boolean
  isHot?: boolean
  isVerified?: boolean
  imageContext?: 'listing' | 'detail' | 'thumbnail' | 'gallery'
}

export function ImageSwiper({
  images,
  title = "Image",
  className = "",
  height = "h-96",
  showThumbs = true,
  isHot = false,
  isVerified = false,
  imageContext = 'gallery'
}: ImageSwiperProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})

  // Normalize images to string array
  const normalizedImages = images.map(img =>
    typeof img === 'string' ? img : img.url
  ).filter(img => img && img.trim() !== "")

  // Don't render anything if no images
  if (normalizedImages.length === 0) {
    return null
  }

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
  }

  const objectFitClass = imageContext === 'detail' ? 'object-contain' : 'object-cover'

  const MainSwiper = (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Main Swiper */}
      <div className={`relative ${height}`}>
        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          className="h-full"
          spaceBetween={0}
          slidesPerView={1}
        >
          {normalizedImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full bg-black">
                {imageContext === 'detail' ? (
                  <PhotoView src={image || "/images/error-image.jpg"}>
                    <Image
                      src={imageErrors[index] ? "/images/error-image.jpg" : (image || "/images/error-image.jpg")}
                      alt={`${title} ${index + 1}`}
                      fill
                      className={objectFitClass}
                      onError={() => handleImageError(index)}
                      unoptimized={!imageErrors[index] && image?.includes('pt123.cdn.static123.com')}
                    />
                  </PhotoView>
                ) : (
                  <Image
                    src={imageErrors[index] ? "/images/error-image.jpg" : (image || "/images/error-image.jpg")}
                    alt={`${title} ${index + 1}`}
                    fill
                    className={objectFitClass}
                    onError={() => handleImageError(index)}
                    unoptimized={!imageErrors[index] && image?.includes('pt123.cdn.static123.com')}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        {normalizedImages.length > 1 && (
          <>
            <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </>
        )}

        {/* Badges */}
        {isHot && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded">
              HOT
            </span>
          </div>
        )}
        {isVerified && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded">
              ĐÃ XÁC MINH
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Swiper */}
      {showThumbs && normalizedImages.length > 1 && (
        <div className="p-4">
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[FreeMode, Thumbs]}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress={true}
            className="thumbs-swiper"
          >
            {normalizedImages.map((image, index) => (
              <SwiperSlide key={index} className="!w-20 !h-20">
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-colors">
                  <Image
                    src={imageErrors[index] ? "/images/error-image.jpg" : (image || "/images/error-image.jpg")}
                    alt={`${title} thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    onError={() => handleImageError(index)}
                    unoptimized={!imageErrors[index] && image?.includes('pt123.cdn.static123.com')}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  )

  if (imageContext === 'detail') {
    return (
      <PhotoProvider>
        {MainSwiper}
      </PhotoProvider>
    )
  }

  return MainSwiper
}
