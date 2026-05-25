'use client'

import { useState, useCallback } from 'react'
import JSZip from 'jszip'

type TechStack = 'html' | 'react' | 'nextjs'
type ClaudeModel = 'claude-sonnet' | 'claude-haiku' | 'claude-opus'

interface GeneratedFile {
  name: string
  content: string
}

interface GenerationResult {
  files: GeneratedFile[]
  description: string
}

const STACK_LABELS: Record<TechStack, string> = {
  html: 'HTML / CSS / JS',
  react: 'React + Vite',
  nextjs: 'Next.js',
}

const MODEL_LABELS: Record<ClaudeModel, string> = {
  'claude-haiku': 'Haiku (fast)',
  'claude-sonnet': 'Sonnet (balanced)',
  'claude-opus': 'Opus (best)',
}

const STACK_INSTRUCTIONS: Record<TechStack, string> = {
  html: `Generate a single-page website using plain HTML, CSS, and vanilla JavaScript.
Output files: index.html, styles.css, and optionally script.js.
Use modern CSS (custom properties, flexbox/grid). No build step required.`,
  react: `Generate a React application using Vite.
Output files: package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx, and component files in src/components/.
Use functional components with hooks. Include inline styles or Tailwind via CDN.`,
  nextjs: `Generate a Next.js 14 application using the App Router.
Output files: package.json, next.config.js, app/layout.tsx, app/page.tsx, and supporting files.
Use TypeScript. Include Tailwind CSS. Use Server Components by default.`,
}

function buildPrompt(description: string, stack: TechStack): string {
  return `You are a senior web developer. Generate a complete website based on this description:

"${description}"

${STACK_INSTRUCTIONS[stack]}

IMPORTANT: Respond with ONLY valid JSON — no markdown fences, no explanation outside the JSON.

JSON format:
{
  "description": "one sentence describing what was built",
  "files": [
    { "name": "path/to/file.ext", "content": "full file content here" }
  ]
}

Requirements:
- Generate ALL files needed to run the site
- Each file must be complete and production-ready
- Use modern best practices
- Make the design polished and professional
- Include realistic placeholder content matching the site description`
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    html: 'html', css: 'css', js: 'javascript', jsx: 'jsx',
    ts: 'typescript', tsx: 'tsx', json: 'json', md: 'markdown',
  }
  return map[ext] ?? 'plaintext'
}

export function SiteGenerator() {
  const [description, setDescription] = useState('')
  const [stack, setStack] = useState<TechStack>('html')
  const [model, setModel] = useState<ClaudeModel>('claude-sonnet')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [activeFile, setActiveFile] = useState<string | null>(null)

  const generate = useCallback(async () => {
    if (!description.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setActiveFile(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildPrompt(description, stack),
          model,
          jsonMode: true,
          maxTokens: 16000,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      const data = await res.json()
      const parsed: GenerationResult = JSON.parse(data.text)

      if (!Array.isArray(parsed.files) || parsed.files.length === 0) {
        throw new Error('No files returned from generation')
      }

      setResult(parsed)
      setActiveFile(parsed.files[0].name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
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
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'site.zip'
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  const activeContent = result?.files.find(f => f.name === activeFile)?.content ?? ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--mat-sys-on-surface)', margin: '0 0 4px' }}>
          Site Generator
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--mat-sys-on-surface-variant)', margin: 0 }}>
          Describe your site and Claude will generate all the code
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left panel — inputs */}
        <div style={{
          width: '320px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mat-sys-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Site Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. A landing page for a coffee shop called Bean & Brew with a hero section, menu, and contact form"
              rows={6}
              style={{
                width: '100%',
                resize: 'vertical',
                padding: '10px 12px',
                fontSize: '13px',
                background: 'var(--mat-sys-surface-container)',
                color: 'var(--mat-sys-on-surface)',
                border: '1px solid var(--mat-sys-outline-variant)',
                borderRadius: '8px',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Tech stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mat-sys-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tech Stack
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(Object.keys(STACK_LABELS) as TechStack[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStack(s)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${stack === s ? 'var(--mat-sys-primary)' : 'var(--mat-sys-outline-variant)'}`,
                    background: stack === s ? 'color-mix(in srgb, var(--mat-sys-primary) 12%, transparent)' : 'transparent',
                    color: stack === s ? 'var(--mat-sys-primary)' : 'var(--mat-sys-on-surface)',
                    fontSize: '13px',
                    fontWeight: stack === s ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {STACK_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mat-sys-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Model
            </label>
            <select
              value={model}
              onChange={e => setModel(e.target.value as ClaudeModel)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--mat-sys-outline-variant)',
                background: 'var(--mat-sys-surface-container)',
                color: 'var(--mat-sys-on-surface)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {(Object.keys(MODEL_LABELS) as ClaudeModel[]).map(m => (
                <option key={m} value={m}>{MODEL_LABELS[m]}</option>
              ))}
            </select>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading || !description.trim()}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: loading || !description.trim()
                ? 'var(--mat-sys-surface-container-high)'
                : 'var(--mat-sys-primary)',
              color: loading || !description.trim()
                ? 'var(--mat-sys-on-surface-variant)'
                : 'var(--mat-sys-on-primary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading || !description.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Generating...
              </>
            ) : 'Generate Site'}
          </button>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: 'color-mix(in srgb, var(--mat-sys-error) 10%, transparent)',
              border: '1px solid var(--mat-sys-error)',
              color: 'var(--mat-sys-error)',
              fontSize: '12px',
            }}>
              {error}
            </div>
          )}

          {/* Result summary + download */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                padding: '10px 12px',
                borderRadius: '6px',
                background: 'color-mix(in srgb, var(--mat-sys-primary) 8%, transparent)',
                border: '1px solid var(--mat-sys-outline-variant)',
                color: 'var(--mat-sys-on-surface)',
                fontSize: '12px',
                lineHeight: 1.5,
              }}>
                {result.description}
              </div>
              <button
                onClick={downloadZip}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--mat-sys-outline)',
                  background: 'transparent',
                  color: 'var(--mat-sys-on-surface)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Download ZIP ({result.files.length} files)
              </button>
            </div>
          )}
        </div>

        {/* Right panel — file viewer */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!result ? (
            <div style={{
              padding: '48px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '12px',
              color: 'var(--mat-sys-on-surface-variant)',
              background: 'var(--mat-sys-surface-container)',
              borderRadius: '12px',
              border: '1px dashed var(--mat-sys-outline-variant)',
            }}>
              <div style={{ fontSize: '40px', opacity: 0.4 }}>⚡</div>
              <p style={{ fontSize: '14px', margin: 0, fontWeight: 500 }}>Generated files will appear here</p>
              <p style={{ fontSize: '12px', margin: 0, opacity: 0.7 }}>Describe your site and click Generate</p>
            </div>
          ) : (
            <div style={{
              border: '1px solid var(--mat-sys-outline-variant)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {/* File tabs */}
              <div style={{
                display: 'flex',
                gap: 0,
                borderBottom: '1px solid var(--mat-sys-outline-variant)',
                overflowX: 'auto',
                background: 'var(--mat-sys-surface-container)',
              }}>
                {result.files.map(f => (
                  <button
                    key={f.name}
                    onClick={() => setActiveFile(f.name)}
                    style={{
                      padding: '8px 14px',
                      border: 'none',
                      borderBottom: activeFile === f.name
                        ? '2px solid var(--mat-sys-primary)'
                        : '2px solid transparent',
                      background: 'transparent',
                      color: activeFile === f.name
                        ? 'var(--mat-sys-primary)'
                        : 'var(--mat-sys-on-surface-variant)',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontWeight: activeFile === f.name ? 600 : 400,
                    }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* File content */}
              <pre style={{
                margin: 0,
                padding: '16px 20px',
                fontSize: '12px',
                lineHeight: 1.6,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                color: 'var(--mat-sys-on-surface)',
                background: 'var(--mat-sys-surface)',
                maxHeight: '600px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                <code data-language={detectLanguage(activeFile ?? '')}>{activeContent}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SiteGenerator
