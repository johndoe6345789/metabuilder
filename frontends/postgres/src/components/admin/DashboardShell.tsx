'use client';

import MenuIcon from '@metabuilder/components/fakemui/Menu';
import LogoutIcon from '@metabuilder/components/fakemui/Logout';
import StorageIcon from '@metabuilder/components/fakemui/Storage';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@metabuilder/components/fakemui';
import useTheme from '@metabuilder/components/fakemui/utils/useTheme';
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

const DRAWER_WIDTH = 240;

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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });

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
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMobileOpen}
            className={styles.hamburger}
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
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        className={styles.drawer}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
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
