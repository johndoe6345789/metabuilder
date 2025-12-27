'use client'

import { forwardRef, ReactNode, useState } from 'react'
import {
  Box,
  List,
  Collapse,
  Typography,
} from '@mui/material'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// SidebarGroup
interface SidebarGroupProps {
  children: ReactNode
  label?: string
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ children, label, collapsible, defaultOpen = true, ...props }, ref) => {
    const [open, setOpen] = useState(defaultOpen)

    return (
      <Box ref={ref} sx={{ mb: 1 }} {...props}>
        {label && (
          <Box
            onClick={collapsible ? () => setOpen(!open) : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              cursor: collapsible ? 'pointer' : 'default',
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontSize: '0.7rem', letterSpacing: 1 }}
            >
              {label}
            </Typography>
            {collapsible && (
              open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
            )}
          </Box>
        )}
        {collapsible ? (
          <Collapse in={open}>
            <List dense disablePadding>
              {children}
            </List>
          </Collapse>
        ) : (
          <List dense disablePadding>
            {children}
          </List>
        )}
      </Box>
    )
  }
)
SidebarGroup.displayName = 'SidebarGroup'

// SidebarGroupLabel
const SidebarGroupLabel = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Typography
        ref={ref}
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, py: 1, fontSize: '0.7rem', letterSpacing: 1 }}
        {...props}
      >
        {children}
      </Typography>
    )
  }
)
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

// SidebarGroupContent
const SidebarGroupContent = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} {...props}>
        <List dense disablePadding>
          {children}
        </List>
      </Box>
    )
  }
)
SidebarGroupContent.displayName = 'SidebarGroupContent'

export {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
}
