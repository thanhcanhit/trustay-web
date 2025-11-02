"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { RoommateInvitationPanel } from "@/components/roommate/RoommateInvitationPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function RoommateInvitationDemoPage() {
  // Demo postId - replace with actual postId in real usage
  const demoPostId = "your-roommate-seeking-post-id";

  const handleSuccess = () => {
    console.log("Successfully added roommate or generated invite link!");
    // Refresh data, show notification, etc.
  };

  return (
    <DashboardLayout userType="tenant">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý người ở ghép
          </h1>
          <p className="text-gray-600">
            Thêm người vào phòng của bạn bằng cách thêm trực tiếp hoặc mời qua link
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Info className="h-5 w-5" />
              Hướng dẫn sử dụng
            </CardTitle>
            <CardDescription className="text-blue-700">
              Tính năng mới theo API documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-1">Flow 1: Thêm trực tiếp (Add Directly)</h4>
              <p className="text-blue-700">
                Nhập email hoặc số điện thoại → Hệ thống tạo rental ngay lập tức → Hoàn tất
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Flow 2: Mời qua link (Invite by Link)</h4>
              <p className="text-blue-700">
                Tạo link → Chia sẻ → Người nhận điền form → Approval flow → Xác nhận → Tạo rental
              </p>
            </div>
            <div className="bg-white/50 p-3 rounded border border-blue-300">
              <p className="font-semibold mb-1">Endpoints được implement:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>POST /api/roommate-applications/:postId/add-roommate</li>
                <li>POST /api/roommate-applications/generate-invite-link</li>
                <li>POST /api/roommate-applications/accept-invite</li>
                <li>POST /api/roommate-applications/:id/landlord-approve</li>
                <li>PATCH /api/roommate-applications/:id/confirm</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Main Panel */}
        <RoommateInvitationPanel
          postId={demoPostId}
          onSuccess={handleSuccess}
        />

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái Application Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Platform Room:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <code className="text-xs">
                    accept-invite → &apos;accepted&apos; (tenant auto-approved)
                    <br />
                    &nbsp;&nbsp;↓
                    <br />
                    landlord-approve → &apos;awaiting_confirmation&apos;
                    <br />
                    &nbsp;&nbsp;↓
                    <br />
                    applicant-confirm → &apos;accepted&apos; + Rental created
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">External Room:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <code className="text-xs">
                    accept-invite → &apos;awaiting_confirmation&apos; (tenant auto-approved)
                    <br />
                    &nbsp;&nbsp;↓
                    <br />
                    applicant-confirm → &apos;accepted&apos; + Rental created
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
