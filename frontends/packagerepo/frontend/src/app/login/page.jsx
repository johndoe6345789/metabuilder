'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';
import { getApiUrl } from '../../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turboError, setTurboError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const doLogin = async (username, password) => {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const result = await response.json();
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/');
    } else {
      const err = await response.json();
      setError(err.error?.message || 'Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await doLogin(formData.username, formData.password);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTurboLogin = async () => {
    try {
      const raw = await navigator.clipboard.readText();
      if (!raw.trim()) {
        setTurboError('Clipboard is empty. Copy a Turbologin from Vault first.');
        return;
      }
      let data;
      try { data = JSON.parse(raw); } catch {
        setTurboError('Clipboard does not contain valid Turbologin JSON.');
        return;
      }
      if (!data.user || !data.pass) {
        setTurboError('Clipboard JSON is missing required fields (user, pass).');
        return;
      }
      setFormData({ username: data.user, password: data.pass });
      setError('');
      setLoading(true);
      try { await doLogin(data.user, data.pass); } catch {
        setError('Network error. Please try again.');
      } finally { setLoading(false); }
    } catch {
      setTurboError(
        'Could not read clipboard. Please allow clipboard access and try again.'
      );
    }
  };

  return (
    <>
      {turboError && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: '8px', padding: '24px',
            maxWidth: '380px', width: '90%',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600 }}>
              Turbologin Failed
            </h3>
            <p style={{ margin: '0 0 12px', color: '#555' }}>{turboError}</p>
            <p style={{ margin: '0 0 20px', color: '#555' }}>
              Copy a Turbologin from{' '}
              <a href="https://vault.wardcrew.com" target="_blank" rel="noreferrer">
                vault.wardcrew.com
              </a>
              , then try again.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setTurboError(null)}
                style={{
                  padding: '8px 16px', border: '1px solid #ccc',
                  borderRadius: '4px', background: 'none', cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.open('https://vault.wardcrew.com', '_blank')}
                style={{
                  padding: '8px 16px', border: '1px solid #ccc',
                  borderRadius: '4px', background: 'none', cursor: 'pointer',
                }}
              >
                Open Vault
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div className={styles.loginBox__header}>
            <h1>Login</h1>
            <p>Sign in to your account</p>
          </div>
          {error && (
            <div className={`${styles.alert} ${styles['alert--error']}`}>
              {error}
            </div>
          )}
          <form className={styles.loginBox__form} onSubmit={handleSubmit}>
            <div className={styles.loginBox__group}>
              <label className={styles.loginBox__label} htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className={styles.loginBox__input}
                value={formData.username}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
            <div className={styles.loginBox__group}>
              <label className={styles.loginBox__label} htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={styles.loginBox__input}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className={styles.loginBox__button}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              type="button"
              className={styles.loginBox__button}
              onClick={handleTurboLogin}
              disabled={loading}
              style={{ background: 'none', border: '1px solid currentColor', color: 'inherit' }}
            >
              ⚡ Turbologin
            </button>
          </form>
          <div style={{ marginTop: '16px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
            Default credentials: admin / admin
          </div>
        </div>
      </div>
    </>
  );
}
