'use client'

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
  updatedAt: number
  createdAt: number
}

export type VaultDraft = Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>

export type VaultStore = {
  entries: VaultEntry[]
  selectedSlug: string | null
}
