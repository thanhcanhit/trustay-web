"use client";

interface AIControlBlockProps {
  questions?: ReadonlyArray<string>;
  errorCode?: string;
  errorDetails?: string;
  onAsk: (q: string) => void;
}

export function AIControlBlock({ questions, errorCode, errorDetails, onAsk }: AIControlBlockProps) {
  const hasClarify = Array.isArray(questions) && questions.length > 0;
  const hasError = !!errorCode || !!errorDetails;
  return (
    <>
      {hasClarify && (
          <div className="mt-2 flex flex-wrap gap-2">
            {questions!.map((q, idx) => (
              <button key={idx} className="text-xs bg-white/70 border rounded px-2 py-1 hover:bg-white" onClick={() => onAsk(q)}>
                {q}
              </button>
            ))}
        </div>
      )}
      {hasError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
          <div className="text-red-800 font-medium mb-1">Đã xảy ra lỗi</div>
          {errorDetails && <div className="text-red-700 text-xs mb-2">{errorDetails}</div>}
          {errorCode && <div className="text-red-600 text-xs font-mono mb-2">Mã lỗi: {errorCode}</div>}
        </div>
      )}
    </>
  );
}


