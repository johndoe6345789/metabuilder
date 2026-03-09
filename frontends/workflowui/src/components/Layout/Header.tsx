/**
 * Header Component - App bar with navigation and actions
 */

'use client';

import React from 'react';
import { IconButton, Box, Typography } from '@metabuilder/fakemui';
import { HeaderActions } from '@/../../../components/navigation';
import { useUI, useHeaderLogic } from '../../hooks';
import { testId } from '../../utils/accessibility';
import { MenuIcon, WorkflowLogo } from './HeaderIcons';
import { NotificationMenu } from './NotificationMenu';
import styles from '@/../../../scss/atoms/layout.module.scss';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { toggleTheme, theme } = useUI();
  const { user, isAuthenticated, showUserMenu, handleLogout, toggleUserMenu } = useHeaderLogic();

  return (
    <Box component="header" className={styles.appBar} data-testid={testId.navHeader()}>
      <Box className={styles.appBarLeft}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          data-testid={testId.navMenuButton('toggle-sidebar')}
        >
          <MenuIcon />
        </IconButton>
        <Box className={styles.appBarBrand}>
          <WorkflowLogo />
          <Typography variant="h6" component="h1" className={styles.appBarTitle}>
            WorkflowUI
          </Typography>
        </Box>
      </Box>

      <HeaderActions
        theme={theme}
        onToggleTheme={toggleTheme}
        user={isAuthenticated && user ? user : undefined}
        showUserMenu={showUserMenu}
        onToggleUserMenu={toggleUserMenu}
        onLogout={handleLogout}
        notificationMenu={<NotificationMenu />}
      />
    </Box>
  );
};
