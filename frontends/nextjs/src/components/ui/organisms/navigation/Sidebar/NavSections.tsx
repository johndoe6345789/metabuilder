import { forwardRef, ReactNode } from 'react'

import { Box, Divider, Typography } from '@/fakemui'

import styles from '../Navigation.module.scss'

interface SidebarSectionProps {
  title?: string
  children: ReactNode
}

const SidebarSection = forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ title, children, ...props }, ref) => {
    return (
      <Box ref={ref} className={styles.sidebarSection} {...props}>
        {title && (
          <Typography
            variant="caption"
            className={styles.sectionTitle}
          >
            {title}
          </Typography>
        )}
        {children}
      </Box>
    )
  }
)
SidebarSection.displayName = 'SidebarSection'

const SidebarSeparator = forwardRef<HTMLHRElement, Record<string, never>>((props, ref) => {
  return <Divider ref={ref} className={styles.sidebarSeparator} {...props} />
})
SidebarSeparator.displayName = 'SidebarSeparator'

export { SidebarSection, SidebarSeparator }
export type { SidebarSectionProps }
