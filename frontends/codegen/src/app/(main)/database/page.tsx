/**
 * Database Management Page
 *
 * Thin wrapper — all logic lives in tabs/ and hooks/.
 */

'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
} from '@metabuilder/m3'
import { StatusTab } from './tabs/StatusTab'
import { SwitchDatabaseTab } from './tabs/SwitchDatabaseTab'
import { SeedDataTab } from './tabs/SeedDataTab'
import { SyncTab } from './tabs/SyncTab'

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DatabasePage() {
  const [tab, setTab] = useState(0)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Database
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Manage the DBAL C++ daemon — view connection
        status, switch databases, load seed data, and
        sync with Redux.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_e: any, v: any) =>
          setTab(Number(v))
        }
      >
        <Tab label="Status" />
        <Tab label="Switch Database" />
        <Tab label="Seed Data" />
        <Tab label="Sync" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {tab === 0 && <StatusTab />}
        {tab === 1 && <SwitchDatabaseTab />}
        {tab === 2 && <SeedDataTab />}
        {tab === 3 && <SyncTab />}
      </Box>
    </Box>
  )
}
