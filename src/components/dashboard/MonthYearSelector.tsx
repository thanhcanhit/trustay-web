'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MonthYearSelectorProps {
  month: number // 1-12
  year: number
  onChange: (month: number, year: number) => void
}

const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]

export function MonthYearSelector({ month, year, onChange }: MonthYearSelectorProps) {
  const handlePrevious = () => {
    if (month === 1) {
      onChange(12, year - 1)
    } else {
      onChange(month - 1, year)
    }
  }

  const handleNext = () => {
    if (month === 12) {
      onChange(1, year + 1)
    } else {
      onChange(month + 1, year)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handlePrevious}
        className="h-7 w-7 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <select
          value={month}
          onChange={(e) => onChange(Number(e.target.value), year)}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MONTHS.map((monthName, index) => (
            <option key={index} value={index + 1}>
              {monthName}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => onChange(month, Number(e.target.value))}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={handleNext}
        className="h-7 w-7 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
