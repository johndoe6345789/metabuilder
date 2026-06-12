/**
 * DBAL Storage Adapter
 */

import type {
  Snippet,
  Namespace,
  SnippetComment,
  ProfileComment,
} from './types'
import { getAuthToken } from './authToken'
import {
  dbalGetAllSnippets,
  dbalGetSnippet,
  dbalCreateSnippet,
  dbalUpdateSnippet,
  dbalDeleteSnippet,
  dbalGetSnippetsByNamespace,
  dbalBulkMoveSnippets,
} from './storage-dbal-snippets'
import {
  dbalGetAllNamespaces,
  dbalCreateNamespace,
  dbalUpdateNamespace,
  dbalDeleteNamespace,
  dbalGetSnippetComments,
  dbalCreateSnippetComment,
  dbalGetProfileComments,
  dbalCreateProfileComment,
} from './storage-dbal-namespaces'

const T = 'pastebin',
  P = 'pastebin'

export class DBALStorageAdapter {
  private base: string
  constructor(url: string) {
    this.base = url.replace(/\/$/, '')
  }
  private h = () => {
    const t = getAuthToken()
    return t ? { Authorization: `Bearer ${t}` } : ({} as Record<string, string>)
  }
  private eu = () => `${this.base}/${T}/${P}`
  private uid = () => {
    const t = getAuthToken()
    if (!t) return ''
    try {
      return (JSON.parse(atob(t.split('.')[1])).sub ?? '') as string
    } catch {
      return ''
    }
  }
  async testConnection() {
    try {
      return (
        await fetch(`${this.base}/health`, {
          signal: AbortSignal.timeout(5000),
        })
      ).ok
    } catch {
      return false
    }
  }
  getAllSnippets = () => dbalGetAllSnippets(this.eu(), this.uid(), this.h())
  getSnippet = (id: string) => dbalGetSnippet(this.eu(), id, this.h())
  createSnippet = (s: Snippet) =>
    dbalCreateSnippet(this.eu(), s, this.uid(), this.h())
  updateSnippet = (s: Snippet) =>
    dbalUpdateSnippet(this.eu(), s, this.uid(), this.h())
  deleteSnippet = (id: string) => dbalDeleteSnippet(this.eu(), id, this.h())
  getSnippetsByNamespace = (ns: string) =>
    dbalGetSnippetsByNamespace(this.eu(), ns, this.uid(), this.h())
  bulkMoveSnippets = (ids: string[], ns: string) =>
    dbalBulkMoveSnippets(this.eu(), ids, ns, this.h())
  getAllNamespaces = () => dbalGetAllNamespaces(this.eu(), this.uid(), this.h())
  async getNamespace(id: string): Promise<Namespace | null> {
    return (await this.getAllNamespaces()).find(n => n.id === id) || null
  }
  createNamespace = (ns: Namespace) =>
    dbalCreateNamespace(this.eu(), ns, this.uid(), this.h())
  updateNamespace = (id: string, name: string) =>
    dbalUpdateNamespace(this.eu(), id, name, this.h())
  deleteNamespace = (id: string) => dbalDeleteNamespace(this.eu(), id, this.h())
  getSnippetComments = (sid: string) =>
    dbalGetSnippetComments(this.eu(), sid, this.h())
  createSnippetComment = (c: SnippetComment) =>
    dbalCreateSnippetComment(this.eu(), c, this.h())
  getProfileComments = (uid: string) =>
    dbalGetProfileComments(this.eu(), uid, this.h())
  createProfileComment = (c: ProfileComment) =>
    dbalCreateProfileComment(this.eu(), c, this.h())
  async clearDatabase() {
    /* Not supported via DBAL */
  }
  async getStats() {
    const [s, n] = await Promise.all([
      this.getAllSnippets(),
      this.getAllNamespaces(),
    ])
    return {
      snippetCount: s.length,
      templateCount: s.filter(x => x.isTemplate).length,
      namespaceCount: n.length,
      storageType: 'dbal' as const,
      databaseSize: 0,
    }
  }
  async exportDatabase() {
    return {
      snippets: await this.getAllSnippets(),
      namespaces: await this.getAllNamespaces(),
    }
  }
  async importDatabase(data: { snippets: Snippet[]; namespaces: Namespace[] }) {
    for (const ns of data.namespaces) await this.createNamespace(ns)
    for (const s of data.snippets) await this.createSnippet(s)
  }
}
