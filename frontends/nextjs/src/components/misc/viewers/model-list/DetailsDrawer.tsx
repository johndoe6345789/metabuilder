import {
  Badge,
  Button,
  ScrollArea,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui'
import type { ModelSchema } from '@/lib/schema-types'
import { getFieldLabel } from '@/lib/schema-utils'

interface DetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: any | null
  model: ModelSchema
}

export function DetailsDrawer({ open, onOpenChange, record, model }: DetailsDrawerProps) {
  const renderValue = (fieldName: string) => {
    const field = model.fields.find(item => item.name === fieldName)
    if (!field) return null
    const value = record?.[fieldName]

    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground">Not provided</span>
    }

    switch (field.type) {
      case 'boolean':
        return value ? (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
            Yes
          </Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        )
      case 'date':
      case 'datetime':
        return new Date(value).toLocaleString()
      case 'json':
        return (
          <pre className="whitespace-pre-wrap rounded-md bg-muted/60 p-3 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        )
      default:
        return <span className="font-medium text-foreground">{String(value)}</span>
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{model.label || model.name} details</SheetTitle>
          <SheetDescription>Review the full record and its attributes.</SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-4">
            {model.fields.map(field => (
              <div key={field.name} className="rounded-lg border bg-muted/40 p-3">
                <p className="text-xs uppercase text-muted-foreground">{getFieldLabel(field)}</p>
                <div className="mt-1 text-sm">{renderValue(field.name)}</div>
                {field.helpText && (
                  <p className="mt-1 text-xs text-muted-foreground">{field.helpText}</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
