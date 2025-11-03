"use client";

import { Button } from '@/components/ui/button';
import { Sparkles, Trash2, X } from 'lucide-react';

interface AIHeaderProps {
  onClear: () => void;
  onClose: () => void;
}

export function AIHeader({ onClear, onClose }: AIHeaderProps) {
  return (
    <div className="h-12 flex items-center justify-between px-2 border-b">
      <div className="flex items-center gap-2 overflow-hidden">
        <Sparkles className="text-primary" size={18} />
        <span className="font-semibold truncate">Trustay AI</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onClear} aria-label="Xóa hội thoại">
          <Trash2 size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng AI">
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}


