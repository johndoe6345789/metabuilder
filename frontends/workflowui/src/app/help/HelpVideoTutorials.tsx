/**
 * HelpVideoTutorials - Video tutorials grid section
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@metabuilder/fakemui';
import { PlayIcon } from '@/../../../icons/react';

const TUTORIALS = [
  {
    id: 'tutorial-1',
    title: 'Creating Your First Workflow',
    desc: 'Learn the basics with our step-by-step guide.',
  },
  {
    id: 'tutorial-2',
    title: 'Advanced Node Techniques',
    desc: 'Master custom nodes, error handling, and debugging.',
  },
];

export default function HelpVideoTutorials() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Video Tutorials
      </Typography>
      <Grid container spacing={3}>
        {TUTORIALS.map((t) => (
          <Grid item xs={12} md={6} key={t.id}>
            <Card data-testid={`video-${t.id}`}>
              <CardContent>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    backgroundColor:
                      'var(--mat-sys-surface-variant)',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <PlayIcon size={48} />
                </Box>
                <Typography variant="subtitle1" gutterBottom>
                  {t.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {t.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
