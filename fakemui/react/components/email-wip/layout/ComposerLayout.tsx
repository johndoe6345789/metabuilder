// fakemui/react/components/email/layout/ComposerLayout.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps } from '..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface ComposerLayoutProps extends BoxProps {
  form: React.ReactNode
  preview?: React.ReactNode
  testId?: string
}

export const ComposerLayout = forwardRef<HTMLDivElement, ComposerLayoutProps>(
  ({ form, preview, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'composer-layout',
      identifier: customTestId || 'composer'
    })

    return (
      <Box
        ref={ref}
        className="composer-layout"
        {...accessible}
        {...props}
      >
        <Box className="composer-form">{form}</Box>
        {preview && <Box className="composer-preview">{preview}</Box>}
      </Box>
    )
  }
)

ComposerLayout.displayName = 'ComposerLayout'
