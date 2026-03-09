'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageLayout } from '@/app/PageLayout'
import { SnippetEditorPage } from '@/components/features/snippet-editor/SnippetEditorPage'
import { SnippetTemplate, Snippet } from '@/lib/types'
import templatesData from '@/data/templates.json'

const templates = templatesData as SnippetTemplate[]

function NewSnippetContent() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const template = templateId ? templates.find(t => t.id === templateId) : null

  const initialSnippet: Snippet | null = template
    ? {
        id: '',
        title: template.title,
        description: template.description,
        language: template.language,
        code: template.code,
        category: template.category,
        hasPreview: template.hasPreview || false,
        functionName: template.functionName,
        inputParameters: template.inputParameters,
        files: template.files,
        entryPoint: template.entryPoint,
        createdAt: 0,
        updatedAt: 0,
      }
    : null

  return <SnippetEditorPage initialSnippet={initialSnippet} />
}

export default function NewSnippetPage() {
  return (
    <PageLayout>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--mat-sys-on-surface-variant)' }}>Loading…</div>}>
        <NewSnippetContent />
      </Suspense>
    </PageLayout>
  )
}
