'use client'

import { Box, Breadcrumbs, Link, Typography } from '@/fakemui'
import { forwardRef, ReactNode } from 'react'

import { MoreHoriz, NavigateNext } from '@/fakemui/icons'

import styles from './Breadcrumb.module.scss'

interface BreadcrumbProps {
  children: ReactNode
  className?: string
}

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Breadcrumbs
        ref={ref}
        separator={<NavigateNext size={16} />}
        className={`${styles.breadcrumbs} ${className}`}
        aria-label="breadcrumb"
        {...props}
      >
        {children}
      </Breadcrumbs>
    )
  }
)
Breadcrumb.displayName = 'Breadcrumb'

interface BreadcrumbListProps {
  children: ReactNode
  className?: string
}

const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ children, className = '', ...props }, ref) => {
    return <>{children}</>
  }
)
BreadcrumbList.displayName = 'BreadcrumbList'

interface BreadcrumbItemProps {
  children: ReactNode
  className?: string
}

const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box component="span" ref={ref} className={`${styles.breadcrumbItem} ${className}`} {...props}>
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
  ({ children, href, className = '', ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        underline="hover"
        color="inherit"
        className={`${styles.breadcrumbLink} ${className}`}
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
  ({ children, className = '', ...props }, ref) => {
    return (
      <Typography
        ref={ref}
        className={`${styles.breadcrumbPage} ${className}`}
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

const BreadcrumbSeparator = ({ children, className = '', ...props }: BreadcrumbSeparatorProps) => {
  return (
    <Box component="span" className={`${styles.breadcrumbSeparator} ${className}`} {...props}>
      {children || <NavigateNext size={16} />}
    </Box>
  )
}
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

interface BreadcrumbEllipsisProps {
  className?: string
}

const BreadcrumbEllipsis = ({ className = '', ...props }: BreadcrumbEllipsisProps) => {
  return (
    <Box component="span" className={`${styles.breadcrumbEllipsis} ${className}`} {...props}>
      <MoreHoriz size={16} />
      <span className={styles.srOnly}>More</span>
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
