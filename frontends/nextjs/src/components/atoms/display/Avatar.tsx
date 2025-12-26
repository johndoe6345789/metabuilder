'use client'

import { forwardRef } from 'react'
import { 
  Avatar as MuiAvatar, 
  AvatarProps as MuiAvatarProps,
  AvatarGroup as MuiAvatarGroup,
  AvatarGroupProps as MuiAvatarGroupProps,
} from '@mui/material'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps extends Omit<MuiAvatarProps, 'sizes'> {
  size?: AvatarSize
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
