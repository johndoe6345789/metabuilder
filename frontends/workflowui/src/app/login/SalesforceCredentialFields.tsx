/** SalesforceCredentialFields - Email and password inputs */

'use client';

import React from 'react';
import styles from '@scss/components/layout/salesforce-login.module.scss';

interface SalesforceCredentialFieldsProps {
  email: string;
  password: string;
  isLoading: boolean;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
}

export default function SalesforceCredentialFields({
  email, password, isLoading, setEmail, setPassword,
}: SalesforceCredentialFieldsProps) {
  return (
    <>
      <div className={styles.salesforceFieldGroup}>
        <label htmlFor="email"
          className={styles.salesforceLabel}>
          Email
        </label>
        <input
          id="email" type="email"
          className={styles.salesforceInput}
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email" required
          data-testid="salesforce-email-input"
        />
      </div>
      <div className={styles.salesforceFieldGroup}>
        <label htmlFor="password"
          className={styles.salesforceLabel}>
          Password
        </label>
        <input
          id="password" type="password"
          className={styles.salesforceInput}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password" required
          data-testid="salesforce-password-input"
        />
      </div>
    </>
  );
}
