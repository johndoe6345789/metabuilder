import { NextResponse } from 'next/server'
import { db } from '@/lib/db-client'
import {
  encodeConfig,
  makePackageId,
  makeVaultEntry,
  type VaultRecord,
} from '../vault-records'
import {
  DEFAULT_VAULT_LOGINS,
  listFallbackVaultEntries,
  upsertFallbackVaultEntry,
} from '../vault-fallback-store'
import { hasValidVaultSession } from '../vault-session'
import { asString } from '@/lib/api/as-string'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeInstalledPackage(record: Record<string, unknown>) {
  return {
    packageId: asString(record.packageId ?? ''),
    version: asString(record.version ?? '1.0.0'),
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
  for (const entry of DEFAULT_VAULT_LOGINS) {
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

  try {
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
  } catch (error) {
    return NextResponse.json({
      entries: listFallbackVaultEntries(),
      warning:
        error instanceof Error
          ? `DBAL unavailable: ${error.message}`
          : 'DBAL unavailable',
    })
  }
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
    slug: asString(body.slug ?? '').trim(),
    title: asString(body.title ?? '').trim(),
    username: asString(body.username ?? '').trim(),
    password: asString(body.password ?? ''),
    group: asString(body.group ?? 'General').trim() || 'General',
    notes: asString(body.notes ?? '').trim(),
    loginUrl: asString(body.loginUrl ?? '').trim(),
    appUrl: asString(body.appUrl ?? '').trim(),
    tenantId: 'system',
    createdAt: now,
    updatedAt: now,
  }

  if (entry.slug.length === 0 || entry.title.length === 0 || entry.username.length === 0 || entry.password.length === 0) {
    return NextResponse.json({ error: 'Slug, title, username, and password are required' }, { status: 400 })
  }

  try {
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
  } catch {
    return NextResponse.json({
      entry: upsertFallbackVaultEntry(entry, now, now),
    }, { status: 201 })
  }
}
