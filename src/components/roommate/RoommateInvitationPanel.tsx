"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Link2, Users } from "lucide-react";
import { AddRoommateDialog } from "./AddRoommateDialog";
import { InviteLinkDialog } from "./InviteLinkDialog";

interface RoommateInvitationPanelProps {
  postId?: string;
  onSuccess?: () => void;
  className?: string;
}

export function RoommateInvitationPanel({
  postId,
  onSuccess,
  className = "",
}: RoommateInvitationPanelProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mời người ở ghép
          </CardTitle>
          <CardDescription>
            Chọn cách thức bạn muốn thêm người vào phòng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Option 1: Add Directly */}
          {postId && (
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    Thêm trực tiếp
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Thêm người vào phòng ngay lập tức bằng email hoặc số điện thoại.
                    Rental sẽ được tạo tự động, không cần phê duyệt.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      ⚡ Nhanh chóng
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      ❌ Không cần phê duyệt
                    </span>
                  </div>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Thêm ngay
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Option 2: Invite by Link */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Link2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Mời qua liên kết
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Tạo link mời để chia sẻ. Người nhận sẽ điền form và đi qua
                  quy trình phê duyệt trước khi được thêm vào.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    🐌 Chậm hơn
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    ✅ Có phê duyệt
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteDialog(true)}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Tạo link mời
                </Button>
              </div>
            </div>
          </div>

          {/* Comparison Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Nên chọn phương thức nào?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Thêm trực tiếp:</strong> Dành cho người bạn đã biết và tin tưởng
              </li>
              <li>
                • <strong>Mời qua link:</strong> Dành cho người chưa biết, cần xem xét kỹ hơn
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {postId && (
        <AddRoommateDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          postId={postId}
          onSuccess={onSuccess}
        />
      )}

      <InviteLinkDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </>
  );
}
