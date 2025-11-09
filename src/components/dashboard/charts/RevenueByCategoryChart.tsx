'use client'

import { Card } from "@/components/ui/card"
import { RevenueByCategory } from "@/lib/mock-analytics"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface RevenueByCategoryChartProps {
  data: RevenueByCategory[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function RevenueByCategoryChart({ data }: RevenueByCategoryChartProps) {
  const chartData = data.map(item => ({
    category: item.category,
    'Số tiền': item.amount / 1000000,
    percentage: item.percentage,
  }))

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Doanh thu theo danh mục</h3>
        <p className="text-sm text-gray-500">Phân tích nguồn thu nhập</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Triệu VNĐ', position: 'insideBottom', offset: -5, style: { fontSize: 12 } }}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string, props) => [
              `${value.toFixed(1)}M VNĐ (${props.payload.percentage}%)`,
              name
            ]}
          />
          <Bar dataKey="Số tiền" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t">
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-700">{item.category}</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-gray-900">
                  {(item.amount / 1000000).toFixed(1)}M
                </span>
                <span className="text-gray-500 ml-2">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
