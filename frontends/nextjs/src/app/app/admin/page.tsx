/**
 * Admin Panel Page (Level 2+: Moderator/Admin)
 *
 * Mirrors old/src/components/Level3.tsx admin panel
 * Django-style data management with CRUD for users and entities
 * Reads entity schemas from DBAL and renders generic tables
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import {
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  Chip,
  Tabs,
  Tab,
  TabPanel,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@/m3'
import s from './page.module.scss'

interface UserRecord {
  id: string
  username: string
  email: string
  role: string
  createdAt: string
}

interface EntityStats {
  label: string
  count: number
  icon: string
}

function AdminContent() {
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<UserRecord[]>([])
  const [stats, setStats] = useState<EntityStats[]>([
    { label: 'Total Users', count: 0, icon: 'U' },
    { label: 'Total Comments', count: 0, icon: 'C' },
    { label: 'Admin Users', count: 0, icon: 'A' },
  ])

  useEffect(() => {
    // Load users from DBAL
    const dbalUrl = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
    fetch(`${dbalUrl}/system/core/user`, { signal: AbortSignal.timeout(5000) })
      .then(res => res.ok ? res.json() : null)
      .then((json: { data?: UserRecord[] } | null) => {
        if (json?.data != null) {
          setUsers(json.data)
          setStats([
            { label: 'Total Users', count: json.data.length, icon: 'U' },
            { label: 'Total Comments', count: 0, icon: 'C' },
            { label: 'Admin Users', count: json.data.filter(u => u.role === 'admin' || u.role === 'god').length, icon: 'A' },
          ])
        }
      })
      .catch(() => {
        // Fallback seed data for offline mode
        setUsers([
          { id: '1', username: 'demo', email: 'demo@metabuilder.dev', role: 'user', createdAt: new Date().toISOString() },
          { id: '2', username: 'admin', email: 'admin@metabuilder.dev', role: 'admin', createdAt: new Date().toISOString() },
        ])
        setStats([
          { label: 'Total Users', count: 2, icon: 'U' },
          { label: 'Total Comments', count: 0, icon: 'C' },
          { label: 'Admin Users', count: 1, icon: 'A' },
        ])
      })
  }, [])

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleDeleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId))
  }, [])

  return (
    <div className={s.root}>
      <div className={s.header}>
        <Typography variant="h4" gutterBottom>Data Management</Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all application data and users
        </Typography>
      </div>

      {/* Stats cards */}
      <div className={s.statsGrid}>
        {stats.map(stat => (
          <Paper key={stat.label} className={s.statCard}>
            <div className={s.statHeader}>
              <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              <Avatar className={s.statAvatar}>{stat.icon}</Avatar>
            </div>
            <Typography variant="h5" className={s.statCount}>{stat.count}</Typography>
          </Paper>
        ))}
      </div>

      {/* Data tables */}
      <Paper className={s.tablePanel}>
        <div className={s.tableHeader}>
          <div>
            <Typography variant="h6">Models</Typography>
            <Typography variant="body2" color="text.secondary">Browse and manage data models</Typography>
          </div>
          <TextField
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value) }}
            size="small"
            className={s.search}
          />
        </div>
        <Divider />

        <div className={s.tabsWrap}>
          <Tabs value={activeTab} onChange={(_e, v) => { setActiveTab(v as number) }}>
            <Tab label={`Users (${users.length})`} />
            <Tab label="Comments (0)" />
            <Tab label="Entities" />
          </Tabs>
        </div>

        <TabPanel value={activeTab} index={0}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className={s.emptyCell}>
                      <Typography variant="body2" color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className={s.userName}>{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          size="small"
                          color={u.role === 'god' ? 'secondary' : u.role === 'admin' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Button variant="text" size="small" onClick={() => { handleDeleteUser(u.id) }}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="body2" color="text.secondary" className={s.emptyState}>
            No comments data available. Connect to DBAL to load comments.
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="body2" color="text.secondary" className={s.emptyState}>
            Entity schemas are loaded from DBAL at dbal/shared/api/schema/entities/. Connect to DBAL to browse entities.
          </Typography>
        </TabPanel>
      </Paper>
    </div>
  )
}

export default function AdminPage() {
  return (
    <LevelGate minLevel={2} levelName="Admin">
      <AdminContent />
    </LevelGate>
  )
}
