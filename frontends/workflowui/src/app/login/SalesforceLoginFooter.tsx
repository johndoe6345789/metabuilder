/**
 * SalesforceLoginFooter - Footer links for the login form
 */

'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@scss/components/layout/salesforce-login.module.scss';

interface SalesforceLoginFooterProps {
  onSwitchToMaterial: () => void;
}

export default function SalesforceLoginFooter({
  onSwitchToMaterial,
}: SalesforceLoginFooterProps) {
  return (
    <div className={styles.salesforceFooter}>
      <p className={styles.salesforceFooterText}>
        New to WorkflowUI?{' '}
        <Link
          href="/register"
          className={styles.salesforceFooterLink}
          data-testid="salesforce-register-link"
        >
          Create an account
        </Link>
      </p>
      <p
        className={styles.salesforceFooterText}
        style={{ marginTop: '8px' }}
      >
        <button
          type="button"
          onClick={onSwitchToMaterial}
          className={styles.salesforceLink}
          data-testid="switch-to-material"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          Switch to Material Design
        </button>
      </p>
    </div>
  );
}
