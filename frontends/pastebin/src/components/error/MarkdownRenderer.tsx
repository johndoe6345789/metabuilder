import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import styles from './markdown-renderer.module.scss'

interface MarkdownRendererProps {
  content: string
  animate?: boolean
}

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = []
  const regex = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const m = match[0]
    if (m.startsWith('`')) {
      parts.push(<code key={key++} className={styles.inlineCode}>{m.slice(1, -1)}</code>)
    } else if (m.startsWith('**')) {
      parts.push(<strong key={key++}>{m.slice(2, -2)}</strong>)
    } else if (m.startsWith('*')) {
      parts.push(<em key={key++}>{m.slice(1, -1)}</em>)
    }
    last = match.index + m.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 ? parts[0] : parts
}

type Block =
  | { kind: 'fence'; lang: string; code: string }
  | { kind: 'line'; text: string }

function parseBlocks(content: string): Block[] {
  const lines = content.split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const fence = lines[i].match(/^```(\w*)/)
    if (fence) {
      const lang = fence[1]
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push({ kind: 'fence', lang, code: codeLines.join('\n') })
      i++
    } else {
      blocks.push({ kind: 'line', text: lines[i] })
      i++
    }
  }
  return blocks
}

function renderBlock(block: Block, idx: number): ReactNode {
  if (block.kind === 'fence') {
    return <pre key={idx} className={styles.pre}><code>{block.code}</code></pre>
  }
  const { text } = block
  if (text.startsWith('### ')) {
    return <h3 key={idx} className={styles.h3}>{renderInline(text.slice(4))}</h3>
  }
  if (text.startsWith('## ')) {
    return <h2 key={idx} className={styles.h2}>{renderInline(text.slice(3))}</h2>
  }
  if (text.match(/^\d+\./)) {
    return <div key={idx} className={styles.orderedItem}>{renderInline(text)}</div>
  }
  if (text.startsWith('- ')) {
    return <div key={idx} className={styles.listItem}>{renderInline(text.slice(2))}</div>
  }
  if (text.trim()) {
    return <p key={idx} className={styles.paragraph}>{renderInline(text)}</p>
  }
  return null
}

export function MarkdownRenderer({ content, animate = true }: MarkdownRendererProps) {
  const blocks = parseBlocks(content)
  const inner = (
    <div className={styles.card} data-testid="markdown-renderer" role="region" aria-label="Markdown content">
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  )
  if (!animate) return inner
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={styles.wrapper}
    >
      {inner}
    </motion.div>
  )
}
