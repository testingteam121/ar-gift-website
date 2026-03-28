'use client';

import { useCallback, useState } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Video, FileText, Check, AlertCircle } from 'lucide-react';

type FileType = 'image' | 'video' | 'any';

interface FileUploadProps {
  onFileSelect: (file: File, preview: string) => void;
  onFileRemove?: () => void;
  accept?: FileType;
  maxSizeMB?: number;
  label?: string;
  hint?: string;
  currentPreview?: string;
  currentFileName?: string;
  disabled?: boolean;
}

const acceptMap: Record<FileType, Accept> = {
  image: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
  video: { 'video/mp4': [], 'video/quicktime': [], 'video/webm': [] },
  any: { 'image/*': [], 'video/*': [] },
};

const acceptLabelMap: Record<FileType, string> = {
  image: 'JPG, PNG, WebP',
  video: 'MP4, MOV, WebM',
  any: 'Image or Video',
};

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = 'image',
  maxSizeMB = 10,
  label,
  hint,
  currentPreview,
  currentFileName,
  disabled = false,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string>(currentPreview || '');
  const [fileName, setFileName] = useState<string>(currentFileName || '');
  const [fileType, setFileType] = useState<'image' | 'video' | ''>('');
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<number>(100);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError('');

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`File is too large. Max size is ${maxSizeMB}MB.`);
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError(`Invalid file type. Accepted: ${acceptLabelMap[accept]}`);
        } else {
          setError('File could not be uploaded. Please try again.');
        }
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      setPreview(objectUrl);
      setFileName(file.name);
      setFileType(type);

      // Simulate upload progress animation
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 20;
        });
      }, 100);

      onFileSelect(file, objectUrl);
    },
    [accept, maxSizeMB, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptMap[accept],
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview('');
    setFileName('');
    setFileType('');
    setProgress(100);
    setError('');
    if (onFileRemove) onFileRemove();
  };

  const FileIcon = accept === 'video' ? Video : accept === 'image' ? ImageIcon : FileText;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {!preview ? (
        <div
          {...getRootProps()}
          className={[
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
            isDragActive ? 'border-[#F5A900] bg-[#FFFBEB] scale-[1.01]' : 'border-gray-200 hover:border-[#F5A900] hover:bg-gray-50',
            disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
          ].join(' ')}
        >
          <input {...getInputProps()} />
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
            isDragActive ? 'bg-[#FEF3C7]' : 'bg-gray-100'
          }`}>
            {isDragActive ? (
              <Upload className="w-7 h-7 text-[#F5A900]" />
            ) : (
              <FileIcon className="w-7 h-7 text-gray-400" />
            )}
          </div>
          <p className="font-medium text-gray-700 mb-1">
            {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-gray-400 text-sm">
            {acceptLabelMap[accept]} · Max {maxSizeMB}MB
          </p>
          {hint && <p className="text-gray-400 text-xs mt-2">{hint}</p>}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50"
        >
          {/* Preview */}
          {fileType === 'image' ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-56 object-contain bg-gray-100"
            />
          ) : fileType === 'video' ? (
            <video
              src={preview}
              controls
              className="w-full max-h-48"
            />
          ) : null}

          {/* File info bar */}
          <div className="flex items-center gap-3 p-3 bg-white border-t border-gray-100">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              fileType === 'image' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              {fileType === 'image'
                ? <ImageIcon className="w-4 h-4 text-blue-600" />
                : <Video className="w-4 h-4 text-purple-600" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
              {progress < 100 ? (
                <div className="mt-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#F5A900] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" /> Ready
                </p>
              )}
            </div>
            <button
              onClick={handleRemove}
              className="flex-shrink-0 w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-red-600 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
