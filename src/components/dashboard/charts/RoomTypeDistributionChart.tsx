'use client'

import { Card } from "@/components/ui/card"
import { RoomTypeDistribution } from "@/lib/mock-analytics"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface RoomTypeDistributionChartProps {
  data: RoomTypeDistribution[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function RoomTypeDistributionChart({ data }: RoomTypeDistributionChartProps) {
  const chartData = data.map(item => ({
    name: item.type,
    value: item.count,
    percentage: item.percentage,
  }))

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Phân bổ loại phòng</h3>
        <p className="text-sm text-gray-500">Cơ cấu phòng theo loại</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
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
            }}
            formatter={(value: number, name: string, props) => [
              `${value} phòng (${props.payload.percentage}%)`,
              name
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-700">{item.type}</span>
              </div>
              <span className="font-medium text-gray-900">{item.count} phòng</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
