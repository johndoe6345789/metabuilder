// fakemui/react/components/email/surfaces/SignatureCard.tsx
import React, { forwardRef } from 'react'
import { Card, CardProps, Typography } 
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface SignatureCardProps extends CardProps {
  text: string
  editMode?: boolean
  onEdit?: (text: string) => void
  testId?: string
}

export const SignatureCard = forwardRef<HTMLDivElement, SignatureCardProps>(
  ({ text, editMode = false, onEdit, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'signature',
      identifier: customTestId || 'signature'
    })

    return (
      <Card
        ref={ref}
        className="signature-card"
        {...accessible}
        {...props}
      >
        {editMode ? (
          <textarea
            value={text}
            onChange={(e) => onEdit?.(e.target.value)}
            className="signature-editor"
            placeholder="Add your signature here..."
          />
        ) : (
          <Typography variant="body2" className="signature-text">
            {text}
          </Typography>
        )}
      </Card>
    )
  }
)

SignatureCard.displayName = 'SignatureCard'
