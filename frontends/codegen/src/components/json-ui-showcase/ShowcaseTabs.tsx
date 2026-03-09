import { Tabs, Tab, TabPanel } from '@metabuilder/fakemui/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Button } from '@metabuilder/fakemui/inputs'
import { JSONUIPage } from '@/components/JSONUIPage'
import { Eye, Code } from '@metabuilder/fakemui/icons'
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'color-mix(in srgb, var(--muted) 30%, transparent)',
          padding: '0 1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tabs
            value={selectedExample}
            onChange={(_e, v) => onSelectedExampleChange(v)}
          >
            {examples.map((example) => {
              const Icon = example.icon
              return (
                <Tab
                  key={example.key}
                  value={example.key}
                  icon={<Icon size={16} />}
                  label={example.name}
                  selected={selectedExample === example.key}
                  onClick={() => onSelectedExampleChange(example.key)}
                />
              )
            })}
          </Tabs>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onShowJSONChange(!showJSON)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {showJSON ? <Eye size={16} /> : <Code size={16} />}
            {showJSON ? copy.showPreviewLabel : copy.showJsonLabel}
          </Button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {examples.map((example) => (
          <TabPanel
            key={example.key}
            hidden={selectedExample !== example.key}
            style={{ height: '100%', margin: 0 }}
          >
            {showJSON ? (
              <div style={{ padding: '1.5rem' }}>
                <Card>
                  <CardHeader>
                    <CardTitle style={{ fontSize: '1.125rem' }}>{copy.jsonTitle}</CardTitle>
                    <CardDescription>{example.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre
                      style={{
                        backgroundColor: 'var(--muted)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        maxHeight: '600px',
                      }}
                    >
                      <code>{JSON.stringify(example.config, null, 2)}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <JSONUIPage jsonConfig={example.config} />
            )}
          </TabPanel>
        ))}
      </div>
    </div>
  )
}
