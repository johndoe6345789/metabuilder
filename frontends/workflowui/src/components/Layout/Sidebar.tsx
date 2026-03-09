/**
 * Sidebar Component - Navigation drawer
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@metabuilder/fakemui';
import { testId } from '../../utils/accessibility';
import styles from '@/../../../scss/atoms/layout.module.scss';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  testId: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const WorkflowIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z"/></svg>;
const RecentIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>;
const StarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
const TemplatesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>;
const PluginsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>;
const NotificationsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16z"/></svg>;
const HelpIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>;
const DocsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>;

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { href: '/', label: 'Dashboard', testId: 'dashboard', icon: <HomeIcon /> },
      { href: '/notifications', label: 'Notifications', testId: 'notifications', icon: <NotificationsIcon />, badge: 2 },
    ],
  },
  {
    title: 'Workflows',
    items: [
      { href: '/workflows', label: 'All Workflows', testId: 'all-workflows', icon: <WorkflowIcon /> },
      { href: '/workflows/recent', label: 'Recent', testId: 'recent', icon: <RecentIcon /> },
      { href: '/workflows/favorites', label: 'Favorites', testId: 'favorites', icon: <StarIcon /> },
      { href: '/templates', label: 'Templates', testId: 'templates', icon: <TemplatesIcon /> },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/plugins', label: 'Plugins', testId: 'plugins', icon: <PluginsIcon /> },
      { href: '/settings', label: 'Settings', testId: 'settings', icon: <SettingsIcon /> },
    ],
  },
  {
    title: 'Help',
    items: [
      { href: '/docs', label: 'Documentation', testId: 'docs', icon: <DocsIcon /> },
      { href: '/help', label: 'Help & Support', testId: 'help', icon: <HelpIcon /> },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, onClose }) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      <nav className={styles.sidebarContent}>
        {navSections.map((section, idx) => (
          <div key={section.title} className={styles.navSection}>
            <h3 className={styles.navSectionTitle}>{section.title}</h3>
            <ul className={styles.navList} aria-label={`${section.title} navigation`}>
              {section.items.map((item) => (
                <li key={item.href} className={styles.navItem}>
                  <Link
                    href={item.href as any}
                    className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                    data-testid={testId.navLink(item.testId)}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className={styles.navBadge}>{item.badge}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Button variant="contained" size="small" fullWidth data-testid={testId.button('new-workflow')}>
          + New Workflow
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && <div className={styles.drawerBackdrop} onClick={onClose} aria-hidden="true" />}
        <aside
          className={`${styles.drawerMobile} ${styles.sidebar} ${isOpen ? styles.drawerMobileOpen : ''}`}
          data-testid={testId.navSidebar()}
          aria-label="Workflows sidebar"
          aria-hidden={!isOpen}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={`${styles.sidebar} ${!isOpen ? styles.sidebarHidden : ''}`}
      data-testid={testId.navSidebar()}
      aria-label="Workflows sidebar"
    >
      {sidebarContent}
    </aside>
  );
};
