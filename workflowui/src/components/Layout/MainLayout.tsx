/**
 * Main Layout Component
 * Root layout with header, sidebar, and main content area
 */

'use client';

import React from 'react';
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
    <div
      
      data-theme={theme}
      data-testid={testId.button('main-layout')}
    >
      <Header onMenuClick={() => setSidebar(!sidebarOpen)} />

      <div >
        {showSidebar && sidebarOpen && (
          <Sidebar
            isOpen={sidebarOpen}
            isMobile={isMobile}
            onClose={() => setSidebar(false)}
          />
        )}

        <main >{children}</main>
      </div>
    </div>
  );
};

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { toggleTheme, theme } = useUI();
  const { user, isAuthenticated, showUserMenu, handleLogout, toggleUserMenu } = useHeaderLogic();

  return (
    <header  data-testid={testId.navHeader()}>
      <div >
        <div >
          <button
            
            onClick={onMenuClick}
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
            data-testid={testId.navMenuButton('toggle-sidebar')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
              <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
            </svg>
          </button>

          <h1  id="app-title">WorkflowUI</h1>
        </div>

        <div >
          <button
            
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            data-testid={testId.button('toggle-theme')}
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

          {isAuthenticated && user && (
            <div >
              <button
                
                onClick={toggleUserMenu}
                title={user.name}
                aria-label={`User menu for ${user.name}`}
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
                data-testid={testId.navMenuButton('user-menu')}
              >
                <div >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {showUserMenu && (
                <div  role="menu">
                  <div >
                    <div >{user.name}</div>
                    <div >{user.email}</div>
                  </div>
                  <button
                    
                    onClick={handleLogout}
                    role="menuitem"
                    data-testid={testId.button('logout')}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
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
          
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        
        role="complementary"
        data-testid={testId.navSidebar()}
        aria-label="Workflows sidebar"
      >
        <div >
          <h2>Workflows</h2>
        </div>

        <nav  aria-label="Workflows navigation">
          <ul  role="list">
            <li  role="listitem">
              <a href="/workflows"  data-testid={testId.navLink('all-workflows')}>
                All Workflows
              </a>
            </li>
            <li  role="listitem">
              <a href="/workflows/recent"  data-testid={testId.navLink('recent')}>
                Recent
              </a>
            </li>
            <li  role="listitem">
              <a href="/workflows/favorites"  data-testid={testId.navLink('favorites')}>
                Favorites
              </a>
            </li>
          </ul>
        </nav>

        <div >
          <button className="btn btn-secondary btn-sm" data-testid={testId.button('new-workflow')}>
            New Workflow
          </button>
        </div>
      </aside>
    </>
  );
};

export default MainLayout;
