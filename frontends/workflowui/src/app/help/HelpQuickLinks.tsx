/**
 * HelpQuickLinks - Quick link cards section
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Link,
  Grid,
} from '@metabuilder/fakemui';
import {
  CodeIcon,
  PlayIcon,
  AccountTreeIcon,
  HelpIcon,
} from '@/../../../icons/react';
import quickLinksData from './quick-links.json';

const ICON_MAP: Record<string, React.ReactNode> = {
  CodeIcon: <CodeIcon />,
  PlayIcon: <PlayIcon />,
  AccountTreeIcon: <AccountTreeIcon />,
  HelpIcon: <HelpIcon />,
};

export default function HelpQuickLinks() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Quick Links
      </Typography>
      <Grid container spacing={2}>
        {quickLinksData.map((link) => (
          <Grid item xs={12} sm={6} md={3} key={link.title}>
            <Card
              data-testid={`quick-link-${link.title
                .toLowerCase()
                .replace(/\s+/g, '-')}`}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{ color: 'var(--mat-sys-primary)', mb: 1 }}
                >
                  {ICON_MAP[link.icon]}
                </Box>
                <Link href={link.href} underline="none">
                  <Typography variant="subtitle1">
                    {link.title}
                  </Typography>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
