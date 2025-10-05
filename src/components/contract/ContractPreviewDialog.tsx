'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Download } from 'lucide-react';
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

  const { downloadPDF, downloading } = useContractStore();

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Call API to get preview (PNG image)
      const response = await fetch(`/api/contracts/${contractId}/pdf/preview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải bản xem trước');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (open && contractId) {
      loadPreview();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [open, contractId, loadPreview, previewUrl]);

  const handleDownload = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xem trước hợp đồng</DialogTitle>
          <DialogDescription>
            Xem trước nội dung hợp đồng trước khi ký
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="text-gray-500">Đang tải bản xem trước...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview Image */}
          {previewUrl && !loading && !error && (
            <div className="border rounded-lg overflow-hidden bg-gray-50 relative min-h-[600px]">
              <Image
                src={previewUrl}
                alt="Contract Preview"
                width={800}
                height={1000}
                className="w-full h-auto"
                unoptimized
              />
            </div>
          )}

          {/* Actions */}
          {previewUrl && !loading && (
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className={`h-4 w-4 mr-2 ${downloading ? 'animate-spin' : ''}`} />
                Tải xuống PDF
              </Button>

              {showSignButton && onSignClick && (
                <Button onClick={onSignClick}>
                  Ký hợp đồng
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
