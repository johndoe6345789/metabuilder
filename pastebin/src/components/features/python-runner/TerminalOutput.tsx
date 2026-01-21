import { motion } from 'framer-motion'

interface TerminalLine {
  type: 'output' | 'error' | 'input-prompt' | 'input-value'
  content: string
  id: string
}

interface TerminalOutputProps {
  lines: TerminalLine[]
  isRunning: boolean
}

export function TerminalOutput({ lines, isRunning }: TerminalOutputProps) {
  if (lines.length === 0 && !isRunning) {
    return (
      <div
        className="flex items-center justify-center h-full text-muted-foreground"
        data-testid="terminal-empty-state"
        role="status"
        aria-live="polite"
        aria-label="Terminal output area"
      >
        Click "Run" to execute the Python code
      </div>
    )
  }

  // Check if there are any error lines
  const hasErrors = lines.some((line) => line.type === 'error')
  const lastErrorLine = lines.findLast((line) => line.type === 'error')

  return (
    <div
      className="space-y-1"
      data-testid="terminal-output-content"
      aria-label="Terminal output area"
      role="log"
    >
      {/* Aria-live region for error announcements */}
      {hasErrors && (
        <div
          className="sr-only"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-testid="terminal-error-alert"
        >
          Error: {lastErrorLine?.content}
        </div>
      )}

      {lines.map((line) => (
        <motion.div
          key={line.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="leading-relaxed"
          role={line.type === 'error' ? 'alert' : 'status'}
          aria-live={line.type === 'error' ? 'assertive' : 'off'}
        >
          {line.type === 'output' && (
            <div className="text-foreground whitespace-pre-wrap">{line.content}</div>
          )}
          {line.type === 'error' && (
            <div className="text-destructive whitespace-pre-wrap" aria-label={`Error: ${line.content}`}>
              {line.content}
            </div>
          )}
          {line.type === 'input-prompt' && (
            <div className="text-accent font-medium whitespace-pre-wrap">{line.content}</div>
          )}
          {line.type === 'input-value' && (
            <div className="text-primary whitespace-pre-wrap">{'> ' + line.content}</div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
