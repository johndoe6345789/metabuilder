'use client'

import React from 'react'
import {
  DescriptionField,
  StackSelector,
  ModelSelector,
  GenerateButton,
  ErrorMessage,
  ResultSummary,
} from './SiteGeneratorControls'
import type {
  TechStack,
  ClaudeModel,
  GenerationResult,
} from './hooks/useSiteGenerator'

interface InputPanelProps {
  description: string
  onDescriptionChange: (v: string) => void
  stack: TechStack
  onStackChange: (s: TechStack) => void
  model: ClaudeModel
  onModelChange: (m: ClaudeModel) => void
  loading: boolean
  error: string | null
  result: GenerationResult | null
  onGenerate: () => void
  onDownloadZip: () => void
}

export function SiteGeneratorInputPanel({
  description,
  onDescriptionChange,
  stack,
  onStackChange,
  model,
  onModelChange,
  loading,
  error,
  result,
  onGenerate,
  onDownloadZip,
}: InputPanelProps) {
  return (
    <div style={{
      width: '320px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <style>
        {`@keyframes spin {
          to { transform: rotate(360deg); }
        }`}
      </style>

      <DescriptionField
        value={description}
        onChange={onDescriptionChange}
      />
      <StackSelector
        stack={stack}
        onChange={onStackChange}
      />
      <ModelSelector
        model={model}
        onChange={onModelChange}
      />
      <GenerateButton
        loading={loading}
        disabled={!description.trim()}
        onClick={onGenerate}
      />
      {error && <ErrorMessage message={error} />}
      {result && (
        <ResultSummary
          result={result}
          onDownload={onDownloadZip}
        />
      )}
    </div>
  )
}
