"use client";

import Image from "next/image";
import { MapPin, Home } from "lucide-react";
import type { MessageData } from "@/actions/chat.action";
import { MESSAGE_TYPES } from "@/constants/chat.constants";
//import { getRoomTypeDisplayName } from "@/utils/room-types";
import { getOptimizedImageUrl } from "@/lib/utils";

interface InvitationRequestMessageProps {
  message: MessageData;
  isOwnMessage: boolean;
}

export function InvitationRequestMessage({ message, isOwnMessage }: InvitationRequestMessageProps) {
  const isInvitation = message.type === MESSAGE_TYPES.INVITATION;
  const isRequest = message.type === MESSAGE_TYPES.REQUEST;

  if (!isInvitation && !isRequest) {
    return null;
  }

  const metadata = message.metadata;

  // Render room card for invitation
  if (isInvitation && metadata?.roomId) {
    return (
      <div className="flex flex-col gap-2 max-w-sm">
        <div className="font-semibold text-sm">
          Lời mời thuê
        </div>

        {/* Room Card */}
        <a
          href={`/listings/${metadata.roomSlug || metadata.roomId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          {metadata.roomImage && (
            <div className="relative h-32 w-full">
              <Image
                src={getOptimizedImageUrl(metadata.roomImage, 'listing')}
                alt={metadata.roomName || "Room"}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-3 space-y-1">
            <h4 className="font-semibold text-sm line-clamp-2 text-gray-900">
              {metadata.roomName}
            </h4>

            {metadata.roomLocation && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="line-clamp-1">{metadata.roomLocation}</span>
              </div>
            )}

            {metadata.roomPrice && (
              <div className="text-green-600 font-bold text-sm">
                {parseInt(metadata.roomPrice).toLocaleString('vi-VN')}đ/tháng
              </div>
            )}
          </div>
        </a>

        {/* Message content */}
        {message.content && (
          <div className={`p-3 rounded-lg ${isOwnMessage ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>
            <p className="text-sm">{message.content}</p>
          </div>
        )}
      </div>
    );
  }

  // Render room seeking card for request
  if (isRequest && metadata?.roomSeekingPostId) {
    return (
      <div className="flex flex-col gap-2 max-w-sm">
        <div className="font-semibold text-sm">
          Yêu cầu thuê
        </div>

        {/* Room Seeking Card */}
        <a
          href={`/room-seekings/${metadata.roomSeekingPostId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-3 space-y-2">
            <h4 className="font-semibold text-sm line-clamp-2 text-gray-900">
              {metadata.roomSeekingTitle}
            </h4>

            {metadata.roomSeekingBudget && (
              <div className="text-green-600 font-bold text-xs">
                Ngân sách: {metadata.roomSeekingBudget}
              </div>
            )}

            {metadata.roomSeekingLocation && (
              <div className="flex items-center text-xs text-gray-500">
                <Home className="h-3 w-3 mr-1" />
                <span className="line-clamp-1">{metadata.roomSeekingLocation}</span>
              </div>
            )}
          </div>
        </a>

        {/* Message content */}
        {message.content && (
          <div className={`p-3 rounded-lg ${isOwnMessage ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>
            <p className="text-sm">{message.content}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback: render as normal message if metadata is missing
  return null;
}
