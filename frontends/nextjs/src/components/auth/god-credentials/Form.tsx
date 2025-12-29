import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'

export interface GodCredentialsFormProps {
  duration: number
  unit: 'minutes' | 'hours'
  onDurationChange: (value: number) => void
  onUnitChange: (unit: 'minutes' | 'hours') => void
  onSave: () => void
  onResetExpiry: () => void
  onClearExpiry: () => void
}

export function GodCredentialsForm({
  duration,
  unit,
  onDurationChange,
  onUnitChange,
  onSave,
  onResetExpiry,
  onClearExpiry,
}: GodCredentialsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Expiry Duration</Label>
          <div className="flex gap-2">
            <Input
              id="duration"
              type="number"
              min="1"
              max={unit === 'hours' ? '24' : '1440'}
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className="flex-1"
            />
            <Select value={unit} onValueChange={(value) => onUnitChange(value as 'minutes' | 'hours')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Set the duration for how long credentials are visible (1 minute to 24 hours)
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onSave} className="flex-1">
            Save Duration
          </Button>
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="space-y-2">
          <Label>Expiry Management</Label>
          <p className="text-xs text-muted-foreground">
            Reset or clear the current expiry timer
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onResetExpiry} variant="outline" className="flex-1">
            Reset Timer
          </Button>
          <Button onClick={onClearExpiry} variant="outline" className="flex-1">
            Clear Expiry
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          <strong>Reset Timer:</strong> Restart the countdown using the configured duration<br />
          <strong>Clear Expiry:</strong> Remove expiry time (credentials will show on next page load)
        </p>
      </div>
    </div>
  )
}
