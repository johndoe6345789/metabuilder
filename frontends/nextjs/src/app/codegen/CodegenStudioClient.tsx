'use client'

import type { CodegenManifest } from '@/lib/codegen/codegen-types'
import { useMemo, useState, type ChangeEvent } from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

const runtimeOptions = [
  { value: 'web', label: 'Next.js web' },
  { value: 'cli', label: 'Command line' },
  { value: 'desktop', label: 'Desktop shell' },
  { value: 'hybrid', label: 'Hybrid web + desktop' },
  { value: 'server', label: 'Server service' },
]

const initialFormState = {
  projectName: 'nebula-launch',
  packageId: 'codegen_studio',
  runtime: 'web',
  tone: 'newsroom',
  brief: 'Modern web interface with CLI companions',
}

type FormState = (typeof initialFormState)

type FetchStatus = 'idle' | 'loading' | 'success'

const createFilename = (header: string | null, fallback: string) => {
  const match = header?.match(/filename="?([^\"]+)"?/) ?? null
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

const fetchZip = async (values: FormState) => {
  const response = await fetch('/api/codegen/studio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  if (!response.ok) {
    throw new Error('Codegen Studio service returned an error')
  }
  const blob = await response.blob()
  const filename = createFilename(response.headers.get('content-disposition'), `${values.projectName}.zip`)
  downloadBlob(blob, filename)
  const manifestHeader = response.headers.get('x-codegen-manifest')
  const manifest = manifestHeader
    ? (JSON.parse(decodeURIComponent(manifestHeader)) as CodegenManifest)
    : null
  return { filename, manifest }
}

export default function CodegenStudioClient() {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manifest, setManifest] = useState<CodegenManifest | null>(null)

  const runtimeDescription = useMemo(() => {
    switch (form.runtime) {
      case 'cli':
        return 'Generates a CLI entry point plus Next.js wrappers.'
      case 'desktop':
        return 'Includes desktop-ready shell + companion CLI.'
      case 'hybrid':
        return 'Bundles both web and desktop artifacts.'
      case 'server':
        return 'Prepares a backend service project.'
      default:
        return 'Focuses on a Next.js web experience.'
    }
  }, [form.runtime])

  const handleChange = (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleSubmit = async () => {
    setStatus('loading')
    setError(null)
    setMessage(null)
    try {
      const filename = await fetchZip(form)
      setMessage(`Zip ${filename} created successfully.`)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate the zip')
      setStatus('idle')
    }
  }

  return (
    <Container maxWidth="md" className="py-16">
      <Paper elevation={8} className="p-8 space-y-6">
        <Stack spacing={2}>
          <Typography variant="h3" component="h1">
            Codegen Studio Export
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure a starter bundle for MetaBuilder packages and download it instantly.
          </Typography>
        </Stack>

        <Stack spacing={3}>
          <TextField
            label="Project name"
            value={form.projectName}
            onChange={handleChange('projectName')}
            fullWidth
          />
          <TextField
            label="Package id"
            value={form.packageId}
            onChange={handleChange('packageId')}
            fullWidth
          />
          <TextField
            select
            label="Runtime"
            value={form.runtime}
            onChange={handleChange('runtime')}
            fullWidth
          >
            {runtimeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="body2" color="text.secondary">
            {runtimeDescription}
          </Typography>
          <TextField
            label="Tone"
            value={form.tone}
            onChange={handleChange('tone')}
            fullWidth
          />
          <TextField
            label="Creative brief"
            value={form.brief}
            onChange={handleChange('brief')}
            fullWidth
            multiline
            minRows={3}
          />
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={status === 'loading'}
              startIcon={status === 'loading' ? <CircularProgress size={16} /> : null}
            >
              {status === 'loading' ? 'Generating...' : 'Generate ZIP'}
            </Button>
          </Box>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Paper>
    </Container>
  )
}
