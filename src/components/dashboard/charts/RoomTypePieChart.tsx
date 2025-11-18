'use client'

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { NewChartResponseDto } from "@/types/types"

interface RoomTypePieChartProps {
  data: NewChartResponseDto | null
  isLoading?: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

// Map room type codes to Vietnamese names
const ROOM_TYPE_NAMES: Record<string, string> = {
  'boarding_house': 'Nhà trọ',
  'dormitory': 'Ký túc xá',
  'sleepbox': 'Sleepbox',
  'apartment': 'Căn hộ',
  'whole_house': 'Nguyên căn',
  'mini_apartment': 'Căn hộ mini',
  'dorm': 'Phòng tập thể',
  'shared_house': 'Nhà ở chung'
}

export function RoomTypePieChart({ data, isLoading }: RoomTypePieChartProps) {
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
          {data?.title || 'Phân bố loại phòng'}
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Không có dữ liệu</p>
        </div>
      </Card>
    )
  }

  // Transform new API format to Recharts format
  // Get data from the first dataset (should be "Số lượng phòng")
  const dataset = data.dataset[0]
  if (!dataset || !dataset.points || dataset.points.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{data.title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Không có dữ liệu</p>
        </div>
      </Card>
    )
  }

  const chartData = dataset.points.map(point => ({
    name: ROOM_TYPE_NAMES[point.x] || point.x,
    value: point.y
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
        <p className="text-sm text-gray-500">Tổng: {total} phòng</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value} phòng`, 'Số lượng']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const item = chartData.find(d => d.name === value)
              return `${value} (${item?.value || 0})`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
