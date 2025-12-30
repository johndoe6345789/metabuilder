import React from 'react'

export const Stepper = ({ children, activeStep, orientation = 'horizontal', alternativeLabel = false, nonLinear = false, connector, className = '', ...props }) => (
  <div className={`stepper stepper--${orientation} ${alternativeLabel ? 'stepper--alternative-label' : ''} ${nonLinear ? 'stepper--non-linear' : ''} ${className}`} {...props}>
    {React.Children.map(children, (child, index) => (
      <>
        {child}
        {index < React.Children.count(children) - 1 && (connector || <StepConnector />)}
      </>
    ))}
  </div>
)

export const Step = ({ children, active, completed, disabled, expanded, index, last, className = '', ...props }) => (
  <div className={`step ${active ? 'step--active' : ''} ${completed ? 'step--completed' : ''} ${disabled ? 'step--disabled' : ''} ${expanded ? 'step--expanded' : ''} ${className}`} data-index={index} {...props}>{children}</div>
)

export const StepLabel = ({ children, icon, optional, error, StepIconComponent, StepIconProps, className = '', ...props }) => (
  <span className={`step-label ${error ? 'step-label--error' : ''} ${className}`} {...props}>
    {icon !== false && (
      <span className="step-icon">
        {StepIconComponent ? <StepIconComponent {...StepIconProps} /> : icon}
      </span>
    )}
    <span className="step-label-container">
      <span className="step-label-text">{children}</span>
      {optional && <span className="step-label-optional">{optional}</span>}
    </span>
  </span>
)

export const StepButton = ({ children, icon, optional, onClick, disabled, className = '', ...props }) => (
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

export const StepContent = ({ children, TransitionComponent, TransitionProps, transitionDuration, className = '', ...props }) => (
  <div className={`step-content ${className}`} {...props}>
    {children}
  </div>
)

export const StepConnector = ({ className = '', ...props }) => (
  <div className={`step-connector ${className}`} {...props}>
    <span className="step-connector-line" />
  </div>
)

export const StepIcon = ({ active, completed, error, icon, className = '', ...props }) => (
  <div
    className={`step-icon ${active ? 'step-icon--active' : ''} ${completed ? 'step-icon--completed' : ''} ${error ? 'step-icon--error' : ''} ${className}`}
    {...props}
  >
    {completed ? '✓' : error ? '!' : icon}
  </div>
)
