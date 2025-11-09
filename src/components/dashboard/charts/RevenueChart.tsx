'use client'

import { Card } from "@/components/ui/card"
import { MonthYearSelector } from "@/components/dashboard/MonthYearSelector"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function RevenueChart() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  // Mock data cho tháng được chọn (sẽ thay bằng API call)
  const chartData = [
    { day: '01', 'Doanh thu': 2.5, 'Chi phí': 0.8, 'Lợi nhuận': 1.7 },
    { day: '05', 'Doanh thu': 3.2, 'Chi phí': 1.0, 'Lợi nhuận': 2.2 },
    { day: '10', 'Doanh thu': 2.8, 'Chi phí': 0.9, 'Lợi nhuận': 1.9 },
    { day: '15', 'Doanh thu': 4.1, 'Chi phí': 1.2, 'Lợi nhuận': 2.9 },
    { day: '20', 'Doanh thu': 3.5, 'Chi phí': 1.1, 'Lợi nhuận': 2.4 },
    { day: '25', 'Doanh thu': 3.8, 'Chi phí': 1.0, 'Lợi nhuận': 2.8 },
    { day: '30', 'Doanh thu': 4.5, 'Chi phí': 1.3, 'Lợi nhuận': 3.2 },
  ]

  const totalRevenue = chartData.reduce((sum, item) => sum + item['Doanh thu'], 0)
  const totalExpense = chartData.reduce((sum, item) => sum + item['Chi phí'], 0)
  const totalProfit = chartData.reduce((sum, item) => sum + item['Lợi nhuận'], 0)

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Doanh thu & Lợi nhuận</h3>
          <p className="text-sm text-gray-500">Đơn vị: Triệu VNĐ</p>
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
        <div className="bg-blue-50 rounded p-3">
          <p className="text-xs text-blue-600">Tổng doanh thu</p>
          <p className="text-lg font-bold text-blue-900">{totalRevenue.toFixed(1)}M</p>
        </div>
        <div className="bg-red-50 rounded p-3">
          <p className="text-xs text-red-600">Tổng chi phí</p>
          <p className="text-lg font-bold text-red-900">{totalExpense.toFixed(1)}M</p>
        </div>
        <div className="bg-green-50 rounded p-3">
          <p className="text-xs text-green-600">Lợi nhuận</p>
          <p className="text-lg font-bold text-green-900">{totalProfit.toFixed(1)}M</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => `${value.toFixed(1)}M VNĐ`}
            labelFormatter={(label) => `Ngày ${label}`}
          />
          <Bar dataKey="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Chi phí" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Lợi nhuận" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
