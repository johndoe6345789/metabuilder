import { render, screen, fireEvent } from '@/test-utils';
import { FormsShowcase } from './FormsShowcase';

describe('FormsShowcase', () => {
  test('renders section heading', () => {
    render(<FormsShowcase />);
    expect(screen.getByText('Forms')).toBeInTheDocument();
  });

  test('renders section description', () => {
    render(<FormsShowcase />);
    expect(screen.getByText(/Complete form layouts with validation and actions/i)).toBeInTheDocument();
  });

  test('renders form title', () => {
    render(<FormsShowcase />);
    const heading = screen.getByRole('heading', { name: /Create Account/ });
    expect(heading).toBeInTheDocument();
  });

  test('renders form subtitle', () => {
    render(<FormsShowcase />);
    expect(screen.getByText(/Fill in your details to get started/i)).toBeInTheDocument();
  });

  test('renders First Name field', () => {
    render(<FormsShowcase />);
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
  });

  test('renders Last Name field', () => {
    render(<FormsShowcase />);
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  test('renders Email field', () => {
    render(<FormsShowcase />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  test('renders Password field', () => {
    render(<FormsShowcase />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  test('renders password requirement text', () => {
    render(<FormsShowcase />);
    expect(screen.getByText(/Must be at least 8 characters/i)).toBeInTheDocument();
  });

  test('renders Cancel button', () => {
    render(<FormsShowcase />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('renders Create Account button', () => {
    render(<FormsShowcase />);
    expect(screen.getByRole('button', { name: /Create Account/ })).toBeInTheDocument();
  });

  test('form inputs are functional', () => {
    render(<FormsShowcase />);
    const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    expect(firstNameInput.value).toBe('John');
  });

  test('email input accepts email type', () => {
    render(<FormsShowcase />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  test('password input accepts password type', () => {
    render(<FormsShowcase />);
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
  });

  test('form element exists', () => {
    const { container } = render(<FormsShowcase />);
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  test('renders Card component', () => {
    const { container } = render(<FormsShowcase />);
    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  test('section has proper spacing', () => {
    const { container } = render(<FormsShowcase />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('space-y-6');
  });

  test('renders all form fields', () => {
    render(<FormsShowcase />);
    const inputs = screen.getAllByRole('textbox');
    // First name, last name, email = 3 textboxes (password is not a textbox role)
    expect(inputs.length).toBeGreaterThanOrEqual(3);
  });

  test('renders Separator component', () => {
    const { container } = render(<FormsShowcase />);
    // Separator renders as an <hr> element
    const separator = container.querySelector('hr');
    expect(separator).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    const { container } = render(<FormsShowcase />);
    expect(container).toBeInTheDocument();
  });

  test('first name field has correct placeholder', () => {
    render(<FormsShowcase />);
    const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
    expect(firstNameInput).toBeInTheDocument();
  });

  test('form buttons are properly positioned', () => {
    render(<FormsShowcase />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
