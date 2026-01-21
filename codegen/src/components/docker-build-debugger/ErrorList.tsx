import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { getSolutionsForError } from '@/lib/docker-parser'
import { DockerError } from '@/types/docker'
import { CheckCircle, Code, Copy, Warning } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
type ErrorListProps = {
  errors: DockerError[]
  onCopy: (text: string, label: string) => void
  text: {
    title: string
    exitCodeLabel: string
    contextTitle: string
    solutionsTitle: string
  }
  commonText: {
    stepsLabel: string
    codeLabel: string
    copyButton: string
    languageLabel: string
    codeCopyLabel: string
  }
}
export function ErrorList({ errors, onCopy, text, commonText }: ErrorListProps) {
  return (
    <AnimatePresence mode="wait">
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {errors.map((error, index) => (
            <Card key={error.id} className="border-destructive/30 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Warning size={24} weight="fill" className="text-destructive animate-pulse" />
                      <CardTitle className="text-destructive">
                        {text.title.replace('{{index}}', String(index + 1))}
                      </CardTitle>
                      <Badge variant="destructive" className="font-mono">
                        {error.type}
                      </Badge>
                      {error.exitCode && (
                        <Badge variant="outline" className="font-mono">
                          {text.exitCodeLabel} {error.exitCode}
                        </Badge>
                      )}
                      {error.stage && (
                        <Badge variant="secondary" className="font-mono">
                          {error.stage}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{error.message}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {error.context.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Code size={16} weight="bold" />
                      {text.contextTitle}
                    </h4>
                    <ScrollArea className="h-32 rounded-md border border-border/50 bg-secondary/50 p-3">
                      <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                        {error.context.join('\n')}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
                <Separator />
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle size={20} weight="bold" className="text-accent" />
                    {text.solutionsTitle}
                  </h4>
                  <div className="space-y-4">
                    {getSolutionsForError(error).map((solution, sIndex) => (
                      <motion.div
                        key={sIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sIndex * 0.1 }}
                      >
                        <Card className="bg-secondary/30 border-accent/20">
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
                                {solution.codeLanguage && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {commonText.languageLabel} {solution.codeLanguage}
                                  </p>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
