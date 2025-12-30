'use client'

import { Search as SearchIcon } from '@/fakemui/icons'
import { Box } from '@/fakemui/fakemui/layout'
import { Dialog, DialogPanel } from '@/fakemui/fakemui/utils'
import { InputBase } from '@/fakemui/fakemui/inputs'
import { forwardRef } from 'react'

import type { CommandDialogProps, CommandInputProps } from './command.types'
import styles from './CommandDialogShell.module.scss'

const CommandDialogRoot = forwardRef<HTMLDivElement, CommandDialogProps>(
  ({ open, onClose, children, ...props }, ref) => {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        className={styles.dialog}
        {...props}
      >
        <DialogPanel ref={ref} sm className={styles.dialogPaper}>
          {children}
        </DialogPanel>
      </Dialog>
    )
  }
)
CommandDialogRoot.displayName = 'CommandDialogRoot'

const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  (
    { placeholder = 'Type a command or search...', value, onChange, autoFocus = true, ...props },
    ref
  ) => {
    return (
      <Box className={styles.inputWrapper}>
        <SearchIcon className={styles.searchIcon} />
        <InputBase
          inputRef={ref}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          autoFocus={autoFocus}
          fullWidth
          className={styles.input}
          {...props}
        />
      </Box>
    )
  }
)
CommandInput.displayName = 'CommandInput'

export { CommandDialogRoot, CommandInput }
