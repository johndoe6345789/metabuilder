import { Badge } from '@metabuilder/fakemui/data-display'
import { Button } from '@metabuilder/fakemui/inputs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Separator } from '@metabuilder/fakemui/data-display'
import { ScrollArea } from '@/components/ui/scroll-area'
import { KnowledgeBaseItem } from '@/types/docker'
import { CheckCircle, Copy } from '@metabuilder/fakemui/icons'
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(event) => event.stopPropagation()}
          >
            <Card>
              <CardHeader>
                <div>
                  <div>
                    <div>
                      <Badge>{item.category}</Badge>
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                    <p>
                      {text.patternLabel} {item.pattern}
                    </p>
                  </div>
                  <Button variant="text" size="small" onClick={onClose}>
                    {text.closeButton}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4>{text.explanationTitle}</h4>
                  <p>{item.explanation}</p>
                </div>

                <Separator />

                <div>
                  <h4>
                    <CheckCircle size={18} weight="bold" />
                    {text.solutionsTitle}
                  </h4>
                  <div>
                    {item.solutions.map((solution, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>
                            {solution.title}
                          </CardTitle>
                          <CardDescription>{solution.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div>
                            <h5>{commonText.stepsLabel}</h5>
                            <ol>
                              {solution.steps.map((step, stepIndex) => (
                                <li key={stepIndex}>{step}</li>
                              ))}
                            </ol>
                          </div>
                          {solution.code && (
                            <div>
                              <div>
                                <h5>{commonText.codeLabel}</h5>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => onCopy(solution.code!, commonText.codeCopyLabel)}
                                >
                                  <Copy size={14} />
                                  {commonText.copyButton}
                                </Button>
                              </div>
                              <ScrollArea className="max-h-48">
                                <pre>
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
