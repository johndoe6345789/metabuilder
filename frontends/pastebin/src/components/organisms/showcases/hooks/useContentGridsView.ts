import { useState } from 'react';

export function useContentGridsView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  return { viewMode, setViewMode };
}
