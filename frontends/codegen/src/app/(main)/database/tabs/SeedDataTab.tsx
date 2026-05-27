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
import { useSeedDataTab } from '../hooks/useSeedDataTab'

export function SeedDataTab() {
  const {
    force,
    setForce,
    loading,
    dbalConnected,
    seedResult,
    handleSeed,
  } = useSeedDataTab()

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    }}>
      <Card>
        <CardHeader title="Load Seed Data" />
        <CardContent>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Load YAML seed data into the database.
              Seeds include users, workspaces, workflows,
              products, games, artists, videos, forum
              data, and more.
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={force}
                  onChange={(e: any) =>
                    setForce(Boolean(e.target.checked))
                  }
                />
              }
              label={
                'Force re-insert (ignore skipIfExists)'
              }
            />
            {!dbalConnected && (
              <Alert severity="warning">
                DBAL daemon is not connected. Start the
                daemon first.
              </Alert>
            )}
          </Box>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            onClick={handleSeed}
            disabled={loading || !dbalConnected}
          >
            {loading ? 'Seeding...' : 'Load Seeds'}
          </Button>
        </CardActions>
      </Card>

      {seedResult && (
        <Card>
          <CardHeader title="Seed Results" />
          <CardContent>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  label={
                    `Inserted: ${seedResult.totalInserted}`
                  }
                  color="success"
                  size="small"
                />
                <Chip
                  label={
                    `Skipped: ${seedResult.totalSkipped}`
                  }
                  color="default"
                  size="small"
                />
                {seedResult.totalFailed > 0 && (
                  <Chip
                    label={
                      `Failed: ${seedResult.totalFailed}`
                    }
                    color="error"
                    size="small"
                  />
                )}
              </Box>
              <Divider />
              {seedResult.results.map((r) => (
                <Box
                  key={r.entity}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 160 }}
                  >
                    {r.entity}
                  </Typography>
                  <Chip
                    label={`+${r.inserted}`}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                  {r.skipped > 0 && (
                    <Chip
                      label={`~${r.skipped}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {r.failed > 0 && (
                    <Chip
                      label={`!${r.failed}`}
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              ))}
              {seedResult.errors.length > 0 && (
                <Alert severity="error">
                  {seedResult.errors.join('; ')}
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
