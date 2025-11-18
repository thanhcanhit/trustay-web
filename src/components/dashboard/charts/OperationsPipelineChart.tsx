'use client'

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { DashboardOperationsResponseDto } from "@/types/types"

interface OperationsPipelineChartProps {
  data: DashboardOperationsResponseDto['summary'] | null
  isLoading?: boolean
}

const COLORS = {
  pendingBookings: '#3b82f6',           // blue
  pendingInvitations: '#f59e0b',        // amber
  roommateApplications: '#8b5cf6', // purple
  contractAlerts: '#10b981'           // green
}

export function OperationsPipelineChart({ data, isLoading }: OperationsPipelineChartProps) {
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Công việc đang chờ</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Không có dữ liệu</p>
        </div>
      </Card>
    )
  }

  // Transform data for Recharts
  const chartData = [
    {
      name: 'Yêu cầu\nđặt phòng',
      value: data.pendingBookings,
      color: COLORS.pendingBookings,
      key: 'pendingBookings'
    },
    {
      name: 'Lời mời\nchờ xử lý',
      value: data.pendingInvitations,
      color: COLORS.pendingInvitations,
      key: 'pendingInvitations'
    },
    {
      name: 'Yêu cầu\nờ ghép',
      value: data.roommateApplications,
      color: COLORS.roommateApplications,
      key: 'roommateApplications'
    },
    {
      name: 'Hợp đồng\nchờ ký',
      value: data.contractAlerts,
      color: COLORS.contractAlerts,
      key: 'contractAlerts'
    }
  ]

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Công việc đang chờ</h3>
        <p className="text-sm text-gray-500">Tổng: {total} công việc cần xử lý</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value} công việc`, 'Số lượng']}
            labelFormatter={(label) => label.replace('\n', ' ')}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600">Đặt phòng</p>
          <p className="text-lg font-bold text-blue-900">{data.pendingBookings}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-xs text-amber-600">Lời mời</p>
          <p className="text-lg font-bold text-amber-900">{data.pendingInvitations}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs text-purple-600">Ở ghép</p>
          <p className="text-lg font-bold text-purple-900">{data.roommateApplications}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600">Hợp đồng</p>
          <p className="text-lg font-bold text-green-900">{data.contractAlerts}</p>
        </div>
      </div>
    </Card>
  )
}
