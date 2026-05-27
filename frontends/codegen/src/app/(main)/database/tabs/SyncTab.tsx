'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Alert,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
} from '@metabuilder/fakemui'
import { useSyncTab } from '../hooks/useSyncTab'

export function SyncTab() {
  const {
    status,
    lastSyncedAt,
    dbalConnected,
    error,
    autoSyncEnabled,
    pushing,
    pulling,
    handleToggleAutoSync,
    handlePush,
    handlePull,
  } = useSyncTab()

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    }}>
      <Card>
        <CardHeader title="Sync Status" />
        <CardContent>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Chip
                label={
                  dbalConnected
                    ? 'DBAL Connected'
                    : 'DBAL Disconnected'
                }
                color={
                  dbalConnected ? 'success' : 'error'
                }
                size="small"
              />
              {status === 'syncing' && (
                <Chip
                  label="Syncing..."
                  color="primary"
                  size="small"
                />
              )}
            </Box>
            {lastSyncedAt && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Last synced:{' '}
                {new Date(lastSyncedAt).toLocaleString()}
              </Typography>
            )}
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            <Divider />
            <FormControlLabel
              control={
                <Switch
                  checked={autoSyncEnabled}
                  onChange={(e: any) =>
                    handleToggleAutoSync(
                      Boolean(e.target.checked)
                    )
                  }
                />
              }
              label={
                'Auto-sync on changes ' +
                '(push Redux state to DBAL periodically)'
              }
            />
          </Box>
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            onClick={handlePush}
            disabled={pushing || !dbalConnected}
          >
            {pushing ? 'Pushing...' : 'Push to DBAL'}
          </Button>
          <Button
            variant="outlined"
            onClick={handlePull}
            disabled={pulling || !dbalConnected}
          >
            {pulling
              ? 'Pulling...'
              : 'Pull from DBAL'}
          </Button>
        </CardActions>
      </Card>

      <Card>
        <CardHeader title="About Sync" />
        <CardContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            CodeForge stores data locally in IndexedDB
            via Redux-persist. The DBAL daemon provides
            server-side persistence with support for
            SQLite, PostgreSQL, MySQL, and MongoDB. Use
            Push to send local data to the DBAL daemon,
            or Pull to load data from the daemon into
            your local store.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
