/**
 * Tests for login page components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/link
jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

// Mock the components library to avoid ESM errors from deep transitive deps
// Use the absolute path since the @/../../../ alias doesn't resolve in jest.mock
jest.mock('/home/linuxuser/Documents/GitHub/metabuilder/components/layout', () => ({
  AuthFormLayout: ({ children, title }: any) => (
    <div data-testid="auth-layout"><h1>{title}</h1>{children}</div>
  ),
}), { virtual: true });
jest.mock('/home/linuxuser/Documents/GitHub/metabuilder/components/feedback', () => ({
  PasswordStrengthIndicator: ({ strength }: any) => <div data-testid="psi" data-strength={strength} />,
  NotFoundState: () => <div>Not Found</div>,
}), { virtual: true });

// Mock @metabuilder/hooks
jest.mock('../../../hooks', () => ({
  useAuthForm: jest.fn(() => ({
    email: '',
    password: '',
    localError: null,
    isLoading: false,
    errorMessage: null,
    setEmail: jest.fn(),
    setPassword: jest.fn(),
    clearErrors: jest.fn(),
  })),
  useLoginLogic: jest.fn(() => ({
    handleLogin: jest.fn(),
  })),
}));

import MaterialLoginFields from '../MaterialLoginFields';
import MaterialLoginForm from '../MaterialLoginForm';
import SalesforceLoginError from '../SalesforceLoginError';
import SalesforceLoginFooter from '../SalesforceLoginFooter';
import SalesforceSocialButtons from '../SalesforceSocialButtons';
import SalesforceBrandPanel from '../SalesforceBrandPanel';

// ── MaterialLoginFields ──────────────────────────────────────────────────────
describe('MaterialLoginFields', () => {
  const props = {
    email: 'test@example.com',
    password: 'pass',
    isLoading: false,
    setEmail: jest.fn(),
    setPassword: jest.fn(),
  };

  it('renders email input', () => {
    render(<MaterialLoginFields {...props} />);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<MaterialLoginFields {...props} />);
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
  });

  it('calls setEmail on change', async () => {
    render(<MaterialLoginFields {...props} />);
    await userEvent.type(screen.getByTestId('email-input'), 'a');
    expect(props.setEmail).toHaveBeenCalled();
  });

  it('calls setPassword on change', async () => {
    render(<MaterialLoginFields {...props} />);
    await userEvent.type(screen.getByTestId('password-input'), 'x');
    expect(props.setPassword).toHaveBeenCalled();
  });

  it('disables inputs when isLoading', () => {
    render(<MaterialLoginFields {...props} isLoading />);
    expect(screen.getByTestId('email-input')).toBeDisabled();
    expect(screen.getByTestId('password-input')).toBeDisabled();
  });
});

// ── MaterialLoginForm ────────────────────────────────────────────────────────

// Mock AuthFormLayout from @metabuilder/components/layout
jest.mock('@metabuilder/components/layout', () => ({
  AuthFormLayout: ({ children, title }: any) => (
    <div data-testid="auth-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}), { virtual: true });

// Mock MaterialLoginFields sub-import
jest.mock('../MaterialLoginFields', () => ({
  __esModule: true,
  default: ({ email, password, setEmail, setPassword, isLoading }: any) => (
    <div>
      <input data-testid="email-input" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
      <input data-testid="password-input" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
    </div>
  ),
}));

describe('MaterialLoginForm', () => {
  const baseProps = {
    email: '',
    password: '',
    isLoading: false,
    localError: null,
    errorMessage: null,
    setEmail: jest.fn(),
    setPassword: jest.fn(),
    onSubmit: jest.fn(),
    onSwitchToSalesforce: jest.fn(),
  };

  it('renders the login button', () => {
    render(<MaterialLoginForm {...baseProps} />);
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('renders "Sign In" text when not loading', () => {
    render(<MaterialLoginForm {...baseProps} />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders "Signing in..." text when loading', () => {
    render(<MaterialLoginForm {...baseProps} isLoading />);
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('shows error alert when localError is set', () => {
    render(<MaterialLoginForm {...baseProps} localError="Invalid credentials" />);
    expect(screen.getByTestId('error-alert')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('shows error alert when errorMessage is set', () => {
    render(<MaterialLoginForm {...baseProps} errorMessage="Server error" />);
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('renders switch to Salesforce button', () => {
    render(<MaterialLoginForm {...baseProps} />);
    expect(screen.getByTestId('switch-to-salesforce')).toBeInTheDocument();
  });

  it('calls onSwitchToSalesforce when switch button is clicked', async () => {
    render(<MaterialLoginForm {...baseProps} />);
    await userEvent.click(screen.getByTestId('switch-to-salesforce'));
    expect(baseProps.onSwitchToSalesforce).toHaveBeenCalledTimes(1);
  });
});

// ── SalesforceLoginError ─────────────────────────────────────────────────────
describe('SalesforceLoginError', () => {
  it('renders nothing when message is null', () => {
    const { container } = render(<SalesforceLoginError message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the error message', () => {
    render(<SalesforceLoginError message="Login failed" />);
    expect(screen.getByTestId('salesforce-error')).toBeInTheDocument();
    expect(screen.getByText('Login failed')).toBeInTheDocument();
  });

  it('renders warning icon', () => {
    render(<SalesforceLoginError message="Error" />);
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });
});

// ── SalesforceLoginFooter ────────────────────────────────────────────────────
describe('SalesforceLoginFooter', () => {
  it('renders the register link', () => {
    render(<SalesforceLoginFooter onSwitchToMaterial={jest.fn()} />);
    // next/link mock renders as <a href="..."> without extra props
    const link = screen.getByRole('link', { name: /create an account/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
  });

  it('renders the switch-to-material button', () => {
    render(<SalesforceLoginFooter onSwitchToMaterial={jest.fn()} />);
    expect(screen.getByTestId('switch-to-material')).toBeInTheDocument();
  });

  it('calls onSwitchToMaterial when button is clicked', async () => {
    const onSwitch = jest.fn();
    render(<SalesforceLoginFooter onSwitchToMaterial={onSwitch} />);
    await userEvent.click(screen.getByTestId('switch-to-material'));
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});

// ── SalesforceSocialButtons ──────────────────────────────────────────────────
describe('SalesforceSocialButtons', () => {
  it('renders Google login button', () => {
    render(<SalesforceSocialButtons />);
    expect(screen.getByTestId('salesforce-google-login')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('renders Microsoft login button', () => {
    render(<SalesforceSocialButtons />);
    expect(screen.getByTestId('salesforce-microsoft-login')).toBeInTheDocument();
    expect(screen.getByText('Continue with Microsoft')).toBeInTheDocument();
  });
});

// ── SalesforceBrandPanel ─────────────────────────────────────────────────────
describe('SalesforceBrandPanel', () => {
  it('renders the brand name', () => {
    render(<SalesforceBrandPanel />);
    expect(screen.getByText('WorkflowUI')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<SalesforceBrandPanel />);
    expect(
      screen.getByText(/Build powerful workflows/i)
    ).toBeInTheDocument();
  });
});
