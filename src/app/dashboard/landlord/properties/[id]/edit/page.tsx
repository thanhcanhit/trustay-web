"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { BuildingForm } from "@/components/forms/building-form"
import { getBuildingById } from "@/actions/building.action"
import { type Building } from "@/types/types"
import { toast } from "sonner"

export default function EditBuildingPage() {
  const params = useParams()
  const buildingId = params.id as string

  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        setLoading(true)
        const response = await getBuildingById(buildingId)
        
        if (!response.success) {
          toast.error(response.error)
          return
        }
        
        setBuilding(response.data.data)
      } catch (error) {
        console.error('Error fetching building:', error)
        toast.error('Không thể tải thông tin dãy trọ')
      } finally {
        setLoading(false)
      }
    }

    if (buildingId) {
      fetchBuilding()
    }
  }, [buildingId])

  if (loading) {
    return (
      <DashboardLayout userType="landlord">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải thông tin dãy trọ...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!building) {
    return (
      <DashboardLayout userType="landlord">
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy thông tin dãy trọ</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chỉnh sửa dãy trọ</h1>
          <p className="text-gray-600">Cập nhật thông tin &quot;{building.name}&quot;</p>
        </div>

        <BuildingForm mode="edit" building={building} />
      </div>
    </DashboardLayout>
  )
}
