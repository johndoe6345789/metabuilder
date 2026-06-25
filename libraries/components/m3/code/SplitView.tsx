'use client'

import { useState, type ReactNode } from 'react'
import { Button } from '../inputs/Button'

export type ViewMode = 'split' | 'left' | 'right'

export interface SplitViewProps {
  /** Left panel content */
  leftPanel: ReactNode
  /** Right panel content */
  rightPanel: ReactNode
  /** Height of the split view (CSS value) */
  height?: string
  /** Initial view mode */
  defaultMode?: ViewMode
  /** Left panel label for accessibility */
  leftLabel?: string
  /** Right panel label for accessibility */
  rightLabel?: string
  /** Left button label */
  leftButtonLabel?: string
  /** Right button label */
  rightButtonLabel?: string
  /** Split button label */
  splitButtonLabel?: string
  /** Custom left icon */
  leftIcon?: ReactNode
  /** Custom right icon */
  rightIcon?: ReactNode
  /** Custom split icon */
  splitIcon?: ReactNode
  /** Controlled mode value */
  mode?: ViewMode
  /** Controlled mode change handler */
  onModeChange?: (mode: ViewMode) => void
  /** Hide the mode selector buttons */
  hideControls?: boolean
  /** Custom className for container */
  className?: string
  /** Test ID for the component */
  testId?: string
}

/**
 * Generic split view component for displaying two panels side by side,
 * with controls to switch between split, left-only, and right-only views.
 *
 * @example
 * ```tsx
 * <SplitView
 *   leftPanel={<CodeEditor value={code} onChange={setCode} />}
 *   rightPanel={<Preview code={code} />}
 *   leftLabel="Code Editor"
 *   rightLabel="Preview"
 *   height="500px"
 * />
 * ```
 */
export function SplitView({
  leftPanel,
  rightPanel,
  height = '500px',
  defaultMode = 'split',
  leftLabel = 'Left panel',
  rightLabel = 'Right panel',
  leftButtonLabel = 'Left',
  rightButtonLabel = 'Right',
  splitButtonLabel = 'Split',
  leftIcon,
  rightIcon,
  splitIcon,
  mode: controlledMode,
  onModeChange,
  hideControls = false,
  className = '',
  testId,
}: SplitViewProps) {
  const [internalMode, setInternalMode] = useState<ViewMode>(defaultMode)

  const mode = controlledMode ?? internalMode
  const setMode = (newMode: ViewMode) => {
    if (onModeChange) {
      onModeChange(newMode)
    } else {
      setInternalMode(newMode)
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`} data-testid={testId ?? "split-view"}>
      {!hideControls && (
        <div className="flex items-center justify-end">
          <div
            className="flex items-center gap-1 p-1 rounded-md"
            style={{ backgroundColor: 'var(--mat-sys-surface-variant, hsl(var(--muted)))' }}
            role="group"
            aria-label="View mode selector"
          >
            <Button
              variant={mode === 'left' ? 'filled' : 'text'}
              size="sm"
              onClick={() => setMode('left')}
              className="flex items-center gap-2 h-8"
              data-testid="view-mode-left-btn"
              aria-label={`Show ${leftLabel} only`}
              aria-pressed={mode === 'left'}
            >
              {leftIcon}
              <span className="hidden sm:inline">{leftButtonLabel}</span>
            </Button>
            <Button
              variant={mode === 'split' ? 'filled' : 'text'}
              size="sm"
              onClick={() => setMode('split')}
              className="flex items-center gap-2 h-8"
              data-testid="view-mode-split-btn"
              aria-label={`Show ${leftLabel} and ${rightLabel} side by side`}
              aria-pressed={mode === 'split'}
            >
              {splitIcon}
              <span className="hidden sm:inline">{splitButtonLabel}</span>
            </Button>
            <Button
              variant={mode === 'right' ? 'filled' : 'text'}
              size="sm"
              onClick={() => setMode('right')}
              className="flex items-center gap-2 h-8"
              data-testid="view-mode-right-btn"
              aria-label={`Show ${rightLabel} only`}
              aria-pressed={mode === 'right'}
            >
              {rightIcon}
              <span className="hidden sm:inline">{rightButtonLabel}</span>
            </Button>
          </div>
        </div>
      )}

      <div
        className="rounded-md overflow-hidden border"
        style={{
          height,
          borderColor: 'var(--mat-sys-outline-variant, hsl(var(--border)))',
          backgroundColor: 'var(--mat-sys-surface, hsl(var(--background)))',
        }}
        data-testid={`split-view-${mode}`}
        role="region"
        aria-label={
          mode === 'left'
            ? leftLabel
            : mode === 'right'
            ? rightLabel
            : `${leftLabel} and ${rightLabel}`
        }
      >
        {mode === 'left' && leftPanel}

        {mode === 'right' && rightPanel}

        {mode === 'split' && (
          <div
            className="grid grid-cols-2 h-full"
            style={{ gap: '1px', backgroundColor: 'var(--mat-sys-outline-variant, hsl(var(--border)))' }}
            data-testid="split-view-grid"
          >
            <div
              className="overflow-auto"
              style={{ backgroundColor: 'var(--mat-sys-surface, hsl(var(--background)))' }}
              data-testid="split-view-left-pane"
            >
              {leftPanel}
            </div>
            <div
              className="overflow-auto"
              style={{ backgroundColor: 'var(--mat-sys-surface, hsl(var(--background)))' }}
              data-testid="split-view-right-pane"
            >
              {rightPanel}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
