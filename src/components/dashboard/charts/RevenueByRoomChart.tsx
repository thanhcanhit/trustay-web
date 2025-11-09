'use client'

import { Card } from "@/components/ui/card"
import { RevenueByRoom } from "@/lib/mock-analytics"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useState } from "react"
import { MonthYearSelector } from "@/components/dashboard/MonthYearSelector"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RevenueByRoomChartProps {
  data: RevenueByRoom[]
}

type ViewLevel = 'building' | 'room' | 'instance'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export function RevenueByRoomChart({ data }: RevenueByRoomChartProps) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState<number | null>(null)
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(null)

  // Determine view level based on selections
  const viewLevel: ViewLevel =
    selectedBuildingIndex === null ? 'building' :
    selectedRoomIndex === null ? 'room' : 'instance'

  // Building level view
  const buildingChartData = data.map((building) => ({
    name: building.buildingName,
    revenue: building.buildingRevenue / 1000000,
  }))

  // Room level view
  const roomChartData = selectedBuildingIndex !== null
    ? data[selectedBuildingIndex].rooms.map((room) => ({
        name: room.roomName,
        revenue: room.roomRevenue / 1000000,
      }))
    : []

  // Instance level view
  const instanceChartData = selectedBuildingIndex !== null && selectedRoomIndex !== null
    ? data[selectedBuildingIndex].rooms[selectedRoomIndex].instances.map((instance) => ({
        name: instance.instanceName,
        revenue: instance.revenue / 1000000,
        status: instance.status,
      }))
    : []

  // Calculate statistics based on view level
  let totalRevenue = 0
  let averageRevenue = 0
  let highestRevenue = 0
  let itemCount = 0

  if (viewLevel === 'building') {
    totalRevenue = data.reduce((sum, b) => sum + b.buildingRevenue, 0)
    itemCount = data.length
    averageRevenue = totalRevenue / itemCount
    highestRevenue = Math.max(...data.map(b => b.buildingRevenue))
  } else if (viewLevel === 'room' && selectedBuildingIndex !== null) {
    const building = data[selectedBuildingIndex]
    totalRevenue = building.rooms.reduce((sum, r) => sum + r.roomRevenue, 0)
    itemCount = building.rooms.length
    averageRevenue = totalRevenue / itemCount
    highestRevenue = Math.max(...building.rooms.map(r => r.roomRevenue))
  } else if (viewLevel === 'instance' && selectedBuildingIndex !== null && selectedRoomIndex !== null) {
    const room = data[selectedBuildingIndex].rooms[selectedRoomIndex]
    totalRevenue = room.instances.reduce((sum, i) => sum + i.revenue, 0)
    itemCount = room.instances.length
    averageRevenue = totalRevenue / itemCount
    highestRevenue = Math.max(...room.instances.map(i => i.revenue))
  }

  const handleBuildingChange = (value: string) => {
    if (value === 'all') {
      setSelectedBuildingIndex(null)
      setSelectedRoomIndex(null)
    } else {
      setSelectedBuildingIndex(parseInt(value))
      setSelectedRoomIndex(null)
    }
  }

  const handleRoomChange = (value: string) => {
    if (value === 'all') {
      setSelectedRoomIndex(null)
    } else {
      setSelectedRoomIndex(parseInt(value))
    }
  }

  const currentChartData =
    viewLevel === 'building' ? buildingChartData :
    viewLevel === 'room' ? roomChartData :
    instanceChartData

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Doanh thu theo phòng</h3>
          <p className="text-sm text-gray-500">
            {viewLevel === 'building' && 'So sánh doanh thu các toà nhà'}
            {viewLevel === 'room' && 'So sánh doanh thu các loại phòng'}
            {viewLevel === 'instance' && 'Doanh thu các phòng cụ thể'}
          </p>
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">Toà nhà:</label>
            <Select
              value={selectedBuildingIndex === null ? 'all' : selectedBuildingIndex.toString()}
              onValueChange={handleBuildingChange}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {data.map((building, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {building.buildingName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBuildingIndex !== null && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Loại phòng:</label>
              <Select
                value={selectedRoomIndex === null ? 'all' : selectedRoomIndex.toString()}
                onValueChange={handleRoomChange}
              >
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {data[selectedBuildingIndex].rooms.map((room, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {room.roomName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="ml-auto">
            <MonthYearSelector
              month={month}
              year={year}
              onChange={(m, y) => {
                setMonth(m)
                setYear(y)
              }}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 rounded p-3">
            <p className="text-xs text-blue-600">Tổng doanh thu</p>
            <p className="text-lg font-bold text-blue-900">
              {(totalRevenue / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-green-50 rounded p-3">
            <p className="text-xs text-green-600">Trung bình</p>
            <p className="text-lg font-bold text-green-900">
              {(averageRevenue / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <p className="text-xs text-purple-600">Cao nhất</p>
            <p className="text-lg font-bold text-purple-900">
              {(highestRevenue / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={currentChartData} layout="horizontal">
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
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            label={{ value: 'Triệu VNĐ', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value.toFixed(1)}M VNĐ`, 'Doanh thu']}
          />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
            {currentChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={viewLevel !== 'instance' ? 1 : (entry as any).status === 'occupied' ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Detail table */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          {viewLevel === 'building' && 'Danh sách toà nhà'}
          {viewLevel === 'room' && 'Danh sách loại phòng'}
          {viewLevel === 'instance' && 'Danh sách phòng'}
        </h4>
        <div className="space-y-2">
          {currentChartData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                {viewLevel === 'instance' && (item as any).status === 'vacant' && (
                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">Trống</span>
                )}
                {viewLevel === 'instance' && (item as any).status === 'occupied' && (
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">Đã thuê</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">
                  {item.revenue.toFixed(1)}M VNĐ
                </span>
                <p className="text-xs text-gray-500">
                  {((item.revenue / (totalRevenue / 1000000)) * 100).toFixed(1)}% tổng
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
