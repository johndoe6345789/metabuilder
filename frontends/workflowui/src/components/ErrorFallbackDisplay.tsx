/**
 * ErrorFallbackDisplay - Default fallback UI for ErrorBoundary
 */

import React, { ErrorInfo } from 'react';
import { Button } from '@metabuilder/fakemui';
import ErrorDetails from './ErrorDetails';

interface ErrorFallbackDisplayProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

const outerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '24px',
  textAlign: 'center',
  backgroundColor: 'var(--mat-sys-surface)',
  color: 'var(--mat-sys-on-surface)',
};

const cardStyle: React.CSSProperties = {
  maxWidth: '600px',
  padding: '32px',
  borderRadius: '16px',
  backgroundColor: 'var(--mat-sys-error-container)',
  color: 'var(--mat-sys-on-error-container)',
};

export default function ErrorFallbackDisplay({
  error,
  errorInfo,
  onReset,
}: ErrorFallbackDisplayProps) {
  return (
    <div style={outerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          ⚠️
        </div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '8px',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: '16px',
            marginBottom: '24px',
            opacity: 0.8,
          }}
        >
          We encountered an unexpected error.
          Please try refreshing the page.
        </p>

        <ErrorDetails error={error} errorInfo={errorInfo} />

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          <Button variant="contained" onClick={onReset}>
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={() => { window.location.href = '/'; }}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
