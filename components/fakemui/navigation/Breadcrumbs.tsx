import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/breadcrumbs.module.scss'

/**
 * BreadcrumbItem for the items-based API
 */
export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  /** Children-based API: pass breadcrumb elements directly */
  children?: React.ReactNode
  /** Items-based API: pass an array of breadcrumb items */
  items?: BreadcrumbItem[]
  /** Separator between breadcrumb items */
  separator?: React.ReactNode
  /** Render function for links (for framework-specific routing) */
  renderLink?: (item: BreadcrumbItem, index: number) => React.ReactNode
  /** Test ID for accessibility testing */
  'data-testid'?: string
}

/**
 * Breadcrumbs Component
 * Navigation breadcrumbs showing hierarchy
 *
 * Supports two APIs:
 * 1. Children-based: <Breadcrumbs><a href="/">Home</a><span>Current</span></Breadcrumbs>
 * 2. Items-based: <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Current' }]} />
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  children,
  items,
  separator = '/',
  renderLink,
  className = '',
  'data-testid': testId,
  ...props
}) => {
  // If items are provided, use items-based rendering
  // Filter out items with empty or undefined labels to prevent empty breadcrumb items
  const validItems = items?.filter((item) => item.label && item.label.trim() !== '') ?? []

  if (validItems.length > 0) {
    return (
      <nav
        className={classNames(styles.breadcrumbs, className)}
        aria-label="Breadcrumb navigation"
        data-testid={testId}
        {...props}
      >
        <ol className={styles.breadcrumbsList} role="list">
          {validItems.map((item, index) => {
            const isLast = index === validItems.length - 1
            return (
              <li
                key={index}
                className={styles.breadcrumbsItem}
                role="listitem"
                aria-current={isLast ? 'page' : undefined}
              >
                {item.href && !isLast ? (
                  <>
                    {renderLink ? (
                      renderLink(item, index)
                    ) : (
                      <a
                        href={item.href}
                        data-testid={testId ? `${testId}-link-${item.label.toLowerCase().replace(/\s+/g, '-')}` : undefined}
                      >
                        {item.label}
                      </a>
                    )}
                    <span className={styles.breadcrumbsSeparator} aria-hidden="true">
                      {separator}
                    </span>
                  </>
                ) : (
                  <>
                    <span className={styles.breadcrumbsCurrent} aria-current="page">
                      {item.label}
                    </span>
                    {!isLast && (
                      <span className={styles.breadcrumbsSeparator} aria-hidden="true">
                        {separator}
                      </span>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }

  // Children-based rendering (original API)
  // Filter out null, undefined, and boolean children to prevent empty breadcrumb items
  const validChildren = React.Children.toArray(children).filter(
    (child) => child != null && typeof child !== 'boolean'
  )

  return (
    <nav
      className={classNames(styles.breadcrumbs, className)}
      aria-label="breadcrumb"
      data-testid={testId}
      {...props}
    >
      <ol className={styles.breadcrumbsList}>
        {validChildren.map((child, i) => (
          <li key={i} className={styles.breadcrumbsItem}>
            {i > 0 && <span className={styles.breadcrumbsSeparator}>{separator}</span>}
            {child}
          </li>
        ))}
      </ol>
    </nav>
  )
}
