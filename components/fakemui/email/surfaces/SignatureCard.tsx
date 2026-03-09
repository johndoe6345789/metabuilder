// fakemui/react/components/email/surfaces/SignatureCard.tsx
import React from 'react'
import { Card, CardProps, Typography } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface SignatureCardProps extends CardProps {
  text: string
  editMode?: boolean
  onEdit?: (text: string) => void
  testId?: string
}

export const SignatureCard = ({
  text,
  editMode = false,
  onEdit,
  testId: customTestId,
  ...props
}: SignatureCardProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'signature',
    identifier: customTestId || 'signature'
  })

  return (
    <Card
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
