import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Separator } from '@/components/ui'
import { CallSplit, CloudDownload, CloudUpload, Settings } from '@/fakemui/icons'

import type { GitConfig } from './types'

interface NerdModeGitPanelProps {
  gitConfig: GitConfig | null
  gitCommitMessage: string
  onCommitMessageChange: (value: string) => void
  onGitPush: () => void
  onGitPull: () => void
  onOpenConfig: () => void
}

export function NerdModeGitPanel({
  gitConfig,
  gitCommitMessage,
  onCommitMessageChange,
  onGitPush,
  onGitPull,
  onOpenConfig,
}: NerdModeGitPanelProps) {
  return (
    <div className="h-[calc(100%-40px)] m-0 p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Git Operations</h3>
          {gitConfig ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{gitConfig.provider}</Badge>
                <span className="text-muted-foreground">{gitConfig.repoUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <CallSplit size={14} />
                <span>{gitConfig.branch}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No Git configuration found</p>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label htmlFor="commit-message">Commit Message</Label>
            <Input
              id="commit-message"
              placeholder="Update files"
              value={gitCommitMessage}
              onChange={e => onCommitMessageChange(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={onGitPush} className="flex-1">
              <CloudUpload size={16} style={{ marginRight: 8 }} />
              Push
            </Button>
            <Button onClick={onGitPull} variant="outline" className="flex-1">
              <CloudDownload size={16} style={{ marginRight: 8 }} />
              Pull
            </Button>
          </div>

          <Button variant="outline" className="w-full" onClick={onOpenConfig}>
            <Settings size={16} style={{ marginRight: 8 }} />
            Configure Git
          </Button>
        </div>
      </div>
    </div>
  )
}
