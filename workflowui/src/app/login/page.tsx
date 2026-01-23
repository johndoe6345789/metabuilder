/**
 * Login Page
 * User authentication
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthForm, useLoginLogic } from '../../hooks';
import styles from './page.module.scss';

export default function LoginPage() {
  const { email, password, localError, isLoading, errorMessage, setEmail, setPassword, clearErrors } = useAuthForm();
  const { handleLogin } = useLoginLogic();

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    try {
      await handleLogin({ email, password });
    } catch {
      // Error is handled by hook
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>WorkflowUI</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={onLoginSubmit} className={styles.form}>
          {/* Email Input */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password Input */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {/* Error Message */}
          {(localError || errorMessage) && (
            <div className={styles.error}>
              {localError || errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`${styles.button} ${styles.primary}`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p>
            Don't have an account?{' '}
            <Link href="/register" className={styles.link}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
