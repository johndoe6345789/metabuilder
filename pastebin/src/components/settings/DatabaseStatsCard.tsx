'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Database } from '@phosphor-icons/react'

interface DatabaseStatsCardProps {
  loading: boolean
  stats: {
    snippetCount: number
    templateCount: number
    storageType: 'indexeddb' | 'localstorage' | 'none'
    databaseSize: number
  } | null
  formatBytes: (bytes: number) => string
}

export function DatabaseStatsCard({ loading, stats, formatBytes }: DatabaseStatsCardProps) {
  return (
    <Card data-testid="database-stats-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database weight="duotone" size={24} aria-hidden="true" />
          Database Statistics
        </CardTitle>
        <CardDescription>
          Information about your local database storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground" data-testid="stats-loading" role="status" aria-busy="true">Loading...</p>
        ) : stats ? (
          <div className="space-y-3" role="region" aria-label="Database statistics">
            <div className="flex justify-between items-center py-2 border-b border-border" data-testid="stat-snippets">
              <span className="text-sm text-muted-foreground">Snippets</span>
              <span className="font-semibold">{stats.snippetCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border" data-testid="stat-templates">
              <span className="text-sm text-muted-foreground">Templates</span>
              <span className="font-semibold">{stats.templateCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border" data-testid="stat-storage-type">
              <span className="text-sm text-muted-foreground">Storage Type</span>
              <span className="font-semibold capitalize">{stats.storageType}</span>
            </div>
            <div className="flex justify-between items-center py-2" data-testid="stat-database-size">
              <span className="text-sm text-muted-foreground">Database Size</span>
              <span className="font-semibold">{formatBytes(stats.databaseSize)}</span>
            </div>
          </div>
        ) : (
          <p className="text-destructive" data-testid="stats-error" role="alert">Failed to load statistics</p>
        )}
      </CardContent>
    </Card>
  )
}
