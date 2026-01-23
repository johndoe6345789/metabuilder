import React from 'react'
import { classNames } from '../utils/classNames'

export interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  children?: React.ReactNode
  position?: 'left' | 'right' | 'alternate'
}

export function Timeline({ children, position = 'right', className, ...props }: TimelineProps) {
  return (
    <ul className={classNames('fakemui-timeline', `fakemui-timeline-position-${position}`, className)} {...props}>
      {children}
    </ul>
  )
}

export interface TimelineItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode
  position?: 'left' | 'right'
}

export function TimelineItem({ children, position, className, ...props }: TimelineItemProps) {
  return (
    <li
      className={classNames('fakemui-timeline-item', position && `fakemui-timeline-item-position-${position}`, className)}
      {...props}
    >
      {children}
    </li>
  )
}

export interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function TimelineSeparator({ children, className, ...props }: TimelineSeparatorProps) {
  return (
    <div className={classNames('fakemui-timeline-separator', className)} {...props}>
      {children}
    </div>
  )
}

export interface TimelineConnectorProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function TimelineConnector({ className, ...props }: TimelineConnectorProps) {
  return <span className={classNames('fakemui-timeline-connector', className)} {...props} />
}

export interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function TimelineContent({ children, className, ...props }: TimelineContentProps) {
  return (
    <div className={classNames('fakemui-timeline-content', className)} {...props}>
      {children}
    </div>
  )
}

export interface TimelineDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  color?: 'grey' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  variant?: 'filled' | 'outlined'
}

export function TimelineDot({ children, color = 'grey', variant = 'filled', className, ...props }: TimelineDotProps) {
  return (
    <span
      className={classNames('fakemui-timeline-dot', `fakemui-timeline-dot-${variant}`, `fakemui-timeline-dot-${color}`, className)}
      {...props}
    >
      {children}
    </span>
  )
}

export interface TimelineOppositeContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function TimelineOppositeContent({ children, className, ...props }: TimelineOppositeContentProps) {
  return (
    <div className={classNames('fakemui-timeline-opposite-content', className)} {...props}>
      {children}
    </div>
  )
}

export default Timeline
