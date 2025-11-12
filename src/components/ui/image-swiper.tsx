"use client"

import React, { useState, useEffect } from 'react'
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
  const [validImages, setValidImages] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(true)

  // Normalize images to string array and create stable reference
  const normalizedImages = React.useMemo(() =>
    images.map(img =>
      typeof img === 'string' ? img : img.url
    ).filter(img => img && img.trim() !== ""),
    [images]
  )

  // Validate images sequentially with delay to avoid rate limiting
  useEffect(() => {
    const validateImages = async () => {
      setIsValidating(true)
      const validatedImages: string[] = []

      for (let i = 0; i < normalizedImages.length; i++) {
        const imageUrl = normalizedImages[i]

        try {
          // Add delay between requests to avoid rate limiting (200ms between each check)
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }

          const isValid = await new Promise<boolean>((resolve) => {
            const img = new window.Image()
            img.onload = () => resolve(true)
            img.onerror = () => resolve(false)
            img.src = imageUrl

            // Timeout after 3 seconds
            setTimeout(() => resolve(false), 3000)
          })

          if (isValid) {
            validatedImages.push(imageUrl)
          }
        } catch {
          // Skip invalid images
          continue
        }
      }

      setValidImages(validatedImages)
      setIsValidating(false)
    }

    if (normalizedImages.length > 0) {
      validateImages()
    } else {
      setIsValidating(false)
    }
  }, [normalizedImages])

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${height} ${className}`}>
        <div className="text-gray-400 text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm">Đang tải hình ảnh...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if no valid images
  if (validImages.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${height} ${className}`}>
        <div className="text-gray-400 text-center">
          <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Không có hình ảnh</p>
        </div>
      </div>
    )
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
          {validImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full bg-black">
                {imageContext === 'detail' ? (
                  <PhotoView src={image}>
                    <Image
                      src={image}
                      alt={`${title} ${index + 1}`}
                      fill
                      className={objectFitClass}
                      unoptimized={image?.includes('pt123.cdn.static123.com')}
                      priority={index === 0}
                      loading={index === 0 ? undefined : 'lazy'}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </PhotoView>
                ) : (
                  <Image
                    src={image}
                    alt={`${title} ${index + 1}`}
                    fill
                    className={objectFitClass}
                    unoptimized={image?.includes('pt123.cdn.static123.com')}
                    priority={index === 0}
                    loading={index === 0 ? undefined : 'lazy'}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        {validImages.length > 1 && (
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
      {showThumbs && validImages.length > 1 && (
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
            {validImages.map((image, index) => (
              <SwiperSlide key={index} className="!w-20 !h-20">
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-colors">
                  <Image
                    src={image}
                    alt={`${title} thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    unoptimized={image?.includes('pt123.cdn.static123.com')}
                    loading="lazy"
                    sizes="80px"
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
