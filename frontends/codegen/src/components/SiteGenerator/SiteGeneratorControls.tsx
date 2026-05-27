'use client'

/**
 * SiteGeneratorControls — pure UI sub-components for the
 * SiteGenerator left panel. Each component is intentionally
 * small and stateless.
 */

import React from 'react'
import {
  STACK_LABELS,
  MODEL_LABELS,
  inputStyle,
  labelStyle,
} from './constants'
import type {
  TechStack,
  ClaudeModel,
  GenerationResult,
} from './hooks/useSiteGenerator'

// ── Description ──────────────────────────────────────────

export function DescriptionField({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <label style={labelStyle}>Site Description</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          'e.g. A landing page for a coffee shop ' +
          'called Bean & Brew'
        }
        rows={6}
        style={inputStyle}
      />
    </div>
  )
}

// ── Stack ─────────────────────────────────────────────────

export function StackSelector({
  stack,
  onChange,
}: {
  stack: TechStack
  onChange: (s: TechStack) => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <label style={labelStyle}>Tech Stack</label>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        {(
          Object.keys(STACK_LABELS) as TechStack[]
        ).map((s) => (
          <StackButton
            key={s}
            stack={s}
            active={stack === s}
            onClick={onChange}
          />
        ))}
      </div>
    </div>
  )
}

function StackButton({
  stack,
  active,
  onClick,
}: {
  stack: TechStack
  active: boolean
  onClick: (s: TechStack) => void
}) {
  return (
    <button
      onClick={() => onClick(stack)}
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: `1px solid ${
          active
            ? 'var(--mat-sys-primary)'
            : 'var(--mat-sys-outline-variant)'
        }`,
        background: active
          ? 'color-mix(in srgb,' +
            ' var(--mat-sys-primary) 12%, transparent)'
          : 'transparent',
        color: active
          ? 'var(--mat-sys-primary)'
          : 'var(--mat-sys-on-surface)',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
      }}
    >
      {STACK_LABELS[stack]}
    </button>
  )
}

// ── Model ─────────────────────────────────────────────────

export function ModelSelector({
  model,
  onChange,
}: {
  model: ClaudeModel
  onChange: (m: ClaudeModel) => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <label style={labelStyle}>Model</label>
      <select
        value={model}
        onChange={(e) =>
          onChange(e.target.value as ClaudeModel)
        }
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border:
            '1px solid var(--mat-sys-outline-variant)',
          background:
            'var(--mat-sys-surface-container)',
          color: 'var(--mat-sys-on-surface)',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        {(
          Object.keys(MODEL_LABELS) as ClaudeModel[]
        ).map((m) => (
          <option key={m} value={m}>
            {MODEL_LABELS[m]}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Generate button ───────────────────────────────────────

export function GenerateButton({
  loading,
  disabled,
  onClick,
}: {
  loading: boolean
  disabled: boolean
  onClick: () => void
}) {
  const inactive = loading || disabled
  return (
    <button
      onClick={onClick}
      disabled={inactive}
      style={{
        padding: '10px 16px',
        borderRadius: '8px',
        border: 'none',
        background: inactive
          ? 'var(--mat-sys-surface-container-high)'
          : 'var(--mat-sys-primary)',
        color: inactive
          ? 'var(--mat-sys-on-surface-variant)'
          : 'var(--mat-sys-on-primary)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: inactive ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.15s ease',
      }}
    >
      {loading ? <SpinnerLabel /> : 'Generate Site'}
    </button>
  )
}

function SpinnerLabel() {
  return (
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
  )
}

// ── Error / Result ────────────────────────────────────────

export function ErrorMessage({
  message,
}: {
  message: string
}) {
  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: '6px',
      background:
        'color-mix(in srgb,' +
        ' var(--mat-sys-error) 10%, transparent)',
      border: '1px solid var(--mat-sys-error)',
      color: 'var(--mat-sys-error)',
      fontSize: '12px',
    }}>
      {message}
    </div>
  )
}

export function ResultSummary({
  result,
  onDownload,
}: {
  result: GenerationResult
  onDownload: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{
        padding: '10px 12px',
        borderRadius: '6px',
        background:
          'color-mix(in srgb,' +
          ' var(--mat-sys-primary) 8%, transparent)',
        border:
          '1px solid var(--mat-sys-outline-variant)',
        color: 'var(--mat-sys-on-surface)',
        fontSize: '12px',
        lineHeight: 1.5,
      }}>
        {result.description}
      </div>
      <button
        onClick={onDownload}
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
  )
}
