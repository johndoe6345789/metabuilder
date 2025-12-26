import { Button } from '@/components/ui'
import { ScrollArea } from '@/components/ui'

interface NerdModeConsolePanelProps {
  consoleOutput: string[]
  onClear: () => void
}

export function NerdModeConsolePanel({ consoleOutput, onClear }: NerdModeConsolePanelProps) {
  return (
    <div className="h-[calc(100%-40px)] m-0 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Console Output</h3>
        <Button size="sm" variant="outline" onClick={onClear}>
          Clear
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="font-mono text-xs bg-black/50 rounded p-3 space-y-1">
          {consoleOutput.length === 0 ? (
            <div className="text-muted-foreground">No output yet</div>
          ) : (
            consoleOutput.map((line, i) => (
              <div key={i} className="text-white">
                {line}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
