'use client'

import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material'
import { forwardRef } from 'react'

/**
 * Props for the Avatar component
 * @extends {MuiAvatarProps} Inherits Material-UI Avatar props
 */
export type AvatarProps = MuiAvatarProps

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({ sx, ...props }, ref) => {
  return (
    <MuiAvatar
      ref={ref}
      sx={{
        width: 40,
        height: 40,
        ...sx,
      }}
      {...props}
    />
  )
})

Avatar.displayName = 'Avatar'

// For compatibility with shadcn pattern
const AvatarImage = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  (props, ref) => {
    return (
      <img ref={ref} {...props} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    )
  }
)
AvatarImage.displayName = 'AvatarImage'

interface AvatarFallbackProps {
  children?: React.ReactNode
  className?: string
}

const AvatarFallback = ({ children }: AvatarFallbackProps) => {
  return <>{children}</>
}

export { Avatar, AvatarFallback, AvatarImage }
