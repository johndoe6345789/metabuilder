/** SalesforceFormFields - Email, password, remember me fields */

'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@scss/components/layout/salesforce-login.module.scss';
import SalesforceCredentialFields from './SalesforceCredentialFields';

interface SalesforceFormFieldsProps {
  email: string;
  password: string;
  rememberMe: boolean;
  isLoading: boolean;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setRememberMe: (v: boolean) => void;
}

export default function SalesforceFormFields({
  email, password, rememberMe, isLoading,
  setEmail, setPassword, setRememberMe,
}: SalesforceFormFieldsProps) {
  return (
    <>
      <SalesforceCredentialFields
        email={email}
        password={password}
        isLoading={isLoading}
        setEmail={setEmail}
        setPassword={setPassword}
      />
      <div className={styles.salesforceCheckboxGroup}>
        <input
          id="remember" type="checkbox"
          className={styles.salesforceCheckbox}
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          data-testid="salesforce-remember-me"
        />
        <label htmlFor="remember"
          className={styles.salesforceCheckboxLabel}>
          Remember me
        </label>
      </div>
      <div className={styles.salesforceForgotPassword}>
        <Link
          href="/forgot-password"
          className={styles.salesforceLink}
          data-testid="salesforce-forgot-password"
        >
          Forgot your password?
        </Link>
      </div>
    </>
  );
}
