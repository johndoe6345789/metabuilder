'use client'

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
} from '@metabuilder/fakemui'
import { useStatusTab } from '../hooks/useStatusTab'

function redactUrl(url: string): string {
  return url.replace(/:([^@/]+)@/, ':***@')
}

export function StatusTab() {
  const {
    loading,
    dbalConnected,
    dbalConfig,
    dbalAdapters,
    refresh,
  } = useStatusTab()

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Checking DBAL connection...
      </Typography>
    )
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    }}>
      <Card>
        <CardHeader title="Connection Status" />
        <CardContent>
          {dbalConnected && dbalConfig ? (
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
                  label="Connected"
                  color="success"
                  size="small"
                />
                <Chip
                  label={dbalConfig.adapter}
                  color="primary"
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2">
                  Database URL
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {redactUrl(dbalConfig.database_url)}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="warning">
              DBAL daemon is not reachable. Make sure
              it is running on port 8080.
            </Alert>
          )}
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            size="small"
            onClick={refresh}
          >
            Refresh
          </Button>
        </CardActions>
      </Card>

      {dbalAdapters.length > 0 && (
        <Card>
          <CardHeader title="Available Backends" />
          <CardContent>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}>
              {dbalAdapters.map((a) => (
                <Chip
                  key={a.name}
                  label={a.name}
                  color={
                    a.active ? 'primary' : 'default'
                  }
                  variant={
                    a.active ? 'filled' : 'outlined'
                  }
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
