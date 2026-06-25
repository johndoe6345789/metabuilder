'use client';

import { useState } from 'react';

export function useTableManager() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDropDialog, setOpenDropDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return {
    openCreateDialog,
    setOpenCreateDialog,
    openDropDialog,
    setOpenDropDialog,
    searchQuery,
    setSearchQuery,
    handlers: {
      openCreateDialog: () => setOpenCreateDialog(true),
      openDropDialog: () => setOpenDropDialog(true),
    },
  };
}
