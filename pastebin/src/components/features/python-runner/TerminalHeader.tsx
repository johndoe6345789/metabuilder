import { Play, CircleNotch, Terminal as TerminalIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface TerminalHeaderProps {
  onRun: () => void
  isRunning: boolean
  isInitializing: boolean
  waitingForInput: boolean
}

export function TerminalHeader({ 
  onRun, 
  isRunning, 
  isInitializing, 
  waitingForInput 
}: TerminalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30" data-testid="terminal-header">
      <div className="flex items-center gap-2">
        <TerminalIcon size={18} weight="bold" className="text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">Python Terminal</h3>
      </div>
      <Button
        onClick={onRun}
        disabled={isRunning || isInitializing || waitingForInput}
        size="sm"
        className="gap-2"
        data-testid="run-python-btn"
        aria-label={isRunning ? 'Running code' : isInitializing ? 'Loading terminal' : 'Run Python code'}
        aria-busy={isRunning || isInitializing}
      >
        {isRunning || isInitializing ? (
          <>
            <CircleNotch className="animate-spin" size={16} aria-hidden="true" />
            {isInitializing ? 'Loading...' : 'Running...'}
          </>
        ) : (
          <>
            <Play size={16} weight="fill" aria-hidden="true" />
            Run
          </>
        )}
      </Button>
    </div>
  )
}
