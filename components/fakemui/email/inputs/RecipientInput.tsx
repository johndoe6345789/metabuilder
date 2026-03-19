// fakemui/react/components/email/inputs/RecipientInput.tsx
import React, { forwardRef, useState } from 'react'
import { Box } from '../../layout/Box'
import { TextField } from '../../inputs/TextField'
import { Chip } from '../../data-display/Chip'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface RecipientInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  recipients?: string[]
  onRecipientsChange?: (recipients: string[]) => void
  recipientType?: 'to' | 'cc' | 'bcc'
  testId?: string
}

export const RecipientInput = forwardRef<
  HTMLInputElement,
  RecipientInputProps
>(({
  recipients = [],
  onRecipientsChange,
  recipientType = 'to',
  testId: customTestId,
  ...props
}, ref) => {
  const [inputValue, setInputValue] = useState('')
  const accessible = useAccessible({
    feature: 'email',
    component: 'recipient-input',
    identifier: customTestId || recipientType,
    ariaLabel: `Add ${recipientType} recipient`
  })

  const addRecipient = () => {
    if (inputValue && inputValue.includes('@')) {
      onRecipientsChange?.([
        ...recipients, inputValue.trim()
      ])
      setInputValue('')
    }
  }

  const removeRecipient = (index: number) => {
    onRecipientsChange?.(
      recipients.filter((_, i) => i !== index)
    )
  }

  const { size: _size, ...textFieldProps } = props

  return (
    <Box
      className="recipient-input"
      role="group"
      aria-label={`${recipientType.toUpperCase()} recipients`}
    >
      <div className="recipient-chips">
        {recipients.map((r, i) => (
          <Chip
            key={i}
            onDelete={() => removeRecipient(i)}
            aria-label={`Remove ${r}`}
          >
            {r}
          </Chip>
        ))}
      </div>
      <TextField
        ref={ref}
        type="email"
        placeholder={`Add ${recipientType} recipient...`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) =>
          e.key === 'Enter' && addRecipient()
        }
        {...accessible}
        {...textFieldProps}
      />
    </Box>
  )
})

RecipientInput.displayName = 'RecipientInput'
