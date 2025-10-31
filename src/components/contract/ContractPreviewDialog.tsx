'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useContractStore } from '@/stores/contractStore';

interface ContractPreviewDialogProps {
  contractId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignClick?: () => void;
  showSignButton?: boolean;
}

export default function ContractPreviewDialog({
  contractId,
  open,
  onOpenChange,
  onSignClick,
  showSignButton = false,
}: ContractPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { downloadPDF, downloading, getPreview } = useContractStore();

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('[ContractPreviewDialog] Loading preview for contract:', contractId);

    try {
      // Get preview using store action (handles 404 and auto-generate)
      const url = await getPreview(contractId);
      console.log('[ContractPreviewDialog] Preview URL received:', url);
      if (url) {
        setPreviewUrl(url);
        setHasLoadedOnce(true);
        console.log('[ContractPreviewDialog] Preview URL set successfully');
      } else {
        console.error('[ContractPreviewDialog] No URL returned from getPreview');
        throw new Error('Không thể tải bản xem trước');
      }
    } catch (err) {
      console.error('[ContractPreviewDialog] Error loading preview:', err);
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [contractId, getPreview]);

  useEffect(() => {
    if (open && contractId && !hasLoadedOnce) {
      // Reset state when dialog opens
      console.log('[ContractPreviewDialog] Dialog opened, loading preview');
      setPreviewUrl(null);
      setLoading(false);
      setError(null);

      // Load preview
      loadPreview();
    }
  }, [open, contractId, hasLoadedOnce, loadPreview]);

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup: revoke blob URL when component unmounts or dialog closes
      if (previewUrl) {
        console.log('[ContractPreviewDialog] Cleanup: revoking blob URL');
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      console.log('[ContractPreviewDialog] Dialog closed, resetting state');
      setPreviewUrl(null);
      setLoading(false);
      setError(null);
      setHasLoadedOnce(false);
      setZoom(100);
      setIsFullscreen(false);
    }
  }, [open]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleDownload = async () => {
    try {
      // Download PDF (store handles 404 and auto-generate)
      const blob = await downloadPDF(contractId);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `HĐ-${contractId.slice(-8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Không thể tải xuống PDF');
      }
    } catch (error) {
      console.error('Download failed:', error);
      setError(error instanceof Error ? error.message : 'Không thể tải xuống PDF');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          isFullscreen
            ? 'max-w-[98vw] w-[98vw] h-[98vh]'
            : 'max-w-6xl w-full h-[95vh]'
        } overflow-hidden flex flex-col p-0`}
      >
        {/* Header with controls */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Xem trước hợp đồng</DialogTitle>
              <DialogDescription>
                Xem trước nội dung hợp đồng trước khi ký
              </DialogDescription>
            </div>

            {/* Zoom and View Controls */}
            {previewUrl && !loading && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={handleResetZoom}
                    className="px-3 text-sm font-medium hover:bg-gray-100 rounded min-w-[60px]"
                  >
                    {zoom}%
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="h-8"
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content Area with scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="text-gray-500">Đang tải bản xem trước...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="h-full flex items-center justify-center p-4">
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Preview Image */}
          {previewUrl && !loading && !error && (
            <div className="flex items-start justify-center min-h-full pb-4">
              <div
                className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-200"
                style={{
                  width: `${zoom}%`,
                  maxWidth: '100%'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={previewUrl}
                  src={previewUrl}
                  alt="Contract Preview"
                  className="w-full h-auto"
                  onLoad={() => console.log('[ContractPreviewDialog] Image loaded successfully')}
                  onError={(e) => {
                    console.error('[ContractPreviewDialog] Image load error:', e);
                    setError('Không thể hiển thị ảnh xem trước');
                  }}
                />
              </div>
            </div>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && previewUrl && (
            <div className="text-xs text-gray-500 mt-2 text-center">
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
              <div>Has URL: {previewUrl ? 'Yes' : 'No'}</div>
              <div>Zoom: {zoom}%</div>
              <div>Error: {error || 'None'}</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {previewUrl && !loading && (
          <div className="px-6 py-4 border-t bg-white sticky bottom-0">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className={`h-4 w-4 mr-2 ${downloading ? 'animate-spin' : ''}`} />
                {downloading ? 'Đang tải...' : 'Tải xuống PDF'}
              </Button>

              {showSignButton && onSignClick && (
                <Button onClick={onSignClick}>
                  Ký hợp đồng
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
