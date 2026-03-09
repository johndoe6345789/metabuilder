/**
 * Password Strength Indicator - FakeMUI Component
 * Shows visual feedback for password strength with progress bar and message
 */

import React from 'react';
import { LinearProgress, Box, Typography } from '../fakemui';
import styles from '../../scss/components/feedback/password-strength.module.scss';

export interface PasswordStrengthIndicatorProps {
  /** Password value to evaluate */
  password: string;
  /** Strength score (0-4) */
  strength: number;
  /** Strength message (e.g. "Weak", "Strong") */
  message: string;
  /** Hint text shown below indicator */
  hint?: string;
  /** Additional CSS class */
  className?: string;
  [key: string]: any;
}

/**
 * PasswordStrengthIndicator
 *
 * Displays a color-coded progress bar and message indicating password strength.
 *
 * @example
 * ```tsx
 * <PasswordStrengthIndicator
 *   password={password}
 *   strength={2}
 *   message="Medium strength"
 *   hint="At least 8 characters with uppercase, lowercase, and numbers"
 * />
 * ```
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  message,
  hint,
  className,
  ...rest
}) => {
  if (!password) return null;

  // Map strength to color
  const getColor = () => {
    if (strength <= 1) return 'error';
    if (strength <= 2) return 'warning';
    return 'success';
  };

  return (
    <Box className={className} {...rest}>
      <Box className={styles.strengthBar} data-testid="password-strength-indicator">
        <LinearProgress
          variant="determinate"
          value={(strength / 4) * 100}
          color={getColor()}
          data-testid="password-strength-progress"
        />
        <Typography
          variant="body2"
          className={styles.strengthLabel}
          data-testid="password-strength-message"
        >
          {message}
        </Typography>
      </Box>
      {hint && (
        <Typography
          variant="caption"
          className={styles.strengthHint}
          data-testid="password-strength-hint"
        >
          {hint}
        </Typography>
      )}
    </Box>
  );
};
