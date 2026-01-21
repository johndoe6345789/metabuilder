import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, ArrowSquareOut } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPreviewUrlChange?: (url: string) => void
}

export function PreviewDialog({ open, onOpenChange, onPreviewUrlChange }: PreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (open) {
      const currentUrl = window.location.href
      const url = new URL(currentUrl)
      url.searchParams.set('preview', 'true')
      const nextUrl = url.toString()
      setPreviewUrl(nextUrl)
      onPreviewUrlChange?.(nextUrl)
      return
    }
    setPreviewUrl('')
    onPreviewUrlChange?.('')
  }, [open, onPreviewUrlChange])

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-semibold">Preview</DialogTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="gap-2"
            >
              <ArrowSquareOut size={16} />
              Open in New Tab
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 w-full h-full overflow-hidden">
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-forms allow-popups allow-modals"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
