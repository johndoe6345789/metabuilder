'use client'

import { type ReactNode } from 'react'

export interface MarkdownDisplayProps {
  /** Markdown content to render */
  content: string
  /** Custom className for container */
  className?: string
  /** Aria label for the region */
  ariaLabel?: string
  /** Disable animations */
  disableAnimations?: boolean
  /** Custom wrapper for container */
  wrapper?: 'div' | 'article' | 'section'
  /** Test ID for testing */
  testId?: string
}

/**
 * Simple markdown display component that renders basic markdown syntax.
 * Supports headings, lists, and paragraphs.
 *
 * @example
 * ```tsx
 * <MarkdownDisplay
 *   content="## Title\n\n1. First item\n2. Second item\n\n- Bullet point"
 *   ariaLabel="Document content"
 * />
 * ```
 */
export function MarkdownDisplay({
  content,
  className = '',
  ariaLabel = 'Content',
  disableAnimations = false,
  wrapper: Wrapper = 'div',
  testId,
}: MarkdownDisplayProps) {
  const renderLine = (line: string, idx: number): ReactNode => {
    if (line.startsWith('###')) {
      return (
        <h3 key={idx} className="text-base font-semibold text-foreground mt-4 mb-2">
          {line.replace('###', '').trim()}
        </h3>
      )
    }
    if (line.startsWith('##')) {
      return (
        <h2 key={idx} className="text-lg font-semibold text-foreground mt-4 mb-2">
          {line.replace('##', '').trim()}
        </h2>
      )
    }
    if (line.startsWith('#')) {
      return (
        <h1 key={idx} className="text-xl font-bold text-foreground mt-4 mb-2">
          {line.replace('#', '').trim()}
        </h1>
      )
    }
    if (line.match(/^\d+\./)) {
      return (
        <div key={idx} className="text-foreground/90 ml-2">
          {line}
        </div>
      )
    }
    if (line.startsWith('-') || line.startsWith('*')) {
      return (
        <div key={idx} className="text-foreground/90 ml-4">
          {line}
        </div>
      )
    }
    if (line.trim()) {
      return (
        <p key={idx} className="text-foreground/80 text-sm leading-relaxed">
          {line}
        </p>
      )
    }
    return null
  }

  return (
    <Wrapper
      className={`prose prose-invert prose-sm max-w-none ${disableAnimations ? '' : 'animate-fadeIn'} ${className}`}
      data-testid={testId ?? "markdown-display"}
      role="region"
      aria-label={ariaLabel}
    >
      <div className="bg-card/50 rounded-lg p-4 border border-border space-y-3">
        {content.split('\n').map(renderLine)}
      </div>
    </Wrapper>
  )
}
