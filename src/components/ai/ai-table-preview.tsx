"use client";

import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useRouter } from 'next/navigation';
import type { TableCell, TableColumn } from '@/types';

interface AITablePreviewProps {
  columns: ReadonlyArray<TableColumn>;
  rows: ReadonlyArray<Record<string, TableCell>>;
  previewLimit?: number;
  onOpenFull: (content: React.ReactNode) => void;
}

const truncate = (t: string, max = 100) => (t?.length > max ? `${t.slice(0, max)}…` : t);

/**
 * Filter out columns that have no values in any row
 */
function filterColumnsWithValues(
  columns: ReadonlyArray<TableColumn>,
  rows: ReadonlyArray<Record<string, TableCell>>,
): ReadonlyArray<TableColumn> {
  if (rows.length === 0) return columns;
  
  return columns.filter((col) => {
    // Check if at least one row has a non-null, non-undefined, non-empty value for this column
    return rows.some((row) => {
      const value = row[col.key];
      // Consider null, undefined, empty string, and empty array as "no value"
      if (value == null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });
  });
}

export function AITablePreview({ columns, rows, previewLimit, onOpenFull }: AITablePreviewProps) {
  const router = useRouter();
  const limit = Math.min(5, previewLimit ?? 5);
  const previewRows = rows.slice(0, limit);
  
  // Filter out columns without values
  const filteredColumns = filterColumnsWithValues(columns, rows);

  const renderCell = (row: Record<string, TableCell>, col: TableColumn, compact = true) => {
    const cell = row[col.key];
    if (cell == null) return '';
    if (col.type === 'image' && typeof cell === 'string') {
      return (
        <PhotoProvider>
          <PhotoView src={cell}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cell} alt={col.label} className={`${compact ? 'w-10 h-10' : 'w-20 h-20'} object-cover rounded border`} />
          </PhotoView>
        </PhotoProvider>
      );
    }
    if (col.type === 'url' && typeof cell === 'string') {
      return (
        <a href={cell} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline block max-w-[200px] truncate">
          {truncate(cell)}
        </a>
      );
    }
    const rowPath = typeof row['path'] === 'string' ? String(row['path']) : undefined;
    if (rowPath && (col.key === 'title' || col.key === 'id')) {
      const isExternal = rowPath.startsWith('http');
      return isExternal ? (
        <a href={rowPath} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline block max-w-[200px] truncate">
          {truncate(String(cell))}
        </a>
      ) : (
        <button type="button" onClick={(e) => { e.stopPropagation(); router.push(rowPath); }} className="text-blue-700 underline block max-w-[200px] truncate text-left">
          {truncate(String(cell))}
        </button>
      );
    }
    if (col.type === 'number' && typeof cell === 'number') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cell);
    }
    if (col.type === 'date' && typeof cell === 'string') {
      const d = new Date(cell);
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
      }
      return truncate(cell);
    }
    if (col.type === 'boolean' && typeof cell === 'boolean') {
      return cell ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>;
    }
    return <span className="block max-w-[200px] truncate">{truncate(String(cell))}</span>;
  };

  return (
    <div className="mt-3 overflow-auto">
      <table
        className="min-w-full text-xs border bg-white cursor-zoom-in"
        onClick={() =>
          onOpenFull(
            <div className="overflow-auto max-h-[70vh]">
              <table className="min-w-full text-sm border bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    {filteredColumns.map((col) => (
                      <th key={col.key} className="text-left px-3 py-2 border-b">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIdx) => {
                    const rowPath = typeof row['path'] === 'string' ? String(row['path']) : undefined;
                    const isExternal = rowPath?.startsWith('http');
                    return (
                      <tr 
                        key={rIdx} 
                        className="odd:bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={(e) => {
                          if (rowPath) {
                            e.stopPropagation();
                            if (isExternal) {
                              window.open(rowPath, '_blank');
                            } else {
                              router.push(rowPath);
                            }
                          }
                        }}
                      >
                        {filteredColumns.map((col) => (
                          <td key={col.key} className="px-3 py-2 border-b">{renderCell(row, col, false)}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>,
          )
        }
      >
        <thead className="bg-gray-50">
          <tr>
            {filteredColumns.map((col) => (
              <th key={col.key} className="text-left px-2 py-1 border-b">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((row, rIdx) => (
            <tr key={rIdx} className="odd:bg-gray-50">
              {filteredColumns.map((col) => (
                <td key={col.key} className="px-2 py-1 border-b">{renderCell(row, col, true)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


