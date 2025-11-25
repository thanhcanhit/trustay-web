"use client";

import { Button } from '@/components/ui/button';
import { Sparkles, Trash2, X } from 'lucide-react';

interface AIHeaderProps {
  onClear: () => void;
  onClose: () => void;
  onPostRoom: () => void;
}

export function AIHeader({ onClear, onClose, onPostRoom }: AIHeaderProps) {
  return (
    <div className="h-10 sm:h-12 flex items-center justify-between px-2 sm:px-3 border-b flex-shrink-0">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
        <Sparkles className="text-primary w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
        <span className="font-semibold truncate text-sm sm:text-base">Trustay AI</span>
      </div>
      <div className="flex items-center gap-0.5 sm:gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onPostRoom} 
          className="h-8 px-2 sm:px-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
        >
          <Sparkles size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Đăng phòng nhanh</span>
          <span className="sm:hidden">Đăng phòng</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={onClear} aria-label="Xóa hội thoại" className="h-8 w-8 sm:h-9 sm:w-9">
          <Trash2 size={14} className="sm:w-4 sm:h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng AI" className="h-8 w-8 sm:h-9 sm:w-9">
          <X size={14} className="sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
}


