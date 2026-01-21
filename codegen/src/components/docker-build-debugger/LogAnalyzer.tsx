import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Sparkle, Terminal } from '@phosphor-icons/react'

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
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal size={20} weight="bold" className="text-primary" />
              {text.title}
            </CardTitle>
            <CardDescription>{text.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={logInput}
          onChange={(e) => onLogChange(e.target.value)}
          placeholder={text.placeholder}
          className="min-h-[300px] font-mono text-sm bg-secondary/50 border-border/50 focus:border-accent/50 focus:ring-accent/20"
        />
        <div className="flex gap-3">
          <Button onClick={onAnalyze} className="gap-2" size="lg">
            <Sparkle size={18} weight="fill" />
            {text.analyzeButton}
          </Button>
          <Button variant="outline" onClick={onClear} size="lg">
            {text.clearButton}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
