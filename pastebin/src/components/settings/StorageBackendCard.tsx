'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Database, CloudArrowUp, CloudCheck, CloudSlash, Upload, Download } from '@phosphor-icons/react'
import { type StorageBackend } from '@/lib/storage'

interface StorageBackendCardProps {
  storageBackend: StorageBackend
  flaskUrl: string
  flaskConnectionStatus: 'unknown' | 'connected' | 'failed'
  testingConnection: boolean
  envVarSet: boolean
  onStorageBackendChange: (backend: StorageBackend) => void
  onFlaskUrlChange: (url: string) => void
  onTestConnection: () => Promise<void>
  onSaveConfig: () => Promise<void>
  onMigrateToFlask: () => Promise<void>
  onMigrateToIndexedDB: () => Promise<void>
}

export function StorageBackendCard({
  storageBackend,
  flaskUrl,
  flaskConnectionStatus,
  testingConnection,
  envVarSet,
  onStorageBackendChange,
  onFlaskUrlChange,
  onTestConnection,
  onSaveConfig,
  onMigrateToFlask,
  onMigrateToIndexedDB,
}: StorageBackendCardProps) {
  return (
    <Card data-testid="storage-backend-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudArrowUp weight="duotone" size={24} aria-hidden="true" />
          Storage Backend
        </CardTitle>
        <CardDescription>
          Choose where your snippets are stored
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {envVarSet && (
          <Alert className="border-accent bg-accent/10" data-testid="env-var-alert" role="status">
            <AlertDescription className="flex items-center gap-2">
              <CloudCheck weight="fill" size={16} className="text-accent" aria-hidden="true" />
              <span>
                Storage backend is configured via <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">NEXT_PUBLIC_FLASK_BACKEND_URL</code> environment variable and cannot be changed here.
              </span>
            </AlertDescription>
          </Alert>
        )}
        
        <RadioGroup
          value={storageBackend}
          onValueChange={(value) => onStorageBackendChange(value as StorageBackend)}
        >
          <div className="flex items-start space-x-3 space-y-0" data-testid="storage-option-indexeddb">
            <RadioGroupItem value="indexeddb" id="storage-indexeddb" disabled={envVarSet} />
            <div className="flex-1">
              <Label htmlFor="storage-indexeddb" className={`font-semibold ${envVarSet ? 'opacity-50' : 'cursor-pointer'}`}>
                IndexedDB (Local Browser Storage)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Store snippets locally in your browser. Data persists on this device only.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 space-y-0 mt-4" data-testid="storage-option-flask">
            <RadioGroupItem value="flask" id="storage-flask" disabled={envVarSet} />
            <div className="flex-1">
              <Label htmlFor="storage-flask" className={`font-semibold ${envVarSet ? 'opacity-50' : 'cursor-pointer'}`}>
                Flask Backend (Remote Server)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Store snippets on a Flask backend server. Data is accessible from any device.
              </p>
            </div>
          </div>
        </RadioGroup>

        {storageBackend === 'flask' && (
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/50" data-testid="flask-config-section">
            <div>
              <Label htmlFor="flask-url">Flask Backend URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="flask-url"
                  type="url"
                  placeholder="http://localhost:5000"
                  value={flaskUrl}
                  onChange={(e) => onFlaskUrlChange(e.target.value)}
                  disabled={envVarSet}
                  data-testid="flask-url-input"
                  aria-label="Flask backend URL"
                />
                <Button
                  onClick={onTestConnection}
                  variant="outline"
                  disabled={testingConnection || !flaskUrl}
                  data-testid="test-flask-btn"
                  aria-label="Test flask connection"
                  aria-busy={testingConnection}
                >
                  {testingConnection ? 'Testing...' : 'Test'}
                </Button>
              </div>
              {flaskConnectionStatus === 'connected' && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600" data-testid="flask-connected-status">
                  <CloudCheck weight="fill" size={16} aria-hidden="true" />
                  Connected successfully
                </div>
              )}
              {flaskConnectionStatus === 'failed' && (
                <div className="flex items-center gap-2 mt-2 text-sm text-destructive" data-testid="flask-failed-status">
                  <CloudSlash weight="fill" size={16} aria-hidden="true" />
                  Connection failed
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <Button
                onClick={onMigrateToFlask}
                variant="outline"
                size="sm"
                className="w-full gap-2"
                data-testid="migrate-to-flask-btn"
                aria-label="Migrate IndexedDB data to Flask backend"
              >
                <Upload weight="bold" size={16} aria-hidden="true" />
                Migrate IndexedDB Data to Flask
              </Button>
              <Button
                onClick={onMigrateToIndexedDB}
                variant="outline"
                size="sm"
                className="w-full gap-2"
                data-testid="migrate-to-indexeddb-btn"
                aria-label="Migrate Flask data to IndexedDB"
              >
                <Download weight="bold" size={16} aria-hidden="true" />
                Migrate Flask Data to IndexedDB
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button onClick={onSaveConfig} className="gap-2" disabled={envVarSet} data-testid="save-storage-settings-btn" aria-label="Save storage configuration">
            <Database weight="bold" size={16} aria-hidden="true" />
            Save Storage Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
