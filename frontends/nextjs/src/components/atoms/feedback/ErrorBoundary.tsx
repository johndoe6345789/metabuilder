'use client'

import React, { Component, ReactNode } from 'react'
import { logError, LogLevel } from '@/lib/errors/log-error'
import { Alert, Button, Box, Typography } from '@mui/material'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary component to catch React rendering errors
 * Logs errors and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error with component stack
    logError(
      error,
      {
        component: 'ErrorBoundary',
        componentStack: errorInfo.componentStack,
      },
      LogLevel.ERROR
    )

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              size="small"
            >
              Try Again
            </Button>
          </Alert>
        </Box>
      )
    }

    return this.props.children
  }
}
