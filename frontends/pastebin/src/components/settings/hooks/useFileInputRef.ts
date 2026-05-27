import { useRef } from 'react';

export function useFileInputRef() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerClick = () => fileInputRef.current?.click();
  return { fileInputRef, triggerClick };
}
