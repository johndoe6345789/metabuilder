'use client';

import { IconButton } from '@metabuilder/components/m3';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/hooks';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
    <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-5a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 17a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM4.22 4.22a1 1 0 011.42 0l1.41 1.41A1 1 0 115.64 7.05L4.22 5.64a1 1 0 010-1.42zm12.71 12.71a1 1 0 011.42 0l1.41 1.41a1 1 0 01-1.42 1.42l-1.41-1.41a1 1 0 010-1.42zM2 12a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm17 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM4.22 19.78a1 1 0 010-1.42l1.41-1.41a1 1 0 011.42 1.42l-1.41 1.41a1 1 0 01-1.42 0zM16.93 7.05a1 1 0 010-1.42l1.41-1.41a1 1 0 011.42 1.42l-1.41 1.41a1 1 0 01-1.42 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

export default function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  const t = useTranslations('Admin');
  const isDark = mode === 'dark';

  return (
    <IconButton
      color="inherit"
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
