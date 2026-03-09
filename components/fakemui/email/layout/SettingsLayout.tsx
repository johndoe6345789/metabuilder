// fakemui/react/components/email/layout/SettingsLayout.tsx
import React from 'react'
import { Box, BoxProps, Tabs, Tab } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'

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

export const SettingsLayout = ({
  sections,
  activeSection,
  onSectionChange,
  testId: customTestId,
  ...props
}: SettingsLayoutProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'settings-layout',
    identifier: customTestId || 'settings'
  })

  const current = activeSection || sections[0]?.id

  return (
    <Box
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
