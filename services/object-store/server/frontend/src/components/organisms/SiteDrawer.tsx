'use client';

import {
  Drawer, Box, Typography,
  Divider, IconButton, Close, Cloud,
} from '@shared/m3';
import DrawerNavLinks from './DrawerNavLinks';
import DrawerSiteLinks from './DrawerSiteLinks';
import DrawerLogout from './DrawerLogout';

/** @brief Props for SiteDrawer component. */
interface SiteDrawerProps {
  /** Whether the drawer is open. */
  open: boolean;
  /** Callback to close the drawer. */
  onClose: () => void;
  /** Callback to log out. */
  onLogout: () => void;
}

/**
 * @brief Sidebar drawer with nav and site links.
 */
export default function SiteDrawer(
  { open, onClose, onLogout }: SiteDrawerProps,
) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      data-testid="site-drawer"
      aria-label="Site navigation drawer"
    >
      <Box
        style={{ width: 280 }}
        role="presentation"
      >
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
        }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
          }}>
            <Cloud
              style={{ marginRight: 8 }}
            />
            <Typography
              variant="h6"
              style={{ fontWeight: 700 }}
            >
              NextExtra
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close drawer"
          >
            <Close />
          </IconButton>
        </Box>
        <Divider />
        <DrawerNavLinks onClose={onClose} />
        <Divider />
        <DrawerSiteLinks />
        <Divider />
        <DrawerLogout
          onLogout={onLogout}
          onClose={onClose}
        />
      </Box>
    </Drawer>
  );
}
