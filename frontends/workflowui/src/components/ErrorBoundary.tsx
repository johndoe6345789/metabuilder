/**
 * ErrorBoundary Component
 * Catches React errors and displays a fallback UI
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@metabuilder/fakemui';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--mat-sys-surface)',
            color: 'var(--mat-sys-on-surface)',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              padding: '32px',
              borderRadius: '16px',
              backgroundColor: 'var(--mat-sys-error-container)',
              color: 'var(--mat-sys-on-error-container)',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}
            >
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
              We encountered an unexpected error. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '8px', fontWeight: 600 }}>
                  Error Details
                </summary>
                <div>
                  <strong>Message:</strong>
                  <pre style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>
                    {this.state.error.message}
                  </pre>
                </div>
                {this.state.error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre style={{ margin: '8px 0', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre style={{ margin: '8px 0', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </details>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button variant="contained" onClick={this.resetError}>
                Try Again
              </Button>
              <Button variant="outlined" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
