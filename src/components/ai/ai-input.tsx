"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface AIInputProps {
  onSend: (content: string) => void | Promise<void>;
  disabled?: boolean;
}

export function AIInput({ onSend, disabled = false }: AIInputProps) {
  const [value, setValue] = useState("");

  const doSend = async () => {
    const content = value.trim();
    if (!content) return;
    await onSend(content);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void doSend();
    }
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 border-t bg-white flex-shrink-0">
      <div className="flex items-end gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 bg-gray-50 border rounded-xl sm:rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2">
          <Input
            type="text"
            placeholder="Ask anything"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            className="flex-1 border-0 bg-transparent drop-shadow-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 text-xs sm:text-sm h-7 sm:h-auto p-0"
          />
          <button
            onClick={() => void doSend()}
            disabled={disabled || value.trim().length === 0}
            className="inline-flex items-center justify-center h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-black text-white disabled:opacity-50 flex-shrink-0 text-sm sm:text-base"
            aria-label="Send"
            title="Send"
          >
            <span className="sr-only">Send</span>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}


