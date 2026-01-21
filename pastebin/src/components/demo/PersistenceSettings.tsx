'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { usePersistenceConfig } from '@/store/hooks'
import { FloppyDisk, Timer, Bug } from '@phosphor-icons/react'

export function PersistenceSettings() {
  const { config, togglePersistence, toggleLogging, updateDebounceDelay } = usePersistenceConfig()

  return (
    <Card data-testid="persistence-settings">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center" aria-hidden="true">
            <FloppyDisk className="h-5 w-5 text-primary" weight="duotone" />
          </div>
          <div>
            <CardTitle>Redux Persistence</CardTitle>
            <CardDescription>
              Automatic database synchronization for Redux state
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between" data-testid="persistence-enabled-setting">
          <div className="space-y-1">
            <Label htmlFor="persistence-enabled" className="text-base font-medium">
              Auto-Save Enabled
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically sync Redux state changes to database
            </p>
          </div>
          <Switch
            id="persistence-enabled"
            checked={config.enabled}
            onCheckedChange={togglePersistence}
            data-testid="persistence-enabled-toggle"
            aria-label="Toggle auto-save persistence"
          />
        </div>

        <div className="flex items-center justify-between" data-testid="logging-enabled-setting">
          <div className="space-y-1">
            <Label htmlFor="logging-enabled" className="text-base font-medium flex items-center gap-2">
              Debug Logging
              <Bug className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Label>
            <p className="text-sm text-muted-foreground">
              Log persistence operations to console
            </p>
          </div>
          <Switch
            id="logging-enabled"
            checked={config.logging}
            onCheckedChange={toggleLogging}
            data-testid="logging-enabled-toggle"
            aria-label="Toggle debug logging"
          />
        </div>

        <div className="space-y-3" data-testid="debounce-setting">
          <div className="flex items-center justify-between">
            <Label htmlFor="debounce-delay" className="text-base font-medium flex items-center gap-2">
              Save Delay
              <Timer className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Label>
            <Badge variant="secondary" data-testid="debounce-value">{config.debounceMs}ms</Badge>
          </div>
          <div className="space-y-2">
            <Slider
              id="debounce-delay"
              min={0}
              max={1000}
              step={50}
              value={[config.debounceMs]}
              onValueChange={([value]) => updateDebounceDelay(value)}
              disabled={!config.enabled}
              data-testid="debounce-slider"
              aria-label="Debounce delay in milliseconds"
            />
            <p className="text-xs text-muted-foreground">
              Delay between rapid actions and database save (0-1000ms)
            </p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2" data-testid="monitored-actions-section" role="region" aria-label="Monitored actions">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monitored Actions</span>
            <Badge data-testid="actions-count">{config.actions.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {config.actions.map((action) => (
              <Badge key={action} variant="outline" className="text-xs font-mono" data-testid={`action-badge-${action.split('/').pop()}`}>
                {action.split('/').pop()}
              </Badge>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 space-y-2" data-testid="retry-settings-section" role="region" aria-label="Retry settings">
          <div className="text-sm font-medium">Retry Settings</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div data-testid="retry-on-failure-stat">
              <div className="text-muted-foreground">Retry on Failure</div>
              <div className="font-medium" aria-label={`Retry on failure: ${config.retryOnFailure ? 'Yes' : 'No'}`}>{config.retryOnFailure ? 'Yes' : 'No'}</div>
            </div>
            <div data-testid="max-retries-stat">
              <div className="text-muted-foreground">Max Retries</div>
              <div className="font-medium" aria-label={`Maximum retries: ${config.maxRetries}`}>{config.maxRetries}</div>
            </div>
            <div className="col-span-2" data-testid="retry-delay-stat">
              <div className="text-muted-foreground">Retry Delay</div>
              <div className="font-medium" aria-label={`Retry delay: ${config.retryDelayMs}ms`}>{config.retryDelayMs}ms</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
