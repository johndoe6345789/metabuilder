'use client';

import {
  AppBar, Toolbar, Typography,
  Button, Box, Cloud,
  AppHeaderActions,
} from '@shared/m3';
import { useS3Auth } from '@/hooks';
import labels from '@/constants/ui-labels.json';
import routes from '@/constants/routes.json';

/**
 * @brief Top navigation bar with shared
 * cross-app actions (burger, bell, theme,
 * user) plus tool-specific links.
 */
export default function AppNavbar() {
  const { logout } = useS3Auth();

  return (
    <AppBar
      position="sticky"
      data-testid="app-navbar"
      aria-label="Main navigation"
    >
      <Toolbar>
        <AppHeaderActions
          activePath="/s3"
          onLogout={logout}
        />
        <Cloud
          style={{ margin: '0 8px 0 8px' }}
        />
        <Typography
          variant="h6"
          style={{ marginRight: 32 }}
        >
          {labels.app.title}
        </Typography>
        <Button
          color="inherit"
          href={routes.dashboard}
          size="small"
        >
          {labels.nav.dashboard}
        </Button>
        <Button
          color="inherit"
          href={routes.buckets}
          size="small"
        >
          {labels.nav.buckets}
        </Button>
        <Box style={{ flexGrow: 1 }} />
      </Toolbar>
    </AppBar>
  );
}
