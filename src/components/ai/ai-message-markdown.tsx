"use client";

import ReactMarkdown from 'react-markdown';
import { PhotoProvider, PhotoView } from 'react-photo-view';

interface AIMessageMarkdownProps {
  content: string;
  onOpenTable: (table: React.ReactNode) => void;
}

export function AIMessageMarkdown({ content, onOpenTable }: AIMessageMarkdownProps) {
  return (
    <PhotoProvider>
      <ReactMarkdown
        components={{
          a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          table: ({ children, ...props }) => (
            <div className="space-y-2">
              <div className="overflow-auto max-h-48">
                <table {...props} className="min-w-full text-xs border bg-white">
                  {children as React.ReactNode}
                </table>
              </div>
              <div>
                <button
                  className="text-xs text-blue-700 hover:underline"
                  onClick={() => {
                    onOpenTable(
                      <div className="overflow-auto max-h-[70vh]">
                        <table className="min-w-full text-sm border bg-white">{children as React.ReactNode}</table>
                      </div>,
                    );
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ),
          pre: ({ children }) => <pre className="overflow-auto max-h-64">{children as React.ReactNode}</pre>,
          code: (props) => <code className={props.className}>{props.children as React.ReactNode}</code>,
          img: ({ src, alt }) => {
            const s = typeof src === 'string' ? src : undefined;
            return s ? (
              <PhotoView src={s}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s} alt={alt || ''} className="max-w-full h-auto rounded border" />
              </PhotoView>
            ) : null;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </PhotoProvider>
  );
}


