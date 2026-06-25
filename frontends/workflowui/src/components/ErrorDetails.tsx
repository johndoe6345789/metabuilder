/**
 * ErrorDetails - Dev-only error details <details> block
 */

import React, { ErrorInfo } from 'react';

interface ErrorDetailsProps {
  error: Error;
  errorInfo: ErrorInfo | null;
}

const detailsStyle: React.CSSProperties = {
  textAlign: 'left',
  marginBottom: '24px',
  padding: '16px',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'monospace',
  maxHeight: '200px',
  overflow: 'auto',
};

const summaryStyle: React.CSSProperties = {
  cursor: 'pointer',
  marginBottom: '8px',
  fontWeight: 600,
};

const preStyle: React.CSSProperties = {
  margin: '8px 0',
  whiteSpace: 'pre-wrap',
};

const preSmallStyle: React.CSSProperties = {
  ...preStyle,
  fontSize: '12px',
};

export default function ErrorDetails({
  error,
  errorInfo,
}: ErrorDetailsProps) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <details style={detailsStyle}>
      <summary style={summaryStyle}>Error Details</summary>
      <div>
        <strong>Message:</strong>
        <pre style={preStyle}>{error.message}</pre>
      </div>
      {error.stack && (
        <div>
          <strong>Stack:</strong>
          <pre style={preSmallStyle}>{error.stack}</pre>
        </div>
      )}
      {errorInfo && (
        <div>
          <strong>Component Stack:</strong>
          <pre style={preSmallStyle}>
            {errorInfo.componentStack}
          </pre>
        </div>
      )}
    </details>
  );
}
