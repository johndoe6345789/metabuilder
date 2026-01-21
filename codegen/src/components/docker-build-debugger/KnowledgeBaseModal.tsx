import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { KnowledgeBaseItem } from '@/types/docker'
import { CheckCircle, Copy } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'

type KnowledgeBaseModalProps = {
  item: KnowledgeBaseItem | null
  onClose: () => void
  onCopy: (text: string, label: string) => void
  text: {
    closeButton: string
    patternLabel: string
    explanationTitle: string
    solutionsTitle: string
  }
  commonText: {
    stepsLabel: string
    codeLabel: string
    copyButton: string
    codeCopyLabel: string
  }
}

export function KnowledgeBaseModal({
  item,
  onClose,
  onCopy,
  text,
  commonText,
}: KnowledgeBaseModalProps) {
  return (
    <AnimatePresence mode="wait">
      {item && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-auto"
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground">
                      {text.patternLabel} {item.pattern}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    {text.closeButton}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">{text.explanationTitle}</h4>
                  <p className="text-sm text-muted-foreground">{item.explanation}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle size={18} weight="bold" className="text-accent" />
                    {text.solutionsTitle}
                  </h4>
                  <div className="space-y-4">
                    {item.solutions.map((solution, index) => (
                      <Card key={index} className="bg-secondary/30 border-accent/20">
                        <CardHeader>
                          <CardTitle className="text-base text-accent">
                            {solution.title}
                          </CardTitle>
                          <CardDescription>{solution.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h5 className="text-sm font-semibold mb-2">{commonText.stepsLabel}</h5>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                              {solution.steps.map((step, stepIndex) => (
                                <li key={stepIndex}>{step}</li>
                              ))}
                            </ol>
                          </div>
                          {solution.code && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-semibold">{commonText.codeLabel}</h5>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onCopy(solution.code!, commonText.codeCopyLabel)}
                                  className="gap-2 h-7"
                                >
                                  <Copy size={14} />
                                  {commonText.copyButton}
                                </Button>
                              </div>
                              <ScrollArea className="max-h-48 rounded-md border border-border/50 bg-secondary/50 p-3">
                                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                                  {solution.code}
                                </pre>
                              </ScrollArea>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
