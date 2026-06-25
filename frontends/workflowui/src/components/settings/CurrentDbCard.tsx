/**
 * CurrentDbCard - Shows current database adapter and connection
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Chip,
} from '@metabuilder/m3';

interface DbConfig {
  adapter: string;
  status: string;
  database_url: string;
}

interface CurrentDbCardProps {
  config: DbConfig | null;
}

export default function CurrentDbCard({
  config,
}: CurrentDbCardProps) {
  return (
    <Card data-testid="current-db-card">
      <CardHeader title="Current Database" />
      <CardContent>
        {config ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography variant="subtitle1">Adapter:</Typography>
              <Chip
                label={config.adapter}
                color="primary"
                size="small"
              />
              <Chip
                label={config.status}
                color={
                  config.status === 'connected'
                    ? 'success'
                    : 'error'
                }
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle1">URL:</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {config.database_url}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Alert severity="warning">
            Could not connect to DBAL daemon. Make sure it is
            running on port 8080.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
