'use client'

/**
 * Error Boundary for User Form Page
 *
 * Catches errors in user form (create/edit) and provides recovery options
 */

import React, { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onReset?: () => void
  onNavigateBack?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class UserFormErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('UserForm Error:', error, errorInfo)

    this.setState({
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    this.props.onReset?.()
  }

  handleNavigateBack = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    this.props.onNavigateBack?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-md bg-red-50 p-4">
          <h2 className="text-sm font-medium text-red-800">
            Something went wrong with the form
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-red-600">
                Error details (development only)
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-800">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={this.handleReset}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>

            <button
              onClick={this.handleNavigateBack}
              className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-400"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
