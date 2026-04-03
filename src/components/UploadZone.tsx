'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useEditor } from '@/lib/editor-context';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { FileData } from '@/types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      resolve({ width: 0, height: 0 });
      return;
    }
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error('Nu s-au putut citi dimensiunile imaginii.'));
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function UploadZone() {
  const { fileData, setFileData } = useEditor();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const errorCode = rejection.errors[0]?.code;
        if (errorCode === 'file-too-large') {
          setError(`Fișierul este prea mare. Dimensiunea maximă este 50MB.`);
        } else if (errorCode === 'file-invalid-type') {
          setError(`Format neacceptat. Încarcă un fișier JPG, PNG sau PDF.`);
        } else {
          setError(`Fișierul nu a putut fi încărcat. Verifică formatul.`);
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      try {
        const { width, height } = await getImageDimensions(file);
        const previewUrl =
          file.type === 'application/pdf'
            ? ''
            : URL.createObjectURL(file);

        const data: FileData = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          width,
          height,
          previewUrl,
        };

        setFileData(data);
      } catch {
        setError('Nu s-a putut procesa fișierul. Încearcă din nou.');
      }
    },
    [setFileData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const removeFile = useCallback(() => {
    if (fileData?.previewUrl) {
      URL.revokeObjectURL(fileData.previewUrl);
    }
    setFileData(null);
    setError(null);
  }, [fileData, setFileData]);

  if (fileData) {
    return (
      <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
        <div className="flex items-start gap-4">
          {fileData.previewUrl && (
            <img
              src={fileData.previewUrl}
              alt="Preview"
              className="w-24 h-24 object-contain rounded-lg border border-gray-100 bg-gray-50"
            />
          )}
          {fileData.type === 'application/pdf' && (
            <div className="w-24 h-24 rounded-lg border border-gray-100 bg-red-50 flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">PDF</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{fileData.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatFileSize(fileData.size)}
              {fileData.width > 0 && (
                <span> &middot; {fileData.width} × {fileData.height} px</span>
              )}
            </p>
          </div>
          <button
            onClick={removeFile}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Șterge fișierul"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <svg
          className="mx-auto w-12 h-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Lasă fișierul aici...</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium">
              Trage fișierul aici sau click pentru a selecta
            </p>
            <p className="text-sm text-gray-500 mt-2">JPG, PNG sau PDF &middot; max. 50MB</p>
          </>
        )}
      </div>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
