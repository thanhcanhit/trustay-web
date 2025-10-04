"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";

interface MessageAttachmentsProps {
  attachments: Array<{ id: string; url: string; type: string; name?: string }>;
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string } | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleMediaClick = (url: string, type: string) => {
    setSelectedMedia({ url, type });
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        {attachments.map((attachment) => {
          const isImage = attachment.type.startsWith('image');
          const isVideo = attachment.type.startsWith('video');

          return (
            <div
              key={attachment.id}
              className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleMediaClick(attachment.url, attachment.type)}
            >
              {isImage && (
                <Image
                  src={attachment.url}
                  alt={attachment.name || "Attachment"}
                  width={200}
                  height={200}
                  className="object-cover max-h-48 rounded-lg"
                />
              )}

              {isVideo && (
                <div className="relative">
                  <video
                    src={attachment.url}
                    className="object-cover max-h-48 rounded-lg w-48"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="bg-white/90 rounded-full p-3">
                      <Play className="text-gray-800" size={24} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fullscreen Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300"
            onClick={closeModal}
          >
            ×
          </button>

          <div className="max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type.startsWith('image') ? (
              <Image
                src={selectedMedia.url}
                alt="Full size"
                width={1200}
                height={800}
                className="object-contain max-h-[90vh]"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-h-[90vh] w-full"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
