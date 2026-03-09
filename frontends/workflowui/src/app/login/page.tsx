/**
 * Login Page
 * User authentication with Material Design 3 and Salesforce-style options
 */

'use client';

import React, { useState } from 'react';
import { Button, TextField, Alert, Box } from '@metabuilder/fakemui';
import { AuthFormLayout } from '@/../../../components/layout';
import { useAuthForm, useLoginLogic } from '../../hooks';
import Link from 'next/link';
import styles from '@/../../../scss/components/layout/salesforce-login.module.scss';

export default function LoginPage() {
  const { email, password, localError, isLoading, errorMessage, setEmail, setPassword, clearErrors } = useAuthForm();
  const { handleLogin } = useLoginLogic();
  const [rememberMe, setRememberMe] = useState(false);
  const [useSalesforceStyle, setUseSalesforceStyle] = useState(true); // Default to Salesforce style

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    try {
      await handleLogin({ email, password });
    } catch {
      // Error is handled by hook
    }
  };

  // Salesforce-style login
  if (useSalesforceStyle) {
    return (
      <div className={styles.salesforcePage} data-testid="salesforce-login-page">
        <div className={styles.salesforceLeft}>
          <div className={styles.salesforceBrand}>
            <h1 className={styles.salesforceLogo}>WorkflowUI</h1>
            <p className={styles.salesforceTagline}>
              Build powerful workflows with visual no-code tools. Connect, automate, and transform your business processes.
            </p>
          </div>
        </div>

        <div className={styles.salesforceRight}>
          <div className={styles.salesforceFormContainer}>
            <div className={styles.salesforceHeader}>
              <h2 className={styles.salesforceTitle} data-testid="salesforce-title">Log In</h2>
              <p className={styles.salesforceSubtitle}>Welcome back to WorkflowUI</p>
            </div>

            <form onSubmit={onLoginSubmit} className={styles.salesforceForm}>
              {(localError || errorMessage) && (
                <div className={styles.salesforceError} data-testid="salesforce-error">
                  <span className={styles.salesforceErrorIcon}>⚠</span>
                  <span>{localError || errorMessage}</span>
                </div>
              )}

              <div className={styles.salesforceFieldGroup}>
                <label htmlFor="email" className={styles.salesforceLabel}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.salesforceInput}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  data-testid="salesforce-email-input"
                />
              </div>

              <div className={styles.salesforceFieldGroup}>
                <label htmlFor="password" className={styles.salesforceLabel}>Password</label>
                <input
                  id="password"
                  type="password"
                  className={styles.salesforceInput}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  data-testid="salesforce-password-input"
                />
              </div>

              <div className={styles.salesforceCheckboxGroup}>
                <input
                  id="remember"
                  type="checkbox"
                  className={styles.salesforceCheckbox}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  data-testid="salesforce-remember-me"
                />
                <label htmlFor="remember" className={styles.salesforceCheckboxLabel}>
                  Remember me
                </label>
              </div>

              <div className={styles.salesforceForgotPassword}>
                <Link href="/forgot-password" className={styles.salesforceLink} data-testid="salesforce-forgot-password">
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                className={`${styles.salesforceButton} ${isLoading ? styles.salesforceButtonLoading : ''}`}
                disabled={isLoading}
                data-testid="salesforce-login-button"
              >
                {isLoading ? '' : 'Log In'}
              </button>

              <div className={styles.salesforceDivider}>
                <span className={styles.salesforceDividerText}>or</span>
              </div>

              <div className={styles.salesforceSocialButtons}>
                <button type="button" className={styles.salesforceSocialButton} data-testid="salesforce-google-login">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
                <button type="button" className={styles.salesforceSocialButton} data-testid="salesforce-microsoft-login">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect width="8.5" height="8.5" fill="#F25022"/>
                    <rect x="9.5" width="8.5" height="8.5" fill="#7FBA00"/>
                    <rect y="9.5" width="8.5" height="8.5" fill="#00A4EF"/>
                    <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900"/>
                  </svg>
                  Continue with Microsoft
                </button>
              </div>
            </form>

            <div className={styles.salesforceFooter}>
              <p className={styles.salesforceFooterText}>
                New to WorkflowUI?{' '}
                <Link href="/register" className={styles.salesforceFooterLink} data-testid="salesforce-register-link">
                  Create an account
                </Link>
              </p>
              <p className={styles.salesforceFooterText} style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setUseSalesforceStyle(false)}
                  className={styles.salesforceLink}
                  data-testid="switch-to-material"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  Switch to Material Design
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Material Design 3 style (existing)
  return (
    <AuthFormLayout
      title="WorkflowUI"
      subtitle="Sign in to your account"
      footerText="Don't have an account?"
      footerLinkHref="/register"
      footerLinkText="Sign up"
    >
      <Box component="form" onSubmit={onLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
          required
          data-testid="email-input"
        />

        <TextField
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
          required
          data-testid="password-input"
        />

        {(localError || errorMessage) && (
          <Alert severity="error" data-testid="error-alert">
            {localError || errorMessage}
          </Alert>
        )}

        <Button
          type="submit"
          variant="filled"
          fullWidth
          loading={isLoading}
          data-testid="login-button"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <button
            type="button"
            onClick={() => setUseSalesforceStyle(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--mat-sys-primary)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
            data-testid="switch-to-salesforce"
          >
            Switch to Salesforce Style
          </button>
        </Box>
      </Box>
    </AuthFormLayout>
  );
}
