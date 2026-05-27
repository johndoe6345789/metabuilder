import { useState } from 'react';

export function useErrorFallback() {
  const [isStackOpen, setIsStackOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (errorDetails: string) => {
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return { isStackOpen, setIsStackOpen, copied, handleCopy };
}
