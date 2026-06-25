/**
 * SalesforceLoginError - Inline error banner for login form
 */

'use client';

import React from 'react';
import styles from '/components/layout/salesforce-login.module.scss';

interface SalesforceLoginErrorProps {
  message: string | null;
}

export default function SalesforceLoginError({
  message,
}: SalesforceLoginErrorProps) {
  if (!message) return null;

  return (
    <div
      className={styles.salesforceError}
      data-testid="salesforce-error"
    >
      <span className={styles.salesforceErrorIcon}>⚠</span>
      <span>{message}</span>
    </div>
  );
}
