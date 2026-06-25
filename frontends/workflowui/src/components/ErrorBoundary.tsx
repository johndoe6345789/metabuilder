/**
 * ErrorBoundary Component
 * Catches React errors and displays a fallback UI
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallbackDisplay from './ErrorFallbackDisplay';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (
    error: Error,
    resetError: () => void
  ) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      'ErrorBoundary caught an error:',
      error,
      errorInfo
    );
    this.setState({ error, errorInfo });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;

    if (hasError && error) {
      if (this.props.fallback) {
        return this.props.fallback(error, this.resetError);
      }
      return (
        <ErrorFallbackDisplay
          error={error}
          errorInfo={errorInfo}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
