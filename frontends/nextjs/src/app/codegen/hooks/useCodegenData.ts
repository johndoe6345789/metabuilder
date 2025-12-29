'use client'

import { useCallback, useState } from 'react'

import type { CodegenManifest } from '@/lib/codegen/codegen-types'

export type CodegenRequest = {
  projectName: string
  packageId: string
  runtime: string
  tone: string
  brief: string
}

export type FetchStatus = 'idle' | 'loading' | 'success'

const createFilename = (header: string | null, fallback: string) => {
  const match = header?.match(/filename="?([^"]+)"?/) ?? null
  return match ? match[1] : fallback
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

const fetchZip = async (values: CodegenRequest) => {
  const response = await fetch('/api/codegen/studio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  if (!response.ok) {
    throw new Error('Codegen Studio service returned an error')
  }
  const blob = await response.blob()
  const filename = createFilename(
    response.headers.get('content-disposition'),
    `${values.projectName}.zip`
  )
  downloadBlob(blob, filename)
  const manifestHeader = response.headers.get('x-codegen-manifest')
  const manifest = manifestHeader
    ? (JSON.parse(decodeURIComponent(manifestHeader)) as CodegenManifest)
    : null
  return { filename, manifest }
}

export function useCodegenData() {
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manifest, setManifest] = useState<CodegenManifest | null>(null)

  const generate = useCallback(async (values: CodegenRequest) => {
    setStatus('loading')
    setError(null)
    setMessage(null)
    try {
      const { filename, manifest: manifestResult } = await fetchZip(values)
      setMessage(`Zip ${filename} created successfully.`)
      setManifest(manifestResult)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate the zip')
      setManifest(null)
      setStatus('idle')
    }
  }, [])

  return { status, message, error, manifest, generate }
}
