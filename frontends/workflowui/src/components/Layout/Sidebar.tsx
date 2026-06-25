/** Sidebar Component - Navigation drawer */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { testId } from '../../utils/accessibility';
import styles from '@/../../../scss/atoms/layout.module.scss';
import {
  HomeIcon, WorkflowIcon, RecentIcon, StarIcon,
  TemplatesIcon, PluginsIcon, SettingsIcon,
  NotificationsIcon, HelpIcon, DocsIcon,
} from './SidebarIcons';
import SidebarMobileDrawer from './SidebarMobileDrawer';
import SidebarContent from './SidebarContent';

const ICON_MAP: Record<string, React.ReactNode> = {
  HomeIcon: <HomeIcon />, WorkflowIcon: <WorkflowIcon />,
  RecentIcon: <RecentIcon />, StarIcon: <StarIcon />,
  TemplatesIcon: <TemplatesIcon />,
  PluginsIcon: <PluginsIcon />,
  SettingsIcon: <SettingsIcon />,
  NotificationsIcon: <NotificationsIcon />,
  HelpIcon: <HelpIcon />, DocsIcon: <DocsIcon />,
};

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen, isMobile, onClose,
}) => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname.startsWith(href);

  if (isMobile) {
    return (
      <SidebarMobileDrawer isOpen={isOpen} onClose={onClose}>
        <SidebarContent
          iconMap={ICON_MAP}
          isActive={isActive}
        />
      </SidebarMobileDrawer>
    );
  }

  return (
    <aside
      className={`${styles.sidebar} ${
        !isOpen ? styles.sidebarHidden : ''
      }`}
      data-testid={testId.navSidebar()}
      aria-label="Workflows sidebar"
    >
      <SidebarContent iconMap={ICON_MAP} isActive={isActive} />
    </aside>
  );
};
