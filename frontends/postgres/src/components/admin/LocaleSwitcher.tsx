'use client';

import { Select, MenuItem } from '@metabuilder/components/m3';
import { useTranslations } from 'next-intl';
import {
  useAdminLocale, LOCALES, LOCALE_LABELS, type LocaleCode,
} from '@/hooks';
import styles from './locale-switcher.module.scss';

export default function LocaleSwitcher() {
  const { locale, setLocale } = useAdminLocale();
  const t = useTranslations('Admin');

  return (
    <Select
      value={locale}
      size="small"
      aria-label={t('language')}
      className={styles.switcher}
      onChange={e => setLocale(e.target.value as LocaleCode)}
    >
      {LOCALES.map(code => (
        <MenuItem key={code} value={code}>
          {LOCALE_LABELS[code]}
        </MenuItem>
      ))}
    </Select>
  );
}
