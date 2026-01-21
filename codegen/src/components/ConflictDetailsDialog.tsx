import { useMemo, useState } from 'react'
import { ConflictItem } from '@/types/conflicts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import conflictCopy from '@/data/conflict-resolution-copy.json'
import { Database, Cloud, ArrowsLeftRight, Clock, CheckCircle } from '@phosphor-icons/react'
import { format } from 'date-fns'

interface ConflictDetailsDialogProps {
  conflict: ConflictItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve: (conflictId: string, strategy: 'local' | 'remote' | 'merge') => void
  isResolving: boolean
}

type ConflictTab = 'local' | 'remote' | 'diff'

type ConflictDiffItem = {
  key: string
  localValue: unknown
  remoteValue: unknown
  isDifferent: boolean
  onlyInLocal: boolean
  onlyInRemote: boolean
}

const dialogCopy = conflictCopy.detailsDialog

function getConflictDiff(conflict: ConflictItem): ConflictDiffItem[] {
  const localKeys = Object.keys(conflict.localVersion)
  const remoteKeys = Object.keys(conflict.remoteVersion)
  const allKeys = Array.from(new Set([...localKeys, ...remoteKeys]))

  return allKeys.map((key) => {
    const localValue = conflict.localVersion[key]
    const remoteValue = conflict.remoteVersion[key]
    const isDifferent = JSON.stringify(localValue) !== JSON.stringify(remoteValue)
    const onlyInLocal = !(key in conflict.remoteVersion)
    const onlyInRemote = !(key in conflict.localVersion)

    return {
      key,
      localValue,
      remoteValue,
      isDifferent,
      onlyInLocal,
      onlyInRemote,
    }
  })
}

function ConflictDetailsHeader({ conflict }: { conflict: ConflictItem }) {
  return (
    <DialogHeader>
      <DialogTitle className="font-mono text-lg">{dialogCopy.title}</DialogTitle>
      <DialogDescription className="flex items-center gap-2">
        <Badge variant="outline">{conflict.entityType}</Badge>
        <span>{conflict.id}</span>
      </DialogDescription>
    </DialogHeader>
  )
}

function ConflictVersionSummary({ conflict, isLocalNewer }: { conflict: ConflictItem; isLocalNewer: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      <div className="flex items-center gap-2">
        <Database size={20} className="text-primary" />
        <div className="flex-1">
          <div className="text-sm font-medium">{dialogCopy.localVersionLabel}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} />
            {format(new Date(conflict.localTimestamp), 'PPp')}
          </div>
        </div>
        {isLocalNewer && (
          <Badge variant="secondary" className="text-xs">
            {dialogCopy.newerLabel}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Cloud size={20} className="text-accent" />
        <div className="flex-1">
          <div className="text-sm font-medium">{dialogCopy.remoteVersionLabel}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} />
            {format(new Date(conflict.remoteTimestamp), 'PPp')}
          </div>
        </div>
        {!isLocalNewer && (
          <Badge variant="secondary" className="text-xs">
            {dialogCopy.newerLabel}
          </Badge>
        )}
      </div>
    </div>
  )
}

function DiffItemCard({ item }: { item: ConflictDiffItem }) {
  return (
    <div
      key={item.key}
      className={`p-3 rounded-md border ${
        item.isDifferent
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-border bg-muted/30'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm font-medium">{item.key}</span>
        {item.isDifferent && (
          <Badge variant="destructive" className="text-xs">
            {dialogCopy.conflictBadge}
          </Badge>
        )}
        {!item.isDifferent && (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle size={12} />
            {dialogCopy.matchBadge}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div>
          <div className="text-muted-foreground mb-1">{dialogCopy.localFieldLabel}</div>
          <div className={item.onlyInLocal ? 'text-primary font-medium' : ''}>
            {item.onlyInLocal ? (
              <Badge variant="outline" className="text-xs">{dialogCopy.onlyInLocal}</Badge>
            ) : (
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(item.localValue, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div>
          <div className="text-muted-foreground mb-1">{dialogCopy.remoteFieldLabel}</div>
          <div className={item.onlyInRemote ? 'text-accent font-medium' : ''}>
            {item.onlyInRemote ? (
              <Badge variant="outline" className="text-xs">{dialogCopy.onlyInRemote}</Badge>
            ) : (
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(item.remoteValue, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DiffTabContent({ diff }: { diff: ConflictDiffItem[] }) {
  return (
    <TabsContent value="diff" className="flex-1 min-h-0">
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-2">
          {diff.map((item) => (
            <DiffItemCard key={item.key} item={item} />
          ))}
        </div>
      </ScrollArea>
    </TabsContent>
  )
}

function JsonTabContent({ value, json }: { value: ConflictTab; json: string }) {
  return (
    <TabsContent value={value} className="flex-1 min-h-0">
      <ScrollArea className="h-[400px] rounded-md border">
        <pre className="p-4 text-xs font-mono">{json}</pre>
      </ScrollArea>
    </TabsContent>
  )
}

function ResolutionFooter({
  conflict,
  isResolving,
  onOpenChange,
  onResolve,
}: {
  conflict: ConflictItem
  isResolving: boolean
  onOpenChange: (open: boolean) => void
  onResolve: (conflictId: string, strategy: 'local' | 'remote' | 'merge') => void
}) {
  return (
    <div className="flex justify-between gap-2">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        {dialogCopy.cancel}
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            onResolve(conflict.id, 'local')
            onOpenChange(false)
          }}
          disabled={isResolving}
        >
          <Database size={16} />
          {dialogCopy.keepLocal}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            onResolve(conflict.id, 'remote')
            onOpenChange(false)
          }}
          disabled={isResolving}
        >
          <Cloud size={16} />
          {dialogCopy.keepRemote}
        </Button>
        <Button
          onClick={() => {
            onResolve(conflict.id, 'merge')
            onOpenChange(false)
          }}
          disabled={isResolving}
        >
          <ArrowsLeftRight size={16} />
          {dialogCopy.mergeBoth}
        </Button>
      </div>
    </div>
  )
}

export function ConflictDetailsDialog({
  conflict,
  open,
  onOpenChange,
  onResolve,
  isResolving,
}: ConflictDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<ConflictTab>('diff')

  if (!conflict) return null

  const isLocalNewer = conflict.localTimestamp > conflict.remoteTimestamp
  const localJson = JSON.stringify(conflict.localVersion, null, 2)
  const remoteJson = JSON.stringify(conflict.remoteVersion, null, 2)

  const diff = useMemo(() => getConflictDiff(conflict), [conflict])
  const conflictingKeys = diff.filter((item) => item.isDifferent)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <ConflictDetailsHeader conflict={conflict} />

        <ConflictVersionSummary conflict={conflict} isLocalNewer={isLocalNewer} />

        <Separator />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ConflictTab)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="diff" className="gap-2">
              <ArrowsLeftRight size={16} />
              {dialogCopy.differencesLabel} ({conflictingKeys.length})
            </TabsTrigger>
            <TabsTrigger value="local" className="gap-2">
              <Database size={16} />
              {dialogCopy.localTabLabel}
            </TabsTrigger>
            <TabsTrigger value="remote" className="gap-2">
              <Cloud size={16} />
              {dialogCopy.remoteTabLabel}
            </TabsTrigger>
          </TabsList>

          <DiffTabContent diff={diff} />

          <JsonTabContent value="local" json={localJson} />

          <JsonTabContent value="remote" json={remoteJson} />
        </Tabs>

        <Separator />

        <ResolutionFooter
          conflict={conflict}
          isResolving={isResolving}
          onOpenChange={onOpenChange}
          onResolve={onResolve}
        />
      </DialogContent>
    </Dialog>
  )
}
