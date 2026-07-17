'use client';

import {
  List, ListItemButton, ListItemIcon,
  ListItemText, Dashboard, ViewList,
} from '@shared/m3';
import Link from 'next/link';
import labels from '@/constants/ui-labels.json';
import routes from '@/constants/routes.json';

/** @brief Props for DrawerNavLinks. */
interface DrawerNavLinksProps {
  /** Callback to close the drawer. */
  onClose: () => void;
}

/**
 * @brief Internal navigation links for drawer.
 */
export default function DrawerNavLinks(
  { onClose }: DrawerNavLinksProps,
) {
  return (
    <List>
      <Link
        href={routes.dashboard}
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <ListItemButton
          onClick={onClose}
          data-testid="drawer-nav-dashboard"
          aria-label={labels.nav.dashboard}
        >
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText
            primary={labels.nav.dashboard}
          />
        </ListItemButton>
      </Link>
      <Link
        href={routes.buckets}
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <ListItemButton
          onClick={onClose}
          data-testid="drawer-nav-buckets"
          aria-label={labels.nav.buckets}
        >
          <ListItemIcon>
            <ViewList />
          </ListItemIcon>
          <ListItemText
            primary={labels.nav.buckets}
          />
        </ListItemButton>
      </Link>
    </List>
  );
}
