import { useEffect } from 'react';

export function useTemplatePickerClose(
  anchor: HTMLElement | null,
  onClose: () => void
) {
  useEffect(() => {
    if (!anchor) return;
    const handleResize = () => onClose();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [anchor, onClose]);
}
