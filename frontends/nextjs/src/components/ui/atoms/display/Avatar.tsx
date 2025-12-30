'use client'

import { CSSProperties,forwardRef } from 'react'

import { Avatar as FakemuiAvatar, AvatarProps as FakemuiAvatarProps } from '@/fakemui/fakemui/data-display'

import styles from './Avatar.module.scss'

/**
 * Props for the Avatar component
 * @extends {FakemuiAvatarProps} Inherits fakemui Avatar props
 */
export interface AvatarProps extends FakemuiAvatarProps {
  /** Custom inline styles */
  style?: CSSProperties
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({ className, style, ...props }, ref) => {
  return (
    <FakemuiAvatar
      ref={ref}
      md
      className={`${styles.avatar} ${className || ''}`}
      style={style}
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
