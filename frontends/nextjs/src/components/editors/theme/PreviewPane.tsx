import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'

export function PreviewPane() {
  return (
    <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
      <h4 className="text-sm font-semibold mb-3">Theme Preview</h4>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button size="sm">Primary Button</Button>
          <Button size="sm" variant="secondary">
            Secondary
          </Button>
          <Button size="sm" variant="outline">
            Outline
          </Button>
          <Button size="sm" variant="destructive">
            Destructive
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Card Example</CardTitle>
            <CardDescription>This is a card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Card content with muted text</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
