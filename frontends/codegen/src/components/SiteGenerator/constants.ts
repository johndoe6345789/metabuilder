import type { TechStack, ClaudeModel } from './hooks/useSiteGenerator'

export const STACK_LABELS: Record<TechStack, string> = {
  html: 'HTML / CSS / JS',
  react: 'React + Vite',
  nextjs: 'Next.js',
}

export const MODEL_LABELS: Record<ClaudeModel, string> = {
  'claude-haiku': 'Haiku (fast)',
  'claude-sonnet': 'Sonnet (balanced)',
  'claude-opus': 'Opus (best)',
}

// Inline styles shared across sub-components

export const inputStyle: React.CSSProperties = {
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
}

export const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--mat-sys-on-surface-variant)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}
