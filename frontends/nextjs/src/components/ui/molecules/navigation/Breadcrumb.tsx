'use client'

import { Box, Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

import { MoreHoriz, NavigateNext } from '@/fakemui/icons'

interface BreadcrumbProps {
  children: ReactNode
  className?: string
}

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(({ children, ...props }, ref) => {
  return (
    <MuiBreadcrumbs
      ref={ref}
      separator={<NavigateNext size={16} />}
      aria-label="breadcrumb"
      {...props}
    >
      {children}
    </MuiBreadcrumbs>
  )
})
Breadcrumb.displayName = 'Breadcrumb'

interface BreadcrumbListProps {
  children: ReactNode
  className?: string
}

const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ children, ...props }, ref) => {
    return <>{children}</>
  }
)
BreadcrumbList.displayName = 'BreadcrumbList'

interface BreadcrumbItemProps {
  children: ReactNode
  className?: string
}

const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box component="span" ref={ref} {...props}>
        {children}
      </Box>
    )
  }
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

interface BreadcrumbLinkProps {
  children: ReactNode
  href?: string
  asChild?: boolean
  className?: string
}

const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ children, href, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        underline="hover"
        color="inherit"
        sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}
        {...props}
      >
        {children}
      </Link>
    )
  }
)
BreadcrumbLink.displayName = 'BreadcrumbLink'

interface BreadcrumbPageProps {
  children: ReactNode
  className?: string
}

const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ children, ...props }, ref) => {
    return (
      <Typography
        ref={ref}
        color="text.primary"
        sx={{ fontSize: '0.875rem', fontWeight: 500 }}
        {...props}
      >
        {children}
      </Typography>
    )
  }
)
BreadcrumbPage.displayName = 'BreadcrumbPage'

interface BreadcrumbSeparatorProps {
  children?: ReactNode
  className?: string
}

const BreadcrumbSeparator = ({ children, ...props }: BreadcrumbSeparatorProps) => {
  return (
    <Box component="span" sx={{ mx: 1, color: 'text.secondary' }} {...props}>
      {children || <NavigateNextIcon fontSize="small" />}
    </Box>
  )
}
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

interface BreadcrumbEllipsisProps {
  className?: string
}

const BreadcrumbEllipsis = ({ ...props }: BreadcrumbEllipsisProps) => {
  return (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }} {...props}>
      <MoreHorizIcon fontSize="small" />
      <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        More
      </Box>
    </Box>
  )
}
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
