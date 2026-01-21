'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Warning, FirstAid, CheckCircle } from '@phosphor-icons/react'

interface SchemaHealthCardProps {
  schemaHealth: 'unknown' | 'healthy' | 'corrupted'
  checkingSchema: boolean
  onClear: () => Promise<void>
  onCheckSchema: () => Promise<void>
}

export function SchemaHealthCard({ 
  schemaHealth, 
  checkingSchema, 
  onClear, 
  onCheckSchema 
}: SchemaHealthCardProps) {
  if (schemaHealth === 'unknown') return null

  if (schemaHealth === 'corrupted') {
    return (
      <Card className="border-destructive bg-destructive/10" data-testid="schema-corrupted-card" role="alert" aria-label="Database schema corruption alert">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Warning weight="fill" size={24} aria-hidden="true" />
            Schema Corruption Detected
          </CardTitle>
          <CardDescription>
            Your database schema is outdated or corrupted and needs to be repaired
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-destructive" role="alert" data-testid="schema-error-details">
            <AlertDescription>
              The database schema is missing required tables or columns (likely due to namespace feature addition).
              This can cause errors when loading or saving snippets. Click the button below to wipe and recreate the database with the correct schema.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2" data-testid="schema-repair-actions">
            <Button onClick={onClear} variant="destructive" className="gap-2" data-testid="repair-database-btn" aria-label="Repair database (wipe and recreate)">
              <FirstAid weight="bold" size={16} aria-hidden="true" />
              Repair Database (Wipe & Recreate)
            </Button>
            <Button onClick={onCheckSchema} variant="outline" disabled={checkingSchema} data-testid="recheck-schema-btn" aria-label="Re-check schema status" aria-busy={checkingSchema}>
              {checkingSchema ? 'Checking...' : 'Re-check Schema'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-600 bg-green-600/10" data-testid="schema-healthy-card" role="status" aria-label="Database schema health check passed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle weight="fill" size={24} aria-hidden="true" />
          Schema Healthy
        </CardTitle>
        <CardDescription>
          Your database schema is up to date and functioning correctly
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
