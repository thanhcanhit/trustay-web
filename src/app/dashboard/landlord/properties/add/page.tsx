"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { BuildingForm } from "@/components/forms/building-form"

export default function AddBuildingPage() {
  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thêm dãy trọ mới</h1>
          <p className="text-gray-600">Tạo thông tin dãy trọ/tòa nhà của bạn</p>
        </div>

        <BuildingForm mode="create" />
      </div>
    </DashboardLayout>
  )
}