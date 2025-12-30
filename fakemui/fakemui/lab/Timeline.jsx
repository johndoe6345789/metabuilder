import React from 'react'
import { classNames } from '../utils/classNames'

/**
 * Timeline - Displays a list of events in chronological order
 */
export function Timeline({
  children,
  position = 'right',
  className,
  ...props
}) {
  return (
    <ul
      className={classNames(
        'fakemui-timeline',
        `fakemui-timeline-position-${position}`,
        className
      )}
      {...props}
    >
      {children}
    </ul>
  )
}

/**
 * TimelineItem - A single event in the timeline
 */
export function TimelineItem({
  children,
  position,
  className,
  ...props
}) {
  return (
    <li
      className={classNames(
        'fakemui-timeline-item',
        position && `fakemui-timeline-item-position-${position}`,
        className
      )}
      {...props}
    >
      {children}
    </li>
  )
}

/**
 * TimelineSeparator - The separator between content and opposite content
 */
export function TimelineSeparator({ children, className, ...props }) {
  return (
    <div
      className={classNames('fakemui-timeline-separator', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * TimelineConnector - The vertical line connecting timeline items
 */
export function TimelineConnector({ className, ...props }) {
  return (
    <span
      className={classNames('fakemui-timeline-connector', className)}
      {...props}
    />
  )
}

/**
 * TimelineContent - The main content of a timeline item
 */
export function TimelineContent({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={classNames('fakemui-timeline-content', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * TimelineDot - The dot/icon indicator in the timeline
 */
export function TimelineDot({
  children,
  color = 'grey',
  variant = 'filled',
  className,
  ...props
}) {
  return (
    <span
      className={classNames(
        'fakemui-timeline-dot',
        `fakemui-timeline-dot-${variant}`,
        `fakemui-timeline-dot-${color}`,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/**
 * TimelineOppositeContent - Content on the opposite side of the timeline
 */
export function TimelineOppositeContent({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={classNames('fakemui-timeline-opposite-content', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export default Timeline
