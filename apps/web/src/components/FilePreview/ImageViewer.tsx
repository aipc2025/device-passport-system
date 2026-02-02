import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, X, Maximize2 } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  onClose?: () => void;
  className?: string;
}

export function ImageViewer({ src, alt = 'Image', onClose, className = '' }: ImageViewerProps) {
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 5.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.2));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1.0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.2}
            className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 5.0}
            className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            title="放大"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRotate}
            className="p-2 rounded-lg hover:bg-gray-700"
            title="旋转"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-gray-700"
            title="重置"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-700"
            title="下载"
          >
            <Download className="w-5 h-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Image Container */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain transition-transform select-none"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
