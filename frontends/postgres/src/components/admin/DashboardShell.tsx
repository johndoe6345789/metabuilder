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
import styles from './dashboard-shell.module.scss';
import AdminDrawerContent, { type AdminNavItem } from './AdminDrawerContent';

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
            onClick={onMobileOpen}
            className={styles.hamburger}
            aria-label="Open navigation drawer"
          >
            <MenuIcon />
          </IconButton>
          <StorageIcon className={styles.barIcon} />
          <Typography variant="h6" noWrap component="div" className={styles.title}>
            Postgres Admin
          </Typography>
          <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open
        className={`${styles.drawer} ${styles.desktopDrawer}`}
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
