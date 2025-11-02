"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  Briefcase,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { RoommateApplication } from "@/actions/roommate-applications.action";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useApplicationManagementStore } from "@/stores/applicationManagementStore";

interface ApplicationCardProps {
  application: RoommateApplication;
  userRole: "tenant" | "landlord" | "applicant";
  onUpdate?: () => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Đang chờ",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  accepted: {
    label: "Đã chấp nhận",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  rejected: {
    label: "Đã từ chối",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  awaiting_confirmation: {
    label: "Chờ xác nhận",
    color: "bg-blue-100 text-blue-800",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
  },
  expired: {
    label: "Hết hạn",
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
  },
};

export function ApplicationCard({
  application,
  userRole,
  onUpdate,
}: ApplicationCardProps) {
  const { 
    confirmApplication, 
    approveApplicationAsLandlord, 
    rejectApplicationAsLandlord,
    loading 
  } = useApplicationManagementStore();
  
  const statusConfig = STATUS_CONFIG[application.status];
  const StatusIcon = statusConfig.icon;

  const handleLandlordApprove = async () => {
    const success = await approveApplicationAsLandlord(
      application.id,
      "Chấp nhận đơn ứng tuyển"
    );

    if (success) {
      onUpdate?.();
    }
  };

  const handleLandlordReject = async () => {
    const success = await rejectApplicationAsLandlord(
      application.id,
      "Từ chối đơn ứng tuyển"
    );

    if (success) {
      onUpdate?.();
    }
  };

  const handleConfirm = async () => {
    const success = await confirmApplication(application.id);

    if (success) {
      onUpdate?.();
    }
  };

  // Determine if user can perform actions
  const canLandlordApprove =
    userRole === "landlord" && application.status === "accepted";
  const canConfirm =
    userRole === "applicant" && application.status === "awaiting_confirmation";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={application.applicant?.avatarUrl}
                alt={application.fullName}
              />
              <AvatarFallback>
                {application.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{application.fullName}</CardTitle>
              <CardDescription>{application.email}</CardDescription>
            </div>
          </div>
          <Badge className={statusConfig.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span>{application.phoneNumber}</span>
          </div>
          {application.occupation && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <span>{application.occupation}</span>
            </div>
          )}
        </div>

        {/* Move-in Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>
              Chuyển vào:{" "}
              {format(new Date(application.moveInDate), "dd/MM/yyyy", {
                locale: vi,
              })}
            </span>
          </div>
          {application.intendedStayMonths && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Dự kiến: {application.intendedStayMonths} tháng</span>
            </div>
          )}
        </div>

        {/* Room Info */}
        {application.roommateSeekingPost && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">
                  {application.roommateSeekingPost.title}
                </p>
                {application.roommateSeekingPost.roomInstance && (
                  <p className="text-xs text-gray-600">
                    Phòng {application.roommateSeekingPost.roomInstance.roomNumber} -{" "}
                    {application.roommateSeekingPost.roomInstance.room.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Application Message */}
        {application.applicationMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  Lời nhắn
                </p>
                <p className="text-sm text-blue-800">
                  {application.applicationMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Urgent Badge */}
        {application.isUrgent && (
          <Badge variant="destructive">Khẩn cấp</Badge>
        )}

        {/* Actions */}
        {(canLandlordApprove || canConfirm) && (
          <div className="flex gap-2 pt-2">
            {canLandlordApprove && (
              <>
                <Button
                  onClick={handleLandlordApprove}
                  disabled={loading}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Phê duyệt
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLandlordReject}
                  disabled={loading}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
              </>
            )}

            {canConfirm && (
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Xác nhận hoàn tất
              </Button>
            )}
          </div>
        )}

        {/* Status Messages */}
        {application.status === "accepted" && userRole === "applicant" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              Đơn của bạn đang chờ chủ nhà phê duyệt. Bạn sẽ nhận được thông báo
              khi có kết quả.
            </p>
          </div>
        )}

        {application.status === "awaiting_confirmation" &&
          userRole !== "applicant" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-900">
                Đang chờ người ứng tuyển xác nhận để hoàn tất.
              </p>
            </div>
          )}

        {/* Timestamps */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <p>
            Nộp đơn:{" "}
            {format(new Date(application.createdAt), "dd/MM/yyyy HH:mm", {
              locale: vi,
            })}
          </p>
          {application.confirmedAt && (
            <p>
              Xác nhận:{" "}
              {format(new Date(application.confirmedAt), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
