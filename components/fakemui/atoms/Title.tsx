import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/title.module.scss'

export type DisplaySize = 'large' | 'medium' | 'small'
export type HeadlineSize = 'large' | 'medium' | 'small'
export type TitleSize = 'large' | 'medium' | 'small'

export interface TitleProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  /** @deprecated Use variant props instead */
  page?: boolean
  /** @deprecated Use variant props instead */
  card?: boolean
  truncate?: boolean
  as?: React.ElementType
  /** Display variant for hero sections (large, medium, small) */
  display?: DisplaySize
  /** Headline variant (large = pageTitle, medium, small) */
  headline?: HeadlineSize
  /** Title variant (large = cardTitle, medium, small) */
  title?: TitleSize
  /** Test ID for automated testing */
  testId?: string
}

export const Title: React.FC<TitleProps> = ({
  children,
  page,
  card,
  truncate,
  testId,
  className,
  as: Tag = 'h2',
  display,
  headline,
  title,
  ...props
}) => {
  const computedClassName = classNames(
    // Legacy props (deprecated but still supported)
    { [styles.pageTitle]: page },
    { [styles.cardTitle]: card },
    { [styles.cardTitleTruncate]: truncate },
    // Display variants
    { [styles.displayTitle]: display === 'large' },
    { [styles.displayTitleMedium]: display === 'medium' },
    { [styles.displayTitleSmall]: display === 'small' },
    // Headline variants
    { [styles.pageTitle]: headline === 'large' },
    { [styles.headline]: headline === 'medium' },
    { [styles.headlineSmall]: headline === 'small' },
    // Title variants
    { [styles.cardTitle]: title === 'large' },
    { [styles.title]: title === 'medium' },
    { [styles.titleSmall]: title === 'small' },
    className
  )

  return (
    <Tag className={computedClassName} data-testid={testId} {...props}>
      {children}
    </Tag>
  )
}

export interface SubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
  /** @deprecated Use variant prop instead */
  page?: boolean
  /** Use card variant for card subtitles */
  card?: boolean
}

export const Subtitle: React.FC<SubtitleProps> = ({
  children,
  className,
  page = true,
  card,
  ...props
}) => {
  const computedClassName = classNames(
    { [styles.pageSubtitle]: page && !card },
    { [styles.cardSubtitle]: card },
    className
  )

  return (
    <p className={computedClassName} {...props}>
      {children}
    </p>
  )
}
