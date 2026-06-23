/**
 * Login Page
 * User authentication with Material Design 3 and Salesforce-style
 */

'use client';

import React from 'react';
import { useLoginPage } from './hooks/useLoginPage';
import SalesforceLoginForm from './SalesforceLoginForm';
import MaterialLoginForm from './MaterialLoginForm';
import TurboErrorDialog from './TurboErrorDialog';

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
    onTurboLogin,
    turboError,
    clearTurboError,
  } = useLoginPage();

  return (
    <>
      <TurboErrorDialog
        open={!!turboError}
        message={turboError ?? ''}
        onClose={clearTurboError}
      />
      {useSalesforceStyle ? (
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
          onTurboLogin={onTurboLogin}
          onSwitchToMaterial={() =>
            setUseSalesforceStyle(false)
          }
        />
      ) : (
        <MaterialLoginForm
          email={email}
          password={password}
          isLoading={isLoading}
          localError={localError}
          errorMessage={errorMessage}
          setEmail={setEmail}
          setPassword={setPassword}
          onSubmit={onLoginSubmit}
          onTurboLogin={onTurboLogin}
          onSwitchToSalesforce={() =>
            setUseSalesforceStyle(true)
          }
        />
      )}
    </>
  );
}
