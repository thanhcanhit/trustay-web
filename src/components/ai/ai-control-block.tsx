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
        <details className="mt-2 text-[11px] sm:text-xs text-red-700">
          <summary className="cursor-pointer inline-flex items-center gap-1 text-red-600 hover:underline">
            Đã xảy ra lỗi (bấm để xem chi tiết)
          </summary>
          <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded">
            {errorDetails && <div className="text-red-700 text-xs mb-1">{errorDetails}</div>}
            {errorCode && <div className="text-red-600 text-xs font-mono">Mã lỗi: {errorCode}</div>}
          </div>
        </details>
      )}
    </>
  );
}


