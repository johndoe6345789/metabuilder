/**
 * Register Page
 * User registration
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useAuthForm,
  usePasswordValidation,
  useRegisterLogic
} from '../../hooks';
import styles from './page.module.scss';

export default function RegisterPage() {
  const { email, password, localError, isLoading, errorMessage, setEmail, setPassword, setLocalError, clearErrors } = useAuthForm();
  const { passwordStrength, validatePassword, handlePasswordChange } = usePasswordValidation();
  const { handleRegister } = useRegisterLogic();

  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    try {
      await handleRegister({
        name,
        email,
        password,
        confirmPassword
      });
    } catch {
      // Error is handled by hook
    }
  };

  const onPasswordChange = (value: string) => {
    setPassword(value);
    handlePasswordChange(value);
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <div className={styles.header}>
          <h1>WorkflowUI</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={onRegisterSubmit} className={styles.form}>
          {/* Name Input */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

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
              onChange={(e) => onPasswordChange(e.target.value)}
              className={styles.input}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {password && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  <div
                    className={`${styles.fill} ${styles[`strength${passwordStrength}`]}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <span className={styles.strengthText}>
                  {validatePassword(password).message}
                </span>
              </div>
            )}
            <p className={styles.hint}>
              At least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          {/* Confirm Password Input */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              disabled={isLoading}
              autoComplete="new-password"
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
