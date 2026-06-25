/**
 * SidebarNavItem - Single nav link item in the sidebar
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { testId } from '../../utils/accessibility';
import styles from '@/../../../scss/atoms/layout.module.scss';

interface SidebarNavItemProps {
  href: string;
  label: string;
  itemTestId: string;
  icon: React.ReactNode;
  badge?: number;
  isActive: boolean;
}

export default function SidebarNavItem({
  href,
  label,
  itemTestId,
  icon,
  badge,
  isActive,
}: SidebarNavItemProps) {
  return (
    <li className={styles.navItem}>
      <Link
        href={href as any}
        className={`${styles.navLink} ${
          isActive ? styles.navLinkActive : ''
        }`}
        data-testid={testId.navLink(itemTestId)}
      >
        <span className={styles.navIcon}>{icon}</span>
        <span className={styles.navLabel}>{label}</span>
        {badge && badge > 0 && (
          <span className={styles.navBadge}>{badge}</span>
        )}
      </Link>
    </li>
  );
}
