'use client'

import { Card } from "@/components/ui/card"
import { MonthYearSelector } from "@/components/dashboard/MonthYearSelector"
import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function OccupancyChart() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  // Mock data cho tháng được chọn (data theo ngày trong tháng)
  const chartData = [
    { day: '01', rate: 75.5, occupied: 34 },
    { day: '05', rate: 77.8, occupied: 35 },
    { day: '10', rate: 82.2, occupied: 37 },
    { day: '15', rate: 84.4, occupied: 38 },
    { day: '20', rate: 86.7, occupied: 39 },
    { day: '25', rate: 88.9, occupied: 40 },
    { day: '30', rate: 91.1, occupied: 41 },
  ]

  const averageRate = (chartData.reduce((sum, item) => sum + item.rate, 0) / chartData.length).toFixed(1)
  const totalRooms = 45
  const currentOccupied = chartData[chartData.length - 1].occupied

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tỷ lệ lấp đầy</h3>
          <p className="text-sm text-gray-500">Theo dõi xu hướng cho thuê</p>
        </div>
        <MonthYearSelector
          month={month}
          year={year}
          onChange={(m, y) => {
            setMonth(m)
            setYear(y)
          }}
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-purple-50 rounded p-3">
          <p className="text-xs text-purple-600">TB lấp đầy</p>
          <p className="text-lg font-bold text-purple-900">{averageRate}%</p>
        </div>
        <div className="bg-blue-50 rounded p-3">
          <p className="text-xs text-blue-600">Đã thuê</p>
          <p className="text-lg font-bold text-blue-900">{currentOccupied}/{totalRooms}</p>
        </div>
        <div className="bg-green-50 rounded p-3">
          <p className="text-xs text-green-600">Còn trống</p>
          <p className="text-lg font-bold text-green-900">{totalRooms - currentOccupied}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            label={{ value: 'Ngày', position: 'insideBottom', offset: -5, style: { fontSize: 12 } }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            domain={[0, 100]}
            label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'rate') return `${value.toFixed(1)}%`
              return `${value} phòng`
            }}
            labelFormatter={(label) => `Ngày ${label}`}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#8b5cf6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRate)"
            name="Tỷ lệ lấp đầy"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
