'use client';

import {
  List, ListItemButton,
  ListItemIcon, ListItemText, Logout,
} from '@shared/m3';
import labels from '@/constants/ui-labels.json';

/** @brief Props for DrawerLogout. */
interface DrawerLogoutProps {
  /** Callback to log out. */
  onLogout: () => void;
  /** Callback to close the drawer. */
  onClose: () => void;
}

/**
 * @brief Logout button at bottom of the drawer.
 */
export default function DrawerLogout(
  { onLogout, onClose }: DrawerLogoutProps,
) {
  const handleClick = () => {
    onClose();
    onLogout();
  };

  return (
    <List>
      <ListItemButton
        onClick={handleClick}
        data-testid="drawer-logout"
        aria-label={labels.nav.logout}
      >
        <ListItemIcon>
          <Logout />
        </ListItemIcon>
        <ListItemText
          primary={labels.nav.logout}
        />
      </ListItemButton>
    </List>
  );
}
