'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Download, Upload, Trash } from '@phosphor-icons/react'

interface DatabaseActionsCardProps {
  onExport: () => Promise<void>
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onSeed: () => Promise<void>
  onClear: () => Promise<void>
}

export function DatabaseActionsCard({ 
  onExport, 
  onImport, 
  onSeed, 
  onClear 
}: DatabaseActionsCardProps) {
  return (
    <Card data-testid="database-actions-card">
      <CardHeader>
        <CardTitle>Database Actions</CardTitle>
        <CardDescription>
          Backup, restore, or reset your database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div data-testid="export-section">
          <h3 className="text-sm font-semibold mb-2">Export Database</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Download your database as a file for backup or transfer to another device
          </p>
          <Button onClick={onExport} variant="outline" className="gap-2" data-testid="export-db-btn" aria-label="Export database as file">
            <Download weight="bold" size={16} aria-hidden="true" />
            Export Database
          </Button>
        </div>

        <div className="pt-4 border-t border-border" data-testid="import-section">
          <h3 className="text-sm font-semibold mb-2">Import Database</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Restore a previously exported database file
          </p>
          <label data-testid="import-label">
            <input
              type="file"
              accept=".db"
              onChange={onImport}
              className="hidden"
              id="import-db"
              data-testid="import-file-input"
              aria-label="Import database file"
            />
            <Button variant="outline" className="gap-2" asChild data-testid="import-db-btn">
              <span>
                <Upload weight="bold" size={16} aria-hidden="true" />
                Import Database
              </span>
            </Button>
          </label>
        </div>

        <div className="pt-4 border-t border-border" data-testid="seed-section">
          <h3 className="text-sm font-semibold mb-2">Sample Data</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Add sample code snippets to get started (only if database is empty)
          </p>
          <Button onClick={onSeed} variant="outline" className="gap-2" data-testid="seed-db-btn" aria-label="Add sample data to database">
            <Database weight="bold" size={16} aria-hidden="true" />
            Add Sample Data
          </Button>
        </div>

        <div className="pt-4 border-t border-border" data-testid="clear-section">
          <h3 className="text-sm font-semibold mb-2 text-destructive">Clear All Data</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Permanently delete all snippets and templates. This cannot be undone.
          </p>
          <Button onClick={onClear} variant="destructive" className="gap-2" data-testid="clear-db-btn" aria-label="Permanently delete all database contents">
            <Trash weight="bold" size={16} aria-hidden="true" />
            Clear Database
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
