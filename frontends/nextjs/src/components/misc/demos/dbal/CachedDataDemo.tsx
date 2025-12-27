import { useState } from 'react'
import { Badge, Button, Input, Label } from '@/components/ui'
import { useCachedData } from '@/hooks/useDBAL'
import { DemoCard } from './dbalUtils'
import { toast } from 'sonner'

interface UserPreferences {
  theme: string
  language: string
  notifications: boolean
}

export const CachedDataDemo = () => {

  const { data, loading, error, save, clear, isReady } = useCachedData<UserPreferences>(
    'user-preferences'
  )

  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('en')
  const [notifications, setNotifications] = useState(true)

  const handleSave = async () => {
    try {
      await save({ theme, language, notifications }, 3600)
      toast.success('Preferences saved')
    } catch (error) {
      console.error('Save Error:', error)
    }
  }

  const handleClear = async () => {
    try {
      await clear()
      toast.success('Cache cleared')
    } catch (error) {
      console.error('Clear Error:', error)
    }
  }

  return (
    <DemoCard title="Cached Data Hook" description="Automatic caching with React hooks">
      {loading && <Badge variant="outline">Loading cached data...</Badge>}
      {error && <Badge variant="destructive">Error: {error}</Badge>}

      {data && (
        <div className="p-3 bg-muted rounded-md space-y-1">
          <p className="text-sm font-medium">Cached Preferences:</p>
          <p className="text-sm font-mono">Theme: {data.theme}</p>
          <p className="text-sm font-mono">Language: {data.language}</p>
          <p className="text-sm font-mono">Notifications: {data.notifications ? 'On' : 'Off'}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Input
          id="theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="dark"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Input
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="en"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="notifications"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
          className="w-4 h-4"
        />
        <Label htmlFor="notifications">Enable Notifications</Label>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!isReady}>
          Save to Cache
        </Button>
        <Button onClick={handleClear} variant="destructive" disabled={!isReady}>
          Clear Cache
        </Button>
      </div>
    </DemoCard>
  )
}
