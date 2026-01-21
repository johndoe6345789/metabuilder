import { Database, CloudCheck } from '@phosphor-icons/react'
import { getStorageConfig } from '@/lib/storage'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function BackendIndicator() {
  const { backend } = getStorageConfig()
  const isEnvConfigured = Boolean(process.env.NEXT_PUBLIC_FLASK_BACKEND_URL)

  if (backend === 'indexeddb') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              data-testid="backend-indicator"
              className="backend-indicator disconnected flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border"
              role="status"
              aria-label="Backend connection status: Local storage"
            >
              <Database size={16} className="text-muted-foreground" aria-hidden="true" />
              <span className="text-xs font-medium text-muted-foreground">Local</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disconnected from backend - Using local storage</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            data-testid="backend-indicator"
            className="backend-indicator connected flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30"
            role="status"
            aria-label={`Backend connection status: Connected${isEnvConfigured ? ' (Auto-configured)' : ''}`}
          >
            <CloudCheck size={16} className="text-accent" weight="fill" aria-hidden="true" />
            <span className="text-xs font-medium text-accent">Connected</span>
            {isEnvConfigured && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connected to Flask Backend</p>
          {isEnvConfigured && <p className="text-xs text-muted-foreground">Auto-configured</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
