'use client';

import MenuIcon from '@metabuilder/components/m3/Menu';
import LogoutIcon from '@metabuilder/components/m3/Logout';
import {
  AppBar, Button, IconButton, Toolbar, Typography,
} from '@metabuilder/components/m3';
import { useTranslations } from 'next-intl';
import styles from './dashboard-shell.module.scss';
import ThemeToggle from './ThemeToggle';
import LocaleSwitcher from './LocaleSwitcher';

type Props = {
  onMenuClick: () => void;
  onLogout: () => void;
};

export default function DashboardAppBar({ onMenuClick, onLogout }: Props) {
  const t = useTranslations('Admin');
  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          onClick={onMenuClick}
          className={styles.menuButton}
          aria-label={t('openNav')}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6" noWrap component="div" className={styles.title}
        >
          {t('appTitle')}
        </Typography>
        <LocaleSwitcher />
        <ThemeToggle />
        <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>
          {t('logout')}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
