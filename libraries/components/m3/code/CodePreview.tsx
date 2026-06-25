'use client'

import { type ReactNode } from 'react'

export interface CodePreviewProps {
  /** The code to display */
  code: string
  /** Whether the code is truncated */
  isTruncated?: boolean
  /** Message to show when truncated */
  truncatedMessage?: string
  /** Custom className for the container */
  className?: string
  /** Custom className for the code element */
  codeClassName?: string
  /** Children to render after the code */
  children?: ReactNode
  /** Test ID for the component */
  testId?: string
}

/**
 * Simple code preview component for displaying code snippets.
 *
 * @example
 * ```tsx
 * <CodePreview
 *   code={snippet.code}
 *   isTruncated={snippet.code.length > 500}
 *   truncatedMessage="Click to view full code"
 * />
 * ```
 */
export function CodePreview({
  code,
  isTruncated = false,
  truncatedMessage = 'Click to view full code',
  className = '',
  codeClassName = '',
  children,
  testId,
}: CodePreviewProps) {
  return (
    <div
      className={`rounded-md bg-secondary/30 p-3 border border-border ${className}`}
      data-testid={testId ?? "code-preview"}
      role="region"
      aria-label="Code preview"
    >
      <pre
        className={`text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words font-mono ${codeClassName}`}
        data-testid="code-preview-content"
      >
        {code}
      </pre>
      {isTruncated && (
        <p
          className="text-xs text-accent mt-2"
          role="status"
          data-testid="code-truncated-notice"
        >
          {truncatedMessage}
        </p>
      )}
      {children}
    </div>
  )
}
