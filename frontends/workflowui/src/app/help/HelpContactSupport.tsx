/**
 * HelpContactSupport - Contact support card at the bottom of help page
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
} from '@metabuilder/fakemui';

export default function HelpContactSupport() {
  return (
    <Card data-testid="contact-support-card">
      <CardHeader title="Still Need Help?" />
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
        >
          Can&apos;t find what you&apos;re looking for? Our support
          team is here to help.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            data-testid="contact-support-btn"
          >
            Contact Support
          </Button>
          <Button
            variant="outlined"
            data-testid="community-forum-btn"
          >
            Join Community Forum
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
