/**
 * Dialog Component
 * Material Design 3 dialog with backdrop and content panel
 * Wraps DialogOverlay and DialogPanel for consistent styling with Angular Material
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DialogOverlay, DialogPanel } from '../utils/Dialog';
import { useFocusTrap } from '../../../hooks/useAccessible';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  fullScreen?: boolean;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
  /** Test ID for automated testing */
  testId?: string;
  /** ID of the element labelling this dialog (for aria-labelledby) */
  'aria-labelledby'?: string;
}

export function Dialog({
  open,
  onClose,
  children,
  maxWidth = 'sm',
  fullWidth = false,
  fullScreen = false,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  testId,
  'aria-labelledby': ariaLabelledBy,
}: DialogProps): React.ReactElement | null {
  // Focus trapping
  const { focusTrapRef } = useFocusTrap(open);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableEscapeKeyDown) {
        onClose();
      }
    },
    [onClose, disableEscapeKeyDown]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const handleBackdropClick = () => {
    if (!disableBackdropClick) {
      onClose();
    }
  };

  // Map maxWidth to DialogPanel size props
  const sizeProps = {
    sm: maxWidth === 'xs' || maxWidth === 'sm',
    lg: maxWidth === 'md' || maxWidth === 'lg',
    xl: maxWidth === 'xl',
  };

  const dialog = (
    <DialogOverlay onClick={handleBackdropClick}>
      <div ref={focusTrapRef}>
        <DialogPanel
          open={open}
          fullScreen={fullScreen}
          fullWidth={fullWidth}
          sm={sizeProps.sm}
          lg={sizeProps.lg}
          xl={sizeProps.xl}
          hasActions={true}
          testId={testId}
          aria-labelledby={ariaLabelledBy}
        >
          {children}
        </DialogPanel>
      </div>
    </DialogOverlay>
  );

  // Use portal to render at document root
  if (typeof document !== 'undefined') {
    return createPortal(dialog, document.body);
  }

  return dialog;
}

export default Dialog;
