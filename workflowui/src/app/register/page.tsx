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
    <div >
      <div >
        <div >
          <h1>WorkflowUI</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={onRegisterSubmit} >
          {/* Name Input */}
          <div >
            <label htmlFor="name" >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              
              disabled={isLoading}
            />
          </div>

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
              onChange={(e) => onPasswordChange(e.target.value)}
              
              disabled={isLoading}
              autoComplete="new-password"
            />
            {password && (
              <div >
                <div >
                  <div
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <span >
                  {validatePassword(password).message}
                </span>
              </div>
            )}
            <p >
              At least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          {/* Confirm Password Input */}
          <div >
            <label htmlFor="confirmPassword" >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              
              disabled={isLoading}
              autoComplete="new-password"
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div >
          <p>
            Already have an account?{' '}
            <Link href="/login" >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
