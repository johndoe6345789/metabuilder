import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'

interface TerminalInputProps {
  waitingForInput: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function TerminalInput({
  waitingForInput,
  inputValue,
  onInputChange,
  onSubmit
}: TerminalInputProps) {
  const t = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [waitingForInput])

  if (!waitingForInput) {
    return null
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}
      data-testid="terminal-input-form"
    >
      <span style={{ color: 'var(--mat-sys-primary)', fontWeight: 'bold' }} aria-hidden="true">{'>'}</span>
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        style={{ flex: 1, fontFamily: 'monospace', background: 'var(--mat-sys-surface-container-low)', borderColor: 'var(--mat-sys-primary)', color: 'var(--mat-sys-on-surface)' }}
        placeholder={t.pythonTerminal.inputPlaceholder}
        disabled={!waitingForInput}
        data-testid="terminal-input"
        aria-label={t.pythonTerminal.inputAria}
      />
    </motion.form>
  )
}
