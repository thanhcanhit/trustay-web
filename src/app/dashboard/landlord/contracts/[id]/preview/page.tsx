"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Download, ZoomIn, ZoomOut, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useContractStore } from '@/stores/contractStore';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Contract } from '@/types/types';
import ContractSigningWorkflow from '@/components/contract/ContractSigningWorkflow';

export default function ContractPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [contract, setContract] = useState<Contract | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const { downloadPDF, downloading, getPreview, loadContractById } = useContractStore();

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('[ContractPreview] Loading preview for contract:', contractId);

    try {
      const url = await getPreview(contractId);
      console.log('[ContractPreview] Preview URL received:', url);
      if (url) {
        setPreviewUrl(url);
        console.log('[ContractPreview] Preview URL set successfully');
      } else {
        console.error('[ContractPreview] No URL returned from getPreview');
        throw new Error('Không thể tải bản xem trước');
      }
    } catch (err) {
      console.error('[ContractPreview] Error loading preview:', err);
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [contractId, getPreview]);

  const loadContract = useCallback(async () => {
    const result = await loadContractById(contractId);
    if (result) {
      setContract(result);
      // Determine current user ID (landlord)
      setCurrentUserId(result.landlordId || '');
    }
  }, [contractId, loadContractById]);

  useEffect(() => {
    if (contractId) {
      loadPreview();
      loadContract();
    }

    // Cleanup: revoke blob URL when component unmounts
    return () => {
      if (previewUrl) {
        console.log('[ContractPreview] Cleanup: revoking blob URL');
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [contractId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSigningComplete = () => {
    // Reload contract and preview after signing
    loadContract();
    loadPreview();
    toast.success('Hợp đồng đã được cập nhật!');
  };

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
        toast.success('Đã tải xuống hợp đồng thành công!');
      } else {
        throw new Error('Không thể tải xuống PDF');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Không thể tải xuống hợp đồng');
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <DashboardLayout userType="landlord">
      <div className="flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Back button and title */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </Button>
                <div className="border-l h-6" />
                <h1 className="text-lg font-semibold text-gray-900">
                  Xem trước hợp đồng
                </h1>
              </div>

              {/* Right: Controls */}
              {previewUrl && !loading && (
                <div className="flex items-center gap-3">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 border rounded-md p-1 bg-gray-50">
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
                      className="px-3 text-sm font-medium hover:bg-gray-200 rounded min-w-[60px] h-8"
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

                  {/* Download Button */}
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    <Download className={`h-4 w-4 mr-2 ${downloading ? 'animate-spin' : ''}`} />
                    {downloading ? 'Đang tải...' : 'Tải xuống PDF'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area - Two Column Layout */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Preview (2/3 width) */}
              <div className="lg:col-span-2">
                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                      <span className="text-gray-500">Đang tải bản xem trước...</span>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="flex items-center justify-center min-h-[60vh] p-4">
                    <Alert variant="destructive" className="max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Preview Image */}
                {previewUrl && !loading && !error && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-center">
                      <div
                        className="bg-white shadow-lg rounded-md overflow-hidden transition-all duration-200 border"
                        style={{
                          width: `${zoom}%`,
                          maxWidth: '100%',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          key={previewUrl}
                          src={previewUrl}
                          alt="Contract Preview"
                          className="w-full h-auto"
                          onLoad={() => console.log('[ContractPreview] Image loaded successfully')}
                          onError={(e) => {
                            console.error('[ContractPreview] Image load error:', e);
                            setError('Không thể hiển thị ảnh xem trước');
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && previewUrl && (
                  <div className="text-xs text-gray-500 mt-4 text-center space-y-1">
                    <div>Loading: {loading ? 'Yes' : 'No'}</div>
                    <div>Has URL: {previewUrl ? 'Yes' : 'No'}</div>
                    <div>Zoom: {zoom}%</div>
                    <div>Error: {error || 'None'}</div>
                  </div>
                )}
              </div>

              {/* Right Column - Signing Section (1/3 width) */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  {contract && (
                    <ContractSigningWorkflow
                      contract={contract}
                      currentUserId={currentUserId}
                      currentUserRole="landlord"
                      onSigningComplete={handleSigningComplete}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
