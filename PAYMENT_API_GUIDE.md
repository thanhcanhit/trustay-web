# Payment API Guide - Frontend Implementation

Hướng dẫn tích hợp Payment API cho Frontend Developer.

## 📋 Table of Contents

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Implementation Guide](#implementation-guide)
- [Use Cases & Examples](#use-cases--examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Overview

Payment API quản lý tất cả các giao dịch thanh toán trong hệ thống Trustay, bao gồm tiền thuê, tiền cọc, tiền tiện ích, và hoàn tiền.

### Base URL
```
/api/payments
```

### Authentication
Tất cả endpoints yêu cầu JWT Bearer Token:
```
Authorization: Bearer <token>
```

### Roles
- `tenant` - Người thuê trọ
- `landlord` - Chủ nhà

---

## API Endpoints

### 1. Tạo Thanh Toán Mới

**`POST /payments`**

Tạo thanh toán cho rental (cả tenant và landlord đều có thể tạo).

**Request:**
```typescript
{
  rentalId: string;                    // Required - ID của rental
  billId?: string;                     // Optional - ID của bill
  paymentType: PaymentType;            // Required - Loại thanh toán
  amount: number;                      // Required - Số tiền thanh toán
  currency?: string;                   // Optional - Loại tiền tệ (default: 'VND')
  paymentMethod?: PaymentMethod;       // Optional - Phương thức thanh toán
  dueDate?: string;                    // Optional - Ngày đáo hạn (ISO date)
  description?: string;                // Optional - Mô tả thanh toán
  transactionReference?: string;       // Optional - Mã giao dịch tham chiếu
}
```

**Response (201 Created):**
```typescript
{
  id: string;
  rentalId: string;
  billId?: string;
  payerId: string;
  paymentType: PaymentType;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  dueDate?: Date;
  paymentDate?: Date;
  description?: string;
  transactionReference?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations
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
  bill?: {
    id: string;
    billingPeriod: string;
    totalAmount: number;
  };
  payer?: {
    id: string;
    name: string;
    email: string;
  };
}
```

**Error Responses:**
- `400` - Dữ liệu không hợp lệ
- `403` - Không có quyền tạo thanh toán cho rental này
- `404` - Rental hoặc bill không tồn tại

**Example:**
```typescript
const createPayment = async (paymentData) => {
  try {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rentalId: 'rental-123',
        billId: 'bill-456',
        paymentType: 'rent',
        amount: 3000000,
        paymentMethod: 'bank_transfer',
        description: 'Tiền thuê tháng 11/2025'
      })
    });
    
    if (!response.ok) throw new Error('Failed to create payment');
    return await response.json();
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};
```

---

### 2. Lấy Danh Sách Thanh Toán

**`GET /payments`**

Lấy tất cả thanh toán của user hiện tại với phân trang và lọc.

**Query Parameters:**
```typescript
{
  page?: number;                       // Optional - default: 1, min: 1
  limit?: number;                      // Optional - default: 20, min: 1, max: 100
  rentalId?: string;                   // Optional - Lọc theo rental
  paymentType?: PaymentType;           // Optional - Lọc theo loại thanh toán
  paymentStatus?: PaymentStatus;       // Optional - Lọc theo trạng thái
  fromDate?: string;                   // Optional - Từ ngày (ISO date)
  toDate?: string;                     // Optional - Đến ngày (ISO date)
}
```

**Response (200 OK):**
```typescript
{
  data: PaymentResponseDto[];
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

**Example:**
```typescript
const getPayments = async (filters) => {
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 20,
    ...(filters.rentalId && { rentalId: filters.rentalId }),
    ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
    ...(filters.fromDate && { fromDate: filters.fromDate }),
    ...(filters.toDate && { toDate: filters.toDate })
  });
  
  const response = await fetch(`/api/payments?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Failed to fetch payments');
  return await response.json();
};
```

---

### 3. Lấy Lịch Sử Thanh Toán

**`GET /payments/history`**

Alias endpoint cho việc lấy danh sách thanh toán (đặc biệt dành cho tenant).

**Query Parameters:** Tương tự `GET /payments`

**Response:** Tương tự `GET /payments`

**Example:**
```typescript
// Tenant xem lịch sử thanh toán
const getPaymentHistory = async (rentalId) => {
  const response = await fetch(
    `/api/payments/history?rentalId=${rentalId}&paymentStatus=completed`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) throw new Error('Failed to fetch payment history');
  return await response.json();
};
```

---

### 4. Lấy Chi Tiết Thanh Toán

**`GET /payments/:id`**

Lấy thông tin chi tiết một thanh toán.

**Path Parameters:**
- `id`: UUID - ID của thanh toán

**Response (200 OK):** `PaymentResponseDto`

**Error Responses:**
- `403` - Không có quyền xem thanh toán này
- `404` - Thanh toán không tồn tại

**Example:**
```typescript
const getPaymentDetail = async (paymentId) => {
  const response = await fetch(`/api/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Failed to fetch payment detail');
  return await response.json();
};
```

---

### 5. Cập Nhật Thanh Toán

**`PUT /payments/:id`**

Cập nhật thông tin thanh toán như trạng thái, ngày thanh toán, etc.

**Path Parameters:**
- `id`: UUID - ID của thanh toán

**Request Body:**
```typescript
{
  // Tất cả fields từ CreatePaymentDto (optional)
  rentalId?: string;
  billId?: string;
  paymentType?: PaymentType;
  amount?: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  dueDate?: string;
  description?: string;
  transactionReference?: string;
  
  // Additional fields
  paymentStatus?: PaymentStatus;       // Optional - Trạng thái thanh toán
  paymentDate?: string;                // Optional - Ngày thanh toán thực tế (ISO date)
}
```

**Response (200 OK):** `PaymentResponseDto`

**Error Responses:**
- `400` - Dữ liệu không hợp lệ
- `403` - Không có quyền cập nhật thanh toán này
- `404` - Thanh toán không tồn tại

**Example:**
```typescript
const updatePaymentStatus = async (paymentId, status) => {
  const response = await fetch(`/api/payments/${paymentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      paymentStatus: status,
      paymentDate: new Date().toISOString()
    })
  });
  
  if (!response.ok) throw new Error('Failed to update payment');
  return await response.json();
};
```

---

### 6. Xóa Thanh Toán

**`DELETE /payments/:id`**

Xóa thanh toán (chỉ những thanh toán chưa hoàn thành).

**Path Parameters:**
- `id`: UUID - ID của thanh toán

**Response:** `200 OK` (void)

**Error Responses:**
- `400` - Không thể xóa thanh toán đã hoàn thành
- `403` - Không có quyền xóa thanh toán này
- `404` - Thanh toán không tồn tại

**Example:**
```typescript
const deletePayment = async (paymentId) => {
  const response = await fetch(`/api/payments/${paymentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Failed to delete payment');
};
```

---

## Data Models

### PaymentType (Loại Thanh Toán)

```typescript
enum PaymentType {
  rent = 'rent',           // Tiền thuê
  deposit = 'deposit',     // Tiền cọc/đặt cọc
  utility = 'utility',     // Tiền tiện ích (điện, nước, etc.)
  fee = 'fee',             // Phí dịch vụ
  refund = 'refund'        // Hoàn tiền
}
```

### PaymentMethod (Phương Thức Thanh Toán)

```typescript
enum PaymentMethod {
  bank_transfer = 'bank_transfer',   // Chuyển khoản ngân hàng
  cash = 'cash',                     // Tiền mặt
  e_wallet = 'e_wallet',             // Ví điện tử
  card = 'card'                      // Thẻ tín dụng/ghi nợ
}
```

### PaymentStatus (Trạng Thái Thanh Toán)

```typescript
enum PaymentStatus {
  pending = 'pending',       // Chờ xử lý
  completed = 'completed',   // Đã hoàn thành
  failed = 'failed',         // Thất bại
  refunded = 'refunded'      // Đã hoàn tiền
}
```

---

## Implementation Guide

### 1. Setup TypeScript Types

```typescript
// types/payment.types.ts

export enum PaymentType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  UTILITY = 'utility',
  FEE = 'fee',
  REFUND = 'refund'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  E_WALLET = 'e_wallet',
  CARD = 'card'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface Payment {
  id: string;
  rentalId: string;
  billId?: string;
  payerId: string;
  paymentType: PaymentType;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  dueDate?: Date;
  paymentDate?: Date;
  description?: string;
  transactionReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDto {
  rentalId: string;
  billId?: string;
  paymentType: PaymentType;
  amount: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  dueDate?: string;
  description?: string;
  transactionReference?: string;
}

export interface UpdatePaymentDto extends Partial<CreatePaymentDto> {
  paymentStatus?: PaymentStatus;
  paymentDate?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  rentalId?: string;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}

export interface PaginatedPaymentResponse {
  data: Payment[];
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

### 2. Create API Service

```typescript
// services/payment.service.ts

import { 
  Payment, 
  CreatePaymentDto, 
  UpdatePaymentDto, 
  PaymentFilters,
  PaginatedPaymentResponse 
} from '@/types/payment.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class PaymentService {
  private async request<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> {
    const token = localStorage.getItem('token'); // or from your auth context
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  }

  // Create payment
  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get payments list
  async getPayments(filters?: PaymentFilters): Promise<PaginatedPaymentResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/payments?${queryString}` : '/payments';
    
    return this.request<PaginatedPaymentResponse>(endpoint);
  }

  // Get payment history
  async getPaymentHistory(filters?: PaymentFilters): Promise<PaginatedPaymentResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/payments/history?${queryString}` : '/payments/history';
    
    return this.request<PaginatedPaymentResponse>(endpoint);
  }

  // Get payment by ID
  async getPaymentById(paymentId: string): Promise<Payment> {
    return this.request<Payment>(`/payments/${paymentId}`);
  }

  // Update payment
  async updatePayment(paymentId: string, data: UpdatePaymentDto): Promise<Payment> {
    return this.request<Payment>(`/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete payment
  async deletePayment(paymentId: string): Promise<void> {
    return this.request<void>(`/payments/${paymentId}`, {
      method: 'DELETE',
    });
  }
}

export const paymentService = new PaymentService();
```

---

### 3. React Hooks (Optional)

```typescript
// hooks/usePayments.ts

import { useState, useEffect } from 'react';
import { paymentService } from '@/services/payment.service';
import { Payment, PaymentFilters, PaginatedPaymentResponse } from '@/types/payment.types';

export const usePayments = (filters?: PaymentFilters) => {
  const [data, setData] = useState<PaginatedPaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const result = await paymentService.getPayments(filters);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [JSON.stringify(filters)]);

  const refetch = async () => {
    try {
      setLoading(true);
      const result = await paymentService.getPayments(filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const usePaymentDetail = (paymentId: string) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const result = await paymentService.getPaymentById(paymentId);
        setPayment(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

  return { payment, loading, error };
};
```

---

## Use Cases & Examples

### Use Case 1: Tenant Thanh Toán Tiền Thuê Hàng Tháng

**Scenario**: Tenant xem bill và tạo payment để thanh toán tiền thuê tháng.

**Flow**:
1. Tenant xem bills: `GET /bills/tenant/my-bills?status=pending`
2. Tenant chọn bill cần thanh toán
3. Tenant tạo payment: `POST /payments`
4. Sau khi thanh toán thực tế (chuyển khoản), Tenant/Landlord cập nhật status
5. Landlord mark bill as paid: `POST /bills/:id/mark-paid`

**Implementation:**
```typescript
// Component: PayBillButton.tsx
const PayBillButton = ({ bill, rental }) => {
  const [loading, setLoading] = useState(false);
  
  const handlePayBill = async () => {
    try {
      setLoading(true);
      
      // Step 1: Create payment
      const payment = await paymentService.createPayment({
        rentalId: rental.id,
        billId: bill.id,
        paymentType: PaymentType.UTILITY,
        amount: bill.totalAmount,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        description: `Thanh toán hóa đơn ${bill.billingPeriod}`
      });
      
      // Step 2: Show payment instructions (bank info, QR code, etc.)
      showPaymentInstructions(payment);
      
      // Step 3: After user confirms payment, update status
      // (This can be done automatically via webhook or manually by landlord)
      
      toast.success('Đã tạo thanh toán thành công!');
    } catch (error) {
      toast.error('Không thể tạo thanh toán');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handlePayBill} disabled={loading}>
      {loading ? 'Đang xử lý...' : 'Thanh toán'}
    </button>
  );
};
```

---

### Use Case 2: Landlord Xem Danh Sách Thanh Toán

**Scenario**: Landlord xem tất cả thanh toán của một rental hoặc tất cả rentals.

**Implementation:**
```typescript
// Component: PaymentList.tsx
const PaymentList = ({ rentalId }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    rentalId: rentalId,
    paymentStatus: undefined,
  });
  
  const { data, loading, error, refetch } = usePayments(filters);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <div className="filters">
        <select 
          value={filters.paymentStatus || ''} 
          onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="failed">Thất bại</option>
        </select>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Mã giao dịch</th>
            <th>Loại</th>
            <th>Số tiền</th>
            <th>Trạng thái</th>
            <th>Ngày thanh toán</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.transactionReference || payment.id}</td>
              <td>{formatPaymentType(payment.paymentType)}</td>
              <td>{formatCurrency(payment.amount)}</td>
              <td>
                <StatusBadge status={payment.paymentStatus} />
              </td>
              <td>{formatDate(payment.paymentDate)}</td>
              <td>
                <button onClick={() => viewDetail(payment.id)}>
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Pagination 
        currentPage={data?.meta.page} 
        totalPages={data?.meta.totalPages}
        onPageChange={(page) => setFilters({...filters, page})}
      />
    </div>
  );
};
```

---

### Use Case 3: Landlord Tạo Payment Record Cho Tiền Cọc

**Scenario**: Landlord tạo payment record khi tenant đặt cọc.

**Implementation:**
```typescript
// Component: CreateDepositPayment.tsx
const CreateDepositPayment = ({ rental }) => {
  const [amount, setAmount] = useState(rental.monthlyRent * 2);
  const [method, setMethod] = useState(PaymentMethod.CASH);
  const [loading, setLoading] = useState(false);
  
  const handleCreateDeposit = async () => {
    try {
      setLoading(true);
      
      const payment = await paymentService.createPayment({
        rentalId: rental.id,
        paymentType: PaymentType.DEPOSIT,
        amount: amount,
        paymentMethod: method,
        paymentStatus: PaymentStatus.COMPLETED, // Đã nhận tiền
        paymentDate: new Date().toISOString(),
        description: 'Tiền cọc thuê phòng'
      });
      
      toast.success('Đã tạo payment tiền cọc thành công!');
    } catch (error) {
      toast.error('Không thể tạo payment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleCreateDeposit(); }}>
      <div>
        <label>Số tiền cọc:</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      
      <div>
        <label>Phương thức:</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="cash">Tiền mặt</option>
          <option value="bank_transfer">Chuyển khoản</option>
          <option value="e_wallet">Ví điện tử</option>
        </select>
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Tạo payment'}
      </button>
    </form>
  );
};
```

---

### Use Case 4: Landlord Xác Nhận Thanh Toán

**Scenario**: Landlord nhận được tiền chuyển khoản và xác nhận payment.

**Implementation:**
```typescript
// Component: ConfirmPaymentButton.tsx
const ConfirmPaymentButton = ({ paymentId }) => {
  const [loading, setLoading] = useState(false);
  
  const handleConfirm = async () => {
    try {
      setLoading(true);
      
      await paymentService.updatePayment(paymentId, {
        paymentStatus: PaymentStatus.COMPLETED,
        paymentDate: new Date().toISOString()
      });
      
      toast.success('Đã xác nhận thanh toán thành công!');
    } catch (error) {
      toast.error('Không thể xác nhận thanh toán');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleConfirm} disabled={loading}>
      {loading ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
    </button>
  );
};
```

---

### Use Case 5: Hoàn Tiền Cọc Khi Kết Thúc Hợp Đồng

**Scenario**: Landlord hoàn tiền cọc cho tenant khi kết thúc rental.

**Implementation:**
```typescript
// Component: RefundDepositButton.tsx
const RefundDepositButton = ({ rental, depositAmount }) => {
  const [loading, setLoading] = useState(false);
  
  const handleRefund = async () => {
    try {
      setLoading(true);
      
      // Step 1: Create refund payment
      const refundPayment = await paymentService.createPayment({
        rentalId: rental.id,
        paymentType: PaymentType.REFUND,
        amount: depositAmount,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        description: 'Hoàn tiền cọc khi kết thúc hợp đồng',
        paymentStatus: PaymentStatus.PENDING
      });
      
      // Step 2: After actual refund, update status
      await paymentService.updatePayment(refundPayment.id, {
        paymentStatus: PaymentStatus.COMPLETED,
        paymentDate: new Date().toISOString()
      });
      
      toast.success('Đã hoàn tiền cọc thành công!');
    } catch (error) {
      toast.error('Không thể hoàn tiền cọc');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleRefund} disabled={loading}>
      {loading ? 'Đang xử lý...' : 'Hoàn tiền cọc'}
    </button>
  );
};
```

---

## Error Handling

### Common Error Scenarios

```typescript
// utils/errorHandler.ts

export class PaymentError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export const handlePaymentError = (error: any) => {
  if (error.statusCode === 400) {
    return 'Dữ liệu thanh toán không hợp lệ';
  }
  
  if (error.statusCode === 403) {
    return 'Bạn không có quyền thực hiện thanh toán này';
  }
  
  if (error.statusCode === 404) {
    return 'Không tìm thấy thông tin rental hoặc bill';
  }
  
  if (error.statusCode === 409) {
    return 'Payment đã tồn tại cho bill này';
  }
  
  return 'Có lỗi xảy ra, vui lòng thử lại sau';
};
```

### Error Handling in Components

```typescript
const PaymentForm = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (data) => {
    try {
      setError(null);
      await paymentService.createPayment(data);
    } catch (err) {
      setError(handlePaymentError(err));
    }
  };
  
  return (
    <form>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {/* Form fields */}
    </form>
  );
};
```

---

## Best Practices

### 1. Always Validate Data Before Submission

```typescript
const validatePayment = (data: CreatePaymentDto): string[] => {
  const errors: string[] = [];
  
  if (!data.rentalId) {
    errors.push('Rental ID là bắt buộc');
  }
  
  if (!data.paymentType) {
    errors.push('Loại thanh toán là bắt buộc');
  }
  
  if (!data.amount || data.amount <= 0) {
    errors.push('Số tiền phải lớn hơn 0');
  }
  
  return errors;
};
```

### 2. Use Optimistic Updates

```typescript
const updatePaymentStatus = async (paymentId: string, status: PaymentStatus) => {
  // Optimistic update
  setPayments(prev => 
    prev.map(p => p.id === paymentId ? {...p, paymentStatus: status} : p)
  );
  
  try {
    await paymentService.updatePayment(paymentId, { paymentStatus: status });
  } catch (error) {
    // Revert on error
    refetchPayments();
    throw error;
  }
};
```

### 3. Cache Payment Data

```typescript
// Use React Query or SWR for caching
import { useQuery } from '@tanstack/react-query';

const usePayments = (filters: PaymentFilters) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentService.getPayments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### 4. Format Display Values

```typescript
// utils/formatters.ts

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatPaymentType = (type: PaymentType): string => {
  const labels = {
    rent: 'Tiền thuê',
    deposit: 'Tiền cọc',
    utility: 'Tiền tiện ích',
    fee: 'Phí dịch vụ',
    refund: 'Hoàn tiền'
  };
  return labels[type] || type;
};

export const formatPaymentStatus = (status: PaymentStatus): string => {
  const labels = {
    pending: 'Chờ xử lý',
    completed: 'Đã hoàn thành',
    failed: 'Thất bại',
    refunded: 'Đã hoàn tiền'
  };
  return labels[status] || status;
};
```

### 5. Handle Real-time Updates

```typescript
// Use WebSocket or polling for real-time updates
import { useEffect } from 'react';

const useRealtimePayments = (rentalId: string) => {
  const { data, refetch } = usePayments({ rentalId });
  
  useEffect(() => {
    // Subscribe to WebSocket
    const socket = new WebSocket('ws://your-api.com/ws');
    
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'payment_updated' && message.rentalId === rentalId) {
        refetch();
      }
    });
    
    return () => socket.close();
  }, [rentalId, refetch]);
  
  return data;
};
```

### 6. Security Considerations

- ✅ Always use HTTPS in production
- ✅ Store tokens securely (HttpOnly cookies or secure storage)
- ✅ Validate all inputs on frontend AND backend
- ✅ Implement rate limiting for payment creation
- ✅ Log all payment transactions for audit
- ✅ Use CSRF protection for state-changing operations
- ✅ Never expose sensitive payment gateway credentials

---

## Integration with Bills

Payment API có thể tích hợp với Bills API:

```typescript
const payBill = async (bill: Bill) => {
  try {
    // Step 1: Create payment
    const payment = await paymentService.createPayment({
      rentalId: bill.rentalId,
      billId: bill.id,
      paymentType: PaymentType.UTILITY,
      amount: bill.totalAmount,
      description: `Thanh toán hóa đơn ${bill.billingPeriod}`
    });
    
    // Step 2: After real payment (e.g., bank transfer)
    await paymentService.updatePayment(payment.id, {
      paymentStatus: PaymentStatus.COMPLETED,
      paymentDate: new Date().toISOString()
    });
    
    // Step 3: Mark bill as paid
    await billService.markBillAsPaid(bill.id);
    
    return payment;
  } catch (error) {
    throw error;
  }
};
```

---

## Testing

### Unit Tests Example

```typescript
// __tests__/payment.service.test.ts

import { paymentService } from '@/services/payment.service';
import { PaymentType, PaymentMethod } from '@/types/payment.types';

describe('PaymentService', () => {
  it('should create payment successfully', async () => {
    const paymentData = {
      rentalId: 'rental-123',
      paymentType: PaymentType.RENT,
      amount: 3000000,
      paymentMethod: PaymentMethod.BANK_TRANSFER
    };
    
    const payment = await paymentService.createPayment(paymentData);
    
    expect(payment).toBeDefined();
    expect(payment.rentalId).toBe(paymentData.rentalId);
    expect(payment.amount).toBe(paymentData.amount);
  });
  
  it('should throw error when creating payment without rentalId', async () => {
    const invalidData = {
      paymentType: PaymentType.RENT,
      amount: 3000000
    };
    
    await expect(
      paymentService.createPayment(invalidData as any)
    ).rejects.toThrow();
  });
});
```

---

## Troubleshooting

### Common Issues

**Issue 1: Payment creation returns 403**
- **Cause**: User không có quyền tạo payment cho rental này
- **Solution**: Verify user có liên quan đến rental (là tenant hoặc landlord)

**Issue 2: Payment list returns empty**
- **Cause**: Filters quá strict hoặc không có payment nào match
- **Solution**: Kiểm tra lại filters, thử bỏ một số filters

**Issue 3: Cannot update payment status**
- **Cause**: Payment đã ở trạng thái final (completed/refunded)
- **Solution**: Check payment status trước khi update

**Issue 4: Delete payment returns 400**
- **Cause**: Không thể xóa payment đã completed
- **Solution**: Chỉ cho phép xóa payment với status pending/failed

---

## Additional Resources

- [Bills API Documentation](./bills-api-documentation.md)
- [Billing API Reference](./BILLING_API_REFERENCE.md)
- [Frontend Billing Guide](./FRONTEND_BILLING_GUIDE.md)

---

## Support

Nếu có bất kỳ câu hỏi nào về Payment API, vui lòng liên hệ:
- Email: support@trustay.com
- Slack: #payment-api-support
- Documentation: https://docs.trustay.com/payment-api

---

**Last Updated**: November 2, 2025
**Version**: 1.0.0
