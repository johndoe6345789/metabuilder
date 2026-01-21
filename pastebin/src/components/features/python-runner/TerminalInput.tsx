import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'

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
      className="flex items-center gap-2 mt-2"
      data-testid="terminal-input-form"
    >
      <span className="text-primary font-bold" aria-hidden="true">{'>'}</span>
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        className="flex-1 font-mono bg-background border-accent/50 focus:border-accent"
        placeholder="Enter input..."
        disabled={!waitingForInput}
        data-testid="terminal-input"
        aria-label="Terminal input"
      />
    </motion.form>
  )
}
