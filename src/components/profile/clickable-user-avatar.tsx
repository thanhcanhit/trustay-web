"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileModal } from "./user-profile-modal";
import { cn } from "@/lib/utils";

interface ClickableUserAvatarProps {
  userId: string;
  avatarUrl?: string | null;
  userName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showHoverEffect?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export function ClickableUserAvatar({
  userId,
  avatarUrl,
  userName,
  size = "md",
  className,
  showHoverEffect = true,
}: ClickableUserAvatarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts
        .slice(-2)
        .map((n) => n.charAt(0).toUpperCase())
        .join("");
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div
        className={cn(
          "cursor-pointer",
          showHoverEffect && "hover:opacity-80 transition-opacity",
          className
        )}
        onClick={() => setModalOpen(true)}
      >
        <Avatar
          className={cn(
            "rounded-lg",
            sizeClasses[size],
            showHoverEffect && "hover:ring-2 hover:ring-primary transition-all"
          )}
        >
          <AvatarImage src={avatarUrl || ""} alt={userName} />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
      </div>

      <UserProfileModal
        userId={userId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
