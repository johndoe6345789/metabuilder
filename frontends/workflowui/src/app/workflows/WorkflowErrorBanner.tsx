/**
 * WorkflowErrorBanner - Inline error message for workflows page
 */

'use client';

import React from 'react';

interface WorkflowErrorBannerProps {
  error: string | null;
}

export default function WorkflowErrorBanner({
  error,
}: WorkflowErrorBannerProps) {
  if (!error) return null;

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--mat-sys-error-container)',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      <p
        style={{
          margin: 0,
          color: 'var(--mat-sys-on-error-container)',
        }}
      >
        {error}
      </p>
    </div>
  );
}
