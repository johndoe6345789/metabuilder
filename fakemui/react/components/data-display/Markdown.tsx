import React from 'react'

export interface MarkdownProps extends React.HTMLAttributes<HTMLDivElement> {
  content?: string
  children?: string
  className?: string
}

/**
 * Markdown renderer component
 * Renders markdown content as HTML
 * Uses the 'marked' library when available
 */
export const Markdown: React.FC<MarkdownProps> = ({
  content,
  children,
  className = '',
  ...props
}) => {
  const markdownContent = content || children || ''
  
  // Simple markdown to HTML conversion for basic cases
  // In production, use 'marked' library
  const renderMarkdown = (md: string): string => {
    return md
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br />')
  }
  
  return (
    <div
      className={`markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdownContent) }}
      {...props}
    />
  )
}

export default Markdown
