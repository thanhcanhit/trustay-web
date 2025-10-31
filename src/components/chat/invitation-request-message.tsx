"use client";

import { MapPin, Home } from "lucide-react";
import type { MessageData } from "@/actions/chat.action";
import { MESSAGE_TYPES } from "@/constants/chat.constants";
import { SizingImage } from "@/components/sizing-image";
import { decodeStructuredMessage } from "@/lib/chat-message-encoder";

interface InvitationRequestMessageProps {
  message: MessageData;
  isOwnMessage: boolean;
}

export function InvitationRequestMessage({ message, isOwnMessage }: InvitationRequestMessageProps) {
  const isInvitation = message.type === MESSAGE_TYPES.INVITATION;
  const isRequest = message.type === MESSAGE_TYPES.REQUEST;
  const isRoommateApplication = message.type === MESSAGE_TYPES.ROOMMATE_APPLICATION;

  if (!isInvitation && !isRequest && !isRoommateApplication) {
    return null;
  }

  // Try to decode structured message first
  const structuredData = decodeStructuredMessage(message.content);
  
  // Fallback to metadata from backend (if available)
  const metadata = message.metadata;

  // Determine the actual type from structured data
  const structuredType = structuredData?.type;
  const isRoommateApp = structuredType === 'roommate_application' || 
                        structuredType === 'roommate_application_approved' || 
                        structuredType === 'roommate_application_rejected';

  // Get data from either structured message or metadata
  const roomData = structuredData?.room || (metadata?.roomId ? {
    roomId: metadata.roomId,
    roomSlug: metadata.roomSlug,
    roomName: metadata.roomName || '',
    roomImage: metadata.roomImage,
    roomPrice: metadata.roomPrice,
    roomLocation: metadata.roomLocation,
  } : null);

  const roomSeekingData = structuredData?.roomSeeking || (metadata?.roomSeekingPostId ? {
    roomSeekingPostId: metadata.roomSeekingPostId,
    roomSeekingTitle: metadata.roomSeekingTitle || '',
    roomSeekingBudget: metadata.roomSeekingBudget,
    roomSeekingLocation: metadata.roomSeekingLocation,
  } : null);

  const roommateSeekingData = structuredData?.roommateSeeking || (metadata?.roommateSeekingPostId ? {
    roommateSeekingPostId: metadata.roommateSeekingPostId,
    roommateSeekingPostTitle: metadata.roommateSeekingPostTitle || '',
    roommateSeekingPostBudget: metadata.roommateSeekingPostBudget,
    roommateSeekingPostLocation: metadata.roommateSeekingPostLocation,
  } : null);

  const displayMessage = structuredData?.message || message.content;

  // Render room card for invitation
  if (isInvitation && roomData) {
    return (
      <div className="flex flex-col gap-2 max-w-xs">
        <div className="font-semibold text-sm">
          Lời mời thuê
        </div>

        {/* Room Card */}
        <a
          href={`/listings/${roomData.roomSlug || roomData.roomId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          {roomData.roomImage && (
            <div className="relative h-32 w-full">
              <SizingImage
                src={roomData.roomImage}
                srcSize="512x512"
                alt={roomData.roomName || "Room"}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-3 space-y-1">
            <h4 className="font-semibold text-sm line-clamp-2 text-gray-900">
              {roomData.roomName}
            </h4>

            {roomData.roomLocation && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="line-clamp-1">{roomData.roomLocation}</span>
              </div>
            )}

            {roomData.roomPrice && (
              <div className="text-green-600 font-bold text-sm">
                {parseInt(roomData.roomPrice).toLocaleString('vi-VN')}đ/tháng
              </div>
            )}
          </div>
        </a>

        {/* Message content */}
        {displayMessage && (
          <div className={`p-3 rounded-lg break-words ${isOwnMessage ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>
            <p className="text-sm break-words">{displayMessage}</p>
          </div>
        )}
      </div>
    );
  }

  // Render room seeking card for request
  if ((isRequest || isRoommateApplication) && roomSeekingData && !isRoommateApp) {
    return (
      <div className="flex flex-col gap-2 max-w-xs">
        <div className="font-semibold text-sm">
          Yêu cầu thuê
        </div>

        {/* Room Seeking Card */}
        <a
          href={`/room-seekings/${roomSeekingData.roomSeekingPostId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-3 space-y-2">
            <h4 className="font-semibold text-sm line-clamp-2 text-gray-900">
              {roomSeekingData.roomSeekingTitle}
            </h4>

            {roomSeekingData.roomSeekingBudget && (
              <div className="text-green-600 font-bold text-xs">
                Ngân sách: {roomSeekingData.roomSeekingBudget}
              </div>
            )}

            {roomSeekingData.roomSeekingLocation && (
              <div className="flex items-center text-xs text-gray-500">
                <Home className="h-3 w-3 mr-1" />
                <span className="line-clamp-1">{roomSeekingData.roomSeekingLocation}</span>
              </div>
            )}
          </div>
        </a>

        {/* Message content */}
        {displayMessage && (
          <div className={`p-3 rounded-lg break-words ${isOwnMessage ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>
            <p className="text-sm break-words">{displayMessage}</p>
          </div>
        )}
      </div>
    );
  }

  // Render roommate seeking post card for application
  if ((isRequest || isRoommateApplication) && (roommateSeekingData || isRoommateApp)) {
    // If we have roommate seeking data, use it
    if (!roommateSeekingData) {
      // Just render the message without card
      return (
        <div className="flex flex-col gap-2 max-w-xs">
          <div className="font-semibold text-sm">
            Đơn ứng tuyển bạn cùng phòng
          </div>
          {displayMessage && (
            <div className={`p-3 rounded-lg break-words ${isOwnMessage ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>
              <p className="text-sm break-words">{displayMessage}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 max-w-xs">
        <div className="font-semibold text-sm">
          Đơn ứng tuyển bạn cùng phòng
        </div>

        {/* Roommate Seeking Post Card */}
        <a
          href={`/roommate/${roommateSeekingData.roommateSeekingPostId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-3 space-y-2">
            <h4 className="font-semibold text-sm line-clamp-2 text-gray-900">
              {roommateSeekingData.roommateSeekingPostTitle}
            </h4>

            {roommateSeekingData.roommateSeekingPostBudget && (
              <div className="text-green-600 font-bold text-xs">
                {roommateSeekingData.roommateSeekingPostBudget}
              </div>
            )}

            {roommateSeekingData.roommateSeekingPostLocation && (
              <div className="flex items-center text-xs text-gray-500">
                <Home className="h-3 w-3 mr-1" />
                <span className="line-clamp-1">{roommateSeekingData.roommateSeekingPostLocation}</span>
              </div>
            )}
          </div>
        </a>

        {/* Message content */}
        {displayMessage && (
          <div className={`p-3 rounded-lg break-words ${isOwnMessage ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>
            <p className="text-sm break-words">{displayMessage}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback: render as normal message if metadata is missing
  return null;
}
