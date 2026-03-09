/**
 * 404 Not Found Page - Fail Whale Edition
 */

'use client';

import React from 'react';
import { NotFoundState } from '@/../../../components/feedback';

export default function NotFound() {
  return (
    <NotFoundState
      errorCode="404"
      title="Page not found"
      description="Looks like this page swam away! The workflow you're looking for doesn't exist or has been moved."
      primaryActionText="Go to Dashboard"
      primaryActionHref="/"
      secondaryActionText="View Workflows"
      secondaryActionHref="/workflows"
    />
  );
}
