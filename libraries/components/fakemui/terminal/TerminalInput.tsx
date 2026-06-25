'use client'

import { useEffect, useRef, type FormEvent } from 'react'
import { Input } from '../inputs/Input'

export interface TerminalInputProps {
  /** Whether the terminal is waiting for input */
  waitingForInput: boolean
  /** Current input value */
  inputValue: string
  /** Called when input value changes */
  onInputChange: (value: string) => void
  /** Called when input is submitted */
  onSubmit: (e: FormEvent) => void
  /** Input prompt character */
  promptChar?: string
  /** Placeholder text */
  placeholder?: string
  /** Custom className */
  className?: string
  /** Disable animations */
  disableAnimations?: boolean
  /** Test ID for the component */
  testId?: string
}

/**
 * Terminal input component with auto-focus and submission handling.
 *
 * @example
 * ```tsx
 * <TerminalInput
 *   waitingForInput={waitingForInput}
 *   inputValue={inputValue}
 *   onInputChange={setInputValue}
 *   onSubmit={handleSubmit}
 *   placeholder="Enter your input..."
 * />
 * ```
 */
export function TerminalInput({
  waitingForInput,
  inputValue,
  onInputChange,
  onSubmit,
  promptChar = '>',
  placeholder = 'Enter input...',
  className = '',
  disableAnimations = false,
  testId,
}: TerminalInputProps) {
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
    <form
      onSubmit={onSubmit}
      className={`flex items-center gap-2 mt-2 ${disableAnimations ? '' : 'animate-fadeIn'} ${className}`}
      data-testid={testId ?? "terminal-input-form"}
    >
      <span className="text-primary font-bold" aria-hidden="true">
        {promptChar}
      </span>
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        className="flex-1 font-mono bg-background border-accent/50 focus:border-accent"
        placeholder={placeholder}
        disabled={!waitingForInput}
        data-testid="terminal-input"
        aria-label="Terminal input"
      />
    </form>
  )
}
