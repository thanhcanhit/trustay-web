'use client'

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { NewChartResponseDto } from "@/types/types"

interface BuildingPerformanceBarChartProps {
  data: NewChartResponseDto | null
  isLoading?: boolean
}

export function BuildingPerformanceBarChart({ data, isLoading }: BuildingPerformanceBarChartProps) {
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
          {data?.title || 'Hiệu suất tòa nhà'}
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Không có dữ liệu</p>
        </div>
      </Card>
    )
  }

  // Transform new API format to Recharts format
  // Get all building names from the first dataset
  const allBuildings = new Set<string>()
  data.dataset.forEach(ds => {
    ds.points.forEach(point => allBuildings.add(point.x))
  })

  const chartData = Array.from(allBuildings).map(buildingName => {
    const dataPoint: any = {
      name: buildingName.length > 20 ? buildingName.substring(0, 20) + '...' : buildingName,
      fullName: buildingName
    }

    data.dataset.forEach(ds => {
      const point = ds.points.find(p => p.x === buildingName)
      if (ds.label.includes('Doanh thu') || ds.label.includes('revenue')) {
        dataPoint.revenue = point ? point.y / 1000000 : 0 // Convert to millions
      } else if (ds.label.includes('lấp đầy') || ds.label.includes('occupancy')) {
        dataPoint.occupancy = point ? point.y : 0
      }
    })

    return dataPoint
  })

  const hasOccupancyData = chartData.some(d => d.occupancy !== undefined && d.occupancy !== null)

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
        <p className="text-sm text-gray-500">Doanh thu (Triệu VNĐ) & Tỷ lệ lấp đầy (%)</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            stroke="#6b7280"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            tickFormatter={(value) => `${value.toFixed(1)}M`}
          />
          {hasOccupancyData && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'Doanh thu') return `${value.toFixed(2)}M VNĐ`
              if (name === 'Tỷ lệ lấp đầy') return `${value.toFixed(2)}%`
              return value
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullName
              }
              return label
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            name="Doanh thu"
          />
          {hasOccupancyData && (
            <Bar
              yAxisId="right"
              dataKey="occupancy"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="Tỷ lệ lấp đầy"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
