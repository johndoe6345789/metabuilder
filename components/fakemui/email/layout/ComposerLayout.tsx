// fakemui/react/components/email/layout/ComposerLayout.tsx
import React from 'react'
import { Box, BoxProps } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface ComposerLayoutProps extends BoxProps {
  form: React.ReactNode
  preview?: React.ReactNode
  testId?: string
}

export const ComposerLayout = ({
  form,
  preview,
  testId: customTestId,
  ...props
}: ComposerLayoutProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'composer-layout',
    identifier: customTestId || 'composer'
  })

  return (
    <Box
      className="composer-layout"
      {...accessible}
      {...props}
    >
      <Box className="composer-form">{form}</Box>
      {preview && <Box className="composer-preview">{preview}</Box>}
    </Box>
  )
}
