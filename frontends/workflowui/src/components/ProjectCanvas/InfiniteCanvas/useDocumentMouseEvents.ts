/**
 * useDocumentMouseEvents - Binds mouse move/up on document
 */

import { useEffect } from 'react';

interface UseDocumentMouseEventsInput {
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: () => void;
  enabled: boolean;
}

export function useDocumentMouseEvents({
  onMouseMove,
  onMouseUp,
  enabled,
}: UseDocumentMouseEventsInput) {
  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener(
        'mousemove',
        onMouseMove
      );
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp, enabled]);
}
