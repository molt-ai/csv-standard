'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  disabled?: boolean;
}

export function FileDropzone({ onFileAccepted, disabled }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    disabled,
  });

  const file = acceptedFiles[0];

  return (
    <div
      {...getRootProps()}
      className={`
        border border-dashed rounded-lg p-12 text-center cursor-pointer
        ${isDragActive ? 'border-neutral-500 bg-neutral-800/50' : 'border-neutral-700 hover:border-neutral-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />

      {file ? (
        <div className="flex flex-col items-center">
          <File className="w-8 h-8 text-neutral-400 mb-3" />
          <p className="text-white">{file.name}</p>
          <p className="text-sm text-neutral-500 mt-1">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Upload className="w-8 h-8 text-neutral-600 mb-3" />
          <p className="text-neutral-400">
            {isDragActive ? 'Drop here' : 'Drop CSV file or click to browse'}
          </p>
        </div>
      )}
    </div>
  );
}
