import { X } from 'lucide-react';
import { PDFViewer } from './PDFViewer';
import { ImageViewer } from './ImageViewer';

interface FilePreviewModalProps {
  file: {
    url: string;
    name: string;
    type: string;
  };
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full h-full max-w-7xl max-h-screen m-4 bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 truncate max-w-md">
            {file.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="pt-16 h-full">
          {isPDF ? (
            <PDFViewer file={file.url} />
          ) : isImage ? (
            <ImageViewer src={file.url} alt={file.name} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg font-medium mb-2">无法预览此文件类型</p>
              <p className="text-sm mb-4">文件类型: {file.type || '未知'}</p>
              <a
                href={file.url}
                download={file.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                下载文件
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
