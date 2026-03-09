import { Button } from '@metabuilder/fakemui/inputs'
import { Textarea } from '@metabuilder/fakemui/inputs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Sparkle, Terminal } from '@metabuilder/fakemui/icons'

type LogAnalyzerText = {
  title: string
  description: string
  placeholder: string
  analyzeButton: string
  clearButton: string
}

type LogAnalyzerProps = {
  logInput: string
  onLogChange: (value: string) => void
  onAnalyze: () => void
  onClear: () => void
  text: LogAnalyzerText
}

export function LogAnalyzer({ logInput, onLogChange, onAnalyze, onClear, text }: LogAnalyzerProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <div>
            <CardTitle>
              <Terminal size={20} weight="bold" />
              {text.title}
            </CardTitle>
            <CardDescription>{text.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={logInput}
          onChange={(e) => onLogChange(e.target.value)}
          placeholder={text.placeholder}
        />
        <div>
          <Button onClick={onAnalyze} size="large">
            <Sparkle size={18} weight="fill" />
            {text.analyzeButton}
          </Button>
          <Button variant="outlined" onClick={onClear} size="large">
            {text.clearButton}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
