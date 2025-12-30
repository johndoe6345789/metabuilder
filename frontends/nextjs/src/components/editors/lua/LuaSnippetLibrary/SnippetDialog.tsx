import { ArrowRight, Check, Code, Copy, Tag } from '@/fakemui/icons'

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Separator,
} from '@/components/ui'
import { type LuaSnippet } from '@/lib/lua-snippets'

interface SnippetDialogProps {
  snippet: LuaSnippet | null
  copiedId: string | null
  onCopy: (snippet: LuaSnippet) => void
  onInsert?: (snippet: LuaSnippet) => void
  onClose: () => void
}

export function SnippetDialog({
  snippet,
  copiedId,
  onCopy,
  onInsert,
  onClose,
}: SnippetDialogProps) {
  return (
    <Dialog open={!!snippet} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{snippet?.name}</DialogTitle>
              <DialogDescription>{snippet?.description}</DialogDescription>
            </div>
            <Badge variant="outline">{snippet?.category}</Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {snippet?.tags && snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {snippet.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  <Tag size={12} className="mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {snippet?.parameters && snippet.parameters.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Code size={16} />
                Parameters
              </h4>
              <div className="space-y-2">
                {snippet.parameters.map(param => (
                  <div key={param.name} className="bg-muted/50 rounded-lg p-3 border">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-semibold text-primary">
                        {param.name}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        {param.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{param.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3">Code</h4>
            <div className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs font-mono leading-relaxed">
                <code>{snippet?.code}</code>
              </pre>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => snippet && onCopy(snippet)}>
              {copiedId === snippet?.id ? (
                <>
                  <Check size={16} className="mr-2" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copy to Clipboard
                </>
              )}
            </Button>
            {onInsert && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => snippet && onInsert(snippet)}
              >
                <ArrowRight size={16} className="mr-2" />
                Insert into Editor
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
