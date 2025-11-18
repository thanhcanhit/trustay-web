'use client'

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { NewChartResponseDto } from "@/types/types"

interface RevenueTrendChartProps {
  data: NewChartResponseDto | null
  isLoading?: boolean
}

export function RevenueTrendChart({ data, isLoading }: RevenueTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }

  if (!data || !data.dataset || data.dataset.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {data?.title || 'Xu hướng doanh thu'}
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Không có dữ liệu</p>
        </div>
      </Card>
    )
  }

  // Transform new API format to Recharts format
  // Combine all datasets into single chart data with dynamic keys
  const allDates = new Set<string>()
  data.dataset.forEach(ds => {
    ds.points.forEach(point => allDates.add(point.x))
  })

  const sortedDates = Array.from(allDates).sort()

  const chartData = sortedDates.map(date => {
    const dataPoint: Record<string, string | number> = { date }
    data.dataset.forEach(ds => {
      const point = ds.points.find(p => p.x === date)
      dataPoint[ds.label] = point ? point.y / 1000000 : 0 // Convert to millions
    })
    return dataPoint
  })

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
        <p className="text-sm text-gray-500">Đơn vị: Triệu VNĐ</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            tickFormatter={(value) => {
              // Format date to show only day-month
              const date = new Date(value)
              return `${date.getDate()}/${date.getMonth() + 1}`
            }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            tickFormatter={(value) => `${value.toFixed(1)}M`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => `${value.toFixed(2)}M VNĐ`}
            labelFormatter={(label) => {
              const date = new Date(label)
              return date.toLocaleDateString('vi-VN')
            }}
          />
          <Legend />
          {data.dataset.map((ds, index) => (
            <Line
              key={ds.label}
              type="monotone"
              dataKey={ds.label}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[index % colors.length], r: 4 }}
              activeDot={{ r: 6 }}
              name={ds.label}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
