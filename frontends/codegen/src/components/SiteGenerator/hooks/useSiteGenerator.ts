'use client'

import { useState, useCallback } from 'react'
import JSZip from 'jszip'
import { buildPrompt } from '../prompts'

export type TechStack = 'html' | 'react' | 'nextjs'
export type ClaudeModel =
  | 'claude-sonnet'
  | 'claude-haiku'
  | 'claude-opus'

export interface GeneratedFile {
  name: string
  content: string
}

export interface GenerationResult {
  files: GeneratedFile[]
  description: string
}

export function detectLanguage(
  filename: string
): string {
  const ext =
    filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    html: 'html',
    css: 'css',
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    json: 'json',
    md: 'markdown',
  }
  return map[ext] ?? 'plaintext'
}

export function useSiteGenerator() {
  const [description, setDescription] = useState('')
  const [stack, setStack] = useState<TechStack>('html')
  const [model, setModel] =
    useState<ClaudeModel>('claude-sonnet')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    null
  )
  const [result, setResult] =
    useState<GenerationResult | null>(null)
  const [activeFile, setActiveFile] = useState<
    string | null
  >(null)

  const generate = useCallback(async () => {
    if (!description.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setActiveFile(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: buildPrompt(description, stack),
          model,
          jsonMode: true,
          maxTokens: 16000,
        }),
      })

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: res.statusText }))
        throw new Error(
          err.error ?? `HTTP ${res.status}`
        )
      }

      const data = await res.json()
      const parsed: GenerationResult = JSON.parse(
        data.text
      )

      if (
        !Array.isArray(parsed.files) ||
        parsed.files.length === 0
      ) {
        throw new Error(
          'No files returned from generation'
        )
      }

      setResult(parsed)
      setActiveFile(parsed.files[0].name)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unknown error'
      )
    } finally {
      setLoading(false)
    }
  }, [description, stack, model])

  const downloadZip = useCallback(async () => {
    if (!result) return
    const zip = new JSZip()
    for (const file of result.files) {
      zip.file(file.name, file.content)
    }
    const blob = await zip.generateAsync({
      type: 'blob',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'site.zip'
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  const activeContent =
    result?.files.find((f) => f.name === activeFile)
      ?.content ?? ''

  return {
    description,
    setDescription,
    stack,
    setStack,
    model,
    setModel,
    loading,
    error,
    result,
    activeFile,
    setActiveFile,
    activeContent,
    generate,
    downloadZip,
  }
}
