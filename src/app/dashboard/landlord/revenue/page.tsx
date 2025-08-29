"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Download } from "lucide-react"

// Mock data for revenue
const MOCK_REVENUE_DATA = {
  currentMonth: {
    income: 25000000,
    expenses: 8500000,
    netProfit: 16500000
  },
  lastMonth: {
    income: 23000000,
    expenses: 8000000,
    netProfit: 15000000
  },
  transactions: [
    {
      id: '1',
      type: 'income',
      category: 'Tiền phòng',
      amount: 4500000,
      date: '2024-01-15',
      description: 'Tiền phòng tháng 1 - Nguyễn Văn A'
    },
    {
      id: '2',
      type: 'income',
      category: 'Tiền phòng',
      amount: 3800000,
      date: '2024-01-10',
      description: 'Tiền phòng tháng 1 - Trần Thị B'
    },
    {
      id: '3',
      type: 'expense',
      category: 'Bảo trì',
      amount: 1200000,
      date: '2024-01-12',
      description: 'Sửa chữa hệ thống điện'
    },
    {
      id: '4',
      type: 'expense',
      category: 'Tiện ích',
      amount: 800000,
      date: '2024-01-08',
      description: 'Tiền điện, nước chung'
    }
  ]
}

// const TRANSACTION_CATEGORIES = {
//   income: ['Tiền phòng', 'Tiền cọc', 'Phí dịch vụ', 'Khác'],
//   expense: ['Bảo trì', 'Tiện ích', 'Nhân viên', 'Thuế', 'Khác']
// }

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState('current-month')
  const [transactionType, setTransactionType] = useState('all')

  const filteredTransactions = MOCK_REVENUE_DATA.transactions.filter(transaction => {
    if (transactionType === 'all') return true
    return transaction.type === transactionType
  })

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpenses

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý thu chi</h1>
          <p className="text-gray-600">Theo dõi thu nhập và chi phí của bạn</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Tháng này</SelectItem>
              <SelectItem value="last-month">Tháng trước</SelectItem>
              <SelectItem value="last-3-months">3 tháng gần đây</SelectItem>
              <SelectItem value="last-year">Năm trước</SelectItem>
            </SelectContent>
          </Select>

          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loại giao dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="income">Thu nhập</SelectItem>
              <SelectItem value="expense">Chi phí</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng thu nhập</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalIncome.toLocaleString('vi-VN')} VNĐ
              </div>
              <p className="text-xs text-muted-foreground">
                +{((totalIncome / MOCK_REVENUE_DATA.lastMonth.income - 1) * 100).toFixed(1)}% so với tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng chi phí</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalExpenses.toLocaleString('vi-VN')} VNĐ
              </div>
              <p className="text-xs text-muted-foreground">
                +{((totalExpenses / MOCK_REVENUE_DATA.lastMonth.expenses - 1) * 100).toFixed(1)}% so với tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lợi nhuận ròng</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {netProfit.toLocaleString('vi-VN')} VNĐ
              </div>
              <p className="text-xs text-muted-foreground">
                +{((netProfit / MOCK_REVENUE_DATA.lastMonth.netProfit - 1) * 100).toFixed(1)}% so với tháng trước
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.category}</p>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {transaction.amount.toLocaleString('vi-VN')} VNĐ
                    </p>
                    <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                      {transaction.type === 'income' ? 'Thu' : 'Chi'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
