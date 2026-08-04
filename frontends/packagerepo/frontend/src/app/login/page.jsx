'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './page.module.scss';
import { startOidcLogin, clearError } from '../../store/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const { error } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    dispatch(clearError());
    setLoading(true);
    dispatch(startOidcLogin());
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.loginBox__header}>
          <h1>Login</h1>
          <p>Sign in with your MetaBuilder account</p>
        </div>
        {error && (
          <div className={`${styles.alert} ${styles['alert--error']}`}>
            {error}
          </div>
        )}
        <button
          type="button"
          className={styles.loginBox__button}
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? 'Redirecting…' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
