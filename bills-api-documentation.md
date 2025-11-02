# Bills API Documentation

Tài liệu này mô tả flow và các endpoints của hệ thống quản lý hóa đơn (Bills Management).

## Table of Contents

1. [Flow Overview](#flow-overview)
2. [Endpoints](#endpoints)
   - [1. Tạo Hóa Đơn](#1-tạo-hóa-đơn)
     - [1.1. Tạo Hóa Đơn Thủ Công](#11-tạo-hóa-đơn-thủ-công)
     - [1.2. Tạo Hóa Đơn Cho Phòng (Tự Động Tính Toán)](#12-tạo-hóa-đơn-cho-phòng-tự-động-tính-toán)
     - [1.3. Tổng Kết và Tạo Hóa Đơn Tháng Cho Building](#13-tổng-kết-và-tạo-hóa-đơn-tháng-cho-building)
   - [2. Truy Vấn Hóa Đơn](#2-truy-vấn-hóa-đơn)
     - [2.1. Lấy Danh Sách Hóa Đơn (Tenant)](#21-lấy-danh-sách-hóa-đơn-tenant)
     - [2.2. Lấy Danh Sách Hóa Đơn Tháng (Landlord)](#22-lấy-danh-sách-hóa-đơn-tháng-landlord)
     - [2.3. Lấy Danh Sách Hóa Đơn (General)](#23-lấy-danh-sách-hóa-đơn-general)
     - [2.4. Lấy Chi Tiết Hóa Đơn](#24-lấy-chi-tiết-hóa-đơn)
   - [3. Cập Nhật Hóa Đơn](#3-cập-nhật-hóa-đơn)
     - [3.1. Cập Nhật Hóa Đơn (Basic)](#31-cập-nhật-hóa-đơn-basic)
     - [3.2. Cập Nhật Bill Với Meter Data và Occupancy](#32-cập-nhật-bill-với-meter-data-và-occupancy)
     - [3.3. Cập Nhật Meter Data Cho Bill Cụ Thể](#33-cập-nhật-meter-data-cho-bill-cụ-thể)
   - [4. Đánh Dấu Thanh Toán](#4-đánh-dấu-thanh-toán)
   - [5. Xóa Hóa Đơn](#5-xóa-hóa-đơn)
3. [Data Models](#data-models)
4. [Best Practices](#best-practices)
5. [Error Codes](#error-codes)

---

## Flow Overview

### 1. Tạo Hóa Đơn Tháng Cho Building (Monthly Bill Generation)

**Mục đích**: Tạo tự động các hóa đơn draft cho tất cả phòng có người thuê trong một building cho kỳ hóa đơn cụ thể.

**Flow**:
```
1. Landlord gọi API generate-monthly-bills-for-building
   ↓
2. Hệ thống tìm tất cả room instances có active rental trong building
   ↓
3. Với mỗi room:
   - Kiểm tra xem đã có bill cho billing period chưa (unique: rentalId + billingPeriod)
   - Nếu chưa có: Tạo bill mới ở trạng thái draft
   - Tính toán bill items dựa trên:
     * Rent (tiền thuê phòng)
     * Fixed costs (chi phí cố định: internet, phí quản lý, etc.)
     * Per-person costs (chi phí theo đầu người: rác, dọn dẹp, etc.)
     ⚠️ KHÔNG bao gồm Metered costs (điện, nước) - cần nhập sau
   - Nếu có metered costs: 
     * requiresMeterData = true
     * meteredCostsToInput[] chứa danh sách cần nhập (roomCostId, name, unit)
   ↓
4. Trả về số lượng bills đã tạo và số bills đã tồn tại
   ↓
5. Landlord cần nhập meter data (bước bắt buộc nếu có metered costs):
   - Gọi API update-with-meter-data hoặc :id/meter-data
   - Nhập currentReading và lastReading cho từng metered cost
   ↓
6. Hệ thống tính toán metered costs:
   - consumption = currentReading - lastReading
   - amount = consumption × unitPrice
   - Thêm vào bill items
   - Cập nhật totalAmount
   - Chuyển status: draft → pending
```

**Lưu ý**:
- ✅ **Bills được tạo tự động bao gồm**: rent + fixed costs + per-person costs
- ❌ **Bills KHÔNG bao gồm**: metered costs (điện, nước) - phải nhập thủ công sau
- Chỉ tạo bill cho phòng có active rental
- Mỗi rental chỉ có 1 bill cho mỗi billing period (unique constraint)
- Bills được tạo ở trạng thái `draft` (nếu có metered costs) hoặc `pending` (nếu không có metered costs)
- Default billing period = tháng trước nếu không chỉ định
- Default occupancy count = 1 (cần cập nhật sau nếu cần)

### 2. Cập Nhật Meter Data và Occupancy

**Mục đích**: Cập nhật số đồng hồ (meter readings) và số người ở (occupancy) cho các bill đã tạo, sau đó tính lại bill items.

**Flow**:
```
1. Landlord gọi API update-with-meter-data hoặc :id/meter-data
   ↓
2. Hệ thống:
   - Cập nhật meter readings trong RoomCost
   - Cập nhật occupancyCount trong Bill
   ↓
3. Tính lại bill items:
   - Fixed costs: prorated theo thời gian rental
   - Per-person costs: prorated × occupancy count
   - Metered costs: (currentReading - lastReading) × unitPrice
   ↓
4. Cập nhật subtotal, totalAmount, remainingAmount
5. Nếu tất cả metered costs đã có readings: requiresMeterData = false
```

### 3. Xem và Xử Lý Bills

**Mục đích**: Landlord xem danh sách bills để xử lý, Tenant xem bills của mình.

**Flow cho Landlord**:
```
1. Landlord gọi API landlord/by-month với filters:
   - buildingId (optional)
   - roomInstanceId (optional - lọc theo building + room)
   - status (optional)
   - billingPeriod / billingMonth + billingYear (default = tháng hiện tại)
   - search (optional - tìm theo tên/số phòng)
   ↓
2. Hệ thống trả về danh sách bills đã paginated với:
   - Sort options: roomName, status, totalAmount, createdAt, dueDate
   - Filter theo các điều kiện trên
   ↓
3. Landlord có thể:
   - Xem chi tiết bill: GET /bills/:id
   - Cập nhật bill: PATCH /bills/:id
   - Đánh dấu đã thanh toán: POST /bills/:id/mark-paid
   - Xóa bill (chỉ draft hoặc pending): DELETE /bills/:id
```

**Flow cho Tenant**:
```
1. Tenant gọi API tenant/my-bills với filters:
   - rentalId (optional)
   - roomInstanceId (optional)
   - status (optional)
   - billingPeriod (optional)
   - fromDate, toDate (optional)
   ↓
2. Hệ thống trả về danh sách bills của tenant với pagination
   ↓
3. Tenant có thể xem chi tiết bill: GET /bills/:id
```

---

## Endpoints

### Base URL
```
/api/bills
```

### Authentication
Tất cả endpoints đều yêu cầu JWT Bearer Token trong header:
```
Authorization: Bearer <token>
```

### Quick Reference - Tất cả Endpoints

| Method | Endpoint | Role | Mô tả |
|--------|----------|------|-------|
| POST | `/bills` | landlord | Tạo hóa đơn thủ công |
| POST | `/bills/create-for-room` | landlord | Tạo hóa đơn cho phòng với tính toán tự động |
| POST | `/bills/generate-monthly-bills-for-building` | landlord | Tạo hóa đơn tháng cho toàn bộ building |
| GET | `/bills/tenant/my-bills` | tenant | Lấy danh sách hóa đơn của tenant |
| GET | `/bills/landlord/by-month` | landlord | Lấy danh sách hóa đơn tháng để xử lý |
| POST | `/bills/update-with-meter-data` | landlord | Cập nhật bill với meter data và occupancy |
| GET | `/bills` | tenant, landlord | Lấy danh sách hóa đơn (general) |
| GET | `/bills/:id` | tenant, landlord | Lấy chi tiết hóa đơn |
| PATCH | `/bills/:id` | landlord | Cập nhật hóa đơn |
| DELETE | `/bills/:id` | landlord | Xóa hóa đơn (chỉ draft/pending) |
| POST | `/bills/:id/mark-paid` | landlord | Đánh dấu hóa đơn đã thanh toán |
| POST | `/bills/:id/meter-data` | landlord | Cập nhật meter data cho bill |

---

## 1. Tạo Hóa Đơn

### 1.1. Tạo Hóa Đơn Thủ Công
**POST** `/bills`

**Role**: `landlord`

**Request Body** (`CreateBillDto`):
```typescript
{
  rentalId: string;              // Required - ID của rental
  roomInstanceId: string;        // Required - ID của room instance
  billingPeriod: string;         // Required - Format: "YYYY-MM", e.g. "2025-01"
  billingMonth: number;          // Required - 1-12
  billingYear: number;          // Required - >= 2020
  periodStart: string;            // Required - Format: "YYYY-MM-DD"
  periodEnd: string;             // Required - Format: "YYYY-MM-DD"
  subtotal: number;              // Required - >= 0
  discountAmount?: number;       // Optional - >= 0, default: 0
  taxAmount?: number;            // Optional - >= 0, default: 0
  totalAmount: number;           // Required - >= 0
  dueDate: string;               // Required - Format: "YYYY-MM-DD"
  notes?: string;                 // Optional
}
```

**Response**: `BillResponseDto` (201 Created)

---

### 1.2. Tạo Hóa Đơn Cho Phòng (Tự Động Tính Toán)
**POST** `/bills/create-for-room`

**Role**: `landlord`

**Request Body** (`CreateBillForRoomDto`):
```typescript
{
  roomInstanceId: string;        // Required
  billingPeriod: string;         // Required - Format: "YYYY-MM"
  billingMonth: number;          // Required - 1-12
  billingYear: number;          // Required - >= 2020
  periodStart: string;           // Required - Format: "YYYY-MM-DD"
  periodEnd: string;             // Required - Format: "YYYY-MM-DD"
  occupancyCount: number;        // Required - >= 1
  meterReadings: Array<{         // Required - Dữ liệu đồng hồ
    roomCostId: string;          // ID của room cost (metered type)
    currentReading: number;       // >= 0
    lastReading: number;        // >= 0
  }>;
  notes?: string;                // Optional
}
```

**Response**: `BillResponseDto` (201 Created)

**Lưu ý**: API này sẽ tự động tính toán bill items dựa trên:
- Room costs (fixed, per_person, metered)
- Occupancy count
- Meter readings
- Proration factor (nếu rental không trọn kỳ)

---

### 1.3. Tổng Kết và Tạo Hóa Đơn Tháng Cho Building
**POST** `/bills/generate-monthly-bills-for-building`

**Role**: `landlord`

**Mô tả**: API này cho phép chủ trọ tạo tự động hóa đơn tháng cho tất cả phòng đang có người thuê trong một building cụ thể. Hệ thống sẽ tự động tính toán chi phí dựa trên:
- Giá thuê phòng (monthly rent)
- Chi phí cố định (fixed costs)
- Chi phí theo đầu người (per-person costs) 
- Chi phí theo đồng hồ (metered costs) - nếu có meter readings
- Tỷ lệ proration nếu rental không trọn kỳ

**Request Body** (`PreviewBuildingBillDto`):
```typescript
{
  buildingId: string;            // Required - ID của building cần tạo bills
  billingPeriod?: string;        // Optional - Format: "YYYY-MM", default: tháng trước
  billingMonth?: number;         // Optional - 1-12, alternative to billingPeriod
  billingYear?: number;          // Optional - >= 2020, alternative to billingPeriod
  periodStart?: string;          // Optional - Format: "YYYY-MM-DD", default: đầu tháng của billingPeriod
  periodEnd?: string;            // Optional - Format: "YYYY-MM-DD", default: cuối tháng của billingPeriod
}
```

**Response** (200 OK):
```typescript
{
  message: string;               // Thông báo kết quả (VD: "Đã tạo 15 hóa đơn, 3 hóa đơn đã tồn tại")
  billsCreated: number;          // Số bills đã tạo mới thành công
  billsExisted: number;         // Số bills đã tồn tại cho kỳ này (bỏ qua)
}
```

**Ví dụ Request**:
```json
{
  "buildingId": "building-123",
  "billingPeriod": "2025-01"
}
```

hoặc:

```json
{
  "buildingId": "building-123",
  "billingMonth": 1,
  "billingYear": 2025,
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31"
}
```

**Ví dụ Response**:
```json
{
  "message": "Đã tạo 15 hóa đơn, 3 hóa đơn đã tồn tại",
  "billsCreated": 15,
  "billsExisted": 3
}
```

**Ví dụ Bill được tạo ra** (khi GET /bills/:id):
```json
{
  "id": "bill-123",
  "status": "draft",
  "requiresMeterData": true,
  "subtotal": 3200000,
  "totalAmount": 3200000,
  "billItems": [
    {
      "itemName": "Tiền thuê phòng",
      "amount": 3000000,
      "costType": "fixed"
    },
    {
      "itemName": "Internet",
      "amount": 150000,
      "costType": "fixed"
    },
    {
      "itemName": "Phí dọn dẹp",
      "amount": 50000,
      "costType": "per_person",
      "quantity": 1
    }
  ],
  "meteredCostsToInput": [
    {
      "roomCostId": "cost-electric-101",
      "name": "Điện",
      "unit": "kWh"
    },
    {
      "roomCostId": "cost-water-101",
      "name": "Nước",
      "unit": "m³"
    }
  ]
}
```

**⚠️ Lưu ý**: Trong ví dụ trên:
- Bill items CHƯA có "Điện" và "Nước"
- `meteredCostsToInput` cho biết cần nhập meter data cho 2 costs này
- Sau khi nhập meter data, "Điện" và "Nước" mới được thêm vào billItems

**Lưu ý quan trọng**:
- **Mặc định billing period**: Nếu không chỉ định, sẽ sử dụng tháng trước (ví dụ: nếu hiện tại là 2025-02, mặc định sẽ là 2025-01)
- **Chỉ tạo bills cho active rentals**: Chỉ phòng đang có hợp đồng thuê active mới được tạo bill
- **Unique constraint**: Mỗi `rentalId` + `billingPeriod` chỉ có 1 bill duy nhất. Nếu đã có bill cho kỳ này, hệ thống sẽ bỏ qua và đếm vào `billsExisted`
- **Trạng thái ban đầu**: Bills được tạo ở trạng thái `draft`
- **Occupancy count**: Mặc định = 1 (có thể cập nhật sau bằng API update-with-meter-data)
- **Xử lý Metered Costs (quan trọng)**:
  - ⚠️ **Hệ thống KHÔNG tự động tạo metered costs với giá trị mặc định**
  - Nếu phòng có metered costs (điện, nước): 
    - `requiresMeterData = true`
    - Bill chỉ bao gồm: rent + fixed costs + per-person costs
    - **KHÔNG bao gồm** metered costs (điện, nước) trong bill items ban đầu
    - Trả về `meteredCostsToInput[]` - danh sách metered costs cần nhập
  - Sau khi gọi `update-with-meter-data` hoặc `:id/meter-data`:
    - Hệ thống mới tính toán và thêm metered costs vào bill items
    - Status tự động chuyển từ `draft` → `pending`
    - `requiresMeterData = false`
  - Nếu phòng không có metered costs: 
    - `requiresMeterData = false`
    - Status = `pending` ngay từ đầu
- **Proration**: Hệ thống tự động tính proration factor nếu rental không bắt đầu/kết thúc đúng kỳ thanh toán
- **Permission**: Chỉ chủ trọ sở hữu building mới có quyền tạo bills cho building đó

**Error Codes**:
- `400 Bad Request`: Dữ liệu đầu vào không hợp lệ (thiếu buildingId, sai format date, etc.)
- `401 Unauthorized`: Chưa đăng nhập
- `403 Forbidden`: Không phải là chủ trọ hoặc không sở hữu building này
- `404 Not Found`: Building không tồn tại

---

## 2. Truy Vấn Hóa Đơn

### 2.1. Lấy Danh Sách Hóa Đơn (Tenant)
**GET** `/bills/tenant/my-bills`

**Role**: `tenant`

**Query Parameters** (`QueryBillDto`):
```typescript
{
  page?: number;                 // Optional - default: 1, min: 1
  limit?: number;                // Optional - default: 20, min: 1, max: 100
  rentalId?: string;             // Optional
  roomInstanceId?: string;       // Optional
  status?: BillStatus;            // Optional - draft, pending, paid, overdue, cancelled
  fromDate?: string;              // Optional - Format: "YYYY-MM-DD"
  toDate?: string;                // Optional - Format: "YYYY-MM-DD"
  billingPeriod?: string;        // Optional - Format: "YYYY-MM"
}
```

**Response**: `PaginatedBillResponseDto`
```typescript
{
  data: BillResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    itemCount: number;
  };
}
```

---

### 2.2. Lấy Danh Sách Hóa Đơn Tháng (Landlord)
**GET** `/bills/landlord/by-month`

**Role**: `landlord`

**Query Parameters** (`QueryBillsForLandlordDto`):
```typescript
{
  page?: number;                 // Optional - default: 1, min: 1
  limit?: number;                // Optional - default: 20, min: 1, max: 100
  buildingId?: string;           // Optional - Lọc theo building
  roomInstanceId?: string;        // Optional - Lọc theo building + room
  billingPeriod?: string;        // Optional - Format: "YYYY-MM"
  billingMonth?: number;         // Optional - 1-12
  billingYear?: number;          // Optional - >= 2020
  status?: BillStatus;            // Optional - draft, pending, paid, overdue, cancelled
  search?: string;                // Optional - Tìm theo tên/số phòng
  sortBy?: string;                // Optional - roomName, status, totalAmount, createdAt, dueDate, default: roomName
  sortOrder?: 'asc' | 'desc';     // Optional - default: asc
}
```

**Response**: `PaginatedBillResponseDto`

**Lưu ý**:
- Mặc định billing period = tháng hiện tại nếu không chỉ định
- Nếu có `roomInstanceId`, filter `buildingId` bị bỏ qua
- `search` tìm kiếm theo tên phòng hoặc số phòng

---

### 2.3. Lấy Danh Sách Hóa Đơn (General)
**GET** `/bills`

**Roles**: `tenant`, `landlord`

**Query Parameters**: Tương tự `QueryBillDto` (xem 2.1)

**Response**: `PaginatedBillResponseDto`

**Lưu ý**: 
- Tenant chỉ thấy bills của mình
- Landlord chỉ thấy bills của buildings mình sở hữu

---

### 2.4. Lấy Chi Tiết Hóa Đơn
**GET** `/bills/:id`

**Roles**: `tenant`, `landlord`

**Path Parameters**:
- `id`: string - ID của bill

**Response**: `BillResponseDto`

---

## 3. Cập Nhật Hóa Đơn

### 3.1. Cập Nhật Hóa Đơn (Basic)
**PATCH** `/bills/:id`

**Role**: `landlord`

**Path Parameters**:
- `id`: string - ID của bill

**Request Body** (`UpdateBillDto`):
```typescript
{
  status?: BillStatus;           // Optional
  discountAmount?: number;        // Optional - >= 0
  taxAmount?: number;             // Optional - >= 0
  totalAmount?: number;           // Optional - >= 0
  dueDate?: string;               // Optional - Format: "YYYY-MM-DD"
  notes?: string;                  // Optional
}
```

**Response**: `BillResponseDto`

---

### 3.2. Cập Nhật Bill Với Meter Data và Occupancy
**POST** `/bills/update-with-meter-data`

**Role**: `landlord`

**Request Body** (`UpdateBillWithMeterDataDto`):
```typescript
{
  billId: string;                 // Required
  occupancyCount: number;        // Required - >= 1
  meterData: Array<{             // Required
    roomCostId: string;           // ID của room cost (metered type)
    currentReading: number;       // >= 0
    lastReading: number;          // >= 0
  }>;
}
```

**Response**: `BillResponseDto`

**Lưu ý**: API này sẽ:
- Cập nhật meter readings trong RoomCost
- Cập nhật occupancyCount trong Bill
- Tính lại tất cả bill items
- Cập nhật totals (subtotal, totalAmount, remainingAmount)

---

### 3.3. Cập Nhật Meter Data Cho Bill Cụ Thể
**POST** `/bills/:id/meter-data`

**Role**: `landlord`

**Path Parameters**:
- `id`: string - ID của bill

**Request Body**: `MeterDataDto[]`
```typescript
[
  {
    roomCostId: string;           // Required
    currentReading: number;        // Required - >= 0
    lastReading: number;          // Required - >= 0
  }
]
```

**Response**: `BillResponseDto`

**Lưu ý**: Chỉ cập nhật meter data, không cập nhật occupancy.

---

## 4. Đánh Dấu Thanh Toán

### 4.1. Đánh Dấu Hóa Đơn Đã Thanh Toán
**POST** `/bills/:id/mark-paid`

**Role**: `landlord`

**Path Parameters**:
- `id`: string - ID của bill

**Response**: `BillResponseDto`

**Lưu ý**: 
- Tự động cập nhật `status = paid`
- Tự động cập nhật `paidDate = now()`
- Tự động cập nhật `paidAmount = totalAmount`

---

## 5. Xóa Hóa Đơn

### 5.1. Xóa Hóa Đơn
**DELETE** `/bills/:id`

**Role**: `landlord`

**Path Parameters**:
- `id`: string - ID của bill

**Response**: `204 No Content`

**Lưu ý**: 
- Chỉ cho phép xóa bills ở trạng thái `draft` hoặc `pending`
- Không thể xóa bills đã thanh toán (`paid`)

---

## Data Models

### Bill Status Lifecycle

```
draft → pending → paid
  ↓        ↓        
cancelled  overdue → paid
```

### BillStatus Enum
```typescript
enum BillStatus {
  draft = 'draft',        // Nháp - Bills vừa tạo, chưa đủ thông tin hoặc chưa gửi tenant
  pending = 'pending',    // Chờ thanh toán - Bills đã gửi tenant, đang chờ thanh toán
  paid = 'paid',          // Đã thanh toán - Bills đã được thanh toán
  overdue = 'overdue',    // Quá hạn - Bills đã quá dueDate mà chưa thanh toán
  cancelled = 'cancelled' // Đã hủy - Bills bị hủy bỏ
}
```

### CostType Enum (cho BillItem)
```typescript
enum CostType {
  fixed = 'fixed',           // Chi phí cố định (VD: tiền phòng, internet)
  per_person = 'per_person', // Chi phí theo đầu người (VD: phí dọn dẹp, rác)
  metered = 'metered'        // Chi phí theo đồng hồ (VD: điện, nước)
}
```

### BillItemType Enum
```typescript
enum BillItemType {
  rent = 'rent',         // Tiền thuê phòng
  utility = 'utility',   // Tiện ích (điện, nước, internet, etc.)
  service = 'service',   // Dịch vụ (dọn dẹp, bảo trì, etc.)
  other = 'other'        // Chi phí khác
}
```

### BillResponseDto
```typescript
{
  id: string;
  rentalId: string;
  roomInstanceId: string;
  billingPeriod: string;          // "YYYY-MM"
  billingMonth: number;           // 1-12
  billingYear: number;
  periodStart: Date;
  periodEnd: Date;
  rentalStartDate?: Date;         // Ngày bắt đầu rental trong kỳ
  rentalEndDate?: Date;           // Ngày kết thúc rental trong kỳ
  occupancyCount?: number;        // Số người ở
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BillStatus;
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  isAutoGenerated: boolean;
  requiresMeterData: boolean;     // Có cần nhập meter data không
  createdAt: Date;
  updatedAt: Date;
  billItems: BillItemDto[];
  rental?: {
    id: string;
    monthlyRent: number;
    roomInstance: {
      roomNumber: string;
      room: {
        name: string;
      };
    };
  };
  meteredCostsToInput?: Array<{     // Danh sách metered costs cần nhập data
    roomCostId: string;             // ID để truyền lên khi update meter data
    name: string;                   // Tên cost (VD: "Điện", "Nước")
    unit: string;                    // Đơn vị (VD: "kWh", "m³")
  }>;
}
```

### BillItemDto
```typescript
{
  id: string;
  billId: string;
  itemType: BillItemType;         // rent, utility, service, other
  itemName: string;               // Tên item (VD: "Tiền thuê phòng", "Điện", "Nước")
  description?: string;           // Mô tả chi tiết (VD: "Tiền thuê phòng (100% tháng)")
  quantity: number;               // Số lượng
  unitPrice: number;              // Đơn giá
  amount: number;                 // Thành tiền = quantity × unitPrice
  currency: string;               // Đơn vị tiền tệ (VD: "VND")
  roomCostId?: string;            // ID của RoomCost (nếu được tính từ RoomCost)
  costType?: CostType;            // fixed, per_person, metered (nếu có)
  meterReading?: {                // Chỉ có nếu costType = metered
    lastReading: number;          // Chỉ số cũ
    currentReading: number;       // Chỉ số mới
    consumption: number;          // Lượng tiêu thụ = currentReading - lastReading
    unit: string;                 // Đơn vị (VD: "kWh", "m³")
  };
  prorationFactor?: number;       // Hệ số proration (0-1) nếu rental không trọn kỳ
  createdAt: Date;
  updatedAt: Date;
}
```

### Cách Tính Toán Bill Items

#### 1. Fixed Costs (Chi phí cố định)
```
amount = unitPrice × prorationFactor
```
- Ví dụ: Tiền thuê phòng 3,000,000 VND/tháng
- Nếu thuê trọn tháng: amount = 3,000,000 × 1 = 3,000,000
- Nếu chỉ thuê 15 ngày trong tháng 30 ngày: amount = 3,000,000 × (15/30) = 1,500,000

#### 2. Per-Person Costs (Chi phí theo đầu người)
```
amount = unitPrice × occupancyCount × prorationFactor
```
- Ví dụ: Phí dọn dẹp 100,000 VND/người/tháng, có 2 người ở
- Nếu thuê trọn tháng: amount = 100,000 × 2 × 1 = 200,000
- Nếu chỉ thuê 20 ngày trong tháng 30 ngày: amount = 100,000 × 2 × (20/30) = 133,333

#### 3. Metered Costs (Chi phí theo đồng hồ)
```
consumption = currentReading - lastReading
amount = consumption × unitPrice
```
- Ví dụ: Điện 3,500 VND/kWh
- Chỉ số cũ: 1200 kWh, chỉ số mới: 1500 kWh
- Consumption = 1500 - 1200 = 300 kWh
- Amount = 300 × 3,500 = 1,050,000 VND

#### 4. Proration Factor
```
prorationFactor = số ngày rental trong kỳ / tổng số ngày của kỳ
```
- Ví dụ 1: Rental từ 01/01 đến 31/01, kỳ billing từ 01/01 đến 31/01
  - prorationFactor = 31 / 31 = 1.0 (100%)
  
- Ví dụ 2: Rental từ 15/01 đến 31/01, kỳ billing từ 01/01 đến 31/01
  - prorationFactor = 17 / 31 ≈ 0.548 (54.8%)
  
- Ví dụ 3: Rental từ 01/01 đến 15/01, kỳ billing từ 01/01 đến 31/01
  - prorationFactor = 15 / 31 ≈ 0.484 (48.4%)

### PaginatedBillResponseDto
```typescript
{
  data: BillResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    itemCount: number;
  };
}
```

---

## Best Practices

### 1. Tạo Bills Tháng (Chi tiết từng bước)

#### Bước 1: Tạo Bills cho toàn Building
```bash
POST /bills/generate-monthly-bills-for-building
{
  "buildingId": "building-123",
  "billingPeriod": "2025-01"
}
```

**Kết quả**: 
- Bills được tạo với status = `draft`
- Chỉ có: Tiền phòng + Fixed costs + Per-person costs
- KHÔNG có: Metered costs (điện, nước)

#### Bước 2: Lấy danh sách bills cần nhập meter data
```bash
GET /bills/landlord/by-month?status=draft&requiresMeterData=true&billingPeriod=2025-01
```

**Response**: Danh sách bills có `requiresMeterData = true`

Mỗi bill sẽ có `meteredCostsToInput`:
```json
{
  "id": "bill-room-101",
  "status": "draft",
  "requiresMeterData": true,
  "meteredCostsToInput": [
    {
      "roomCostId": "cost-electric-101",
      "name": "Điện",
      "unit": "kWh"
    },
    {
      "roomCostId": "cost-water-101",
      "name": "Nước",
      "unit": "m³"
    }
  ]
}
```

#### Bước 3: Nhập meter data cho từng phòng
```bash
POST /bills/update-with-meter-data
{
  "billId": "bill-room-101",
  "occupancyCount": 2,
  "meterData": [
    {
      "roomCostId": "cost-electric-101",
      "currentReading": 1520.5,  // Chỉ số hiện tại (bạn nhập)
      "lastReading": 1200.0      // Chỉ số kỳ trước (bạn nhập)
    },
    {
      "roomCostId": "cost-water-101",
      "currentReading": 155.2,
      "lastReading": 145.0
    }
  ]
}
```

**Hệ thống tự động**:
- Tính consumption: 1520.5 - 1200.0 = 320.5 kWh
- Tính amount: 320.5 × 3,500 = 1,121,750 VND
- Thêm bill item "Điện" vào bill
- Tương tự cho "Nước"
- Cập nhật totalAmount
- Chuyển status: `draft` → `pending`
- Set `requiresMeterData = false`

#### Bước 4: Xem lại bills đã hoàn thành
```bash
GET /bills/landlord/by-month?status=pending&billingPeriod=2025-01
```

**Kết quả**: Bills đã có đầy đủ thông tin, sẵn sàng gửi cho tenant

---

### 2. Xử Lý Bills
1. Xem danh sách bills: `GET /bills/landlord/by-month`
2. Filter theo building, room, status, v.v.
3. Xem chi tiết: `GET /bills/:id`
4. Cập nhật nếu cần: `PATCH /bills/:id`
5. Đánh dấu thanh toán: `POST /bills/:id/mark-paid`

### 3. Tenant Xem Bills
1. Xem danh sách: `GET /bills/tenant/my-bills`
2. Filter theo status, billing period, v.v.
3. Xem chi tiết: `GET /bills/:id`

---

## Error Codes

### HTTP Status Codes

| Status Code | Description | Ví dụ |
|------------|-------------|-------|
| 200 | OK - Request thành công | GET /bills/:id |
| 201 | Created - Tạo resource thành công | POST /bills |
| 204 | No Content - Xóa thành công | DELETE /bills/:id |
| 400 | Bad Request - Dữ liệu đầu vào không hợp lệ | Thiếu required fields, sai format date |
| 401 | Unauthorized - Chưa đăng nhập | Missing hoặc invalid JWT token |
| 403 | Forbidden - Không có quyền truy cập | Tenant cố truy cập bills của người khác |
| 404 | Not Found - Resource không tồn tại | Bill/Rental/Building/RoomInstance không tồn tại |
| 409 | Conflict - Xung đột dữ liệu | Bill đã tồn tại cho rental + billingPeriod |
| 422 | Unprocessable Entity - Logic error | Cố xóa bill đã thanh toán, meter reading không hợp lệ |
| 500 | Internal Server Error - Lỗi server | Lỗi không mong đợi |

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "buildingId must be a string",
    "billingPeriod must match YYYY-MM format"
  ],
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You don't have permission to access this building",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Bill not found",
  "error": "Not Found"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Bill already exists for this rental and billing period",
  "error": "Conflict"
}
```

#### 422 Unprocessable Entity
```json
{
  "statusCode": 422,
  "message": "Cannot delete a bill that has been paid",
  "error": "Unprocessable Entity"
}
```

---

## Response Mẫu

### Response Mẫu - Bill cần nhập Meter Data

```json
{
  "id": "bill-123",
  "rentalId": "rental-456",
  "roomInstanceId": "room-instance-789",
  "billingPeriod": "2025-01",
  "billingMonth": 1,
  "billingYear": 2025,
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "subtotal": 3000000,
  "discountAmount": 0,
  "taxAmount": 0,
  "totalAmount": 3000000,
  "paidAmount": 0,
  "remainingAmount": 3000000,
  "status": "draft",
  "dueDate": "2025-01-31",
  "notes": "Auto-generated bill for 2025-01",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z",
  "billItems": [
    {
      "id": "item-1",
      "itemType": "utility",
      "itemName": "Tiền thuê phòng",
      "description": "Tiền thuê phòng (100% tháng)",
      "quantity": 1,
      "unitPrice": 3000000,
      "amount": 3000000,
      "currency": "VND",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "rental": {
    "id": "rental-456",
    "monthlyRent": 3000000,
    "roomInstance": {
      "roomNumber": "101",
      "room": {
        "name": "Phòng đôi"
      }
    }
  },
  "meteredCostsToInput": [
    {
      "roomCostId": "room-cost-1",
      "name": "Điện",
      "unit": "kWh"
    },
    {
      "roomCostId": "room-cost-2",
      "name": "Nước",
      "unit": "m³"
    }
  ]
}
```

### Request Mẫu - Update Meter Data

```json
{
  "billId": "bill-123",
  "occupancyCount": 2,
  "meterData": [
    {
      "roomCostId": "room-cost-1",
      "currentReading": 1500.5,
      "lastReading": 1200.0
    },
    {
      "roomCostId": "room-cost-2",
      "currentReading": 150.5,
      "lastReading": 120.0
    }
  ]
}
```

**Lưu ý về `meteredCostsToInput`**:
- Chỉ trả về các metered costs **chưa có readings** (cần nhập)
- Frontend dùng `roomCostId` để truyền lên khi update meter data
- Sau khi update meter data:
  - Hệ thống sẽ tính lại bill items với meter readings mới
  - Tự động cập nhật status: `draft` → `pending` (nếu có metered costs)
  - Phòng không có metered costs: status = `pending` ngay từ khi tạo

---

## Notes

- Tất cả dates sử dụng ISO 8601 format: `YYYY-MM-DD`
- Billing period format: `YYYY-MM`
- Tất cả amounts là số dương (>= 0)
- Pagination: `page` bắt đầu từ 1, `limit` tối đa 100
- Unique constraint: Mỗi `rentalId` + `billingPeriod` chỉ có 1 bill
- **Metered Costs**: 
  - Response chỉ trả về `meteredCostsToInput` (chỉ những metered costs chưa có readings)
  - Phòng không có metered costs: status = `pending` ngay từ khi tạo
  - Phòng có metered costs chưa có readings: status = `draft`
  - Sau khi nhập đủ meter data: status tự động chuyển từ `draft` → `pending`

---

## Use Cases - Kịch Bản Thực Tế

### Use Case 1: Tạo Bills Cuối Tháng Cho Toàn Bộ Building

**Bối cảnh**: Chủ trọ muốn tạo hóa đơn cho tất cả phòng trong building vào cuối tháng 1/2025

**Bước thực hiện**:

1. **Tạo bills tháng 1/2025**
```http
POST /bills/generate-monthly-bills-for-building
Authorization: Bearer <landlord_token>

{
  "buildingId": "building-abc-123",
  "billingPeriod": "2025-01"
}
```

Response:
```json
{
  "message": "Đã tạo 18 hóa đơn, 2 hóa đơn đã tồn tại",
  "billsCreated": 18,
  "billsExisted": 2
}
```

2. **Lấy danh sách bills draft để xử lý**
```http
GET /bills/landlord/by-month?buildingId=building-abc-123&status=draft&billingPeriod=2025-01
Authorization: Bearer <landlord_token>
```

3. **Cập nhật meter data cho từng phòng**

Phòng 101 (có điện, nước):
```http
POST /bills/update-with-meter-data
Authorization: Bearer <landlord_token>

{
  "billId": "bill-room-101",
  "occupancyCount": 2,
  "meterData": [
    {
      "roomCostId": "cost-electric-101",
      "currentReading": 1520.5,
      "lastReading": 1200.0
    },
    {
      "roomCostId": "cost-water-101",
      "currentReading": 155.2,
      "lastReading": 145.0
    }
  ]
}
```

4. **Xem lại danh sách bills pending**
```http
GET /bills/landlord/by-month?buildingId=building-abc-123&status=pending&billingPeriod=2025-01
Authorization: Bearer <landlord_token>
```

5. **Đánh dấu bills đã thanh toán khi tenant chuyển tiền**
```http
POST /bills/bill-room-101/mark-paid
Authorization: Bearer <landlord_token>
```

---

### Use Case 2: Tenant Thuê Phòng Giữa Tháng

**Bối cảnh**: Tenant thuê phòng từ ngày 15/01/2025, kỳ thanh toán từ 01/01-31/01

**Calculation**:
- Tổng ngày trong kỳ: 31 ngày
- Số ngày thuê: 17 ngày (từ 15/01 đến 31/01)
- Proration factor: 17/31 ≈ 0.548

**Bill Items**:
1. Tiền thuê phòng: 3,000,000 × 0.548 = 1,644,000 VND
2. Internet (fixed): 150,000 × 0.548 = 82,200 VND
3. Phí dọn dẹp (per-person, 2 người): 100,000 × 2 × 0.548 = 109,600 VND
4. Điện (metered): 300 kWh × 3,500 = 1,050,000 VND (không prorate)
5. Nước (metered): 10 m³ × 25,000 = 250,000 VND (không prorate)

**Total**: 3,135,800 VND

---

### Use Case 3: Tenant Xem Bills Của Mình

**Bước thực hiện**:

1. **Xem tất cả bills**
```http
GET /bills/tenant/my-bills
Authorization: Bearer <tenant_token>
```

2. **Xem bills chưa thanh toán**
```http
GET /bills/tenant/my-bills?status=pending
Authorization: Bearer <tenant_token>
```

3. **Xem bills của tháng 1/2025**
```http
GET /bills/tenant/my-bills?billingPeriod=2025-01
Authorization: Bearer <tenant_token>
```

4. **Xem chi tiết một bill**
```http
GET /bills/bill-123
Authorization: Bearer <tenant_token>
```

Response sẽ bao gồm:
- Thông tin bill (tổng tiền, trạng thái, hạn thanh toán)
- Chi tiết từng bill item (tiền phòng, điện, nước, etc.)
- Thông tin phòng (số phòng, tên phòng)
- Meter readings (nếu có)

---

### Use Case 4: Cập Nhật Bill Khi Có Sai Sót

**Bối cảnh**: Landlord phát hiện nhập sai meter reading cho bill đã tạo

**Bước thực hiện**:

1. **Xem chi tiết bill hiện tại**
```http
GET /bills/bill-123
Authorization: Bearer <landlord_token>
```

2. **Cập nhật lại meter data**
```http
POST /bills/bill-123/meter-data
Authorization: Bearer <landlord_token>

[
  {
    "roomCostId": "cost-electric-101",
    "currentReading": 1530.5,
    "lastReading": 1200.0
  }
]
```

Hệ thống sẽ:
- Tự động tính lại consumption: 1530.5 - 1200.0 = 330.5 kWh
- Tự động tính lại amount: 330.5 × 3,500 = 1,156,750 VND
- Cập nhật lại totalAmount của bill

3. **Hoặc cập nhật thủ công các thông tin khác**
```http
PATCH /bills/bill-123
Authorization: Bearer <landlord_token>

{
  "discountAmount": 100000,
  "notes": "Giảm giá 100k cho khách hàng thân thiết",
  "dueDate": "2025-02-10"
}
```

---

### Use Case 5: Xử Lý Bills Quá Hạn

**Bối cảnh**: Hệ thống cần xử lý bills quá hạn thanh toán

1. **Lấy danh sách bills quá hạn**
```http
GET /bills/landlord/by-month?status=overdue&buildingId=building-123
Authorization: Bearer <landlord_token>
```

2. **Xem chi tiết để liên hệ tenant**
```http
GET /bills/bill-overdue-456
Authorization: Bearer <landlord_token>
```

3. **Sau khi tenant thanh toán, đánh dấu đã paid**
```http
POST /bills/bill-overdue-456/mark-paid
Authorization: Bearer <landlord_token>
```

---

### Use Case 6: Xóa Bill Tạo Nhầm

**Bối cảnh**: Landlord tạo nhầm bill cho phòng không có người thuê

**Bước thực hiện**:

1. **Kiểm tra status của bill**
```http
GET /bills/bill-wrong-789
Authorization: Bearer <landlord_token>
```

2. **Xóa bill nếu ở trạng thái draft hoặc pending**
```http
DELETE /bills/bill-wrong-789
Authorization: Bearer <landlord_token>
```

**Lưu ý**: Chỉ có thể xóa bills ở trạng thái `draft` hoặc `pending`. Bills đã `paid` không thể xóa.

---

## Performance & Optimization Tips

### 1. Pagination
- Luôn sử dụng pagination khi lấy danh sách bills
- Limit mặc định là 20, tối đa 100
- Không lấy toàn bộ bills một lúc để tránh quá tải

### 2. Filtering
- Sử dụng các filters (buildingId, roomInstanceId, status, billingPeriod) để giảm kết quả trả về
- Ví dụ: Thay vì lấy tất cả bills rồi filter ở client, hãy filter ngay ở API

### 3. Caching
- Response của bills có thể cache ở client side
- Invalidate cache khi có thay đổi (update, mark-paid, delete)

### 4. Bulk Operations
- Sử dụng `generate-monthly-bills-for-building` để tạo nhiều bills cùng lúc
- Hiệu quả hơn việc gọi `create-for-room` nhiều lần

### 5. Meter Data Updates
- Nên cập nhật meter data ngay sau khi tạo bills
- Avoid gọi API nhiều lần cho cùng một bill
- Sử dụng `update-with-meter-data` để cập nhật cả occupancy và meter data cùng lúc


