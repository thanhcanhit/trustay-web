'use client'

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { DashboardOverviewResponseDto } from "@/types/types"

interface OccupancyStatusChartProps {
  data: DashboardOverviewResponseDto['rooms'] | null
  isLoading?: boolean
}

const STATUS_COLORS = {
  available: '#10b981',    // green
  occupied: '#3b82f6',     // blue
  maintenance: '#f59e0b',  // amber
  reserved: '#8b5cf6',     // purple
  unavailable: '#6b7280'   // gray
}

const STATUS_LABELS = {
  available: 'Trống',
  occupied: 'Đã thuê',
  maintenance: 'Bảo trì',
  reserved: 'Đã đặt',
  unavailable: 'Không khả dụng'
}

export function OccupancyStatusChart({ data, isLoading }: OccupancyStatusChartProps) {
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

  if (!data) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tình trạng phòng</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Không có dữ liệu</p>
        </div>
      </Card>
    )
  }

  // Transform data for Recharts
  const chartData = [
    { name: STATUS_LABELS.available, value: data.availableInstances, status: 'available' },
    { name: STATUS_LABELS.occupied, value: data.occupiedInstances, status: 'occupied' },
    { name: STATUS_LABELS.maintenance, value: data.maintenanceInstances, status: 'maintenance' },
    { name: STATUS_LABELS.reserved, value: data.reservedInstances, status: 'reserved' }
  ].filter(item => item.value > 0) // Only show statuses with count > 0

  const total = data.totalInstances

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tình trạng phòng</h3>
        <p className="text-sm text-gray-500">
          Tổng: {total} phòng • Tỷ lệ lấp đầy: {(data.occupancyRate * 100).toFixed(1)}%
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number, name: string) => [
              `${value} phòng (${((value / total) * 100).toFixed(1)}%)`,
              name
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => {
              const item = chartData.find(d => d.name === value)
              return `${value} (${item?.value || 0})`
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600">Đã thuê</p>
          <p className="text-lg font-bold text-blue-900">{data.occupiedInstances}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600">Còn trống</p>
          <p className="text-lg font-bold text-green-900">{data.availableInstances}</p>
        </div>
      </div>
    </Card>
  )
}
