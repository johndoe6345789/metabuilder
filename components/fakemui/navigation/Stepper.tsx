import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/Stepper.module.scss'

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  activeStep?: number
  orientation?: 'horizontal' | 'vertical'
  alternativeLabel?: boolean
  nonLinear?: boolean
  connector?: React.ReactNode
  /** Test ID for automated testing */
  testId?: string
}

export const Stepper: React.FC<StepperProps> = ({
  children,
  activeStep,
  orientation = 'horizontal',
  alternativeLabel = false,
  nonLinear = false,
  connector,
  className,
  testId,
  ...props
}) => (
  <div
    role="navigation"
    aria-label="progress"
    data-testid={testId}
    className={classNames(
      styles.stepper,
      {
        [styles.horizontal]: orientation === 'horizontal',
        [styles.vertical]: orientation === 'vertical',
        [styles.alternativeLabel]: alternativeLabel,
      },
      className
    )}
    {...props}
  >
    {React.Children.map(children, (child, index) => (
      <>
        {child}
        {index < React.Children.count(children) - 1 &&
          (connector || <StepConnector orientation={orientation} />)}
      </>
    ))}
  </div>
)

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  active?: boolean
  completed?: boolean
  disabled?: boolean
  expanded?: boolean
  index?: number
  last?: boolean
}

export const Step: React.FC<StepProps> = ({
  children,
  active,
  completed,
  disabled,
  expanded,
  index,
  last,
  className,
  ...props
}) => (
  <div
    className={classNames(
      styles.step,
      {
        [styles.active]: active,
        [styles.completed]: completed,
        [styles.clickable]: !disabled && props.onClick,
      },
      className
    )}
    data-index={index}
    {...props}
  >
    {children}
  </div>
)

export interface StepLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  icon?: React.ReactNode | false
  optional?: React.ReactNode
  error?: boolean
  StepIconComponent?: React.ComponentType<any>
  StepIconProps?: any
}

export const StepLabel: React.FC<StepLabelProps> = ({
  children,
  icon,
  optional,
  error,
  StepIconComponent,
  StepIconProps,
  className,
  ...props
}) => (
  <span
    className={classNames(
      styles.stepContent,
      {
        [styles.error]: error,
      },
      className
    )}
    {...props}
  >
    {icon !== false && (
      <span className={styles.stepIcon}>
        {StepIconComponent ? <StepIconComponent {...StepIconProps} /> : icon}
      </span>
    )}
    <span className={styles.stepLabels}>
      <span className={styles.stepLabel}>{children}</span>
      {optional && <span className={styles.optional}>{optional}</span>}
    </span>
  </span>
)

export interface StepButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  icon?: React.ReactNode
  optional?: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}

export const StepButton: React.FC<StepButtonProps> = ({
  children,
  icon,
  optional,
  onClick,
  disabled,
  className,
  ...props
}) => (
  <button
    className={classNames(styles.clickable, className)}
    onClick={onClick}
    disabled={disabled}
    type="button"
    {...props}
  >
    <StepLabel icon={icon} optional={optional}>
      {children}
    </StepLabel>
  </button>
)

export interface StepContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  TransitionComponent?: React.ComponentType<any>
  TransitionProps?: any
  transitionDuration?: number | string
}

export const StepContent: React.FC<StepContentProps> = ({
  children,
  TransitionComponent,
  TransitionProps,
  transitionDuration,
  className,
  ...props
}) => (
  <div className={classNames(styles.stepContent, className)} {...props}>
    {children}
  </div>
)

export interface StepConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  completed?: boolean
}

export const StepConnector: React.FC<StepConnectorProps> = ({
  orientation = 'horizontal',
  completed,
  className,
  ...props
}) => (
  <div
    className={classNames(
      styles.connector,
      {
        [styles.horizontal]: orientation === 'horizontal',
        [styles.vertical]: orientation === 'vertical',
        [styles.completed]: completed,
      },
      className
    )}
    {...props}
  >
    <span className={styles.connectorLine} />
  </div>
)

export interface StepIconProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  completed?: boolean
  error?: boolean
  icon?: React.ReactNode
}

export const StepIcon: React.FC<StepIconProps> = ({
  active,
  completed,
  error,
  icon,
  className,
  ...props
}) => (
  <div
    className={classNames(
      styles.stepIcon,
      {
        [styles.active]: active,
        [styles.completed]: completed,
        [styles.error]: error,
      },
      className
    )}
    {...props}
  >
    {completed ? '✓' : error ? '!' : icon}
  </div>
)
