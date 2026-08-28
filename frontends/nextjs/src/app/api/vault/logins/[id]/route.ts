import { NextResponse } from 'next/server'
import { db } from '@/lib/db-client'
import {
  encodeConfig,
  makeVaultEntry,
  type VaultRecord,
  type VaultEntry,
} from '../../vault-records'
import {
  deleteFallbackVaultEntry,
  readFallbackVaultEntry,
  upsertFallbackVaultEntry,
} from '../../vault-fallback-store'
import { hasValidVaultSession } from '../../vault-session'
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
      typeof record.installedAt === 'number' ||
      typeof record.installedAt === 'bigint'
        ? record.installedAt
        : null,
  } satisfies VaultRecord
}

function requireVaultMasterAccess(request: Request): NextResponse | null {
  if (!hasValidVaultSession(request)) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  return null
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const denied = requireVaultMasterAccess(request)
  if (denied !== null) return denied

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing login id' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!isObject(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const current = await db.entity('InstalledPackage').read(id)
  const currentVault =
    current !== null && isObject(current)
      ? makeVaultEntry(normalizeInstalledPackage(current))
      : readFallbackVaultEntry(id)

  if (currentVault === null) {
    return NextResponse.json({ error: 'Login not found' }, { status: 404 })
  }

  const updatedAt = Date.now()
  const nextEntry = {
    slug: asString(body.slug ?? currentVault.slug ?? '').trim(),
    title: asString(body.title ?? currentVault.title ?? '').trim(),
    username: asString(body.username ?? currentVault.username ?? '').trim(),
    password: asString(body.password ?? currentVault.password ?? ''),
    group:
      asString(body.group ?? currentVault.group ?? 'General').trim() ||
      'General',
    notes: asString(body.notes ?? currentVault.notes ?? '').trim(),
    loginUrl: asString(body.loginUrl ?? currentVault.loginUrl ?? '').trim(),
    appUrl: asString(body.appUrl ?? currentVault.appUrl ?? '').trim(),
    tenantId: 'system',
    createdAt: currentVault.createdAt,
    updatedAt,
  }

  if (
    nextEntry.slug.length === 0 ||
    nextEntry.title.length === 0 ||
    nextEntry.username.length === 0 ||
    nextEntry.password.length === 0
  ) {
    return NextResponse.json(
      { error: 'Slug, title, username, and password are required' },
      { status: 400 }
    )
  }

  let normalized: VaultEntry | null
  if (current !== null && isObject(current)) {
    try {
      const updated = await db.entity('InstalledPackage').update(id, {
        packageId: id,
        version: asString(current.version ?? '1.0.0'),
        enabled: Boolean(current.enabled ?? true),
        config: encodeConfig(nextEntry, currentVault.createdAt, updatedAt),
        tenantId: 'system',
        installedAt: Number(currentVault.createdAt),
      })
      normalized = makeVaultEntry(normalizeInstalledPackage(updated))
    } catch {
      normalized = upsertFallbackVaultEntry(
        nextEntry,
        currentVault.createdAt,
        updatedAt
      )
    }
  } else {
    normalized = upsertFallbackVaultEntry(
      nextEntry,
      currentVault.createdAt,
      updatedAt
    )
  }

  if (normalized === null) {
    return NextResponse.json({ error: 'Login not found' }, { status: 404 })
  }
  return NextResponse.json({ entry: normalized })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const denied = requireVaultMasterAccess(_request)
  if (denied !== null) return denied

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing login id' }, { status: 400 })
  }

  const removed =
    (await db.entity('InstalledPackage').remove(id)) ||
    deleteFallbackVaultEntry(id)

  if (!removed) {
    return NextResponse.json({ error: 'Login not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
