"use client";

import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useRouter } from 'next/navigation';
import type { ListItem } from '@/types';

interface AIListPreviewProps {
  items: ReadonlyArray<ListItem>;
  onOpenFull: (content: React.ReactNode) => void;
}

const truncate = (t: string, max = 100) => (t?.length > max ? `${t.slice(0, max)}…` : t);

export function AIListPreview({ items, onOpenFull }: AIListPreviewProps) {
  const router = useRouter();
  // Filter out items that don't have a meaningful title to avoid showing
  // generic placeholders like "Untitled" in the UI.
  const meaningfulItems = items.filter((item) => {
    const title = item.title?.trim();
    if (!title) return false;
    return title.toLowerCase() !== 'untitled';
  });

  if (meaningfulItems.length === 0) {
    return null;
  }

  const preview = meaningfulItems.slice(0, 5);

  const Card = (item: ListItem, compact = true) => (
    <div className={`flex items-center gap-2 ${compact ? 'p-1' : 'p-2'} rounded border bg-white`} aria-label={item.title}>
      {item.thumbnailUrl && (
        <PhotoProvider>
          <PhotoView src={item.thumbnailUrl}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.thumbnailUrl} alt={item.title} width={compact ? 32 : 48} height={compact ? 32 : 48} className="rounded object-cover border" />
          </PhotoView>
        </PhotoProvider>
      )}
      <div className="min-w-0">
        <div className={`${compact ? 'text-xs' : 'text-sm'} font-medium truncate text-blue-700 underline-offset-2 group-hover:underline`}>{truncate(item.title)}</div>
        {item.description && <div className={`${compact ? 'text-[11px]' : 'text-xs'} text-gray-500 truncate`}>{truncate(item.description)}</div>}
      </div>
    </div>
  );

  const renderLink = (item: ListItem, node: React.ReactNode) => {
    const href = item.path || item.externalUrl || '';
    const isExternal = href.startsWith('http');
    if (!href) return <div key={item.id} className="opacity-80 cursor-default">{node}</div>;
    if (!isExternal && href.startsWith('/')) {
      return (
        <button key={item.id} type="button" onClick={() => router.push(href)} className="group block w-full text-left" aria-label={item.title}>
          {node}
        </button>
      );
    }
    return (
      <a key={item.id} href={href} className="group block" target="_blank" rel="noopener noreferrer" aria-label={item.title}>
        {node}
      </a>
    );
  };

  return (
    <div className="mt-3 space-y-1">
      {preview.map((i) => renderLink(i, Card(i, true)))}
      {meaningfulItems.length > 5 && (
        <div className="pt-1">
          <button
            className="text-xs text-blue-700 hover:underline"
            onClick={() =>
              onOpenFull(
                <div className="overflow-auto max-h-[70vh] space-y-2">
                  {meaningfulItems.map((i) => {
                    const node = Card(i, false);
                    const href = i.path || i.externalUrl || '';
                    const isExternal = href.startsWith('http');
                    if (!href) return <div key={i.id}>{node}</div>;
                    return isExternal ? (
                      <a key={i.id} href={href} target="_blank" rel="noopener noreferrer" aria-label={i.title}>
                        {node}
                      </a>
                    ) : (
                      <button key={i.id} type="button" onClick={() => router.push(href)} className="block w-full text-left cursor-pointer" aria-label={i.title}>
                        {node}
                      </button>
                    );
                  })}
                </div>,
              )
            }
          >
            Xem tất cả ({meaningfulItems.length})
          </button>
        </div>
      )}
    </div>
  );
}


