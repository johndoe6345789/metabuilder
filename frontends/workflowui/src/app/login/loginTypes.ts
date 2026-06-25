/**
 * loginTypes - Shared types for login page components
 */

export interface SalesforceLoginFormProps {
  email: string;
  password: string;
  isLoading: boolean;
  localError: string | null;
  errorMessage: string | null;
  rememberMe: boolean;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setRememberMe: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTurboLogin: () => void;
  onSwitchToMaterial: () => void;
}
