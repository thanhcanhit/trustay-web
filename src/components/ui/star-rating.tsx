"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  totalStars?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating = 0,
  totalStars = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }

  const handleMouseEnter = (star: number) => {
    if (interactive) {
      setHoverRating(star)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const handleClick = (star: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(star)
    }
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: totalStars }, (_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= (hoverRating || rating)
        
        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              "transition-colors",
              {
                "fill-yellow-400 text-yellow-400": isFilled,
                "text-gray-300": !isFilled,
                "cursor-pointer hover:text-yellow-400": interactive,
              }
            )}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          />
        )
      })}
    </div>
  )
}

interface StarRatingDisplayProps {
  rating: number
  totalStars?: number
  size?: "sm" | "md" | "lg"
  showRating?: boolean
  className?: string
}

export function StarRatingDisplay({
  rating = 0,
  totalStars = 5,
  size = "md",
  showRating = false,
  className
}: StarRatingDisplayProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <StarRating 
        rating={rating} 
        totalStars={totalStars} 
        size={size} 
        interactive={false} 
      />
      {showRating && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)} / {totalStars}
        </span>
      )}
    </div>
  )
}
