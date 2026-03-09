import React, { forwardRef, useState, useCallback, useMemo, createContext, useContext } from 'react'
import styles from '../../../scss/atoms/accordion.module.scss'

// Context for sharing accordion state with children
interface AccordionContextValue {
  expanded: boolean
  disabled: boolean
  toggle: (event?: React.SyntheticEvent) => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

const useAccordionContext = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion compound components must be used within an Accordion')
  }
  return context
}

// ============================================================================
// Accordion
// ============================================================================

export type AccordionVariant = 'elevated' | 'outlined' | 'filled'

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Content of the accordion */
  children?: React.ReactNode
  /** If true, the accordion is expanded (controlled) */
  expanded?: boolean
  /** If true, the accordion is expanded by default (uncontrolled) */
  defaultExpanded?: boolean
  /** Callback fired when the expand/collapse state changes */
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void
  /** If true, the accordion is disabled */
  disabled?: boolean
  /** The variant to use */
  variant?: AccordionVariant
  /** If true, removes margin when expanded */
  disableGutters?: boolean
  /** If true, removes rounded corners when placed in an AccordionGroup */
  square?: boolean
  /** Test ID for automated testing */
  testId?: string
}

/**
 * Variant to CSS module class mapping
 */
const variantClassMap: Record<AccordionVariant, string> = {
  elevated: styles.accordionElevated,
  outlined: styles.accordionOutlined,
  filled: styles.accordionFilled,
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      children,
      expanded: controlledExpanded,
      defaultExpanded = false,
      onChange,
      disabled = false,
      variant = 'elevated',
      disableGutters = false,
      square = false,
      className = '',
      testId,
      ...props
    },
    ref
  ) => {
    // Handle controlled vs uncontrolled state
    const isControlled = controlledExpanded !== undefined
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
    const expanded = isControlled ? controlledExpanded : internalExpanded

    const toggle = useCallback(
      (event?: React.SyntheticEvent) => {
        if (disabled) return

        const newExpanded = !expanded

        if (!isControlled) {
          setInternalExpanded(newExpanded)
        }

        if (event) {
          onChange?.(event, newExpanded)
        }
      },
      [disabled, expanded, isControlled, onChange]
    )

    const contextValue = useMemo(
      () => ({
        expanded,
        disabled,
        toggle,
      }),
      [expanded, disabled, toggle]
    )

    const classes = [
      styles.accordion,
      expanded ? styles.accordionOpen : '',
      disabled ? styles.accordionDisabled : '',
      variantClassMap[variant] || '',
      className,
    ].filter(Boolean).join(' ')

    return (
      <AccordionContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={classes}
          aria-expanded={expanded}
          aria-disabled={disabled}
          data-testid={testId}
          {...props}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)

Accordion.displayName = 'Accordion'

// ============================================================================
// AccordionSummary
// ============================================================================

export interface AccordionSummaryProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Content of the summary (typically title and subtitle) */
  children?: React.ReactNode
  /** Icon to display at the end (typically an expand icon) */
  expandIcon?: React.ReactNode
  /** Element to display before the title */
  leadingIcon?: React.ReactNode
  /** Additional classes for the icon wrapper */
  iconClassName?: string
  /** Callback fired when clicked */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const AccordionSummary = forwardRef<HTMLButtonElement, AccordionSummaryProps>(
  ({ children, expandIcon, leadingIcon, iconClassName = '', className = '', onClick, ...props }, ref) => {
    const { expanded, disabled, toggle } = useAccordionContext()

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        toggle(event)
        onClick?.(event)
      },
      [toggle, onClick]
    )

    const headerClasses = [styles.accordionHeader, className].filter(Boolean).join(' ')
    const iconClasses = [styles.accordionIcon, iconClassName].filter(Boolean).join(' ')

    return (
      <button
        ref={ref}
        type="button"
        className={headerClasses}
        onClick={handleClick}
        disabled={disabled}
        aria-expanded={expanded}
        aria-disabled={disabled}
        {...props}
      >
        {leadingIcon && <span className={styles.accordionLeading}>{leadingIcon}</span>}
        <span className={styles.accordionTitle}>{children}</span>
        {expandIcon && <span className={iconClasses}>{expandIcon}</span>}
      </button>
    )
  }
)

AccordionSummary.displayName = 'AccordionSummary'

// ============================================================================
// AccordionDetails
// ============================================================================

export interface AccordionDetailsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content of the details section */
  children?: React.ReactNode
  /** If true, adds extra top padding */
  padded?: boolean
}

export const AccordionDetails = forwardRef<HTMLDivElement, AccordionDetailsProps>(
  ({ children, padded = false, className = '', ...props }, ref) => {
    const { expanded } = useAccordionContext()

    const contentClasses = [
      styles.accordionContent,
      padded ? styles.accordionContentPadded : '',
      className,
    ].filter(Boolean).join(' ')

    return (
      <div className={styles.accordionCollapse} aria-hidden={!expanded}>
        <div className={styles.accordionCollapseInner}>
          <div ref={ref} className={contentClasses} {...props}>
            {children}
          </div>
        </div>
      </div>
    )
  }
)

AccordionDetails.displayName = 'AccordionDetails'

// ============================================================================
// AccordionActions
// ============================================================================

export interface AccordionActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Action buttons or other interactive elements */
  children?: React.ReactNode
  /** If true, removes default spacing between actions */
  disableSpacing?: boolean
}

export const AccordionActions = forwardRef<HTMLDivElement, AccordionActionsProps>(
  ({ children, disableSpacing = false, className = '', ...props }, ref) => {
    const { expanded } = useAccordionContext()

    const actionsClasses = [styles.accordionActions, className].filter(Boolean).join(' ')

    return (
      <div className={styles.accordionCollapse} aria-hidden={!expanded}>
        <div className={styles.accordionCollapseInner}>
          <div ref={ref} className={actionsClasses} {...props}>
            {children}
          </div>
        </div>
      </div>
    )
  }
)

AccordionActions.displayName = 'AccordionActions'

// ============================================================================
// AccordionGroup
// ============================================================================

export interface AccordionGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accordion components */
  children?: React.ReactNode
  /** If true, removes gaps between accordions */
  flush?: boolean
}

export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  ({ children, flush = false, className = '', ...props }, ref) => {
    const groupClasses = [
      styles.accordionGroup,
      flush ? styles.accordionGroupFlush : '',
      className,
    ].filter(Boolean).join(' ')

    return (
      <div ref={ref} className={groupClasses} {...props}>
        {children}
      </div>
    )
  }
)

AccordionGroup.displayName = 'AccordionGroup'

// ============================================================================
// Default Expand Icon
// ============================================================================

export interface ExpandMoreIconProps extends React.SVGProps<SVGSVGElement> {}

export const ExpandMoreIcon: React.FC<ExpandMoreIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
  </svg>
)

// ============================================================================
// Exports
// ============================================================================

export default Accordion
