import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Eye, LockKey } from '@/fakemui/icons'
import type { PageConfig } from '@/lib/level-types'

interface PreviewProps {
  formData: Partial<PageConfig>
}

export function Preview({ formData }: PreviewProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Route Preview</CardTitle>
        <CardDescription>Quick glance at the route details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Path</p>
          <p className="font-mono">{formData.path || '/your-path'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Title</p>
          <p className="font-semibold">{formData.title || 'Untitled Page'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Level {formData.level || 1}</Badge>
          <Badge variant="secondary">{formData.requiredRole || 'public'}</Badge>
          {formData.requiresAuth ? (
            <LockKey className="text-orange-500" weight="fill" />
          ) : (
            <Eye className="text-green-500" weight="fill" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
