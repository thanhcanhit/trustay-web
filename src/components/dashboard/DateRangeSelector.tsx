'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useState } from "react"

export type DateRange = '3months' | '6months' | '1year' | 'all'

interface DateRangeSelectorProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const options: { label: string; value: DateRange }[] = [
    { label: '3 tháng', value: '3months' },
    { label: '6 tháng', value: '6months' },
    { label: '1 năm', value: '1year' },
    { label: 'Tất cả', value: 'all' },
  ]

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <div className="flex gap-1">
        {options.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={value === option.value ? "default" : "outline"}
            onClick={() => onChange(option.value)}
            className="text-xs h-7 px-3"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
