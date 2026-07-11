import { NextResponse } from 'next/server'
import { db } from '@/lib/db-client'
import {
  encodeConfig,
  makePackageId,
  makeVaultEntry,
  type VaultRecord,
} from '../vault-records'
import { hasValidVaultSession } from '../vault-session'

const DEFAULT_LOGINS = [
  {
    slug: 'demo',
    title: 'Demo user',
    username: 'demo',
    password: 'demo1234',
    group: 'Default',
    notes: 'Primary smoke-test login.',
    loginUrl: '/app/ui/login',
    appUrl: '/app',
  },
  {
    slug: 'alice',
    title: 'Alice tester',
    username: 'alice',
    password: 'alice1234',
    group: 'Default',
    notes: 'Secondary test account.',
    loginUrl: '/app/ui/login',
    appUrl: '/app',
  },
  {
    slug: 'bob',
    title: 'Bob tester',
    username: 'bob',
    password: 'bob12345',
    group: 'Default',
    notes: 'Used for permission and role checks.',
    loginUrl: '/app/ui/login',
    appUrl: '/app',
  },
  {
    slug: 'guest',
    title: 'Guest viewer',
    username: 'guest',
    password: 'guest1234',
    group: 'Public',
    notes: 'Low-friction smoke test account.',
    loginUrl: '/app/ui/login',
    appUrl: '/app',
  },
  {
    slug: 'qa',
    title: 'QA engineer',
    username: 'qa',
    password: 'qa1234',
    group: 'Testing',
    notes: 'Used for general QA runs.',
    loginUrl: '/app/ui/login',
    appUrl: '/app/dashboard',
  },
  {
    slug: 'analyst',
    title: 'Analytics reviewer',
    username: 'analyst',
    password: 'analyst1234',
    group: 'Testing',
    notes: 'Checks reporting surfaces and read-only flows.',
    loginUrl: '/app/ui/login',
    appUrl: '/app/dashboard',
  },
  {
    slug: 'editor',
    title: 'Content editor',
    username: 'editor',
    password: 'editor1234',
    group: 'Workspace',
    notes: 'Useful for content and form editing checks.',
    loginUrl: '/app/ui/login',
    appUrl: '/app/comments',
  },
  {
    slug: 'moderator',
    title: 'Moderator',
    username: 'moderator',
    password: 'moderator1234',
    group: 'Workspace',
    notes: 'Moderation and review workflows.',
    loginUrl: '/app/ui/login',
    appUrl: '/app/comments',
  },
  {
    slug: 'admin',
    title: 'Admin operator',
    username: 'admin',
    password: 'admin1234',
    group: 'Administration',
    notes: 'Covers admin and configuration flows.',
    loginUrl: '/app/ui/login',
    appUrl: '/app/admin',
  },
  {
    slug: 'god',
    title: 'God operator',
    username: 'god',
    password: 'god1234',
    group: 'Administration',
    notes: 'Exercises god panel controls.',
    loginUrl: '/app/ui/login',
    appUrl: '/app/god-panel',
  },
  {
    slug: 'supergod',
    title: 'Supergod operator',
    username: 'supergod',
    password: 'supergod1234',
    group: 'Administration',
    notes: 'Exercises super-god workflows.',
    loginUrl: '/app/ui/login',
    appUrl: '/app/super-god-panel',
  },
  {
    slug: 'service',
    title: 'Service account',
    username: 'service',
    password: 'service1234',
    group: 'System',
    notes: 'Tests automation and integration hooks.',
    loginUrl: '/app/ui/login',
    appUrl: '/app/system/god-panel',
  },
]

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeInstalledPackage(record: Record<string, unknown>) {
  return {
    packageId: String(record.packageId ?? ''),
    version: String(record.version ?? '1.0.0'),
    enabled: Boolean(record.enabled ?? true),
    config:
      typeof record.config === 'string' || record.config === null
        ? record.config
        : JSON.stringify(record.config),
    tenantId:
      typeof record.tenantId === 'string' || record.tenantId === null
        ? record.tenantId
        : null,
    installedAt:
      typeof record.installedAt === 'number' || typeof record.installedAt === 'bigint'
        ? record.installedAt
        : null,
  } satisfies VaultRecord
}

function requireVaultMasterAccess(request: Request): NextResponse | null {
  if (!hasValidVaultSession(request)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  return null
}

async function ensureSeeded(): Promise<void> {
  const result = await db.entity('InstalledPackage').list({
    filter: { tenantId: 'system' },
  })
  const existingIds = new Set(
    result.data
      .filter(isObject)
      .map(normalizeInstalledPackage)
      .filter(item => item.packageId.startsWith('vault_'))
      .map(item => item.packageId)
  )

  const now = Date.now()
  for (const entry of DEFAULT_LOGINS) {
    const packageId = makePackageId(entry.slug)
    if (existingIds.has(packageId)) continue
    await db.entity('InstalledPackage').create({
      packageId,
      version: '1.0.0',
      enabled: true,
      config: encodeConfig(
        entry,
        now,
        now
      ),
      tenantId: 'system',
      installedAt: now,
    })
  }
}

export async function GET(request: Request) {
  const denied = requireVaultMasterAccess(request)
  if (denied !== null) return denied

  await ensureSeeded()
  const result = await db.entity('InstalledPackage').list({
    filter: { tenantId: 'system' },
  })
  const entries = result.data
    .filter(isObject)
    .map(normalizeInstalledPackage)
    .filter(item => item.packageId.startsWith('vault_'))
    .map(item => makeVaultEntry(item))
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.title.localeCompare(b.title))

  return NextResponse.json({ entries })
}

export async function POST(request: Request) {
  const denied = requireVaultMasterAccess(request)
  if (denied !== null) return denied

  const body = await request.json().catch(() => null)
  if (!isObject(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const now = Date.now()
  const entry = {
    slug: String(body.slug ?? '').trim(),
    title: String(body.title ?? '').trim(),
    username: String(body.username ?? '').trim(),
    password: String(body.password ?? ''),
    group: String(body.group ?? 'General').trim() || 'General',
    notes: String(body.notes ?? '').trim(),
    loginUrl: String(body.loginUrl ?? '').trim(),
    appUrl: String(body.appUrl ?? '').trim(),
    tenantId: 'system',
    createdAt: now,
    updatedAt: now,
  }

  if (entry.slug.length === 0 || entry.title.length === 0 || entry.username.length === 0 || entry.password.length === 0) {
    return NextResponse.json({ error: 'Slug, title, username, and password are required' }, { status: 400 })
  }

  const created = await db.entity('InstalledPackage').create({
    packageId: makePackageId(entry.slug),
    version: '1.0.0',
    enabled: true,
    config: encodeConfig(entry, now, now),
    tenantId: 'system',
    installedAt: now,
  })

  const normalized = makeVaultEntry(normalizeInstalledPackage(created))
  return NextResponse.json({ entry: normalized }, { status: 201 })
}
