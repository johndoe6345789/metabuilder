import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { ElementType, forwardRef, type MouseEvent, ReactNode } from 'react'

interface NavigationMenuProps {
  children: ReactNode
}

const NavigationMenu = forwardRef<HTMLDivElement, NavigationMenuProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="nav"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationMenu.displayName = 'NavigationMenu'

interface NavigationListProps {
  children: ReactNode
}

const NavigationList = forwardRef<HTMLUListElement, NavigationListProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="ul"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          listStyle: 'none',
          m: 0,
          p: 0,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationList.displayName = 'NavigationList'

interface NavigationItemProps {
  children: ReactNode
}

const NavigationItem = forwardRef<HTMLLIElement, NavigationItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box component="li" ref={ref} sx={{ position: 'relative' }} {...props}>
        {children}
      </Box>
    )
  }
)
NavigationItem.displayName = 'NavigationItem'

interface NavigationTriggerProps {
  children: ReactNode
  onClick?: (event: MouseEvent<HTMLElement>) => void
  hasDropdown?: boolean
}

const NavigationTrigger = forwardRef<HTMLButtonElement, NavigationTriggerProps>(
  ({ children, onClick, hasDropdown = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        color="inherit"
        endIcon={hasDropdown ? <ExpandMoreIcon fontSize="small" /> : undefined}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          color: 'text.primary',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
NavigationTrigger.displayName = 'NavigationTrigger'

interface NavigationContentProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  children: ReactNode
}

const NavigationContent = forwardRef<HTMLDivElement, NavigationContentProps>(
  ({ anchorEl, open, onClose, children, ...props }, ref) => {
    return (
      <Menu
        ref={ref}
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
        {...props}
      >
        {children}
      </Menu>
    )
  }
)
NavigationContent.displayName = 'NavigationContent'

interface NavigationLinkProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  icon?: ReactNode
  asChild?: boolean
  component?: ElementType
}

const NavigationLink = forwardRef<HTMLElement, NavigationLinkProps>(
  (
    {
      children,
      href,
      onClick,
      active = false,
      disabled = false,
      icon,
      asChild,
      component,
      ...props
    },
    ref
  ) => {
    if (asChild || component) {
      return (
        <MenuItem
          ref={ref}
          component={component || 'a'}
          href={href}
          onClick={onClick}
          disabled={disabled}
          selected={active}
          {...props}
        >
          {icon && <ListItemIcon>{icon}</ListItemIcon>}
          <ListItemText>{children}</ListItemText>
        </MenuItem>
      )
    }

    return (
      <MenuItem
        onClick={onClick}
        disabled={disabled}
        selected={active}
        sx={{
          borderRadius: 1,
        }}
        {...props}
      >
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText>{children}</ListItemText>
      </MenuItem>
    )
  }
)
NavigationLink.displayName = 'NavigationLink'

export {
  NavigationContent,
  NavigationItem,
  NavigationLink,
  NavigationList,
  NavigationMenu,
  NavigationTrigger,
}
