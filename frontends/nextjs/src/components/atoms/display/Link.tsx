'use client'

import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { forwardRef } from 'react'

export interface LinkProps extends Omit<MuiLinkProps, 'href'> {
  href: NextLinkProps['href']
  external?: boolean
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, external, children, sx, ...props }, ref) => {
    if (external) {
      return (
        <MuiLink
          ref={ref}
          href={href as string}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
            ...sx,
          }}
          {...props}
        >
          {children}
        </MuiLink>
      )
    }

    return (
      <MuiLink
        ref={ref}
        component={NextLink}
        href={href}
        sx={{
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiLink>
    )
  }
)

Link.displayName = 'Link'

export { Link }
