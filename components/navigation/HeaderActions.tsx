/**
 * Header Actions - FakeMUI Component
 * Action buttons for app header (notifications, theme toggle, user menu)
 */

import React from 'react';
import { IconButton, Avatar, Menu, MenuItem, Divider, Box } from '../fakemui';
import styles from '../../scss/components/navigation/header-actions.module.scss';

export interface HeaderActionsProps {
  /** Current theme ('light' | 'dark') */
  theme?: 'light' | 'dark';
  /** Theme toggle handler */
  onToggleTheme?: () => void;
  /** User information */
  user?: {
    name: string;
    email: string;
  };
  /** User menu open state */
  showUserMenu?: boolean;
  /** User menu toggle handler */
  onToggleUserMenu?: () => void;
  /** Logout handler */
  onLogout?: () => void;
  /** Notification menu component */
  notificationMenu?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  [key: string]: any;
}

/**
 * HeaderActions
 *
 * Renders action buttons for the app header including theme toggle,
 * notifications, and user menu.
 *
 * @example
 * ```tsx
 * <HeaderActions
 *   theme="light"
 *   onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
 *   user={{ name: 'John Doe', email: 'john@example.com' }}
 *   showUserMenu={menuOpen}
 *   onToggleUserMenu={() => setMenuOpen(!menuOpen)}
 *   onLogout={handleLogout}
 *   notificationMenu={<NotificationMenu />}
 * />
 * ```
 */
export const HeaderActions: React.FC<HeaderActionsProps> = ({
  theme = 'light',
  onToggleTheme,
  user,
  showUserMenu = false,
  onToggleUserMenu,
  onLogout,
  notificationMenu,
  className,
  ...rest
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    onToggleUserMenu?.();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    if (showUserMenu) onToggleUserMenu?.();
  };

  const handleLogout = () => {
    onLogout?.();
    handleMenuClose();
  };

  return (
    <Box className={`${styles.headerActions} ${className || ''}`} {...rest} data-testid="header-actions">
      {/* Notification Menu */}
      {notificationMenu}

      {/* Theme Toggle */}
      {onToggleTheme && (
        <IconButton
          color="inherit"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          data-testid="toggle-theme-button"
        >
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zM13 4h-2V1h2v3zm0 19h-2v-3h2v3zM5 11H2v2h3v-2zm17 0h-3v2h3v-2zM6.3 5.3l-2.1-2.1-1.4 1.4 2.1 2.1L6.3 5.3zm15.3 15.3l-2.1-2.1-1.4 1.4 2.1 2.1 1.4-1.4zm-2.1-15.3l2.1-2.1-1.4-1.4-2.1 2.1 1.4 1.4zM4.9 20.6l2.1-2.1-1.4-1.4-2.1 2.1 1.4 1.4z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
          )}
        </IconButton>
      )}

      {/* User Menu */}
      {user && (
        <>
          <IconButton
            onClick={handleUserMenuClick}
            aria-label={`User menu for ${user.name}`}
            aria-expanded={showUserMenu}
            aria-haspopup="menu"
            data-testid="user-menu-button"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={showUserMenu && Boolean(anchorEl)}
            onClose={handleMenuClose}
            data-testid="user-menu"
          >
            <Box className={styles.userInfo}>
              <Box className={styles.userName}>{user.name}</Box>
              <Box className={styles.userEmail}>{user.email}</Box>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout} data-testid="logout-button">
              Logout
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};
