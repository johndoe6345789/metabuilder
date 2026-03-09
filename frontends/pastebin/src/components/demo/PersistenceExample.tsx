import { useState } from 'react'
import { FloppyDisk, Plus } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader } from '@metabuilder/components/fakemui'
import { FormLabel } from '@metabuilder/components/fakemui'
import { Button } from '@metabuilder/components/fakemui'
import { Input } from '@metabuilder/components/fakemui'
import { useAppDispatch } from '@/store/hooks'
import { createSnippet } from '@/store/slices/snippetsSlice'
import { toast } from 'sonner'
import styles from './PersistenceExample.module.scss'

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
      <CardHeader
        title={
          <div className={styles.headerRow}>
            <div className={`${styles.iconWrap} h-10 w-10`} aria-hidden="true">
              <FloppyDisk size={20} className={styles.headerIcon} />
            </div>
            <div>
              <h3 style={{ fontWeight: 600 }}>Auto-Persistence Example</h3>
              <p className={styles.subtitle}>
                Create a snippet and watch it automatically save to the database
              </p>
            </div>
          </div>
        }
      />
      <CardContent>
        <div className={`${styles.cardBody} space-y-4`}>
          <div className={`${styles.field} space-y-2`} data-testid="title-field">
            <FormLabel htmlFor="example-title">Snippet Title</FormLabel>
            <Input
              id="example-title"
              placeholder="My Awesome Snippet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="title-input"
              aria-label="Snippet title"
            />
          </div>

          <div className={`${styles.field} space-y-2`} data-testid="code-field">
            <FormLabel htmlFor="example-code">Code</FormLabel>
            <textarea
              id="example-code"
              placeholder="console.log('Hello World')"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[100px] resize-y font-mono px-3 py-2 border border-input bg-background rounded-md text-sm w-full"
              data-testid="code-textarea"
              aria-label="Code snippet content"
            />
          </div>

          <Button onClick={handleCreate} className={`${styles.fullWidthBtn} w-full gap-2`} data-testid="create-snippet-button" aria-label="Create snippet and auto-save to database">
            <Plus size={16} aria-hidden="true" />
            Create Snippet (Auto-Saves)
          </Button>

          <div className={`${styles.howItWorks} pt-4 border-t`} data-testid="how-it-works-section" role="region" aria-label="How persistence works">
            <div className={styles.howTitle}>How It Works</div>
            <ul className={`${styles.stepList} list-disc list-inside text-muted-foreground`} data-testid="workflow-list">
              <li data-testid="step-1">Click &ldquo;Create Snippet&rdquo; to dispatch a Redux action</li>
              <li data-testid="step-2">Persistence middleware intercepts the action</li>
              <li data-testid="step-3">Database save happens automatically (100ms debounce)</li>
              <li data-testid="step-4">Check console for: <code className={styles.inlineCode}>[Redux Persistence] State synced to database</code></li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
