"use client";

export function AITypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100">
      <span className="sr-only">Thinking...</span>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}


