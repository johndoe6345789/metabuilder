/**
 * Login Page - redirects to DBAL SSO
 */

'use client';

import React, { useState } from 'react';
import { beginLogin } from '@metabuilder/dbal-sso/core';
import { dbalSsoConfig } from '../../lib/dbalSsoConfig';
import styles from './page.module.scss';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setError('');
    setLoading(true);
    beginLogin(dbalSsoConfig).catch(e => {
      setError(e instanceof Error ? e.message : 'Sign-in failed to start');
      setLoading(false);
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in to WorkflowUI</h1>
        <p className={styles.subtitle}>Continue with your MetaBuilder account</p>
        {error.length > 0 && <p className={styles.error}>{error}</p>}
        <button className={styles.submit} type="button" disabled={loading} onClick={handleSignIn}>
          {loading ? 'Redirecting…' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
