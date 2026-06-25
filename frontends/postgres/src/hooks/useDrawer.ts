/**
 * Drawer open/close state for the dashboard shell.
 *
 * `desktopOpen` collapses/expands the permanent drawer on wide screens; the
 * menu button in the app bar toggles it. Mobile (temporary) open state is
 * handled separately by the page so navigation can auto-close it.
 */

'use client';

import { useCallback, useState } from 'react';

export function useDrawer() {
  const [desktopOpen, setDesktopOpen] = useState(true);

  const toggleDesktop = useCallback(() => {
    setDesktopOpen(open => !open);
  }, []);

  return { desktopOpen, toggleDesktop };
}
