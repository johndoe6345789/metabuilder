import React from 'react'

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  activeStep?: number
  orientation?: 'horizontal' | 'vertical'
  alternativeLabel?: boolean
  nonLinear?: boolean
  connector?: React.ReactNode
}

export const Stepper: React.FC<StepperProps> = ({
  children,
  activeStep,
  orientation = 'horizontal',
  alternativeLabel = false,
  nonLinear = false,
  connector,
  className = '',
  ...props
}) => (
  <div
    className={`stepper stepper--${orientation} ${alternativeLabel ? 'stepper--alternative-label' : ''} ${nonLinear ? 'stepper--non-linear' : ''} ${className}`}
    {...props}
  >
    {React.Children.map(children, (child, index) => (
      <>
        {child}
        {index < React.Children.count(children) - 1 && (connector || <StepConnector />)}
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
  className = '',
  ...props
}) => (
  <div
    className={`step ${active ? 'step--active' : ''} ${completed ? 'step--completed' : ''} ${disabled ? 'step--disabled' : ''} ${expanded ? 'step--expanded' : ''} ${className}`}
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
  className = '',
  ...props
}) => (
  <span className={`step-label ${error ? 'step-label--error' : ''} ${className}`} {...props}>
    {icon !== false && (
      <span className="step-icon">{StepIconComponent ? <StepIconComponent {...StepIconProps} /> : icon}</span>
    )}
    <span className="step-label-container">
      <span className="step-label-text">{children}</span>
      {optional && <span className="step-label-optional">{optional}</span>}
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
  className = '',
  ...props
}) => (
  <button
    className={`step-button ${disabled ? 'step-button--disabled' : ''} ${className}`}
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
  className = '',
  ...props
}) => (
  <div className={`step-content ${className}`} {...props}>
    {children}
  </div>
)

export interface StepConnectorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const StepConnector: React.FC<StepConnectorProps> = ({ className = '', ...props }) => (
  <div className={`step-connector ${className}`} {...props}>
    <span className="step-connector-line" />
  </div>
)

export interface StepIconProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  completed?: boolean
  error?: boolean
  icon?: React.ReactNode
}

export const StepIcon: React.FC<StepIconProps> = ({ active, completed, error, icon, className = '', ...props }) => (
  <div
    className={`step-icon ${active ? 'step-icon--active' : ''} ${completed ? 'step-icon--completed' : ''} ${error ? 'step-icon--error' : ''} ${className}`}
    {...props}
  >
    {completed ? '✓' : error ? '!' : icon}
  </div>
)
