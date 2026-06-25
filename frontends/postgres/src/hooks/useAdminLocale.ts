/**
 * Read/update the dashboard locale from anywhere inside AdminI18nProvider.
 */

'use client';

import { useContext } from 'react';
import {
  AdminLocaleContext,
  type AdminLocaleContextValue,
} from '@/components/admin/AdminI18nProvider';

export function useAdminLocale(): AdminLocaleContextValue {
  const ctx = useContext(AdminLocaleContext);
  if (!ctx) {
    throw new Error('useAdminLocale must be used within AdminI18nProvider');
  }
  return ctx;
}
