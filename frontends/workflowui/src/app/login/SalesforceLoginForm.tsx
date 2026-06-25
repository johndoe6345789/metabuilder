/**
 * SalesforceLoginForm - Salesforce-style login layout
 */

'use client';

import React from 'react';
import styles from '/components/layout/salesforce-login.module.scss';
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
  onTurboLogin,
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

            <button
              type="button"
              className={styles.salesforceButton}
              onClick={onTurboLogin}
              data-testid="salesforce-turbo-button"
              style={{ marginTop: '0.5rem', background: 'none',
                border: '1px solid currentColor', opacity: 0.7 }}
            >
              ⚡ Turbologin
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
