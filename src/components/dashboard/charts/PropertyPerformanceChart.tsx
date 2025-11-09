'use client'

import { Card } from "@/components/ui/card"
import { PropertyPerformance } from "@/lib/mock-analytics"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface PropertyPerformanceChartProps {
  data: PropertyPerformance[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function PropertyPerformanceChart({ data }: PropertyPerformanceChartProps) {
  const chartData = data.map(item => ({
    name: item.buildingName.length > 20 ? item.buildingName.substring(0, 18) + '...' : item.buildingName,
    fullName: item.buildingName,
    'Doanh thu': item.revenue / 1000000,
    'Tỷ lệ lấp đầy': item.occupancyRate,
    roomCount: item.roomCount,
  }))

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Hiệu suất theo nhà trọ</h3>
        <p className="text-sm text-gray-500">So sánh doanh thu và tỷ lệ lấp đầy</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Triệu VNĐ', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            domain={[0, 100]}
            label={{ value: '%', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'Doanh thu') return `${value.toFixed(1)}M VNĐ`
              if (name === 'Tỷ lệ lấp đầy') return `${value.toFixed(1)}%`
              return value
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.fullName
              }
              return label
            }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar yAxisId="left" dataKey="Doanh thu" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
          <Bar yAxisId="right" dataKey="Tỷ lệ lấp đầy" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
