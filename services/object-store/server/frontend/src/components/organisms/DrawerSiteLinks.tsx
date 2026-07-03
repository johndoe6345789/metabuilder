'use client';

import {
  List, ListItemButton, ListItemIcon,
  ListItemText, Typography, Box,
  OpenInNew, Home, Email,
  Storage, Archive, CloudQueue,
} from '@shared/m3';
import siteLinks from '@/constants/site-links.json';

/** @brief Icon name to component mapping. */
const iconMap: Record<
  string, React.ReactElement
> = {
  Home: <Home />,
  Email: <Email />,
  Storage: <Storage />,
  Inventory: <Archive />,
  CloudQueue: <CloudQueue />,
};

/** @brief Site link entry shape. */
interface SiteLink {
  label: string;
  url: string;
  icon: string;
  current?: boolean;
}

/**
 * @brief External site links in the drawer.
 */
export default function DrawerSiteLinks() {
  return (
    <Box>
      <Typography
        variant="overline"
        style={{
          padding: '12px 16px 0',
          display: 'block',
        }}
      >
        Sites
      </Typography>
      <List dense>
        {(siteLinks as SiteLink[]).map((link) => (
          <ListItemButton
            key={link.label}
            component="a"
            href={link.url}
            target={
              link.current
                ? undefined
                : '_blank'
            }
            rel={
              link.current
                ? undefined
                : 'noopener noreferrer'
            }
            selected={link.current ?? false}
            data-testid={
              `site-link-${link.icon}`
            }
            aria-label={link.label}
          >
            <ListItemIcon>
              {iconMap[link.icon] ?? <Home />}
            </ListItemIcon>
            <ListItemText
              primary={link.label}
            />
            {!link.current && (
              <OpenInNew />
            )}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
