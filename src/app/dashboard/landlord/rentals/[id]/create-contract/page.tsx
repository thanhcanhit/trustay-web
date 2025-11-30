"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ContractCreationForm } from "@/components/contract/ContractCreationForm"
import { useRentalStore } from "@/stores/rentalStore"
import { useContractStore } from "@/stores/contractStore"
import { toast } from "sonner"
import { AlertCircle, ArrowLeft, RotateCcw, Home, User } from "lucide-react"

export default function CreateContractPage() {
  const params = useParams()
  const router = useRouter()
  const rentalId = params.id as string

  const [isLoading, setIsLoading] = useState(true)

  const {
    landlordRentals,
    // loadingLandlord,
    errorLandlord,
    loadLandlordRentals,
  } = useRentalStore()

  const {
    autoGenerate,
    submitting: contractSubmitting
  } = useContractStore()

  // Load rentals on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await loadLandlordRentals()
      setIsLoading(false)
    }
    loadData()
  }, [loadLandlordRentals])

  // Find the current rental
  const selectedRental = landlordRentals?.find(rental => rental.id === rentalId)

  const handleGenerateContract = async (formData: {
    financial: {
      monthlyRent: number;
      deposit: number;
      depositMonths: number;
      paymentMethod: string;
      paymentDueDate: number;
      electricityPrice: number;
      waterPrice: number;
      internetPrice?: number;
      parkingFee?: number;
    };
    terms: {
      utilities: string[];
      restrictions: string[];
      rules: string[];
      landlordResponsibilities: string[];
      tenantResponsibilities: string[];
    };
    emergencyContact?: {
      name: string;
      phone: string;
    };
    specialNote?: string;
    endDate?: string;
  }) => {
    if (!selectedRental?.id) {
      toast.error('Không tìm thấy thông tin cho thuê')
      return
    }

    // Prepare contract data to send to backend
    // endDate is sent at top level according to CreateContractDto schema
    const additionalContractData = {
      endDate: formData.endDate, // Top-level field per schema
      financial: formData.financial,
      terms: {
        ...formData.terms,
        responsibilities: {
          landlord: formData.terms.landlordResponsibilities,
          tenant: formData.terms.tenantResponsibilities
        }
      },
      emergencyContact: formData.emergencyContact,
      specialNote: formData.specialNote
    }

    const success = await autoGenerate(selectedRental.id, additionalContractData)
    if (success) {
      toast.success('Tạo hợp đồng thành công!')
      // Redirect back to rentals page
      router.push('/dashboard/landlord/rentals')
    } else {
      toast.error('Không thể tạo hợp đồng')
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/landlord/rentals')
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo hợp đồng cho thuê</h1>
          <p className="text-gray-600">Điền thông tin để tạo hợp đồng cho hợp đồng thuê này</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-6 w-6 animate-spin text-gray-500" />
              <span className="text-gray-500">Đang tải thông tin...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {errorLandlord && !isLoading && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorLandlord}</AlertDescription>
          </Alert>
        )}

        {/* Rental Not Found */}
        {!isLoading && !selectedRental && !errorLandlord && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không tìm thấy thông tin cho thuê. Vui lòng thử lại.
            </AlertDescription>
          </Alert>
        )}

        {/* Rental Info Card */}
        {!isLoading && selectedRental && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-blue-900">Thông tin cho thuê</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Phòng</p>
                    <p className="font-semibold text-blue-900">
                      {selectedRental.roomInstance?.room?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-blue-700">
                      {selectedRental.roomInstance?.room?.building?.name || 'N/A'} - {selectedRental.roomInstance?.roomNumber || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Người thuê</p>
                    <p className="font-semibold text-blue-900">
                      {selectedRental.tenant
                        ? `${selectedRental.tenant.firstName} ${selectedRental.tenant.lastName}`
                        : 'N/A'}
                    </p>
                    {selectedRental.tenant?.email && (
                      <p className="text-sm text-blue-700">{selectedRental.tenant.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Creation Form */}
        {!isLoading && selectedRental && (
          <ContractCreationForm
            initialMonthlyRent={selectedRental.monthlyRent ? parseFloat(selectedRental.monthlyRent) : 0}
            initialDeposit={selectedRental.depositPaid ? parseFloat(selectedRental.depositPaid) : 0}
            initialEndDate={
              selectedRental.contractEndDate 
                ? new Date(selectedRental.contractEndDate).toISOString().split('T')[0]
                : selectedRental.endDate
                ? new Date(selectedRental.endDate).toISOString().split('T')[0]
                : undefined
            }
            onSubmit={handleGenerateContract}
            onCancel={handleCancel}
            isSubmitting={contractSubmitting}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
