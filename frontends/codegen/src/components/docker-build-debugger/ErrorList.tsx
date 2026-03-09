import { Badge } from '@metabuilder/fakemui/data-display'
import { Button } from '@metabuilder/fakemui/inputs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Separator } from '@metabuilder/fakemui/data-display'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSolutionsForError } from '@/lib/docker-parser'
import { DockerError } from '@/types/docker'
import { CheckCircle, Code, Copy, Warning } from '@metabuilder/fakemui/icons'
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
        >
          {errors.map((error, index) => (
            <Card key={error.id}>
              <CardHeader>
                <div>
                  <div>
                    <div>
                      <Warning size={24} weight="fill" />
                      <CardTitle>
                        {text.title.replace('{{index}}', String(index + 1))}
                      </CardTitle>
                      <Badge>
                        {error.type}
                      </Badge>
                      {error.exitCode && (
                        <Badge>
                          {text.exitCodeLabel} {error.exitCode}
                        </Badge>
                      )}
                      {error.stage && (
                        <Badge>
                          {error.stage}
                        </Badge>
                      )}
                    </div>
                    <p>{error.message}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error.context.length > 0 && (
                  <div>
                    <h4>
                      <Code size={16} weight="bold" />
                      {text.contextTitle}
                    </h4>
                    <ScrollArea className="h-32">
                      <pre>
                        {error.context.join('\n')}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
                <Separator />
                <div>
                  <h4>
                    <CheckCircle size={20} weight="bold" />
                    {text.solutionsTitle}
                  </h4>
                  <div>
                    {getSolutionsForError(error).map((solution, sIndex) => (
                      <motion.div
                        key={sIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sIndex * 0.1 }}
                      >
                        <Card>
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
                                {solution.codeLanguage && (
                                  <p>
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
