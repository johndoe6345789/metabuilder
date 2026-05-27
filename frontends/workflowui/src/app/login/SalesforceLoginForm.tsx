/**
 * SalesforceLoginForm - Salesforce-style login layout
 */

'use client';

import React from 'react';
import styles from '@/../../../scss/components/layout/salesforce-login.module.scss';
import SalesforceFormFields from './SalesforceFormFields';
import SalesforceSocialButtons from './SalesforceSocialButtons';
import SalesforceLoginFooter from './SalesforceLoginFooter';
import SalesforceBrandPanel from './SalesforceBrandPanel';
import SalesforceLoginError from './SalesforceLoginError';
import type { SalesforceLoginFormProps } from './loginTypes';

export default function SalesforceLoginForm({
  email,
  password,
  isLoading,
  localError,
  errorMessage,
  rememberMe,
  setEmail,
  setPassword,
  setRememberMe,
  onSubmit,
  onSwitchToMaterial,
}: SalesforceLoginFormProps) {
  return (
    <div
      className={styles.salesforcePage}
      data-testid="salesforce-login-page"
    >
      <SalesforceBrandPanel />

      <div className={styles.salesforceRight}>
        <div className={styles.salesforceFormContainer}>
          <div className={styles.salesforceHeader}>
            <h2
              className={styles.salesforceTitle}
              data-testid="salesforce-title"
            >
              Log In
            </h2>
            <p className={styles.salesforceSubtitle}>
              Welcome back to WorkflowUI
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className={styles.salesforceForm}
          >
            <SalesforceLoginError
              message={localError || errorMessage}
            />

            <SalesforceFormFields
              email={email}
              password={password}
              rememberMe={rememberMe}
              isLoading={isLoading}
              setEmail={setEmail}
              setPassword={setPassword}
              setRememberMe={setRememberMe}
            />

            <button
              type="submit"
              className={`${styles.salesforceButton} ${
                isLoading
                  ? styles.salesforceButtonLoading
                  : ''
              }`}
              disabled={isLoading}
              data-testid="salesforce-login-button"
            >
              {isLoading ? '' : 'Log In'}
            </button>

            <div className={styles.salesforceDivider}>
              <span
                className={styles.salesforceDividerText}
              >
                or
              </span>
            </div>

            <SalesforceSocialButtons />
          </form>

          <SalesforceLoginFooter
            onSwitchToMaterial={onSwitchToMaterial}
          />
        </div>
      </div>
    </div>
  );
}
