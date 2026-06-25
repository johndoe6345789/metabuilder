'use client';

/**
 * Client-side i18n + locale state for the admin dashboard.
 *
 * The dashboard is not under the `[locale]` route segment, so we feed
 * NextIntlClientProvider a locale chosen at runtime (persisted in
 * localStorage via useLocale). All six catalogs are bundled — a dashboard is
 * small and this avoids a loading flash when switching language.
 */

import { NextIntlClientProvider } from 'next-intl';
import { createContext } from 'react';
import type { ReactNode } from 'react';
import { useLocale, type LocaleCode } from '@/hooks/useLocale';
import en from '@/locales/admin/en.json';
import es from '@/locales/admin/es.json';
import fr from '@/locales/admin/fr.json';
import de from '@/locales/admin/de.json';
import ja from '@/locales/admin/ja.json';
import zh from '@/locales/admin/zh.json';

const MESSAGES: Record<LocaleCode, Record<string, unknown>> = {
  en, es, fr, de, ja, zh,
};

export type AdminLocaleContextValue = {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
};

export const AdminLocaleContext =
  createContext<AdminLocaleContextValue | null>(null);

export default function AdminI18nProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { locale, setLocale } = useLocale();

  return (
    <AdminLocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={MESSAGES[locale]}
        timeZone="UTC"
      >
        {children}
      </NextIntlClientProvider>
    </AdminLocaleContext.Provider>
  );
}
