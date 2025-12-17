"use client";

import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

interface AIHeaderProps {
  onClose: () => void;
  onPostRoom?: () => void;
}

export function AIHeader({ onClose }: AIHeaderProps) {
  return (
    <div className="h-10 sm:h-10 py-1 pb-0 sm:pb-1 flex items-center justify-between px-2 sm:px-3 border-b flex-shrink-0">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
        <Sparkles className="text-primary w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        <span className="font-semibold truncate text-sm sm:text-base">Trustay AI</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng AI" className="h-8 w-8 sm:h-9 sm:w-9">
          <X size={14} className="sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
}


