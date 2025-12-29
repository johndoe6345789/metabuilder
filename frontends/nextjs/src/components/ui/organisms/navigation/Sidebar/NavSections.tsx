import { forwardRef, ReactNode } from 'react'
import { Box, Divider, Typography } from '@mui/material'

interface SidebarSectionProps {
  title?: string
  children: ReactNode
}

const SidebarSection = forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ title, children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ py: 1 }} {...props}>
        {title && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
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
  return <Divider ref={ref} sx={{ my: 1 }} {...props} />
})
SidebarSeparator.displayName = 'SidebarSeparator'

export { SidebarSection, SidebarSeparator }
export type { SidebarSectionProps }
