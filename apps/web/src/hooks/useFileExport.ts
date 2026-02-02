import { useState } from 'react';
import { apiClient } from '../lib/api-client';
import toast from 'react-hot-toast';

interface ExportOptions {
  endpoint: string;
  filename?: string;
  params?: Record<string, any>;
}

export function useFileExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportFile = async (options: ExportOptions) => {
    setIsExporting(true);
    try {
      const response = await apiClient.get(options.endpoint, {
        params: options.params,
        responseType: 'blob',
      });

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = options.filename || 'export.xlsx';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('导出成功');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  const exportPassportsToExcel = async (params?: {
    ids?: string[];
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    await exportFile({
      endpoint: '/api/v1/export/passports/excel',
      params,
      filename: `device-passports-${Date.now()}.xlsx`,
    });
  };

  const exportPassportsToCSV = async (params?: { ids?: string[] }) => {
    await exportFile({
      endpoint: '/api/v1/export/passports/csv',
      params,
      filename: `device-passports-${Date.now()}.csv`,
    });
  };

  const exportLifecycleToExcel = async (passportId: string) => {
    await exportFile({
      endpoint: '/api/v1/export/lifecycle/excel',
      params: { passportId },
      filename: `lifecycle-events-${passportId}.xlsx`,
    });
  };

  const exportQRCodesBatch = async (ids: string[]) => {
    await exportFile({
      endpoint: '/api/v1/export/qr-codes/batch',
      params: { ids },
      filename: `qr-codes-batch-${Date.now()}.xlsx`,
    });
  };

  const exportServiceOrdersToExcel = async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    await exportFile({
      endpoint: '/api/v1/export/service-orders/excel',
      params,
      filename: `service-orders-${Date.now()}.xlsx`,
    });
  };

  return {
    isExporting,
    exportFile,
    exportPassportsToExcel,
    exportPassportsToCSV,
    exportLifecycleToExcel,
    exportQRCodesBatch,
    exportServiceOrdersToExcel,
  };
}
