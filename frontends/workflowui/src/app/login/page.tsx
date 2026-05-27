/**
 * Login Page
 * User authentication with Material Design 3 and Salesforce-style
 */

'use client';

import React from 'react';
import { useLoginPage } from './hooks/useLoginPage';
import SalesforceLoginForm from './SalesforceLoginForm';
import MaterialLoginForm from './MaterialLoginForm';

export default function LoginPage() {
  const {
    email,
    password,
    localError,
    isLoading,
    errorMessage,
    setEmail,
    setPassword,
    rememberMe,
    setRememberMe,
    useSalesforceStyle,
    setUseSalesforceStyle,
    onLoginSubmit,
  } = useLoginPage();

  if (useSalesforceStyle) {
    return (
      <SalesforceLoginForm
        email={email}
        password={password}
        isLoading={isLoading}
        localError={localError}
        errorMessage={errorMessage}
        rememberMe={rememberMe}
        setEmail={setEmail}
        setPassword={setPassword}
        setRememberMe={setRememberMe}
        onSubmit={onLoginSubmit}
        onSwitchToMaterial={() =>
          setUseSalesforceStyle(false)
        }
      />
    );
  }

  return (
    <MaterialLoginForm
      email={email}
      password={password}
      isLoading={isLoading}
      localError={localError}
      errorMessage={errorMessage}
      setEmail={setEmail}
      setPassword={setPassword}
      onSubmit={onLoginSubmit}
      onSwitchToSalesforce={() =>
        setUseSalesforceStyle(true)
      }
    />
  );
}
