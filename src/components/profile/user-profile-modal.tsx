"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PublicUserProfile } from "@/types";
import { getPublicUserProfile } from "@/actions";
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  XCircle,
  Star,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Spinner } from "@/components/ui/spinner";

interface UserProfileModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileModal({
  userId,
  open,
  onOpenChange,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicUserProfile(userId);
      setProfile(data);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setError("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Không xác định";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "tenant":
        return "Người thuê";
      case "landlord":
        return "Chủ nhà";
      default:
        return role;
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart.substring(0, 2)}${"*".repeat(localPart.length - 2)}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (phone.length <= 6) {
      return `${phone.substring(0, 3)}***`;
    }
    return `${phone.substring(0, 3)}****${phone.substring(phone.length - 3)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thông tin người dùng</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <Spinner className="w-8 h-8" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="space-y-6">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatarUrl || ""} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name
                    .split(" ")
                    .slice(-2)
                    .map((n) => n.charAt(0).toUpperCase())
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h3 className="text-xl font-semibold">{profile.name}</h3>
                <Badge variant="outline" className="mt-2">
                  {getRoleLabel(profile.role)}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Rating */}
            {profile.totalRatings > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-semibold">
                      {profile.overallRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({profile.totalRatings} đánh giá)
                  </span>
                </div>
                <Separator />
              </>
            )}

            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">Giới tính:</span>
                <span className="font-medium">
                  {getGenderLabel(profile.gender)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{maskEmail(profile.email)}</span>
                {profile.isVerifiedEmail ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300" />
                )}
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">Số điện thoại:</span>
                <span className="font-medium">{maskPhone(profile.phone)}</span>
                {profile.isVerifiedPhone ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300" />
                )}
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">Tham gia:</span>
                <span className="font-medium">
                  {format(new Date(profile.createdAt), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">
                    Giới thiệu
                  </h4>
                  <p className="text-sm text-gray-600">{profile.bio}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Verification Badges */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Xác thực</h4>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={profile.isVerifiedEmail ? "default" : "outline"}
                  className="gap-1"
                >
                  <Mail className="w-3 h-3" />
                  Email
                  {profile.isVerifiedEmail && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                </Badge>

                <Badge
                  variant={profile.isVerifiedPhone ? "default" : "outline"}
                  className="gap-1"
                >
                  <Phone className="w-3 h-3" />
                  Số điện thoại
                  {profile.isVerifiedPhone && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                </Badge>

                <Badge
                  variant={profile.isVerifiedIdentity ? "default" : "outline"}
                  className="gap-1"
                >
                  <Shield className="w-3 h-3" />
                  CMND/CCCD
                  {profile.isVerifiedIdentity && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                </Badge>

                <Badge
                  variant={profile.isVerifiedBank ? "default" : "outline"}
                  className="gap-1"
                >
                  <Shield className="w-3 h-3" />
                  Ngân hàng
                  {profile.isVerifiedBank && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
