'use client';

import MenuIcon from '@metabuilder/components/m3/Menu';
import LogoutIcon from '@metabuilder/components/m3/Logout';
import StorageIcon from '@metabuilder/components/m3/Storage';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from '@metabuilder/components/m3';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useDrawer } from '@/hooks';
import styles from './dashboard-shell.module.scss';
import AdminDrawerContent, { type AdminNavItem } from './AdminDrawerContent';
import ThemeToggle from './ThemeToggle';
import LocaleSwitcher from './LocaleSwitcher';

type Props = {
  navItems: AdminNavItem[];
  selectedIndex: number;
  onNavigate: (id: string) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
  children: ReactNode;
  version: string;
};

export default function DashboardShell({
  navItems,
  selectedIndex,
  onNavigate,
  onLogout,
  mobileOpen,
  onMobileOpen,
  onMobileClose,
  children,
  version,
}: Props) {
  const t = useTranslations('Admin');
  const { desktopOpen, toggleDesktop } = useDrawer();

  const handleMenuClick = () => {
    // Wide screens: collapse/expand the permanent drawer.
    // Narrow screens: toggle the temporary drawer open/closed.
    if (typeof window !== 'undefined' && window.innerWidth >= 900) {
      toggleDesktop();
    } else if (mobileOpen) {
      onMobileClose();
    } else {
      onMobileOpen();
    }
  };

  const drawerContent = (
    <>
      <Toolbar />
      <AdminDrawerContent
        navItems={navItems}
        selectedIndex={selectedIndex}
        onNavigate={id => {
          onNavigate(id);
          onMobileClose();
        }}
        version={version}
      />
    </>
  );

  return (
    <Box className={styles.root}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={handleMenuClick}
            className={styles.menuButton}
            aria-label={t('openNav')}
          >
            <MenuIcon />
          </IconButton>
          <StorageIcon className={styles.barIcon} />
          <Typography variant="h6" noWrap component="div" className={styles.title}>
            {t('appTitle')}
          </Typography>
          <LocaleSwitcher />
          <ThemeToggle />
          <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>
            {t('logout')}
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open
        className={`${styles.drawer} ${styles.desktopDrawer} ${
          desktopOpen ? '' : styles.drawerCollapsed
        }`}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        className={`${styles.drawer} ${styles.mobileDrawer}`}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        className={styles.main}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
