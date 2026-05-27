'use client';

import { useState } from 'react';

export function useTableManager() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDropDialog, setOpenDropDialog] = useState(false);

  return {
    openCreateDialog,
    setOpenCreateDialog,
    openDropDialog,
    setOpenDropDialog,
    handlers: {
      openCreateDialog: () => setOpenCreateDialog(true),
      openDropDialog: () => setOpenDropDialog(true),
    },
  };
}
