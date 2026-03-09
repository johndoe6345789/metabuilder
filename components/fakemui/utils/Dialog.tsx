import React from 'react'
import styles from '../../../scss/atoms/mat-dialog.module.scss'

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const DialogOverlay: React.FC<DialogOverlayProps> = ({ children, onClick, className = '', ...props }) => (
  <div className={`${styles.dialogOverlay} ${className}`} onClick={onClick} {...props}>
    {children}
  </div>
)

export interface DialogPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  sm?: boolean
  lg?: boolean
  xl?: boolean
  fullScreen?: boolean
  /** Stretch dialog to its maxWidth boundary */
  fullWidth?: boolean
  /** Set to true when dialog is open to trigger animations */
  open?: boolean
  /** Show dialog with actions - adjusts content padding per Angular Material */
  hasActions?: boolean
  /** Test ID for automated testing */
  testId?: string
  /** ID of the element labelling this dialog (for aria-labelledby) */
  'aria-labelledby'?: string
}

export const DialogPanel: React.FC<DialogPanelProps> = ({
  children,
  sm,
  lg,
  xl,
  fullScreen,
  fullWidth,
  open = true,
  hasActions,
  testId,
  'aria-labelledby': ariaLabelledBy,
  className = '',
  ...props
}) => {
  const sizeClass = sm ? styles.dialogPanelSm : lg ? styles.dialogPanelLg : xl ? styles.dialogPanelXl : ''
  const fullScreenClass = fullScreen ? styles.dialogPanelFullscreen : ''
  const openClass = open ? styles.dialogOpen : ''

  return (
    <div className={openClass} {...props}>
      <div
        className={`${styles.dialogContainer} ${sizeClass} ${fullScreenClass} ${className}`}
        style={fullWidth ? { width: '100%' } : undefined}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        data-testid={testId}
        tabIndex={-1}
      >
        <div className={styles.dialogInnerContainer}>
          <div className={styles.dialogSurface}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  withIcon?: boolean
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, withIcon, className = '', ...props }) => (
  <div className={`${styles.dialogHeader} ${withIcon ? styles.dialogHeaderWithIcon : ''} ${className}`} {...props}>
    {children}
  </div>
)

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '', ...props }) => (
  <h2 className={`${styles.dialogTitle} ${className}`} {...props}>
    {children}
  </h2>
)

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  dividers?: boolean
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, dividers, className = '', ...props }) => (
  <>
    {dividers && <hr className={styles.dialogDivider} />}
    <div className={`${styles.dialogContent} ${className}`} {...props}>
      {children}
    </div>
    {dividers && <hr className={styles.dialogDivider} />}
  </>
)

export interface DialogContentTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

export const DialogContentText: React.FC<DialogContentTextProps> = ({ children, className = '', ...props }) => (
  <p className={`${styles.dialogContent} ${className}`} style={{ margin: 0 }} {...props}>
    {children}
  </p>
)

export interface DialogActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  stacked?: boolean
  /** Alignment of actions: 'start' | 'center' | 'end' (default) */
  align?: 'start' | 'center' | 'end'
}

export const DialogActions: React.FC<DialogActionsProps> = ({
  children,
  stacked,
  align,
  className = '',
  ...props
}) => {
  const alignClass = align === 'start' ? styles.dialogActionsStart : align === 'center' ? styles.dialogActionsCenter : ''
  const stackedClass = stacked ? styles.dialogActionsStacked : ''

  return (
    <div
      className={`${styles.dialogActions} ${alignClass} ${stackedClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export const DialogClose: React.FC<DialogCloseProps> = ({ children, className = '', ...props }) => (
  <button type="button" className={`${styles.dialogClose} ${className}`} aria-label="Close dialog" {...props}>
    {children}
  </button>
)

export interface DialogIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const DialogIcon: React.FC<DialogIconProps> = ({ children, className = '', ...props }) => (
  <div className={`${styles.dialogIcon} ${className}`} {...props}>
    {children}
  </div>
)

/**
 * Component host class - use when passing a component into the dialog
 * to ensure proper flex layout. Apply to the host element of your component.
 *
 * Example:
 * <DialogPanel>
 *   <div className="mat-mdc-dialog-component-host">
 *     <YourComponent />
 *   </div>
 * </DialogPanel>
 */
export const DialogComponentHostClass = 'mat-mdc-dialog-component-host'
