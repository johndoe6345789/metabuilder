'use client'

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
import { type ChangeEvent,useMemo, useState } from 'react'

import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { type CodegenRequest,useCodegenData } from './hooks/useCodegenData'

const runtimeOptions = [
  { value: 'web', label: 'Next.js web' },
  { value: 'cli', label: 'Command line' },
  { value: 'desktop', label: 'Desktop shell' },
  { value: 'hybrid', label: 'Hybrid web + desktop' },
  { value: 'server', label: 'Server service' },
]

const initialFormState: CodegenRequest = {
  projectName: 'nebula-launch',
  packageId: 'codegen_studio',
  runtime: 'web',
  tone: 'newsroom',
  brief: 'Modern web interface with CLI companions',
}

type FormState = typeof initialFormState

export default function CodegenStudioClient() {
  const [form, setForm] = useState<FormState>(initialFormState)
  const { status, message, error, manifest, generate } = useCodegenData()

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

  const previewFiles = useMemo(() => {
    const root =
      form.projectName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'metabuilder-starter'
    return [
      `${root}/README.md`,
      `${root}/package.json`,
      `${root}/src/app/page.tsx`,
      `${root}/cli/main.cpp`,
      `${root}/spec.json`,
    ]
  }, [form.projectName])

  const handleChange = (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: event.target.value }))
  }

  const handleSubmit = () => generate(form)

  return (
    <Container maxWidth="lg" className="py-16">
      <Paper elevation={8} className="p-8">
        <Stack spacing={5}>
          <Header
            title="Codegen Studio Export"
            subtitle="Configure a starter bundle for MetaBuilder packages and download it instantly."
          />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={5} alignItems="flex-start">
            <Stack spacing={3} flex={1} width="100%">
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
                {runtimeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Typography variant="body2" color="text.secondary">
                {runtimeDescription}
              </Typography>
              <TextField label="Tone" value={form.tone} onChange={handleChange('tone')} fullWidth />
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
            <Box width={{ xs: '100%', md: 320 }} flexShrink={0}>
              <Sidebar manifest={manifest} previewFiles={previewFiles} />
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
