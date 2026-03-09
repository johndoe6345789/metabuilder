/**
 * Auth Form Layout - FakeMUI Component
 * Wrapper layout for authentication pages (login, register)
 */

import React from 'react';
import Link from 'next/link';
import { Box, Typography } from '../fakemui';
import styles from '../../scss/components/layout/auth-layout.module.scss';

export interface AuthFormLayoutProps {
  /** Page title (e.g. "WorkflowUI") */
  title: string;
  /** Subtitle text (e.g. "Sign in to your account") */
  subtitle: string;
  /** Form content */
  children: React.ReactNode;
  /** Footer text (e.g. "Don't have an account?") */
  footerText?: string;
  /** Footer link href */
  footerLinkHref?: string;
  /** Footer link text */
  footerLinkText?: string;
  /** Additional CSS class */
  className?: string;
  [key: string]: any;
}

/**
 * AuthFormLayout
 *
 * Provides consistent layout for authentication pages with centered card,
 * header, form area, and footer with link.
 *
 * @example
 * ```tsx
 * <AuthFormLayout
 *   title="WorkflowUI"
 *   subtitle="Sign in to your account"
 *   footerText="Don't have an account?"
 *   footerLinkHref="/register"
 *   footerLinkText="Sign up"
 * >
 *   <form>...</form>
 * </AuthFormLayout>
 * ```
 */
export const AuthFormLayout: React.FC<AuthFormLayoutProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkHref,
  footerLinkText,
  className,
  ...rest
}) => {
  return (
    <Box className={`${styles.authPage} ${className || ''}`} {...rest} data-testid="auth-layout">
      <Box className={styles.authCard} data-testid="auth-card">
        <Box className={styles.authHeader} data-testid="auth-header">
          <Typography variant="h4" className={styles.authTitle} data-testid="auth-title">
            {title}
          </Typography>
          <Typography variant="body1" className={styles.authSubtitle} data-testid="auth-subtitle">
            {subtitle}
          </Typography>
        </Box>

        {children}

        {(footerText || footerLinkHref || footerLinkText) && (
          <Box className={styles.authFooter} data-testid="auth-footer">
            <Typography variant="body2">
              {footerText}{' '}
              {footerLinkHref && footerLinkText && (
                <Link href={footerLinkHref as any} className={styles.authLink} data-testid="auth-footer-link">
                  {footerLinkText}
                </Link>
              )}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
