# API Documentation: Roommate Application

## Tổng quan

API Roommate Application quản lý quy trình ứng tuyển và phê duyệt người ở ghép cho các bài đăng tìm roommate. Hệ thống hỗ trợ 2 loại phòng:

- **Platform Room**: Phòng trong hệ thống, cần phê duyệt từ cả Tenant và Landlord
## Quy trình (Workflow)

### Platform Room Flow:
```
Applicant → POST /roommate-applications (status: pending)
         ↓
Tenant → PATCH /:id/respond (accept → status: accepted)
         ↓
Landlord → POST /:id/landlord-approve (status: awaiting_confirmation)
         ↓
Applicant → PATCH /:id/confirm (status: accepted + tạo Rental)
```

## Trạng thái (Status)

| Status | Mô tả |
|--------|-------|
| `pending` | Đang chờ Tenant xem xét |
| `accepted` | Tenant đã phê duyệt (Platform: chờ Landlord) |
| `rejected` | Bị từ chối bởi Tenant hoặc Landlord |
| `awaiting_confirmation` | Đang chờ Applicant xác nhận cuối cùng |
| `cancelled` | Applicant đã hủy |
| `expired` | Đã hết hạn |

---

## API Endpoints

### 1. Tạo đơn ứng tuyển

**POST** `/api/roommate-applications`

Tạo đơn ứng tuyển vào bài đăng tìm người ở ghép.

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "roommateSeekingPostId": "uuid",
  "fullName": "string",
  "phone": "string",
  "email": "string",
  "occupation": "string",
  "monthlyIncome": 5000000,
  "applicationMessage": "string",
  "moveInDate": "2025-12-01",
  "intendedStayMonths": 6,
  "isUrgent": false
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "roommateSeekingPostId": "uuid",
  "applicantId": "uuid",
  "fullName": "Nguyễn Văn A",
  "phone": "0912345678",
  "email": "applicant@example.com",
  "occupation": "Software Engineer",
  "monthlyIncome": 5000000,
  "applicationMessage": "Tôi rất quan tâm đến phòng này...",
  "moveInDate": "2025-12-01T00:00:00.000Z",
  "intendedStayMonths": 6,
  "isUrgent": false,
  "status": "pending",
  "tenantResponse": null,
  "landlordResponse": null,
  "tenantRespondedAt": null,
  "landlordRespondedAt": null,
  "confirmedAt": null,
  "createdAt": "2025-11-02T10:00:00.000Z",
  "updatedAt": "2025-11-02T10:00:00.000Z"
}
```

**Errors**:
- `400`: Dữ liệu không hợp lệ hoặc không thể ứng tuyển
- `401`: Chưa xác thực
- `404`: Không tìm thấy bài đăng

---

### 2. Lấy danh sách đơn ứng tuyển của tôi

**GET** `/api/roommate-applications/my-applications`

Lấy danh sách các đơn ứng tuyển do user hiện tại tạo ra.

**Authentication**: Required (JWT)

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Số trang |
| limit | number | No | 20 | Số items per page (max: 100) |
| status | string | No | - | Lọc theo trạng thái: `pending`, `accepted`, `rejected`, `expired`, `cancelled`, `awaiting_confirmation` |
| search | string | No | - | Tìm kiếm theo tên, nghề nghiệp, message |
| roommateSeekingPostId | string | No | - | Lọc theo bài đăng cụ thể |
| isUrgent | boolean | No | - | Lọc đơn khẩn cấp |
| sortBy | string | No | createdAt | Sắp xếp theo field |
| sortOrder | string | No | desc | `asc` hoặc `desc` |

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "roommateSeekingPostId": "uuid",
      "fullName": "Nguyễn Văn A",
      "status": "pending",
      "createdAt": "2025-11-02T10:00:00.000Z",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false,
    "itemCount": 20
  },
  "counts": {
    "pending": 10,
    "approvedByTenant": 15,
    "rejectedByTenant": 5,
    "approvedByLandlord": 8,
    "rejectedByLandlord": 2,
    "cancelled": 7,
    "expired": 3,
    "total": 50
  }
}
```

---

### 3. Lấy danh sách đơn ứng tuyển cho bài đăng của tôi

**GET** `/api/roommate-applications/for-my-posts`

Lấy danh sách các đơn ứng tuyển vào các bài đăng do user hiện tại tạo ra (dành cho Tenant).

**Authentication**: Required (JWT)

**Query Parameters**: Giống như `/my-applications`

**Response** (200): Giống như `/my-applications`

---

### 4. Landlord xem các đơn ứng tuyển cần duyệt ✨

**GET** `/api/roommate-applications/landlord/pending`

Lấy danh sách các đơn ứng tuyển từ platform rooms thuộc landlord cần duyệt.

**Authentication**: Required (JWT - Role: Landlord)

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Số trang |
| limit | number | No | 10 | Số items per page (max: 100) |
| status | string | No | accepted | Lọc theo trạng thái (mặc định là `accepted` - đang chờ landlord duyệt) |
| search | string | No | - | Tìm kiếm theo tên, nghề nghiệp, message |
| roommateSeekingPostId | string | No | - | Lọc theo bài đăng cụ thể |
| isUrgent | boolean | No | - | Lọc đơn khẩn cấp |
| sortBy | string | No | createdAt | Sắp xếp theo field |
| sortOrder | string | No | desc | `asc` hoặc `desc` |

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "roommateSeekingPostId": "uuid",
      "applicantId": "uuid",
      "fullName": "Nguyễn Văn A",
      "phone": "0912345678",
      "email": "applicant@example.com",
      "status": "accepted",
      "tenantResponse": "Ứng viên phù hợp",
      "tenantRespondedAt": "2025-11-01T10:00:00.000Z",
      "createdAt": "2025-11-01T09:00:00.000Z",
      "roommateSeekingPost": {
        "id": "uuid",
        "title": "Tìm bạn ở ghép",
        "roomInstance": {
          "id": "uuid",
          "roomNumber": "101",
          "room": {
            "name": "Phòng 101",
            "building": {
              "name": "Tòa A",
              "ownerId": "landlord-uuid"
            }
          }
        }
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "counts": {
    "pending": 5,
    "approvedByTenant": 15,
    "rejectedByTenant": 0,
    "approvedByLandlord": 3,
    "rejectedByLandlord": 2,
    "cancelled": 0,
    "expired": 0,
    "total": 25
  }
}
```

**Errors**:
- `401`: Chưa xác thực

**Lưu ý**: 
- Chỉ trả về các đơn từ **platform rooms** (có roomInstanceId) thuộc landlord
- Mặc định lọc các đơn có status = `accepted` (tenant đã approve, đang chờ landlord)

---

### 5. Lấy chi tiết đơn ứng tuyển

**GET** `/api/roommate-applications/:id`

Lấy chi tiết một đơn ứng tuyển cụ thể.

**Authentication**: Optional (JWT)

**Path Parameters**:
- `id` (string, required): ID của đơn ứng tuyển

**Response** (200):
```json
{
  "id": "uuid",
  "roommateSeekingPostId": "uuid",
  "applicantId": "uuid",
  "fullName": "Nguyễn Văn A",
  "phone": "0912345678",
  "email": "applicant@example.com",
  "occupation": "Software Engineer",
  "monthlyIncome": 5000000,
  "applicationMessage": "Tôi rất quan tâm...",
  "moveInDate": "2025-12-01T00:00:00.000Z",
  "intendedStayMonths": 6,
  "isUrgent": false,
  "status": "pending",
  "tenantResponse": null,
  "landlordResponse": null,
  "tenantRespondedAt": null,
  "landlordRespondedAt": null,
  "confirmedAt": null,
  "createdAt": "2025-11-02T10:00:00.000Z",
  "updatedAt": "2025-11-02T10:00:00.000Z",
  "applicant": {
    "id": "uuid",
    "firstName": "Văn",
    "lastName": "A",
    "email": "applicant@example.com",
    "avatarUrl": "https://..."
  },
  "roommateSeekingPost": {
    "id": "uuid",
    "title": "Tìm bạn ở ghép",
    "monthlyRent": 3000000,
    "depositAmount": 3000000
  }
}
```

**Errors**:
- `403`: Không có quyền xem (nếu không phải applicant, tenant, hoặc landlord)
- `404`: Không tìm thấy đơn ứng tuyển

---

### 6. Cập nhật đơn ứng tuyển

**PATCH** `/api/roommate-applications/:id`

Cập nhật thông tin đơn ứng tuyển (chỉ applicant, chỉ khi status = pending).

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (string, required): ID của đơn ứng tuyển

**Request Body**:
```json
{
  "fullName": "string",
  "phone": "string",
  "email": "string",
  "occupation": "string",
  "monthlyIncome": 5500000,
  "applicationMessage": "string",
  "moveInDate": "2025-12-15",
  "intendedStayMonths": 12,
  "isUrgent": true
}
```

**Response** (200): Giống như response của POST

**Errors**:
- `400`: Dữ liệu không hợp lệ hoặc chỉ có thể chỉnh sửa đơn đang chờ xử lý
- `401`: Chưa xác thực
- `403`: Không có quyền chỉnh sửa
- `404`: Không tìm thấy đơn ứng tuyển

---

### 7. Tenant phản hồi đơn ứng tuyển

**PATCH** `/api/roommate-applications/:id/respond`

Tenant phản hồi (phê duyệt/từ chối) đơn ứng tuyển.

**Authentication**: Required (JWT - Role: Tenant)

**Path Parameters**:
- `id` (string, required): ID của đơn ứng tuyển

**Request Body**:
```json
{
  "status": "accepted",  // hoặc "rejected"
  "response": "Ứng viên phù hợp với yêu cầu của phòng"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "status": "accepted",  // Platform: "accepted", External: "awaiting_confirmation"
  "tenantResponse": "Ứng viên phù hợp với yêu cầu của phòng",
  "tenantRespondedAt": "2025-11-02T10:30:00.000Z",
  ...
}
```

**Errors**:
- `400`: Trạng thái không hợp lệ hoặc chỉ có thể phản hồi đơn đang chờ xử lý
- `401`: Chưa xác thực
- `403`: Không có quyền phản hồi (không phải tenant của bài đăng)
- `404`: Không tìm thấy đơn ứng tuyển

**Lưu ý**:
- **Platform Room**: Khi tenant accept, status = `accepted` (chờ landlord duyệt)
- **External Room**: Khi tenant accept, status = `awaiting_confirmation` (applicant có thể confirm ngay)
- Notification sẽ được gửi đến:
  - Applicant (nếu accept hoặc reject)
  - Landlord (nếu là platform room và accept)

---

### 8. Landlord phê duyệt đơn ứng tuyển ✨

**POST** `/api/roommate-applications/:id/landlord-approve`

Landlord phê duyệt đơn ứng tuyển đã được tenant phê duyệt. **Chỉ áp dụng cho platform rooms.**

**Authentication**: Required (JWT - Role: Landlord)

**Path Parameters**:
- `id` (string, required): ID của đơn ứng tuyển

**Request Body**:
```json
{
  "response": "Đồng ý cho thuê phòng cho ứng viên này"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "status": "awaiting_confirmation",
  "tenantResponse": "Ứng viên phù hợp",
  "landlordResponse": "Đồng ý cho thuê phòng",
  "landlordRespondedAt": "2025-11-02T11:00:00.000Z",
  ...
}
```

**Errors**:
- `400`: Trạng thái không hợp lệ, không phải platform room, hoặc chỉ có thể phê duyệt đơn đã được tenant phê duyệt
- `401`: Chưa xác thực
- `403`: Không có quyền phê duyệt (không phải landlord của building)
- `404`: Không tìm thấy đơn ứng tuyển

**Lưu ý**:
- Application status phải là `accepted` (tenant đã approve)
- Sau khi approve, status sẽ chuyển thành `awaiting_confirmation`
- Notification sẽ được gửi đến cả applicant và tenant
- Post counts sẽ được cập nhật (approvedCount++, remainingSlots--)

---

### 9. Landlord từ chối đơn ứng tuyển ✨

**POST** `/api/roommate-applications/:id/landlord-reject`

Landlord từ chối đơn ứng tuyển đã được tenant phê duyệt. **Chỉ áp dụng cho platform rooms.**

**Authentication**: Required (JWT - Role: Landlord)

**Path Parameters**:
- `id` (string, required): ID của đơn ứng tuyển

**Request Body**:
```json
{
  "response": "Ứng viên không phù hợp với tiêu chí của tòa nhà"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "status": "rejected",
  "tenantResponse": "Ứng viên phù hợp",
  "landlordResponse": "Ứng viên không phù hợp với tiêu chí của tòa nhà",
  "landlordRespondedAt": "2025-11-02T11:00:00.000Z",
  ...
}
```

**Errors**:
- `400`: Trạng thái không hợp lệ, không phải platform room, hoặc chỉ có thể từ chối đơn đã được tenant phê duyệt
- `401`: Chưa xác thực
- `403`: Không có quyền từ chối (không phải landlord của building)
- `404`: Không tìm thấy đơn ứng tuyển

**Lưu ý**:
- Application status phải là `accepted` (tenant đã approve)
- Sau khi reject, status sẽ chuyển thành `rejected`
- Notification sẽ được gửi đến applicant

---

### 10. Applicant xác nhận đơn ứng tuyển ✨

**PATCH** `/api/roommate-applications/:id/confirm`

Applicant xác nhận đơn ứng tuyển cuối cùng. Sau khi xác nhận, **rental sẽ được tạo tự động**.

**Authentication**: Required (JWT - Role: Applicant)

**Path Parameters**:
- `id` (string, required): ID của đơn ứng tuyển

**Request Body**: None

**Response** (200):
```json
{
  "id": "uuid",
  "status": "accepted",
  "confirmedAt": "2025-11-02T11:30:00.000Z",
  "rental": {
    "id": "rental-uuid",
    "roomInstanceId": "uuid",
    "tenantId": "applicant-uuid",
    "ownerId": "landlord-uuid",
    "contractStartDate": "2025-12-01T00:00:00.000Z",
    "contractEndDate": "2026-06-01T00:00:00.000Z",
    "monthlyRent": 3000000,
    "depositPaid": 3000000,
    "status": "active"
  },
  ...
}
```

**Errors**:
- `400`: Không thể xác nhận đơn ứng tuyển (trạng thái không hợp lệ, phòng đã đầy, applicant đã có rental active khác)
- `401`: Chưa xác thực
- `403`: Không có quyền xác nhận (không phải applicant)
- `404`: Không tìm thấy đơn ứng tuyển

**Điều kiện để confirm**:
- **Platform Room**: Status phải là `awaiting_confirmation` (sau khi tenant và landlord đã approve)
- **External Room**: Status phải là `awaiting_confirmation` (sau khi tenant đã approve)
- Phòng chưa đầy (activeRentalsCount < maxOccupancy)
- Applicant chưa có rental active nào khác

**Sau khi confirm**:
1. Application status → `accepted`
2. Tạo Rental mới với status = `active`
3. Cập nhật post: `approvedCount++`, `remainingSlots--`
4. Nếu `remainingSlots <= 0`, post status → `closed`

---

### 11. Hủy đơn ứng tuyển

**PATCH** `/api/roommate-applications/:id/cancel`

Applicant hủy đơn ứng tuyển (chỉ khi status = pending).

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (string, required): ID của đơn ứng tuyển

**Response** (204): No Content

**Errors**:
- `400`: Không thể hủy đơn ứng tuyển (chỉ có thể hủy đơn đang chờ xử lý)
- `401`: Chưa xác thực
- `403`: Không có quyền hủy (không phải applicant)
- `404`: Không tìm thấy đơn ứng tuyển

---

### 12. Xử lý hàng loạt đơn ứng tuyển

**POST** `/api/roommate-applications/bulk-respond`

Phê duyệt hoặc từ chối nhiều đơn ứng tuyển cùng lúc.

**Authentication**: Required (JWT - Role: Tenant)

**Request Body**:
```json
{
  "applicationIds": ["uuid1", "uuid2", "uuid3"],
  "status": "accepted",  // hoặc "rejected"
  "response": "Tất cả ứng viên đều phù hợp"
}
```

**Response** (200):
```json
{
  "successCount": 2,
  "failureCount": 1,
  "processedApplications": ["uuid1", "uuid2"],
  "errors": [
    {
      "applicationId": "uuid3",
      "error": "Chỉ có thể phản hồi đơn ứng tuyển đang chờ xử lý"
    }
  ]
}
```

**Errors**:
- `401`: Chưa xác thực
- `403`: Không có quyền xử lý

---

### 13. Thống kê đơn ứng tuyển của tôi

**GET** `/api/roommate-applications/statistics/my-applications`

Lấy thống kê các đơn ứng tuyển do user hiện tại tạo ra.

**Authentication**: Required (JWT)

**Response** (200):
```json
{
  "total": 50,
  "pending": 10,
  "approvedByTenant": 15,
  "rejectedByTenant": 5,
  "approvedByLandlord": 8,
  "rejectedByLandlord": 2,
  "cancelled": 7,
  "expired": 3,
  "urgent": 5,
  "dailyStats": [
    { "date": "2025-10-27", "count": 2 },
    { "date": "2025-10-28", "count": 5 },
    { "date": "2025-10-29", "count": 3 },
    { "date": "2025-10-30", "count": 8 },
    { "date": "2025-10-31", "count": 4 },
    { "date": "2025-11-01", "count": 6 },
    { "date": "2025-11-02", "count": 7 }
  ],
  "statusBreakdown": [
    {
      "status": "pending",
      "count": 10,
      "percentage": 20
    },
    {
      "status": "accepted",
      "count": 15,
      "percentage": 30
    }
  ]
}
```

---

### 14. Thống kê đơn ứng tuyển cho bài đăng của tôi

**GET** `/api/roommate-applications/statistics/for-my-posts`

Lấy thống kê các đơn ứng tuyển vào bài đăng do user hiện tại tạo ra (dành cho Tenant).

**Authentication**: Required (JWT)

**Response** (200): Giống như `/statistics/my-applications`

---

## Notification System ✨

Hệ thống tự động gửi thông báo khi có các sự kiện sau:

### 1. Tenant nhận đơn ứng tuyển mới
**Trigger**: Khi applicant tạo application mới

**Method**: `notifyRoommateApplicationReceived(tenantId, data)`

**Notification**:
```
Title: Đơn ứng tuyển mới
Message: {applicantName} đã ứng tuyển vào {roomName}
```

### 2. Landlord nhận thông báo có đơn cần duyệt (Platform Room)
**Trigger**: Khi tenant approve application của platform room

**Method**: `notifyRoommateApplicationReceived(landlordId, data)`

**Notification**:
```
Title: Đơn ứng tuyển cần duyệt
Message: {applicantName} đã được tenant phê duyệt cho {roomName}
```

### 3. Applicant nhận thông báo được phê duyệt
**Trigger**: 
- Tenant approve (external room)
- Tenant approve (platform room)
- Landlord approve (platform room)

**Method**: `notifyRoommateApplicationApproved(applicantId, data)`

**Notification**:
```
Title: Đơn ứng tuyển được phê duyệt
Message: Đơn ứng tuyển của bạn cho {roomName} đã được phê duyệt
```

### 4. Applicant nhận thông báo bị từ chối
**Trigger**: 
- Tenant reject
- Landlord reject

**Method**: `notifyRoommateApplicationRejected(applicantId, data)`

**Notification**:
```
Title: Đơn ứng tuyển bị từ chối
Message: Đơn ứng tuyển của bạn cho {roomName} đã bị từ chối
Reason: {reason}
```

### 5. Tenant nhận thông báo khi landlord approve (Platform Room)
**Trigger**: Khi landlord approve application

**Method**: `notifyRoommateApplicationApproved(tenantId, data)`

**Notification**:
```
Title: Đơn ứng tuyển được phê duyệt
Message: Đơn ứng tuyển cho {roomName} đã được landlord phê duyệt
```

### 6. Xác nhận cuối cùng và tạo Rental
**Trigger**: Khi applicant confirm application

**Method**: `notifyRoommateApplicationConfirmed(...)`

**Notification**: Gửi đến tất cả các bên liên quan về việc rental đã được tạo

---

## Validation Rules

### Create Application
- Không thể ứng tuyển vào bài đăng của chính mình
- Không thể ứng tuyển nếu đã có application active cho cùng post
- Bài đăng phải ở trạng thái `active`
- Bài đăng phải còn slot trống (`remainingSlots > 0`)

### Tenant Respond
- Chỉ tenant của bài đăng mới có quyền respond
- Chỉ respond được application có status = `pending`
- Status phải là `accepted` hoặc `rejected`

### Landlord Approve/Reject
- Chỉ áp dụng cho platform rooms (có roomInstanceId)
- Chỉ landlord sở hữu building mới có quyền
- Chỉ xử lý được application có status = `accepted` (tenant đã approve)

### Applicant Confirm
- Chỉ applicant mới có quyền confirm
- Platform room: status phải là `awaiting_confirmation` (sau khi tenant + landlord approve)
- External room: status phải là `awaiting_confirmation` (sau khi tenant approve)
- Phòng chưa đầy (`activeRentalsCount < maxOccupancy`)
- Applicant chưa có rental active nào khác

### Update Application
- Chỉ applicant mới có quyền update
- Chỉ update được khi status = `pending`

### Cancel Application
- Chỉ applicant mới có quyền cancel
- Chỉ cancel được khi status = `pending`

---

## Error Codes

| HTTP Code | Message | Description |
|-----------|---------|-------------|
| 400 | Bad Request | Dữ liệu không hợp lệ, trạng thái không đúng, hoặc vi phạm business rules |
| 401 | Unauthorized | Chưa đăng nhập hoặc token không hợp lệ |
| 403 | Forbidden | Không có quyền thực hiện action (không phải applicant/tenant/landlord) |
| 404 | Not Found | Không tìm thấy application hoặc post |

---

## Notes

1. **Platform Room vs External Room**:
   - Platform room có `roomInstanceId`, cần landlord approve
   - External room không có `roomInstanceId`, không cần landlord approve

2. **Rental Creation**:
   - Chỉ tạo rental khi applicant confirm cuối cùng
   - Rental có `contractStartDate` = `moveInDate` của application
   - Rental có `contractEndDate` tính từ `intendedStayMonths` (nếu có)

3. **Post Updates**:
   - Mỗi lần tạo application: `contactCount++`
   - Khi landlord approve hoặc confirm (external): `approvedCount++`, `remainingSlots--`
   - Khi `remainingSlots <= 0`: post status → `closed`

4. **Permissions**:
   - Applicant: Tạo, update, cancel, confirm application
   - Tenant: Respond (approve/reject) application của bài đăng mình tạo
   - Landlord: Approve/reject application đã được tenant approve (chỉ platform rooms)

5. **Status Flow**:
   ```
   pending → (tenant reject) → rejected
   pending → (tenant accept + external) → awaiting_confirmation → (confirm) → accepted
   pending → (tenant accept + platform) → accepted → (landlord reject) → rejected
   pending → (tenant accept + platform) → accepted → (landlord approve) → awaiting_confirmation → (confirm) → accepted
   ```

---

## Postman Collection

Import collection từ: `Trustay-API.postman_collection.json`

Folder: **Roommate Applications**

Endpoints:
1. Create Application
2. My Applications
3. Applications for My Posts
4. Get Application Detail
5. Respond to Application (Tenant)
6. Cancel Application
7. Get Statistics - My Applications
8. Get Statistics - For My Posts
9. **Landlord Pending Applications** ✨
10. **Landlord Approve** ✨
11. **Landlord Reject** ✨
12. **Confirm Application** ✨

---

## Changelog

### Version 1.0 (Current)
- ✅ Đầy đủ CRUD cho applications
- ✅ Tenant respond workflow
- ✅ Landlord approve/reject workflow
- ✅ Applicant confirm workflow
- ✅ Tự động tạo rental khi confirm
- ✅ Notification system tích hợp
- ✅ Bulk operations
- ✅ Statistics endpoints
- ✅ Hỗ trợ cả platform và external rooms

---

**Last Updated**: November 2, 2025  
**API Version**: 1.0  
**Base URL**: `/api/roommate-applications`
