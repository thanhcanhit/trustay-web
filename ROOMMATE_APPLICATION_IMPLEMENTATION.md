# Roommate Application Implementation

## Tổng quan

Implementation đầy đủ cho Roommate Application API theo tài liệu `ROOMMATE_APPLICATION_API.md`, chỉ hỗ trợ **Platform Rooms** (phòng trong hệ thống).

## Files đã tạo/cập nhật

### Actions (src/actions/roommate-applications.action.ts)

#### Types đã cập nhật:
- `RoommateApplication` - Bao gồm đầy đủ thông tin application và relations
- `CreateRoommateApplicationRequest` - Thêm các trường bắt buộc
- `UpdateRoommateApplicationRequest` - Các trường có thể cập nhật
- `RespondToApplicationRequest` - Request body cho tenant respond
- `RoommateApplicationListResponse` - Response với meta và counts
- `ApplicationStatistics` - Statistics với daily breakdown

#### Functions đã có:
✅ `createRoommateApplication` - Tạo đơn ứng tuyển
✅ `getRoommateApplicationById` - Lấy chi tiết đơn
✅ `getMyRoommateApplications` - Danh sách đơn của applicant (đã cập nhật params)
✅ `getApplicationsForMyPosts` - Danh sách đơn cho tenant (đã cập nhật params)
✅ `updateRoommateApplication` - Cập nhật đơn
✅ `respondToRoommateApplication` - Tenant respond
✅ `confirmRoommateApplication` - Applicant xác nhận cuối cùng
✅ `cancelRoommateApplication` - Applicant hủy đơn
✅ `bulkRespondToApplications` - Xử lý hàng loạt (đã cập nhật response)
✅ `getMyApplicationStatistics` - Thống kê đơn của applicant
✅ `getApplicationStatisticsForMyPosts` - Thống kê đơn cho tenant

#### Functions mới:
🆕 `getLandlordPendingApplications` - Landlord xem đơn cần duyệt
🆕 `landlordApproveApplication` - Landlord phê duyệt
🆕 `landlordRejectApplication` - Landlord từ chối

### Components

#### 1. LandlordApplicationList (src/components/roommate/landlord-application-list.tsx)
Component cho Landlord xem và duyệt các đơn ứng tuyển của platform rooms.

**Features:**
- Hiển thị danh sách đơn đã được tenant phê duyệt
- Phê duyệt/Từ chối đơn với lý do
- Pagination
- Loading states
- Hiển thị thông tin phòng, tenant response

**Usage:**
```tsx
import { LandlordApplicationList } from '@/components/roommate';

function LandlordDashboard() {
  return <LandlordApplicationList token={userToken} />;
}
```

#### 2. TenantApplicationList (src/components/roommate/tenant-application-list.tsx)
Component cho Tenant xem và respond các đơn ứng tuyển vào bài đăng của mình.

**Features:**
- Hiển thị danh sách đơn ứng tuyển
- Phê duyệt/Từ chối đơn với lý do
- Hiển thị status của từng đơn (pending, accepted, awaiting_confirmation, rejected)
- Hiển thị landlord response (nếu là platform room)
- Pagination

**Usage:**
```tsx
import { TenantApplicationList } from '@/components/roommate';

function TenantDashboard() {
  return <TenantApplicationList token={userToken} />;
}
```

#### 3. MyApplicationList (src/components/roommate/my-application-list.tsx)
Component cho Applicant xem và quản lý các đơn ứng tuyển của mình.

**Features:**
- Hiển thị danh sách đơn đã nộp
- Hủy đơn (khi status = pending)
- Xác nhận thuê phòng (khi status = awaiting_confirmation)
- Hiển thị tenant/landlord response
- Status badges với màu sắc phù hợp
- Pagination

**Usage:**
```tsx
import { MyApplicationList } from '@/components/roommate';

function MyApplicationsPage() {
  return <MyApplicationList token={userToken} />;
}
```

#### 4. ApplicationConfirmDialog (src/components/roommate/application-confirm-dialog.tsx)
Dialog component cho applicant xác nhận đơn ứng tuyển cuối cùng.

**Features:**
- Hiển thị thông tin đầy đủ về phòng
- Hiển thị tenant/landlord response
- Xác nhận và tạo rental tự động
- Redirect đến rental page sau khi confirm

**Usage:**
```tsx
import { ApplicationConfirmDialog } from '@/components/roommate';

function ApplicationCard({ application }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Xác nhận</Button>
      <ApplicationConfirmDialog
        application={application}
        open={open}
        onOpenChange={setOpen}
        token={userToken}
        onConfirmed={() => console.log('Confirmed!')}
      />
    </>
  );
}
```

## Workflow

### Platform Room Flow (3 bước):

```
1. Applicant tạo application
   └─> POST /api/roommate-applications
   └─> Status: pending

2. Tenant phê duyệt
   └─> PATCH /api/roommate-applications/:id/respond
   └─> Status: accepted (chờ landlord)

3. Landlord phê duyệt
   └─> POST /api/roommate-applications/:id/landlord-approve
   └─> Status: awaiting_confirmation

4. Applicant xác nhận
   └─> PATCH /api/roommate-applications/:id/confirm
   └─> Status: accepted
   └─> Tạo Rental tự động
```

## Status Flow

```
pending
  ├─> (tenant reject) ──> rejected
  └─> (tenant accept) ──> accepted
                           ├─> (landlord reject) ──> rejected
                           └─> (landlord approve) ──> awaiting_confirmation
                                                       └─> (applicant confirm) ──> accepted + Rental
```

## Notifications

Hệ thống backend sẽ tự động gửi notifications cho các events:

1. **Tenant nhận đơn mới** - Khi applicant tạo application
2. **Landlord nhận đơn cần duyệt** - Khi tenant approve (platform room)
3. **Applicant nhận thông báo được duyệt** - Khi tenant/landlord approve
4. **Applicant nhận thông báo bị từ chối** - Khi tenant/landlord reject
5. **Tenant nhận thông báo landlord approve** - Khi landlord approve

## Integration

### 1. Trang Landlord Dashboard

```tsx
// app/dashboard/landlord/applications/page.tsx
import { LandlordApplicationList } from '@/components/roommate';

export default function LandlordApplicationsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Đơn ứng tuyển cần duyệt</h1>
      <LandlordApplicationList />
    </div>
  );
}
```

### 2. Trang Tenant Dashboard

```tsx
// app/dashboard/tenant/applications/page.tsx
import { TenantApplicationList } from '@/components/roommate';

export default function TenantApplicationsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Đơn ứng tuyển cho bài đăng của bạn</h1>
      <TenantApplicationList />
    </div>
  );
}
```

### 3. Trang My Applications

```tsx
// app/dashboard/my-applications/page.tsx
import { MyApplicationList } from '@/components/roommate';

export default function MyApplicationsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Đơn ứng tuyển của tôi</h1>
      <MyApplicationList />
    </div>
  );
}
```

## Validation Rules

### Create Application
- ✅ Không thể ứng tuyển vào bài đăng của chính mình
- ✅ Không thể ứng tuyển nếu đã có application active cho cùng post
- ✅ Bài đăng phải ở trạng thái `active`
- ✅ Bài đăng phải còn slot trống

### Tenant Respond
- ✅ Chỉ tenant của bài đăng mới có quyền respond
- ✅ Chỉ respond được application có status = `pending`
- ✅ Phải nhập lý do respond

### Landlord Approve/Reject
- ✅ Chỉ áp dụng cho platform rooms
- ✅ Chỉ landlord sở hữu building mới có quyền
- ✅ Chỉ xử lý được application có status = `accepted`
- ✅ Phải nhập lý do

### Applicant Confirm
- ✅ Chỉ applicant mới có quyền confirm
- ✅ Status phải là `awaiting_confirmation`
- ✅ Phòng chưa đầy
- ✅ Applicant chưa có rental active nào khác

## API Endpoints Summary

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/roommate-applications` | Tạo đơn | Applicant |
| GET | `/api/roommate-applications/my-applications` | Đơn của tôi | Applicant |
| GET | `/api/roommate-applications/for-my-posts` | Đơn cho bài của tôi | Tenant |
| GET | `/api/roommate-applications/landlord/pending` | Đơn cần duyệt | Landlord |
| GET | `/api/roommate-applications/:id` | Chi tiết đơn | Any |
| PATCH | `/api/roommate-applications/:id` | Cập nhật đơn | Applicant |
| PATCH | `/api/roommate-applications/:id/respond` | Tenant respond | Tenant |
| POST | `/api/roommate-applications/:id/landlord-approve` | Landlord approve | Landlord |
| POST | `/api/roommate-applications/:id/landlord-reject` | Landlord reject | Landlord |
| PATCH | `/api/roommate-applications/:id/confirm` | Xác nhận cuối | Applicant |
| PATCH | `/api/roommate-applications/:id/cancel` | Hủy đơn | Applicant |
| POST | `/api/roommate-applications/bulk-respond` | Respond hàng loạt | Tenant |
| GET | `/api/roommate-applications/statistics/my-applications` | Thống kê của tôi | Applicant |
| GET | `/api/roommate-applications/statistics/for-my-posts` | Thống kê cho bài của tôi | Tenant |

## Notes

- ✅ Chỉ hỗ trợ Platform Rooms (có roomInstanceId)
- ✅ External Rooms đã được bỏ qua theo yêu cầu
- ✅ Rental tự động được tạo khi applicant confirm
- ✅ Post counts tự động cập nhật (approvedCount, remainingSlots)
- ✅ Post tự động đóng khi remainingSlots <= 0
- ✅ Notification system tích hợp sẵn ở backend

## Next Steps

1. **Testing**: Test các components với real data từ backend
2. **Styling**: Customize UI/UX theo design system
3. **Error Handling**: Thêm error boundaries nếu cần
4. **Loading States**: Improve loading states với skeleton
5. **Filtering**: Thêm filters cho status, date range, etc.
6. **Bulk Actions**: Implement bulk approve/reject cho tenant

## Dependencies

Các components này sử dụng:
- `@/components/ui/*` - shadcn/ui components
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `next/navigation` - Routing

Đảm bảo các dependencies này đã được cài đặt trong project.
