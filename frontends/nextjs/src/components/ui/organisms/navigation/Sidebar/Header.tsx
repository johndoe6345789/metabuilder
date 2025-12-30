import { forwardRef, ReactNode } from 'react'

import { Box, IconButton } from '@/fakemui'
import { ChevronLeft as ChevronLeftIcon } from '@/fakemui/icons'

import styles from '../Navigation.module.scss'

interface SidebarHeaderProps {
  children?: ReactNode
  onClose?: () => void
  showCloseButton?: boolean
}

const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ children, onClose, showCloseButton = false, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={styles.sidebarHeader}
        {...props}
      >
        {children}
        {showCloseButton && onClose && (
          <IconButton onClick={onClose} sm>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
    )
  }
)
SidebarHeader.displayName = 'SidebarHeader'

export { SidebarHeader }
export type { SidebarHeaderProps }
