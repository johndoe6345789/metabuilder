import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { Card, CardContent } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { Button } from '@/components/ui'
import type { PackageTemplate } from '@/lib/nerd-mode-ide'

interface TemplateDialogProps {
  open: boolean
  templates: PackageTemplate[]
  onSelectTemplate: (templateId: string) => void
  onClose: () => void
}

export function TemplateDialog({ open, templates, onSelectTemplate, onClose }: TemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start from a template</DialogTitle>
          <DialogDescription>
            Pick a package blueprint or a Next.js starter and load it into the IDE.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id} className="border">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <AutoAwesomeIcon fontSize="small" />
                    {template.name}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  {template.tags && template.tags.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {template.tags.join(' · ')}
                    </div>
                  )}
                </div>
                <Button size="sm" onClick={() => onSelectTemplate(template.id)}>
                  Load
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
