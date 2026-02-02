// fakemui/react/components/email/inputs/RecipientInput.tsx
import React, { forwardRef, useState } from 'react'
import { Box } from '../../layout/Box'
import { TextField } from '../../inputs/TextField'
import { Chip } from '../../data-display/Chip'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface RecipientInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  recipients?: string[]
  onRecipientsChange?: (recipients: string[]) => void
  recipientType?: 'to' | 'cc' | 'bcc'
  testId?: string
}

export const RecipientInput = forwardRef<HTMLInputElement, RecipientInputProps>(
  ({ recipients = [], onRecipientsChange, recipientType = 'to', testId: customTestId, ...props }, ref) => {
    const [inputValue, setInputValue] = useState('')
    const accessible = useAccessible({
      feature: 'email',
      component: 'recipient-input',
      identifier: customTestId || recipientType
    })

    const handleAddRecipient = () => {
      if (inputValue && inputValue.includes('@')) {
        const newRecipients = [...recipients, inputValue.trim()]
        onRecipientsChange?.(newRecipients)
        setInputValue('')
      }
    }

    const handleRemoveRecipient = (index: number) => {
      const newRecipients = recipients.filter((_, i) => i !== index)
      onRecipientsChange?.(newRecipients)
    }

    // Filter out incompatible HTML input attributes
    const { size: _size, ...textFieldProps } = props

    return (
      <Box className="recipient-input">
        <div className="recipient-chips">
          {recipients.map((recipient, index) => (
            <Chip
              key={index}
              onDelete={() => handleRemoveRecipient(index)}
            >
              {recipient}
            </Chip>
          ))}
        </div>
        <TextField
          ref={ref}
          type="email"
          placeholder={`Add ${recipientType} recipient...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
          {...accessible}
          {...textFieldProps}
        />
      </Box>
    )
  }
)

RecipientInput.displayName = 'RecipientInput'
