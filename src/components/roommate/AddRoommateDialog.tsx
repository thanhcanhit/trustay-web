"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AddRoommateDirectlyRequest } from "@/actions/roommate-applications.action";
import { useRoommateInvitationStore } from "@/stores/roommateInvitationStore";

interface AddRoommateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: string;
  onSuccess?: () => void;
}

export function AddRoommateDialog({
  open,
  onOpenChange,
  postId,
  onSuccess,
}: AddRoommateDialogProps) {
  const { addRoommateDirect, loading } = useRoommateInvitationStore();
  const [formData, setFormData] = useState<AddRoommateDirectlyRequest>({
    email: "",
    phone: "",
    moveInDate: new Date().toISOString().split("T")[0],
    intendedStayMonths: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one contact method
    if (!formData.email && !formData.phone) {
      toast.error("Vui lòng nhập email hoặc số điện thoại");
      return;
    }

    try {
      await addRoommateDirect(postId || "", formData);
      toast.success("Đã thêm người ở ghép thành công");
      onOpenChange(false);
      onSuccess?.();
      // Reset form
      setFormData({
        email: "",
        phone: "",
        moveInDate: new Date().toISOString().split("T")[0],
        intendedStayMonths: undefined,
      });
    } catch {
      toast.error("Không thể thêm người ở ghép. Vui lòng thử lại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Thêm người ở ghép
            </DialogTitle>
            <DialogDescription>
              Thêm trực tiếp người vào phòng bằng email hoặc số điện thoại. Rental sẽ được tạo ngay lập tức.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Số điện thoại
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+84901234567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={loading}
              />
            </div>

            {/* Move-in Date */}
            <div className="grid gap-2">
              <Label htmlFor="moveInDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ngày chuyển vào
              </Label>
              <Input
                id="moveInDate"
                type="date"
                value={formData.moveInDate}
                onChange={(e) =>
                  setFormData({ ...formData, moveInDate: e.target.value })
                }
                disabled={loading}
              />
            </div>

            {/* Intended Stay Months */}
            <div className="grid gap-2">
              <Label htmlFor="intendedStayMonths">
                Thời gian dự kiến (tháng) <span className="text-muted-foreground">(Tùy chọn)</span>
              </Label>
              <Input
                id="intendedStayMonths"
                type="number"
                min="1"
                placeholder="VD: 6"
                value={formData.intendedStayMonths || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    intendedStayMonths: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Thêm ngay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
