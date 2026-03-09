/**
 * Not Found State - FakeMUI Component
 * 404 error page with fail whale illustration
 */

import React from 'react';
import Link from 'next/link';
import { Box, Typography, Button } from '../fakemui';
import styles from '../../scss/components/feedback/not-found.module.scss';

export interface NotFoundStateProps {
  /** Error code to display */
  errorCode?: string | number;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Primary action button text */
  primaryActionText?: string;
  /** Primary action button href */
  primaryActionHref?: string;
  /** Secondary action button text */
  secondaryActionText?: string;
  /** Secondary action button href */
  secondaryActionHref?: string;
  /** Additional CSS class */
  className?: string;
  [key: string]: any;
}

/**
 * FailWhale SVG Illustration
 * Cute whale being lifted by birds with ocean waves
 */
const FailWhale: React.FC = () => (
  <svg
    width="200"
    height="180"
    viewBox="0 -20 200 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.failWhale}
    aria-hidden="true"
  >
    {/* Ocean waves */}
    <path d="M0 140 Q25 130 50 140 T100 140 T150 140 T200 140 V160 H0 Z" fill="var(--mat-sys-primary-container)" opacity="0.5"/>
    <path d="M0 145 Q25 135 50 145 T100 145 T150 145 T200 145 V160 H0 Z" fill="var(--mat-sys-primary-container)" opacity="0.7"/>
    <path d="M0 150 Q25 142 50 150 T100 150 T150 150 T200 150 V160 H0 Z" fill="var(--mat-sys-primary-container)"/>

    {/* Whale body */}
    <ellipse cx="100" cy="95" rx="70" ry="45" fill="var(--mat-sys-primary)"/>

    {/* Whale belly */}
    <ellipse cx="100" cy="105" rx="55" ry="30" fill="var(--mat-sys-primary-container)"/>

    {/* Whale tail */}
    <path d="M165 85 Q190 70 195 50 Q175 65 170 80" fill="var(--mat-sys-primary)"/>
    <path d="M165 105 Q190 120 195 140 Q175 125 170 110" fill="var(--mat-sys-primary)"/>

    {/* Whale eye */}
    <circle cx="55" cy="85" r="10" fill="white"/>
    <circle cx="57" cy="87" r="5" fill="var(--mat-sys-on-primary)"/>
    <circle cx="55" cy="85" r="2" fill="white"/>

    {/* Whale mouth (sad) */}
    <path d="M40 105 Q55 100 70 105" stroke="var(--mat-sys-on-primary)" strokeWidth="3" fill="none" strokeLinecap="round"/>

    {/* Water spout */}
    <path d="M85 50 Q82 35 78 20 M85 50 Q85 32 85 15 M85 50 Q88 35 92 20" stroke="var(--mat-sys-primary)" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="78" cy="15" r="4" fill="var(--mat-sys-primary-container)"/>
    <circle cx="85" cy="10" r="5" fill="var(--mat-sys-primary-container)"/>
    <circle cx="92" cy="15" r="4" fill="var(--mat-sys-primary-container)"/>

    {/* Lifting birds/helpers */}
    <g transform="translate(30, 25)">
      <ellipse cx="0" cy="0" rx="8" ry="5" fill="var(--mat-sys-tertiary)"/>
      <path d="M-8 0 Q-12 -5 -8 -3 M8 0 Q12 -5 8 -3" stroke="var(--mat-sys-tertiary)" strokeWidth="2" fill="none"/>
      <circle cx="-3" cy="-1" r="1" fill="var(--mat-sys-on-tertiary)"/>
    </g>
    <g transform="translate(140, 30)">
      <ellipse cx="0" cy="0" rx="8" ry="5" fill="var(--mat-sys-tertiary)"/>
      <path d="M-8 0 Q-12 -5 -8 -3 M8 0 Q12 -5 8 -3" stroke="var(--mat-sys-tertiary)" strokeWidth="2" fill="none"/>
      <circle cx="-3" cy="-1" r="1" fill="var(--mat-sys-on-tertiary)"/>
    </g>
    <g transform="translate(85, 0)">
      <ellipse cx="0" cy="0" rx="8" ry="5" fill="var(--mat-sys-tertiary)"/>
      <path d="M-8 0 Q-12 -5 -8 -3 M8 0 Q12 -5 8 -3" stroke="var(--mat-sys-tertiary)" strokeWidth="2" fill="none"/>
      <circle cx="-3" cy="-1" r="1" fill="var(--mat-sys-on-tertiary)"/>
    </g>

    {/* Ropes */}
    <line x1="30" y1="30" x2="60" y2="60" stroke="var(--mat-sys-outline)" strokeWidth="1.5" strokeDasharray="4 2"/>
    <line x1="140" y1="35" x2="120" y2="60" stroke="var(--mat-sys-outline)" strokeWidth="1.5" strokeDasharray="4 2"/>
    <line x1="85" y1="5" x2="90" y2="50" stroke="var(--mat-sys-outline)" strokeWidth="1.5" strokeDasharray="4 2"/>
  </svg>
);

/**
 * NotFoundState
 *
 * 404 error page component with fail whale illustration and action buttons.
 *
 * @example
 * ```tsx
 * <NotFoundState
 *   errorCode="404"
 *   title="Page not found"
 *   description="Looks like this page swam away!"
 *   primaryActionText="Go to Dashboard"
 *   primaryActionHref="/"
 *   secondaryActionText="View Workflows"
 *   secondaryActionHref="/workflows"
 * />
 * ```
 */
export const NotFoundState: React.FC<NotFoundStateProps> = ({
  errorCode = '404',
  title = 'Page not found',
  description = "Looks like this page swam away! The workflow you're looking for doesn't exist or has been moved.",
  primaryActionText = 'Go to Dashboard',
  primaryActionHref = '/',
  secondaryActionText = 'View Workflows',
  secondaryActionHref = '/workflows',
  className,
  ...rest
}) => {
  return (
    <Box className={`${styles.notFoundContainer} ${className || ''}`} {...rest} data-testid="not-found-state">
      <Box className={styles.illustration} data-testid="fail-whale-illustration">
        <FailWhale />
      </Box>

      <Typography
        variant="h1"
        className={styles.errorCode}
        data-testid="error-code"
      >
        {errorCode}
      </Typography>

      <Typography
        variant="h2"
        className={styles.title}
        data-testid="error-title"
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        className={styles.description}
        data-testid="error-description"
      >
        {description}
      </Typography>

      <Box className={styles.actions} data-testid="error-actions">
        {primaryActionHref && primaryActionText && (
          <Link href={primaryActionHref as any}>
            <Button variant="contained" data-testid="primary-action">
              {primaryActionText}
            </Button>
          </Link>
        )}
        {secondaryActionHref && secondaryActionText && (
          <Link href={secondaryActionHref as any}>
            <Button variant="outlined" data-testid="secondary-action">
              {secondaryActionText}
            </Button>
          </Link>
        )}
      </Box>

      <Typography
        variant="caption"
        className={styles.errorMeta}
        data-testid="error-meta"
      >
        Error code: {errorCode} • Page not found
      </Typography>
    </Box>
  );
};
