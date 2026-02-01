// fakemui/react/components/email/layout/SettingsLayout.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Tabs, Tab } from '..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface SettingsSection {
  id: string
  label: string
  content: React.ReactNode
}

export interface SettingsLayoutProps extends BoxProps {
  sections: SettingsSection[]
  activeSection?: string
  onSectionChange?: (sectionId: string) => void
  testId?: string
}

export const SettingsLayout = forwardRef<HTMLDivElement, SettingsLayoutProps>(
  ({ sections, activeSection, onSectionChange, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'settings-layout',
      identifier: customTestId || 'settings'
    })

    const current = activeSection || sections[0]?.id

    return (
      <Box
        ref={ref}
        className="settings-layout"
        {...accessible}
        {...props}
      >
        <Tabs value={current} onChange={(_, value) => onSectionChange?.(value as string)}>
          {sections.map((section) => (
            <Tab key={section.id} label={section.label} value={section.id} />
          ))}
        </Tabs>
        <Box className="settings-content">
          {sections.find((s) => s.id === current)?.content}
        </Box>
      </Box>
    )
  }
)

SettingsLayout.displayName = 'SettingsLayout'
