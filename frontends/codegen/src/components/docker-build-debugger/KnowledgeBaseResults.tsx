import { Alert } from '@metabuilder/fakemui/feedback'
import { Badge } from '@metabuilder/fakemui/data-display'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
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
    <div>
      <div>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              onClick={() => onSelect(item)}
            >
              <CardHeader>
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <Badge>
                    {item.category}
                  </Badge>
                </div>
                <CardDescription>
                  {item.pattern}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{item.explanation}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && (
        <Alert>
          {text.noResults.replace('{{query}}', searchQuery)}
        </Alert>
      )}
    </div>
  )
}
