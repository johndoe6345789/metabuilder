'use client'

import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { forwardRef } from 'react'

import { Link as FakemuiLink } from '@/fakemui'

/**
 * Props for the Link component
 * Wrapper around fakemui Link with Next.js integration
 */
export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Link href (Next.js or external URL) */
  href: NextLinkProps['href']
  /** Whether this is an external link */
  external?: boolean
  /** Link underline style */
  underline?: 'none' | 'hover' | 'always'
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
  /** MUI component prop (ignored for compatibility) */
  component?: any
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, external, children, underline = 'hover', sx, className, component, ...props }, ref) => {
    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className].filter(Boolean).join(' ')

    if (external) {
      return (
        <FakemuiLink
          ref={ref}
          href={href as string}
          target="_blank"
          rel="noopener noreferrer"
          underline={underline}
          className={combinedClassName}
          {...props}
        >
          {children}
        </FakemuiLink>
      )
    }

    // For internal links, wrap fakemui Link with Next.js Link
    return (
      <NextLink href={href} passHref legacyBehavior>
        <FakemuiLink
          ref={ref}
          underline={underline}
          className={combinedClassName}
          {...props}
        >
          {children}
        </FakemuiLink>
      </NextLink>
    )
  }
)

Link.displayName = 'Link'

export { Link }
