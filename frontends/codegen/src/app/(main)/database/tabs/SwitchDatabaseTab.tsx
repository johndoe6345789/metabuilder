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
  Select,
  MenuItem,
  TextField,
  Alert,
  Divider,
} from '@metabuilder/fakemui'
import {
  useSwitchDatabaseTab,
  getFieldPlaceholder,
} from '../hooks/useSwitchDatabaseTab'

export function SwitchDatabaseTab() {
  const {
    selectedAdapter,
    formFields,
    testResult,
    switchResult,
    testing,
    switching,
    fields,
    handleAdapterChange,
    handleFieldChange,
    handleTest,
    handleApply,
  } = useSwitchDatabaseTab()

  return (
    <Card>
      <CardHeader title="Switch Database" />
      <CardContent>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}>
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
            >
              Adapter
            </Typography>
            <Select
              fullWidth
              value={selectedAdapter}
              onChange={(e: any) =>
                handleAdapterChange(
                  String(e.target.value)
                )
              }
            >
              <MenuItem value="sqlite">SQLite</MenuItem>
              <MenuItem value="postgres">
                PostgreSQL
              </MenuItem>
              <MenuItem value="mysql">MySQL</MenuItem>
              <MenuItem value="mongodb">
                MongoDB
              </MenuItem>
            </Select>
          </Box>

          <Divider />

          {fields.map((field) => (
            <TextField
              key={field}
              label={
                field.charAt(0).toUpperCase() +
                field
                  .slice(1)
                  .replace(/([A-Z])/g, ' $1')
              }
              fullWidth
              value={formFields[field] || ''}
              onChange={(e: any) =>
                handleFieldChange(
                  field,
                  String(e.target.value)
                )
              }
              type={
                field === 'password'
                  ? 'password'
                  : 'text'
              }
              placeholder={getFieldPlaceholder(
                field,
                selectedAdapter
              )}
            />
          ))}

          {testResult && (
            <Alert
              severity={
                testResult.ok ? 'success' : 'error'
              }
            >
              {testResult.message}
            </Alert>
          )}
          {switchResult && (
            <Alert
              severity={
                switchResult.ok ? 'success' : 'error'
              }
            >
              {switchResult.message}
            </Alert>
          )}
        </Box>
      </CardContent>
      <CardActions>
        <Button
          variant="outlined"
          onClick={handleTest}
          disabled={testing}
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={switching}
        >
          {switching ? 'Switching...' : 'Apply'}
        </Button>
      </CardActions>
    </Card>
  )
}
