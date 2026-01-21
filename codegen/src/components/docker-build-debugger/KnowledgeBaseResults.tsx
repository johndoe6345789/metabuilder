import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KnowledgeBaseItem } from '@/types/docker'
import { motion } from 'framer-motion'

type KnowledgeBaseResultsProps = {
  items: KnowledgeBaseItem[]
  onSelect: (item: KnowledgeBaseItem) => void
  searchQuery: string
  text: {
    noResults: string
  }
}

export function KnowledgeBaseResults({
  items,
  onSelect,
  searchQuery,
  text,
}: KnowledgeBaseResultsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all"
              onClick={() => onSelect(item)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {item.category}
                  </Badge>
                </div>
                <CardDescription className="text-xs font-mono text-muted-foreground">
                  {item.pattern}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.explanation}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && (
        <Alert>
          <AlertDescription>{text.noResults.replace('{{query}}', searchQuery)}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
