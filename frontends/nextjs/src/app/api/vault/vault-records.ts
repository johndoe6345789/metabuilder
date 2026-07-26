export type VaultRecord = {
  packageId: string
  version: string
  enabled: boolean
  config: string | null
  tenantId: string | null
  installedAt: number | bigint | null
}

export type VaultEntry = {
  id: string
  slug: string
  title: string
  username: string
  password: string
  group: string
  notes: string
  loginUrl: string
  appUrl: string
  tenantId?: string | null
  createdAt: number
  updatedAt: number
}

export type VaultDraft = Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>

export function makePackageId(slug: string): string {
  return `vault_${slug}`
}

export function makeVaultEntry(
  record: VaultRecord,
  fallback?: Partial<VaultEntry>
): VaultEntry | null {
  if (!record.packageId.startsWith('vault_')) return null

  let config: Partial<VaultEntry> = {}
  if (typeof record.config === 'string' && record.config.length > 0) {
    try {
      config = JSON.parse(record.config) as Partial<VaultEntry>
    } catch {
      config = {}
    }
  }

  const createdAt = typeof config.createdAt === 'number'
    ? config.createdAt
    : Number(record.installedAt ?? 0)
  const updatedAt = typeof config.updatedAt === 'number'
    ? config.updatedAt
    : Number(record.installedAt ?? 0)

  return {
    id: record.packageId,
    slug: String(config.slug ?? fallback?.slug ?? record.packageId.replace(/^vault_/, '')),
    title: String(config.title ?? fallback?.title ?? record.packageId),
    username: String(config.username ?? fallback?.username ?? ''),
    password: String(config.password ?? fallback?.password ?? ''),
    group: String(config.group ?? fallback?.group ?? 'General'),
    notes: String(config.notes ?? fallback?.notes ?? ''),
    loginUrl: String(config.loginUrl ?? fallback?.loginUrl ?? '/app/login'),
    appUrl: String(config.appUrl ?? fallback?.appUrl ?? '/app'),
    tenantId: record.tenantId ?? 'system',
    createdAt,
    updatedAt,
  }
}

export function encodeConfig(entry: VaultDraft, createdAt: number, updatedAt: number): string {
  return JSON.stringify({
    slug: entry.slug,
    title: entry.title,
    username: entry.username,
    password: entry.password,
    group: entry.group,
    notes: entry.notes,
    loginUrl: entry.loginUrl,
    appUrl: entry.appUrl,
    createdAt,
    updatedAt,
  })
}
