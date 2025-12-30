'use client'

import { ReactNode } from 'react'

import { Stack } from '@/fakemui/fakemui/layout'
import { Divider } from '@/fakemui/fakemui/data-display'

import styles from './Sections.module.scss'

interface DialogSectionsProps {
  children: ReactNode
  spacing?: number
  divided?: boolean
}

const DialogSections = ({ children, spacing = 3, divided = false }: DialogSectionsProps) => {
  return (
    <Stack
      className={styles.sections}
      spacing={spacing}
      divider={divided ? <Divider /> : undefined}
    >
      {children}
    </Stack>
  )
}
DialogSections.displayName = 'DialogSections'

interface DialogSectionProps {
  children: ReactNode
}

const DialogSection = ({ children }: DialogSectionProps) => {
  return <div className={styles.section}>{children}</div>
}
DialogSection.displayName = 'DialogSection'

export { DialogSection, DialogSections }
