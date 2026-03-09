import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/section.module.scss'

export type SectionSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  size?: SectionSize
  /** @deprecated Use size="sm" instead */
  sm?: boolean
  /** Test ID for automated testing */
  testId?: string
}

export const Section: React.FC<SectionProps> = ({
  children,
  size = 'md',
  sm,
  testId,
  className,
  ...props
}) => {
  const effectiveSize = sm ? 'sm' : size

  return (
    <div
      className={classNames(
        styles.section,
        {
          [styles.sectionSm]: effectiveSize === 'sm',
          [styles.sectionLg]: effectiveSize === 'lg',
          [styles.sectionXl]: effectiveSize === 'xl',
        },
        className
      )}
      data-testid={testId}
      role="region"
      {...props}
    >
      {children}
    </div>
  )
}

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  size?: 'sm' | 'md'
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  children,
  size = 'md',
  className,
  ...props
}) => (
  <div
    className={classNames(
      styles.sectionHeader,
      { [styles.sectionHeaderSm]: size === 'sm' },
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={classNames(styles.sectionTitle, className)} {...props}>
    {children}
  </h3>
)

export interface SectionSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

export const SectionSubtitle: React.FC<SectionSubtitleProps> = ({
  children,
  className,
  ...props
}) => (
  <p className={classNames(styles.sectionSubtitle, className)} {...props}>
    {children}
  </p>
)

export type SectionContentVariant = 'elevated' | 'outlined' | 'transparent'

export interface SectionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  variant?: SectionContentVariant
}

export const SectionContent: React.FC<SectionContentProps> = ({
  children,
  variant,
  className,
  ...props
}) => (
  <div
    className={classNames(
      styles.sectionContent,
      {
        [styles.sectionContentElevated]: variant === 'elevated',
        [styles.sectionContentOutlined]: variant === 'outlined',
        [styles.sectionContentTransparent]: variant === 'transparent',
      },
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export interface SectionActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const SectionActions: React.FC<SectionActionsProps> = ({
  children,
  className,
  ...props
}) => (
  <div className={classNames(styles.sectionActions, className)} {...props}>
    {children}
  </div>
)

export interface SectionDividerProps extends React.HTMLAttributes<HTMLHRElement> {}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  className,
  ...props
}) => (
  <hr className={classNames(styles.sectionDivider, className)} {...props} />
)
