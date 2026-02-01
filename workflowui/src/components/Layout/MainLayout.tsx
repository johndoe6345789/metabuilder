/**
 * Main Layout Component
 * Root layout with header, sidebar, and main content area
 */

'use client';

import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  Button,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Backdrop,
} from '@metabuilder/fakemui';
import { useUI, useHeaderLogic, useResponsiveSidebar } from '../../hooks';
import { testId } from '../../utils/accessibility';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, showSidebar = true }) => {
  const { theme, sidebarOpen, setSidebar } = useUI();
  const { isMobile } = useResponsiveSidebar(sidebarOpen, setSidebar);

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-theme={theme}
      data-testid={testId.button('main-layout')}
    >
      <Header onMenuClick={() => setSidebar(!sidebarOpen)} />

      <Box sx={{ display: 'flex', flex: 1 }}>
        {showSidebar && (
          <Sidebar
            isOpen={sidebarOpen}
            isMobile={isMobile}
            onClose={() => setSidebar(false)}
          />
        )}

        <Box component="main" sx={{ flex: 1, p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
};

interface HeaderProps {
  onMenuClick: () => void;
}

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
    <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
    <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
  </svg>
);

const LightModeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" />
    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const DarkModeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { toggleTheme, theme } = useUI();
  const { user, isAuthenticated, showUserMenu, handleLogout, toggleUserMenu } = useHeaderLogic();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    toggleUserMenu();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    if (showUserMenu) toggleUserMenu();
  };

  return (
    <AppBar position="static" data-testid={testId.navHeader()}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
            data-testid={testId.navMenuButton('toggle-sidebar')}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="h1" id="app-title">
            WorkflowUI
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            data-testid={testId.button('toggle-theme')}
          >
            {theme === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {isAuthenticated && user && (
            <>
              <IconButton
                onClick={handleUserMenuClick}
                aria-label={`User menu for ${user.name}`}
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
                data-testid={testId.navMenuButton('user-menu')}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={showUserMenu && Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => { handleLogout(); handleMenuClose(); }}
                  data-testid={testId.button('logout')}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 240;

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, onClose }) => {
  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Workflows</Typography>
      </Box>
      <Divider />
      <List component="nav" aria-label="Workflows navigation">
        <ListItem disablePadding>
          <ListItemButton href="/workflows" data-testid={testId.navLink('all-workflows')}>
            <ListItemText primary="All Workflows" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/workflows/recent" data-testid={testId.navLink('recent')}>
            <ListItemText primary="Recent" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/workflows/favorites" data-testid={testId.navLink('favorites')}>
            <ListItemText primary="Favorites" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          data-testid={testId.button('new-workflow')}
        >
          New Workflow
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Backdrop open={isOpen} onClick={onClose} />
          <Drawer
            variant="temporary"
            open={isOpen}
            onClose={onClose}
            data-testid={testId.navSidebar()}
            aria-label="Workflows sidebar"
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="persistent"
          open={isOpen}
          data-testid={testId.navSidebar()}
          aria-label="Workflows sidebar"
          sx={{
            width: isOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              position: 'relative',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default MainLayout;
