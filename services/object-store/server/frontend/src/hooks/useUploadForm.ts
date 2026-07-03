'use client';

import { useState, useRef } from 'react';

/** @brief Hook return for upload form state. */
export interface UseUploadFormReturn {
  key: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setKey: (k: string) => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handleUpload: () => void;
}

/**
 * @brief Stateful logic for the upload dialog.
 * @param prefix - Current key prefix.
 * @param onUpload - Called with key and file.
 * @param onClose - Called after a successful upload.
 */
export function useUploadForm(
  prefix: string,
  onUpload: (key: string, file: File) => void,
  onClose: () => void,
): UseUploadFormReturn {
  const [key, setKey] = useState('');
  const [file, setFile] =
    useState<File | null>(null);
  const inputRef =
    useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !key) setKey(prefix + f.name);
  };

  const handleUpload = () => {
    if (file && key) {
      onUpload(key, file);
      setKey('');
      setFile(null);
      onClose();
    }
  };

  return {
    key,
    file,
    inputRef,
    setKey,
    handleFileChange,
    handleUpload,
  };
}
