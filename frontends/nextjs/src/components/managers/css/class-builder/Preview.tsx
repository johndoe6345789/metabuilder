import { Label } from '@/components/ui'

interface PreviewProps {
  selectedClasses: string[]
}

export function Preview({ selectedClasses }: PreviewProps) {
  return (
    <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
      <Label className="text-xs uppercase tracking-wider">Preview</Label>
      <div className="rounded-md border border-dashed bg-background p-3">
        <div className={`rounded-md p-4 transition-all ${selectedClasses.join(' ')}`}>
          <div className="text-sm font-semibold">Preview element</div>
          <div className="text-xs text-muted-foreground">
            This sample updates as you add or remove classes.
          </div>
          <div className="mt-3 inline-flex items-center rounded-md border px-3 py-1 text-xs">
            Sample button
          </div>
        </div>
      </div>
    </div>
  )
}
