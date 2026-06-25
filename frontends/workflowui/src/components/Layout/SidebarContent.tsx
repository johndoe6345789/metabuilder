/** SidebarContent - Nav sections and footer button */

'use client';

import React from 'react';
import { Button } from '@metabuilder/m3';
import { testId } from '../../utils/accessibility';
import styles from '@/../../../scss/atoms/layout.module.scss';
import SidebarNavItem from './SidebarNavItem';
import NAV from './sidebar-nav.json';

interface SidebarContentProps {
  iconMap: Record<string, React.ReactNode>;
  isActive: (href: string) => boolean;
}

export default function SidebarContent({
  iconMap,
  isActive,
}: SidebarContentProps) {
  return (
    <>
      <nav className={styles.sidebarContent}>
        {NAV.sections.map((section) => (
          <div key={section.title}
            className={styles.navSection}>
            <h3 className={styles.navSectionTitle}>
              {section.title}
            </h3>
            <ul
              className={styles.navList}
              aria-label={`${section.title} navigation`}
            >
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  itemTestId={item.testId}
                  icon={iconMap[item.icon]}
                  badge={
                    'badge' in item
                      ? item.badge : undefined
                  }
                  isActive={isActive(item.href)}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className={styles.sidebarFooter}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          data-testid={testId.button('new-workflow')}
        >
          + New Workflow
        </Button>
      </div>
    </>
  );
}
