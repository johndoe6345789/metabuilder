'use client';

import { Box, Drawer, Toolbar } from '@metabuilder/components/m3';
import type { ReactNode } from 'react';
import { useDrawer } from '@/hooks';
import styles from './dashboard-shell.module.scss';
import AdminDrawerContent, { type AdminNavItem } from './AdminDrawerContent';
import DashboardAppBar from './DashboardAppBar';

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
  navItems, selectedIndex, onNavigate, onLogout, mobileOpen,
  onMobileOpen, onMobileClose, children, version,
}: Props) {
  const { desktopOpen, toggleDesktop } = useDrawer();

  const handleMenuClick = () => {
    // Desktop: collapse/expand the permanent drawer; mobile: toggle it.
    if (typeof window !== 'undefined' && window.innerWidth >= 900) {
      toggleDesktop();
    } else if (mobileOpen) {
      onMobileClose();
    } else {
      onMobileOpen();
    }
  };

  const drawer = (
    <>
      <Toolbar />
      <AdminDrawerContent
        navItems={navItems}
        selectedIndex={selectedIndex}
        onNavigate={id => { onNavigate(id); onMobileClose(); }}
        version={version}
      />
    </>
  );

  return (
    <Box className={styles.root}>
      <DashboardAppBar onMenuClick={handleMenuClick} onLogout={onLogout} />
      <Drawer
        variant="permanent"
        open
        className={`${styles.drawer} ${styles.desktopDrawer} ${
          desktopOpen ? '' : styles.drawerCollapsed
        }`}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        className={`${styles.drawer} ${styles.mobileDrawer}`}
      >
        {drawer}
      </Drawer>
      <Box component="main" className={styles.main}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
