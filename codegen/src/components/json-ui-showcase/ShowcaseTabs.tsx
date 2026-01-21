import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { JSONUIPage } from '@/components/JSONUIPage'
import { Eye, Code } from '@phosphor-icons/react'
import { ShowcaseExample, ShowcaseTabsCopy } from './types'

interface ShowcaseTabsProps {
  examples: ShowcaseExample[]
  copy: ShowcaseTabsCopy
  selectedExample: string
  onSelectedExampleChange: (value: string) => void
  showJSON: boolean
  onShowJSONChange: (value: boolean) => void
}

export function ShowcaseTabs({
  examples,
  copy,
  selectedExample,
  onSelectedExampleChange,
  showJSON,
  onShowJSONChange,
}: ShowcaseTabsProps) {
  return (
    <Tabs
      value={selectedExample}
      onValueChange={onSelectedExampleChange}
      className="h-full flex flex-col"
    >
      <div className="border-b border-border bg-muted/30 px-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-transparent border-0">
            {examples.map((example) => {
              const Icon = example.icon
              return (
                <TabsTrigger key={example.key} value={example.key} className="gap-2">
                  <Icon size={16} />
                  {example.name}
                </TabsTrigger>
              )
            })}
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowJSONChange(!showJSON)}
            className="gap-2"
          >
            {showJSON ? <Eye size={16} /> : <Code size={16} />}
            {showJSON ? copy.showPreviewLabel : copy.showJsonLabel}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {examples.map((example) => (
          <TabsContent key={example.key} value={example.key} className="h-full m-0">
            {showJSON ? (
              <div className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{copy.jsonTitle}</CardTitle>
                    <CardDescription>{example.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-[600px]">
                      <code>{JSON.stringify(example.config, null, 2)}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <JSONUIPage jsonConfig={example.config} />
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
