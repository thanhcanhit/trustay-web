"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserCheck, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { AcceptInviteRequest } from "@/actions/roommate-applications.action";
import { useRoommateInvitationStore } from "@/stores/roommateInvitationStore";
import { useUserStore } from "@/stores/userStore";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { user } = useUserStore();

  const { submitInviteAcceptance, loading } = useRoommateInvitationStore();
  const [submitted, setSubmitted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>("");
  const [formData, setFormData] = useState<Omit<AcceptInviteRequest, "token">>({
    moveInDate: new Date().toISOString().split("T")[0],
    intendedStayMonths: undefined,
  });

  // Auto-fill form with user data if logged in
  // Note: Backend now only requires moveInDate and intendedStayMonths
  // User information is automatically retrieved from the authenticated user
  useEffect(() => {
    if (user) {
      // No need to auto-fill form as backend gets user info from token
    }
  }, [user]);

  // Validate token exists
  useEffect(() => {
    if (!token) {
      toast.error("Link mời không hợp lệ");
      router.push("/");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Link mời không hợp lệ");
      return;
    }

    // Validate required fields
    if (!formData.moveInDate) {
      toast.error("Vui lòng chọn ngày chuyển vào");
      return;
    }

    const success = await submitInviteAcceptance({
      token,
      ...formData,
    });

    if (success) {
      setSubmitted(true);
      // Note: In real scenario, you should get the status from the response
      setApplicationStatus("awaiting_confirmation");
    }
  };

  if (!token) {
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Đã gửi đơn thành công!</CardTitle>
            <CardDescription>
              Đơn ứng tuyển của bạn đã được gửi đi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {applicationStatus === "accepted" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Trạng thái:</strong> Đã được tenant chấp nhận
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Đơn của bạn đang chờ chủ nhà phê duyệt. Bạn sẽ nhận được thông báo khi có kết quả.
                </p>
              </div>
            )}

            {applicationStatus === "awaiting_confirmation" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  <strong>Trạng thái:</strong> Đã được chấp nhận
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Bạn có thể xác nhận ngay để hoàn tất quá trình. Vui lòng kiểm tra thông báo của bạn.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/dashboard/tenant")}
                className="flex-1"
              >
                Đi tới Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1"
              >
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserCheck className="h-6 w-6" />
              Chấp nhận lời mời ở ghép
            </CardTitle>
            <CardDescription>
              Điền thông tin của bạn để hoàn tất đơn ứng tuyển. Các trường có dấu * là bắt buộc.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {user && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  Bạn đang đăng nhập với tài khoản <strong>{user.email}</strong>. Thông tin cá nhân sẽ được lấy từ hồ sơ của bạn.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Move-in Date */}
              <div className="space-y-2">
                <Label htmlFor="moveInDate">
                  Ngày chuyển vào <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) =>
                    setFormData({ ...formData, moveInDate: e.target.value })
                  }
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">
                  Chọn ngày bạn dự định chuyển vào phòng
                </p>
              </div>

              {/* Intended Stay Months */}
              <div className="space-y-2">
                <Label htmlFor="intendedStayMonths">
                  Thời gian dự kiến ở (tháng)
                </Label>
                <Input
                  id="intendedStayMonths"
                  type="number"
                  min="1"
                  value={formData.intendedStayMonths || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      intendedStayMonths: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="VD: 6"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">
                  Bạn dự định ở trong bao lâu? (tùy chọn)
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Lưu ý:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        Sau khi gửi, đơn của bạn sẽ được tenant xem xét tự động
                      </li>
                      <li>
                        Nếu phòng thuộc nền tảng, chủ nhà cũng cần phê duyệt
                      </li>
                      <li>
                        Bạn sẽ nhận được thông báo khi có kết quả
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={loading}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Gửi đơn ứng tuyển
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
