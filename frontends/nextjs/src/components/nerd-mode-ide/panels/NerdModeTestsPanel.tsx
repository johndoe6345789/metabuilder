import ScienceIcon from '@mui/icons-material/Science'

import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { ScrollArea } from '@/components/ui'

import type { TestResult } from './types'

interface NerdModeTestsPanelProps {
  testResults: TestResult[]
  onRunTests: () => void
}

export function NerdModeTestsPanel({ testResults, onRunTests }: NerdModeTestsPanelProps) {
  return (
    <div className="h-[calc(100%-40px)] m-0 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Test Suite</h3>
        <Button size="sm" onClick={onRunTests}>
          <ScienceIcon className="mr-2" fontSize="small" />
          Run Tests
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="space-y-2">
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ScienceIcon fontSize="large" className="mx-auto mb-2 opacity-50" />
              <p>No tests run yet</p>
            </div>
          ) : (
            testResults.map((test, i) => (
              <Card key={i}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={test.status === 'passed' ? 'default' : 'destructive'}>
                      {test.status}
                    </Badge>
                    <span className="text-sm">{test.name}</span>
                  </div>
                  {test.duration && (
                    <span className="text-xs text-muted-foreground">{test.duration}ms</span>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
