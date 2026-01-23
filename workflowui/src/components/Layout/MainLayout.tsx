/**
 * Main Layout Component
 * Root layout with header, sidebar, and main content area
 */

import React, { useState, useEffect } from 'react';
import { useUI } from '@hooks';
import styles from './MainLayout.module.scss';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, showSidebar = true }) => {
  const { theme, sidebarOpen, setSidebar } = useUI();
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, setSidebar]);

  return (
    <div
      className={styles.mainLayout}
      data-theme={theme}
    >
      <Header onMenuClick={() => setSidebar(!sidebarOpen)} />

      <div className={styles.container}>
        {showSidebar && sidebarOpen && (
          <Sidebar
            isOpen={sidebarOpen}
            isMobile={isMobile}
            onClose={() => setSidebar(false)}
          />
        )}

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { toggleTheme, theme } = useUI();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <button
            className={styles.menuButton}
            onClick={onMenuClick}
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
              <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
            </svg>
          </button>

          <h1 className={styles.logo}>WorkflowUI</h1>
        </div>

        <div className={styles.headerRight}>
          <button
            className={styles.themeButton}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
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
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, onClose }) => {
  return (
    <>
      {isMobile && isOpen && (
        <div
          className={styles.sidebarBackdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        role="navigation"
      >
        <div className={styles.sidebarHeader}>
          <h2>Workflows</h2>
        </div>

        <nav className={styles.sidebarNav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a href="/workflows" className={styles.navLink}>
                All Workflows
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="/workflows/recent" className={styles.navLink}>
                Recent
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="/workflows/favorites" className={styles.navLink}>
                Favorites
              </a>
            </li>
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className="btn btn-secondary btn-sm">New Workflow</button>
        </div>
      </aside>
    </>
  );
};

export default MainLayout;
