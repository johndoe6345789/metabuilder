/**
 * SidebarMobileDrawer - Mobile variant of the sidebar with backdrop
 */

'use client';

import React from 'react';
import styles from '@/../../../scss/atoms/layout.module.scss';
import { testId } from '../../utils/accessibility';

interface SidebarMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SidebarMobileDrawer({
  isOpen,
  onClose,
  children,
}: SidebarMobileDrawerProps) {
  return (
    <>
      {isOpen && (
        <div
          className={styles.drawerBackdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`${styles.drawerMobile} ${styles.sidebar} ${
          isOpen ? styles.drawerMobileOpen : ''
        }`}
        data-testid={testId.navSidebar()}
        aria-label="Workflows sidebar"
        aria-hidden={!isOpen}
      >
        {children}
      </aside>
    </>
  );
}
