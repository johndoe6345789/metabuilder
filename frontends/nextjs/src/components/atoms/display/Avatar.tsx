'use client'

import { forwardRef } from 'react'
import {
  Avatar as MuiAvatar,
  AvatarProps as MuiAvatarProps,
  AvatarGroup as MuiAvatarGroup,
  AvatarGroupProps as MuiAvatarGroupProps,
} from '@mui/material'

/** Avatar size options */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Props for the Avatar component
 * @extends {MuiAvatarProps} Inherits Material-UI Avatar props
 */
export interface AvatarProps extends Omit<MuiAvatarProps, 'sizes'> {
  /** Size of the avatar (xs: 24px, sm: 32px, md: 40px, lg: 56px, xl: 80px) */
  size?: AvatarSize
  /** Fallback text to display when no image is provided */
  fallback?: string
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 'md', fallback, children, sx, ...props }, ref) => {
    const dimension = sizeMap[size]

    return (
      <MuiAvatar
        ref={ref}
        sx={{
          width: dimension,
          height: dimension,
          fontSize: dimension * 0.4,
          ...sx,
        }}
        {...props}
      >
        {children || fallback}
      </MuiAvatar>
    )
  }
)

Avatar.displayName = 'Avatar'

// Re-export AvatarGroup
const AvatarGroup = MuiAvatarGroup
const AvatarFallback = ({ children }: { children: React.ReactNode }) => <>{children}</>
const AvatarImage = MuiAvatar

export { Avatar, AvatarGroup, AvatarFallback, AvatarImage }
