import { useState, useCallback } from 'react';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { uploadApi } from '../../../services/api';

interface UploadedFileInfo {
  id: string;
  originalName: string;
  size: number;
  publicUrl: string;
}

interface FileUploaderProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  fileCategory: string;
  value?: string | string[];
  onChange: (fileIds: string | string[] | undefined) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  helperText?: string;
}

export default function FileUploader({
  label,
  accept = 'image/*,application/pdf,.doc,.docx',
  multiple = false,
  fileCategory,
  value: _value,
  onChange,
  maxFiles = 5,
  maxSize = 10,
  helperText,
}: FileUploaderProps) {
  // Note: _value could be used to load previously uploaded files on mount
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFileInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFiles = async (fileList: FileList) => {
    setError(null);
    const filesToUpload = Array.from(fileList);

    // Validate file count
    if (multiple && files.length + filesToUpload.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = filesToUpload.filter(
      (f) => f.size > maxSize * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError(`Files must be smaller than ${maxSize}MB`);
      return;
    }

    setUploading(true);

    try {
      const uploadedFiles: UploadedFileInfo[] = [];

      for (const file of filesToUpload) {
        const result = await uploadApi.uploadFile(file, fileCategory);
        // API returns { success, data: { id, ... }, timestamp }, extract data
        const fileData = result.data || result;
        uploadedFiles.push(fileData);
      }

      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);

      if (multiple) {
        onChange(newFiles.map((f) => f.id));
      } else {
        onChange(uploadedFiles[0]?.id);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload file. Please try again.';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [files, multiple, maxFiles, maxSize, fileCategory]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = async (fileId: string) => {
    try {
      await uploadApi.deleteFile(fileId);
      const newFiles = files.filter((f) => f.id !== fileId);
      setFiles(newFiles);

      if (multiple) {
        onChange(newFiles.length > 0 ? newFiles.map((f) => f.id) : undefined);
      } else {
        onChange(undefined);
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <span className="font-medium text-blue-600">Click to upload</span> or
                drag and drop
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {helperText || `Max ${maxSize}MB per file`}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Uploaded files list */}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <DocumentIcon className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
