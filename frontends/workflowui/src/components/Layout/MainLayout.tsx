/**
 * Main Layout Component
 * Root layout with header, sidebar, and main content area
 */

'use client';

import React from 'react';
import { useUI, useResponsiveSidebar } from '../../hooks';
import { testId } from '../../utils/accessibility';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from '@/../../../scss/atoms/layout.module.scss';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, showSidebar = true }) => {
  const { theme, sidebarOpen, setSidebar } = useUI();
  const { isMobile } = useResponsiveSidebar(sidebarOpen, setSidebar);

  return (
    <div className={styles.layout} data-theme={theme} data-testid={testId.button('main-layout')}>
      <Header onMenuClick={() => setSidebar(!sidebarOpen)} />

      <div className={styles.content}>
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} isMobile={isMobile} onClose={() => setSidebar(false)} />
        )}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
