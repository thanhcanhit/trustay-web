"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Link2, Copy, Check, Share2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRoommateInvitationStore } from "@/stores/roommateInvitationStore";

interface InviteLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteLinkDialog({
  open,
  onOpenChange,
}: InviteLinkDialogProps) {
  const { createInviteLink, loading, inviteData, clearInviteData } = useRoommateInvitationStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && !inviteData) {
      handleGenerateLink();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerateLink = async () => {
    const result = await createInviteLink();
    
    if (!result) {
      onOpenChange(false);
    }
  };

  const handleCopyLink = async () => {
    if (inviteData?.inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteData.inviteLink);
        setCopied(true);
        toast.success("Đã sao chép liên kết!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
        toast.error("Không thể sao chép liên kết");
      }
    }
  };

  const handleShare = async () => {
    if (inviteData?.inviteLink && navigator.share) {
      try {
        await navigator.share({
          title: "Lời mời ở ghép",
          text: "Tham gia làm bạn cùng phòng của tôi!",
          url: inviteData.inviteLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleClose = () => {
    clearInviteData();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Tạo liên kết mời
          </DialogTitle>
          <DialogDescription>
            Chia sẻ link này với người bạn muốn mời làm bạn cùng phòng. Link sẽ hết hạn sau 30 ngày.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : inviteData ? (
            <>
              {/* Invite Link */}
              <div className="space-y-2">
                <Label htmlFor="inviteLink">Liên kết mời</Label>
                <div className="flex gap-2">
                  <Input
                    id="inviteLink"
                    value={inviteData.inviteLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expiry Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Thông tin liên kết
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Link này sẽ hết hạn vào:{" "}
                      <span className="font-semibold">
                        {format(new Date(inviteData.expiresAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </span>
                    </p>
                    {inviteData.roommateSeekingPostId && (
                      <p className="text-xs text-blue-600 mt-1">
                        Post ID: {inviteData.roommateSeekingPostId}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Đã sao chép!" : "Sao chép link"}
                </Button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <Button
                    type="button"
                    onClick={handleShare}
                    className="flex-1"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </Button>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Hướng dẫn sử dụng:
                </h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Sao chép và chia sẻ link này với người bạn muốn mời</li>
                  <li>Người nhận sẽ điền form thông tin cá nhân</li>
                  <li>
                    Sau khi họ gửi, bạn sẽ nhận được thông báo để phê duyệt
                  </li>
                  <li>Nếu phòng thuộc nền tảng, chủ nhà cũng cần phê duyệt</li>
                  <li>Cuối cùng, người được mời xác nhận để hoàn tất</li>
                </ol>
              </div>
            </>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
