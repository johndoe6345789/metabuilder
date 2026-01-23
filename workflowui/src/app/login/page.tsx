/**
 * Login Page
 * User authentication
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthForm, useLoginLogic } from '../../hooks';

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
    <div >
      <div >
        <div >
          <h1>WorkflowUI</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={onLoginSubmit} >
          {/* Email Input */}
          <div >
            <label htmlFor="email" >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password Input */}
          <div >
            <label htmlFor="password" >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {/* Error Message */}
          {(localError || errorMessage) && (
            <div >
              {localError || errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={""}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div >
          <p>
            Don't have an account?{' '}
            <Link href="/register" >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
