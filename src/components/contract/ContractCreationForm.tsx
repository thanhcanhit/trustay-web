"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FinancialData {
  monthlyRent: number
  deposit: number
  depositMonths: number
  paymentMethod: string
  paymentDueDate: number
  electricityPrice: number
  waterPrice: number
  internetPrice?: number
  parkingFee?: number
}

interface TermsData {
  utilities: string[]
  restrictions: string[]
  rules: string[]
  landlordResponsibilities: string[]
  tenantResponsibilities: string[]
}

interface EmergencyContact {
  name: string
  phone: string
}

interface ContractFormData {
  financial: FinancialData
  terms: TermsData
  emergencyContact?: EmergencyContact
  specialNote?: string
}

interface ContractCreationFormProps {
  initialMonthlyRent?: number
  initialDeposit?: number
  onSubmit: (data: ContractFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ContractCreationForm({
  initialMonthlyRent = 0,
  initialDeposit = 0,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ContractCreationFormProps) {
  // Financial data state
  const [financial, setFinancial] = useState<FinancialData>({
    monthlyRent: initialMonthlyRent,
    deposit: initialDeposit,
    depositMonths: initialDeposit && initialMonthlyRent ? Math.round(initialDeposit / initialMonthlyRent) : 2,
    paymentMethod: "Chuyển khoản ngân hàng",
    paymentDueDate: 5,
    electricityPrice: 3500,
    waterPrice: 15000,
    internetPrice: 0,
    parkingFee: 0
  })

  // Terms data state
  const [utilities, setUtilities] = useState<string[]>(["Điện", "Nước"])
  const [newUtility, setNewUtility] = useState("")

  const [restrictions, setRestrictions] = useState<string[]>(["Không hút thuốc trong phòng", "Không nuôi thú cưng"])
  const [newRestriction, setNewRestriction] = useState("")

  const [rules, setRules] = useState<string[]>([
    "Giữ gìn vệ sinh chung",
    "Không làm ồn sau 22h",
    "Báo trước khi có khách qua đêm"
  ])
  const [newRule, setNewRule] = useState("")

  const [landlordResponsibilities, setLandlordResponsibilities] = useState<string[]>([
    "Cung cấp phòng và trang thiết bị đúng thỏa thuận",
    "Đảm bảo cung cấp điện, nước liên tục"
  ])
  const [newLandlordResp, setNewLandlordResp] = useState("")

  const [tenantResponsibilities, setTenantResponsibilities] = useState<string[]>([
    "Trả tiền thuê đầy đủ, đúng hạn",
    "Sử dụng phòng đúng mục đích"
  ])
  const [newTenantResp, setNewTenantResp] = useState("")

  // Emergency contact state
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: "",
    phone: ""
  })

  // Special note state
  const [specialNote, setSpecialNote] = useState("")

  // Helper functions
  const addItem = (
    items: string[],
    setItems: (items: string[]) => void,
    newItem: string,
    setNewItem: (item: string) => void
  ) => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()])
      setNewItem("")
    }
  }

  const removeItem = (items: string[], setItems: (items: string[]) => void, index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData: ContractFormData = {
      financial: {
        ...financial,
        // Remove optional fields if they're 0 or empty
        internetPrice: financial.internetPrice || undefined,
        parkingFee: financial.parkingFee || undefined
      },
      terms: {
        utilities,
        restrictions,
        rules,
        landlordResponsibilities,
        tenantResponsibilities
      },
      emergencyContact: emergencyContact.name && emergencyContact.phone ? emergencyContact : undefined,
      specialNote: specialNote.trim() || undefined
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài chính</CardTitle>
          <CardDescription>
            Nhập các thông tin về giá thuê và chi phí liên quan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Tiền thuê hàng tháng (VND) *</Label>
              <Input
                id="monthlyRent"
                type="number"
                required
                value={financial.monthlyRent}
                onChange={(e) => setFinancial({ ...financial, monthlyRent: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit">Tiền đặt cọc (VND) *</Label>
              <Input
                id="deposit"
                type="number"
                required
                value={financial.deposit}
                onChange={(e) => setFinancial({ ...financial, deposit: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="depositMonths">Số tháng cọc</Label>
              <Input
                id="depositMonths"
                type="number"
                value={financial.depositMonths}
                onChange={(e) => setFinancial({ ...financial, depositMonths: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Phương thức thanh toán *</Label>
              <Input
                id="paymentMethod"
                required
                value={financial.paymentMethod}
                onChange={(e) => setFinancial({ ...financial, paymentMethod: e.target.value })}
                placeholder="VD: Chuyển khoản ngân hàng"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDueDate">Hạn thanh toán (ngày trong tháng) *</Label>
              <Input
                id="paymentDueDate"
                type="number"
                min="1"
                max="31"
                required
                value={financial.paymentDueDate}
                onChange={(e) => setFinancial({ ...financial, paymentDueDate: Number(e.target.value) })}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3">Chi phí dịch vụ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="electricityPrice">Giá điện (VND/kWh) *</Label>
                <Input
                  id="electricityPrice"
                  type="number"
                  required
                  value={financial.electricityPrice}
                  onChange={(e) => setFinancial({ ...financial, electricityPrice: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterPrice">Giá nước (VND/m³) *</Label>
                <Input
                  id="waterPrice"
                  type="number"
                  required
                  value={financial.waterPrice}
                  onChange={(e) => setFinancial({ ...financial, waterPrice: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internetPrice">Phí Internet (VND/tháng)</Label>
                <Input
                  id="internetPrice"
                  type="number"
                  value={financial.internetPrice || 0}
                  onChange={(e) => setFinancial({ ...financial, internetPrice: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parkingFee">Phí đậu xe (VND/tháng)</Label>
                <Input
                  id="parkingFee"
                  type="number"
                  value={financial.parkingFee || 0}
                  onChange={(e) => setFinancial({ ...financial, parkingFee: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Điều khoản và quy định</CardTitle>
          <CardDescription>
            Thiết lập các quy định và trách nhiệm cho hợp đồng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Utilities */}
          <div className="space-y-2">
            <Label>Tiện ích được cung cấp</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {utilities.map((utility, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {utility}
                  <button
                    type="button"
                    onClick={() => removeItem(utilities, setUtilities, index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newUtility}
                onChange={(e) => setNewUtility(e.target.value)}
                placeholder="VD: Internet, Điều hòa..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addItem(utilities, setUtilities, newUtility, setNewUtility)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(utilities, setUtilities, newUtility, setNewUtility)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Restrictions */}
          <div className="space-y-2">
            <Label>Các hạn chế</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {restrictions.map((restriction, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {restriction}
                  <button
                    type="button"
                    onClick={() => removeItem(restrictions, setRestrictions, index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                placeholder="VD: Không hút thuốc..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addItem(restrictions, setRestrictions, newRestriction, setNewRestriction)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(restrictions, setRestrictions, newRestriction, setNewRestriction)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Rules */}
          <div className="space-y-2">
            <Label>Quy định chung</Label>
            <div className="space-y-2 mb-2">
              {rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
                  <span className="text-sm flex-1">{rule}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(rules, setRules, index)}
                    className="hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Nhập quy định mới..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addItem(rules, setRules, newRule, setNewRule)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(rules, setRules, newRule, setNewRule)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Landlord Responsibilities */}
          <div className="space-y-2">
            <Label>Trách nhiệm của chủ nhà</Label>
            <div className="space-y-2 mb-2">
              {landlordResponsibilities.map((resp, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-md">
                  <span className="text-sm flex-1">{resp}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(landlordResponsibilities, setLandlordResponsibilities, index)}
                    className="hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLandlordResp}
                onChange={(e) => setNewLandlordResp(e.target.value)}
                placeholder="Nhập trách nhiệm mới..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addItem(landlordResponsibilities, setLandlordResponsibilities, newLandlordResp, setNewLandlordResp)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(landlordResponsibilities, setLandlordResponsibilities, newLandlordResp, setNewLandlordResp)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Tenant Responsibilities */}
          <div className="space-y-2">
            <Label>Trách nhiệm của người thuê</Label>
            <div className="space-y-2 mb-2">
              {tenantResponsibilities.map((resp, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-md">
                  <span className="text-sm flex-1">{resp}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(tenantResponsibilities, setTenantResponsibilities, index)}
                    className="hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTenantResp}
                onChange={(e) => setNewTenantResp(e.target.value)}
                placeholder="Nhập trách nhiệm mới..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addItem(tenantResponsibilities, setTenantResponsibilities, newTenantResp, setNewTenantResp)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(tenantResponsibilities, setTenantResponsibilities, newTenantResp, setNewTenantResp)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bổ sung</CardTitle>
          <CardDescription>
            Thêm thông tin liên hệ khẩn cấp và ghi chú đặc biệt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Tên người liên hệ khẩn cấp</Label>
              <Input
                id="emergencyName"
                value={emergencyContact.name}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Số điện thoại khẩn cấp</Label>
              <Input
                id="emergencyPhone"
                value={emergencyContact.phone}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                placeholder="VD: 0987654321"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNote">Ghi chú đặc biệt</Label>
            <Textarea
              id="specialNote"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="Nhập các ghi chú đặc biệt cho hợp đồng..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang tạo..." : "Tạo hợp đồng"}
        </Button>
      </div>
    </form>
  )
}
