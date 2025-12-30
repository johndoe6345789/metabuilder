'use client'

import { forwardRef } from 'react'

import { Avatar as FakemuiAvatar, AvatarGroup as FakemuiAvatarGroup } from '@/fakemui'

/** Avatar size options */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Props for the Avatar component
 * Wrapper around fakemui Avatar to maintain API compatibility
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of the avatar */
  size?: AvatarSize
  /** Fallback text to display when no image is provided */
  fallback?: string
  /** Image source */
  src?: string
  /** Alt text for image */
  alt?: string
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 'md', fallback, children, sx, src, alt, className, ...props }, ref) => {
    // Map size to fakemui size props
    const sizeProps = {
      sm: size === 'xs' || size === 'sm',
      md: size === 'md',
      lg: size === 'lg',
      xl: size === 'xl',
    }

    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className].filter(Boolean).join(' ')

    return (
      <FakemuiAvatar
        ref={ref}
        src={src}
        alt={alt}
        className={combinedClassName}
        {...sizeProps}
        {...props}
      >
        {children || fallback}
      </FakemuiAvatar>
    )
  }
)

Avatar.displayName = 'Avatar'

// Re-export AvatarGroup and create compatibility components
const AvatarGroup = FakemuiAvatarGroup
const AvatarFallback = ({ children }: { children: React.ReactNode }) => <>{children}</>
const AvatarImage = Avatar

export { Avatar, AvatarFallback, AvatarGroup, AvatarImage }
