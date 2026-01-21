import { motion } from 'framer-motion'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="prose prose-invert prose-sm max-w-none"
      data-testid="markdown-renderer"
      role="region"
      aria-label="Error analysis content"
    >
      <div className="bg-card/50 rounded-lg p-4 border border-border space-y-3">
        {content.split('\n').map((line, idx) => {
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
          if (line.match(/^\d+\./)) {
            return (
              <div key={idx} className="text-foreground/90 ml-2">
                {line}
              </div>
            )
          }
          if (line.startsWith('-')) {
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
        })}
      </div>
    </motion.div>
  )
}
