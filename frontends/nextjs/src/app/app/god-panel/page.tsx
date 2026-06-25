/**
 * God Panel Page (Level 4: God)
 *
 * Mirrors old/src/components/Level4.tsx and Qt6 god-panel package
 * The meta-builder with:
 * - Tab-based tool interface (from god-panel-config.json)
 * - Schema editor, workflow builder, package manager
 * - Database management, credential settings, theme editor
 * - Preview levels, import/export
 *
 * Tools are configured via god-panel-config.json (95% data, 5% code)
 */
'use client'

import { useState, useEffect, Suspense } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import { godPanelConfig } from '@/lib/packages/navigation'
import type { GodPanelTab } from '@/lib/packages/navigation'
import {
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  TabPanel,
  Chip,
  Divider,
  Avatar,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@/m3'

/** Lazy-load the existing WorkflowBuilder if available */
const WorkflowBuilderLazy = typeof window !== 'undefined'
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@/components/workflow/WorkflowBuilder').WorkflowBuilder
  : null

const DBAL_URL = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080')
  : 'http://localhost:8080'

/** Tab icon mapping to single-char avatars */
const tabIconMap: Record<string, string> = {
  dashboard: 'O',
  database: 'D',
  workflow: 'W',
  package: 'P',
  pages: 'R',
  components: 'C',
  people: 'U',
  storage: 'S',
  key: 'K',
  palette: 'T',
}

interface EntitySchema {
  name: string
  fields: Array<{ name: string; type: string }>
}

interface DbalStatus {
  connected: boolean
  version?: string
  uptime?: string
  adapters?: string[]
}

function OverviewTab() {
  const [dbalStatus, setDbalStatus] = useState<DbalStatus>({ connected: false })
  const [entityCount, setEntityCount] = useState(0)

  useEffect(() => {
    // Check DBAL status
    fetch(`${DBAL_URL}/health`, { signal: AbortSignal.timeout(3000) })
      .then(res => res.ok ? res.json() : null)
      .then((json) => {
        if (json != null) {
          setDbalStatus({
            connected: true,
            version: (json as Record<string, string>).version ?? 'unknown',
            uptime: (json as Record<string, string>).uptime ?? 'unknown',
          })
        }
      })
      .catch(() => { setDbalStatus({ connected: false }) })

    // Count entities
    fetch(`${DBAL_URL}/version`, { signal: AbortSignal.timeout(3000) })
      .then(res => res.ok ? res.json() : null)
      .then((json) => {
        if (json != null && typeof (json as Record<string, unknown>).entityCount === 'number') {
          setEntityCount((json as Record<string, number>).entityCount)
        }
      })
      .catch(() => { /* ignore */ })
  }, [])

  return (
    <div>
      <Typography variant="h6" gutterBottom>System Overview</Typography>

      {/* DBAL Status */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: dbalStatus.connected ? '#4caf50' : '#f44336',
            }}
          />
          <Typography variant="subtitle2">
            DBAL Daemon: {dbalStatus.connected ? 'Connected' : 'Offline'}
          </Typography>
        </div>
        {dbalStatus.connected && (
          <div style={{ display: 'flex', gap: 16 }}>
            {dbalStatus.version != null && <Chip label={`v${dbalStatus.version}`} size="small" />}
            {dbalStatus.uptime != null && <Chip label={`Up: ${dbalStatus.uptime}`} size="small" variant="outlined" />}
            <Chip label={`${entityCount} entities`} size="small" variant="outlined" />
          </div>
        )}
      </Paper>

      {/* Quick tools grid */}
      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Quick Actions</Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {godPanelConfig.tools.map(tool => (
          <Paper key={tool.id} sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <Avatar sx={{ width: 32, height: 32, mx: 'auto', mb: 1 }}>
              {tool.icon.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2">{tool.label}</Typography>
          </Paper>
        ))}
      </div>

      {/* Config summary (from Level4.tsx) */}
      <Paper
        sx={{
          mt: 3,
          p: 3,
          background: 'linear-gradient(135deg, rgba(98,0,238,0.08), rgba(3,218,198,0.08))',
          border: '2px dashed rgba(98,0,238,0.3)',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Configuration Summary
        </Typography>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">DBAL Entities:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{entityCount}</Typography>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">God Panel Tabs:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{godPanelConfig.tabs.length}</Typography>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Quick Tools:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{godPanelConfig.tools.length}</Typography>
          </div>
        </div>
      </Paper>
    </div>
  )
}

function SchemasTab() {
  const [schemas, setSchemas] = useState<EntitySchema[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/entity_schema`, { signal: AbortSignal.timeout(5000) })
      .then(res => res.ok ? res.json() : null)
      .then((json: { data?: EntitySchema[] } | null) => {
        if (json?.data != null) setSchemas(json.data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback: show known entity categories
        setSchemas([
          { name: 'user', fields: [{ name: 'id', type: 'uuid' }, { name: 'username', type: 'string' }, { name: 'email', type: 'string' }, { name: 'role', type: 'string' }] },
          { name: 'session', fields: [{ name: 'id', type: 'uuid' }, { name: 'userId', type: 'uuid' }, { name: 'token', type: 'string' }] },
          { name: 'workflow', fields: [{ name: 'id', type: 'uuid' }, { name: 'name', type: 'string' }, { name: 'version', type: 'string' }] },
          { name: 'package', fields: [{ name: 'id', type: 'uuid' }, { name: 'packageId', type: 'string' }, { name: 'name', type: 'string' }] },
          { name: 'ui_page', fields: [{ name: 'id', type: 'uuid' }, { name: 'path', type: 'string' }, { name: 'title', type: 'string' }] },
        ])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <Typography variant="body2" color="text.secondary">Loading schemas...</Typography>
  }

  return (
    <div>
      <Typography variant="h6" gutterBottom>Entity Schemas</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Source of truth: dbal/shared/api/schema/entities/
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Entity</TableCell>
              <TableCell>Fields</TableCell>
              <TableCell>Field Names</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schemas.map(schema => (
              <TableRow key={schema.name}>
                <TableCell sx={{ fontWeight: 500 }}>{schema.name}</TableCell>
                <TableCell>{schema.fields.length}</TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {schema.fields.map(f => (
                      <Chip
                        key={f.name}
                        label={`${f.name}: ${f.type}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 22 }}
                      />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

function WorkflowsTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Workflow Builder</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Visual DAG workflow editor. Define workflows in JSON with version 2.2.0 format.
      </Typography>

      {WorkflowBuilderLazy != null ? (
        <Suspense fallback={<Typography variant="body2">Loading workflow editor...</Typography>}>
          <Paper sx={{ p: 2, height: 500 }}>
            <WorkflowBuilderLazy
              workflow={{
                id: 'wf_sample',
                name: 'Sample Workflow',
                version: '2.2.0',
                nodes: [
                  { id: 'trigger', name: 'Trigger', nodeType: 'trigger', position: [50, 100], parameters: {}, description: 'Workflow entry point' },
                  { id: 'process', name: 'Process', nodeType: 'function', position: [300, 100], parameters: {}, description: 'Process data' },
                  { id: 'output', name: 'Output', nodeType: 'output', position: [550, 100], parameters: {}, description: 'Return result' },
                ],
                connections: {
                  trigger: { default: { '0': [{ node: 'process', port: 'input', index: 0 }] } },
                  process: { default: { '0': [{ node: 'output', port: 'input', index: 0 }] } },
                },
                variables: {},
                settings: { debugMode: false, maxConcurrentExecutions: 1, executionTimeout: 30000 },
              }}
              tenant="system"
              readOnly={false}
            />
          </Paper>
        </Suspense>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Workflow editor component available at /components/workflow/WorkflowBuilder.tsx
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Also see frontends/workflowui/ for the full React workflow editor with n8n-style visual editor.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Workflows are defined in dbal/shared/api/schema/workflows/ as JSON files.
            Event dispatch: entity route handler &rarr; send_success callback &rarr; WfEngine &rarr; detached thread execution.
          </Typography>
        </Paper>
      )}
    </div>
  )
}

function PackagesTab() {
  const [packages, setPackages] = useState<Array<{ packageId: string; name: string; version: string; category: string; level: number }>>([])

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/package`, { signal: AbortSignal.timeout(5000) })
      .then(res => res.ok ? res.json() : null)
      .then((json: { data?: Array<Record<string, unknown>> } | null) => {
        if (json?.data != null) {
          setPackages(json.data as Array<{ packageId: string; name: string; version: string; category: string; level: number }>)
        }
      })
      .catch(() => {
        // Hardcoded from Qt6 package metadata for offline
        setPackages([
          { packageId: 'analytics', name: 'Analytics Studio', version: '1.0.0', category: 'admin', level: 3 },
          { packageId: 'blog', name: 'Blog', version: '1.0.0', category: 'social', level: 2 },
          { packageId: 'forum', name: 'Community Forum', version: '1.0.0', category: 'social', level: 2 },
          { packageId: 'gallery', name: 'Gallery', version: '1.0.0', category: 'media', level: 2 },
          { packageId: 'guestbook', name: 'Guestbook', version: '1.0.0', category: 'social', level: 2 },
          { packageId: 'god_panel', name: 'God Panel', version: '1.0.0', category: 'admin', level: 4 },
          { packageId: 'package_manager', name: 'Package Manager', version: '1.0.0', category: 'admin', level: 4 },
        ])
      })
  }, [])

  return (
    <div>
      <Typography variant="h6" gutterBottom>Package Manager</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        62 packages across Admin, UI Core, Dev Tools, Features, Testing categories.
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Package</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packages.map(pkg => (
              <TableRow key={pkg.packageId}>
                <TableCell sx={{ fontWeight: 500 }}>{pkg.name}</TableCell>
                <TableCell><Chip label={pkg.version} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} /></TableCell>
                <TableCell><Chip label={pkg.category} size="small" /></TableCell>
                <TableCell>{pkg.level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

function PageRoutesTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Page Routes</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        URL route configuration. Routes map to JSON component trees rendered by UIPageRenderer.
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Routes are stored in the database and loaded by /ui/[[...slug]]/page.tsx via loadPageFromDb().
          Create routes using the DBAL API: POST /system/core/page_config
        </Typography>
      </Paper>
    </div>
  )
}

function ComponentsTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Component Hierarchy</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        JSON-defined component trees. Components render via JSONComponentRenderer.
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Available component categories:
        </Typography>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['layout', 'cards', 'forms', 'navigation', 'feedback', 'data-display', 'surfaces', 'atoms', 'core'].map(cat => (
            <Chip key={cat} label={cat} size="small" />
          ))}
        </div>
      </Paper>
    </div>
  )
}

function UsersTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>User Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage users, roles, and permissions. Role hierarchy: user &rarr; moderator &rarr; admin &rarr; god &rarr; supergod
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          User management is available in the Admin Panel tab. This tab provides advanced role assignment
          and multi-tenant user configuration.
        </Typography>
      </Paper>
    </div>
  )
}

function DatabaseTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Database Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        14 database backends supported. Configure via DATABASE_URL environment variable.
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { name: 'Memory', desc: 'In-memory (testing)' },
          { name: 'SQLite', desc: 'Embedded, generic CRUD' },
          { name: 'PostgreSQL', desc: 'Direct connection' },
          { name: 'MySQL', desc: 'Direct connection' },
          { name: 'MongoDB', desc: 'JSON/BSON' },
          { name: 'Redis', desc: 'Cache layer' },
          { name: 'Elasticsearch', desc: 'Full-text search' },
          { name: 'SurrealDB', desc: 'Multi-model' },
        ].map(db => (
          <Paper key={db.name} sx={{ p: 2 }}>
            <Typography variant="subtitle2">{db.name}</Typography>
            <Typography variant="caption" color="text.secondary">{db.desc}</Typography>
          </Paper>
        ))}
      </div>
    </div>
  )
}

function CredentialsTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Credential Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        God-tier credential management. JWT auth + JSON ACL configuration.
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" gutterBottom>JWT Authentication</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Auth config: DBAL_AUTH_CONFIG=/app/schemas/auth/auth.json
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Seed Users</Typography>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip label="demo / demo (user, L2)" size="small" variant="outlined" />
          <Chip label="admin / admin (admin, L3)" size="small" variant="outlined" />
          <Chip label="god / god123 (god, L4)" size="small" variant="outlined" />
          <Chip label="super / super123 (supergod, L5)" size="small" variant="outlined" />
        </div>
      </Paper>
    </div>
  )
}

function ThemeTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Theme Configuration</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Configure application theme, colors, and typography.
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Theme is managed via CSS custom properties and the theme context provider.
          Toggle between light/dark/system using the AppBar theme button.
        </Typography>
      </Paper>
    </div>
  )
}

/** Map tab IDs to their content components */
const tabComponents: Record<string, React.FC> = {
  overview: OverviewTab,
  schemas: SchemasTab,
  workflows: WorkflowsTab,
  packages: PackagesTab,
  pages: PageRoutesTab,
  components: ComponentsTab,
  users: UsersTab,
  database: DatabaseTab,
  credentials: CredentialsTab,
  theme: ThemeTab,
}

function GodPanelContent() {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = godPanelConfig.tabs

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Typography variant="h4" gutterBottom>
          Application Builder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Design your application declaratively. Define schemas, create workflows, manage packages and pages.
        </Typography>
      </div>

      <Tabs
        value={activeTab}
        onChange={(_e, v) => { setActiveTab(v as number) }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {tabs.map((tab: GodPanelTab) => (
          <Tab
            key={tab.id}
            label={tab.label}
            icon={
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                {tabIconMap[tab.icon] ?? tab.icon.charAt(0).toUpperCase()}
              </Avatar>
            }
            iconPosition="start"
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
        ))}
      </Tabs>

      {tabs.map((tab: GodPanelTab, index: number) => {
        const TabComponent = tabComponents[tab.id]
        return (
          <TabPanel key={tab.id} value={activeTab} index={index}>
            {TabComponent != null ? <TabComponent /> : (
              <Typography variant="body2" color="text.secondary">
                Tab content for &ldquo;{tab.label}&rdquo; is not yet implemented.
              </Typography>
            )}
          </TabPanel>
        )
      })}
    </div>
  )
}

export default function GodPanelPage() {
  return (
    <LevelGate minLevel={4} levelName="God">
      <GodPanelContent />
    </LevelGate>
  )
}
