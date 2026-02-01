import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from '@heroicons/react/24/outline';

interface FileInfo {
  id: string;
  originalName: string;
  size: number;
  publicUrl?: string;
  mimeType: string;
  fileCategory?: string;
}

interface FilePreviewProps {
  files: FileInfo[];
  apiBaseUrl?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const isImage = (mimeType: string) => mimeType?.startsWith('image/');
const isPdf = (mimeType: string) => mimeType === 'application/pdf';
const isPreviewable = (mimeType: string) => isImage(mimeType) || isPdf(mimeType);

export default function FilePreview({ files, apiBaseUrl }: FilePreviewProps) {
  const { t } = useTranslation();
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const baseUrl = apiBaseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const previewableFiles = files.filter((f) => isPreviewable(f.mimeType));

  const getFileUrl = (file: FileInfo) => `${baseUrl}/api/v1/upload/${file.id}/download`;
  const getPreviewUrl = (file: FileInfo) => {
    // For images, we can use the same download URL
    // For PDFs, we need to embed in an iframe
    return getFileUrl(file);
  };

  const openPreview = (file: FileInfo) => {
    const index = previewableFiles.findIndex((f) => f.id === file.id);
    setPreviewIndex(index >= 0 ? index : 0);
    setPreviewFile(file);
    setZoom(1);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setZoom(1);
  };

  const goToPrev = () => {
    if (previewIndex > 0) {
      const newIndex = previewIndex - 1;
      setPreviewIndex(newIndex);
      setPreviewFile(previewableFiles[newIndex]);
      setZoom(1);
    }
  };

  const goToNext = () => {
    if (previewIndex < previewableFiles.length - 1) {
      const newIndex = previewIndex + 1;
      setPreviewIndex(newIndex);
      setPreviewFile(previewableFiles[newIndex]);
      setZoom(1);
    }
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  if (!files || files.length === 0) {
    return <p className="text-sm text-gray-500">{t('admin.noFiles', 'No files uploaded')}</p>;
  }

  return (
    <>
      {/* File List */}
      <div className="space-y-2">
        {files.map((file) => {
          const canPreview = isPreviewable(file.mimeType);
          const isImg = isImage(file.mimeType);

          return (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Thumbnail for images */}
                {isImg ? (
                  <div
                    className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80"
                    onClick={() => openPreview(file)}
                  >
                    <img
                      src={getFileUrl(file)}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <DocumentIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {file.fileCategory && <span className="mr-2">{file.fileCategory}</span>}
                    {formatFileSize(file.size)}
                    {canPreview && (
                      <span className="ml-2 text-blue-600">
                        {isImg ? t('admin.imagePreview', 'Image') : t('admin.pdfPreview', 'PDF')}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Preview button */}
                {canPreview && (
                  <button
                    onClick={() => openPreview(file)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t('admin.preview', 'Preview')}
                  >
                    <MagnifyingGlassPlusIcon className="w-5 h-5" />
                  </button>
                )}

                {/* Download button */}
                <a
                  href={getFileUrl(file)}
                  download={file.originalName}
                  className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  title={t('admin.download', 'Download')}
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={closePreview}
        >
          <div
            className="relative max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white rounded-t-lg px-4 py-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {previewFile.originalName}
                </p>
                <p className="text-xs text-gray-500">
                  {previewIndex + 1} / {previewableFiles.length}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls for images */}
                {isImage(previewFile.mimeType) && (
                  <>
                    <button
                      onClick={zoomOut}
                      disabled={zoom <= 0.5}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      title={t('admin.zoomOut', 'Zoom out')}
                    >
                      <MagnifyingGlassMinusIcon className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={zoomIn}
                      disabled={zoom >= 3}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      title={t('admin.zoomIn', 'Zoom in')}
                    >
                      <MagnifyingGlassPlusIcon className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Download */}
                <a
                  href={getFileUrl(previewFile)}
                  download={previewFile.originalName}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title={t('admin.download', 'Download')}
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </a>

                {/* Close */}
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title={t('common.close', 'Close')}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-gray-900 flex-1 overflow-auto rounded-b-lg min-h-[60vh]">
              {isImage(previewFile.mimeType) ? (
                <div className="flex items-center justify-center p-4 h-full">
                  <img
                    src={getPreviewUrl(previewFile)}
                    alt={previewFile.originalName}
                    className="max-w-full max-h-full object-contain transition-transform"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
              ) : isPdf(previewFile.mimeType) ? (
                <iframe
                  src={`${getPreviewUrl(previewFile)}#toolbar=1&navpanes=0`}
                  className="w-full h-[70vh]"
                  title={previewFile.originalName}
                />
              ) : null}
            </div>

            {/* Navigation arrows */}
            {previewableFiles.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  disabled={previewIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={previewIndex === previewableFiles.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
