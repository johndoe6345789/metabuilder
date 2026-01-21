import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch } from '@/store/hooks'
import { createSnippet } from '@/store/slices/snippetsSlice'
import { FloppyDisk, Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function PersistenceExample() {
  const dispatch = useAppDispatch()
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')

  const handleCreate = () => {
    if (!title || !code) {
      toast.error('Please enter both title and code')
      return
    }

    dispatch(createSnippet({
      title,
      code,
      language: 'JavaScript',
      category: 'Example',
      description: 'Created via persistence example',
    }))

    toast.success('Snippet created and auto-saved to database!')
    setTitle('')
    setCode('')
  }

  return (
    <Card data-testid="persistence-example">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center" aria-hidden="true">
            <FloppyDisk className="h-5 w-5 text-accent" weight="duotone" />
          </div>
          <div>
            <CardTitle>Auto-Persistence Example</CardTitle>
            <CardDescription>
              Create a snippet and watch it automatically save to the database
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2" data-testid="title-field">
          <Label htmlFor="example-title">Snippet Title</Label>
          <Input
            id="example-title"
            placeholder="My Awesome Snippet"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="title-input"
            aria-label="Snippet title"
          />
        </div>

        <div className="space-y-2" data-testid="code-field">
          <Label htmlFor="example-code">Code</Label>
          <textarea
            id="example-code"
            placeholder="console.log('Hello World')"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-y font-mono"
            data-testid="code-textarea"
            aria-label="Code snippet content"
          />
        </div>

        <Button onClick={handleCreate} className="w-full gap-2" data-testid="create-snippet-button" aria-label="Create snippet and auto-save to database">
          <Plus weight="bold" size={16} aria-hidden="true" />
          Create Snippet (Auto-Saves)
        </Button>

        <div className="pt-4 border-t space-y-2" data-testid="how-it-works-section" role="region" aria-label="How persistence works">
          <div className="text-sm font-medium">How It Works</div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside" data-testid="workflow-list">
            <li data-testid="step-1">Click "Create Snippet" to dispatch a Redux action</li>
            <li data-testid="step-2">Persistence middleware intercepts the action</li>
            <li data-testid="step-3">Database save happens automatically (100ms debounce)</li>
            <li data-testid="step-4">Check console for: <code className="text-xs bg-muted px-1 py-0.5 rounded">[Redux Persistence] State synced to database</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
