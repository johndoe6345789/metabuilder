import { forwardRef, ReactNode } from 'react'
import { Box, Divider } from '@mui/material'

interface NavigationBrandProps {
  children: ReactNode
  href?: string
  onClick?: () => void
}

const NavigationBrand = forwardRef<HTMLDivElement, NavigationBrandProps>(
  ({ children, href, onClick, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: onClick || href ? 'pointer' : 'default',
          mr: 2,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationBrand.displayName = 'NavigationBrand'

const NavigationSeparator = forwardRef<HTMLHRElement, Record<string, never>>((props, ref) => {
  return <Divider ref={ref} orientation="vertical" flexItem sx={{ mx: 1 }} {...props} />
})
NavigationSeparator.displayName = 'NavigationSeparator'

const NavigationSpacer = forwardRef<HTMLDivElement, Record<string, never>>((props, ref) => {
  return <Box ref={ref} sx={{ flexGrow: 1 }} {...props} />
})
NavigationSpacer.displayName = 'NavigationSpacer'

export { NavigationBrand, NavigationSeparator, NavigationSpacer }
