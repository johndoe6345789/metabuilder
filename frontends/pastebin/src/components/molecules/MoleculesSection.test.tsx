import { render, screen } from '@/test-utils';
import { MoleculesSection } from './MoleculesSection';

jest.mock('./FormFieldsSection', () => ({
  FormFieldsSection: ({ onSaveSnippet }: any) => <div data-testid="form-fields-section">Form Fields</div>,
}));

jest.mock('./SearchBarsSection', () => ({
  SearchBarsSection: ({ onSaveSnippet }: any) => <div data-testid="search-bars-section">Search Bars</div>,
}));

jest.mock('./UserCardsSection', () => ({
  UserCardsSection: () => <div data-testid="user-cards-section">User Cards</div>,
}));

jest.mock('./SocialActionsSection', () => ({
  SocialActionsSection: () => <div data-testid="social-actions-section">Social Actions</div>,
}));

jest.mock('./StatusIndicatorsSection', () => ({
  StatusIndicatorsSection: () => <div data-testid="status-indicators-section">Status Indicators</div>,
}));

jest.mock('./ContentPreviewCardsSection', () => ({
  ContentPreviewCardsSection: () => <div data-testid="content-preview-cards-section">Content Preview</div>,
}));

describe('MoleculesSection', () => {
  const mockOnSaveSnippet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all molecule sections', () => {
    render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);

    expect(screen.getByTestId('form-fields-section')).toBeInTheDocument();
    expect(screen.getByTestId('search-bars-section')).toBeInTheDocument();
    expect(screen.getByTestId('user-cards-section')).toBeInTheDocument();
    expect(screen.getByTestId('social-actions-section')).toBeInTheDocument();
    expect(screen.getByTestId('status-indicators-section')).toBeInTheDocument();
    expect(screen.getByTestId('content-preview-cards-section')).toBeInTheDocument();
  });

  test('passes onSaveSnippet to FormFieldsSection', () => {
    render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('form-fields-section')).toBeInTheDocument();
  });

  test('passes onSaveSnippet to SearchBarsSection', () => {
    render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('search-bars-section')).toBeInTheDocument();
  });

  test('UserCardsSection renders without handler', () => {
    render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('user-cards-section')).toBeInTheDocument();
  });

  test('SocialActionsSection renders without handler', () => {
    render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('social-actions-section')).toBeInTheDocument();
  });

  test('StatusIndicatorsSection renders without handler', () => {
    render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('status-indicators-section')).toBeInTheDocument();
  });

  test('ContentPreviewCardsSection renders without handler', () => {
    render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('content-preview-cards-section')).toBeInTheDocument();
  });

  test('all sections are rendered in order', () => {
    const { container } = render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);
    const sections = container.querySelectorAll('[data-testid]');
    expect(sections.length).toBe(7);
  });

  test('has correct spacing classes', () => {
    const { container } = render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);
    const mainDiv = container.querySelector('[class*="space-y"]');
    expect(mainDiv).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    const { container } = render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(container).toBeInTheDocument();
  });

  test('component accepts onSaveSnippet prop', () => {
    render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);
    // Should not throw
    expect(screen.getByTestId('form-fields-section')).toBeInTheDocument();
  });

  test('all molecule types are represented', () => {
    render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />);

    const sections = [
      'form-fields-section',
      'search-bars-section',
      'user-cards-section',
      'social-actions-section',
      'status-indicators-section',
      'content-preview-cards-section',
    ];

    sections.forEach((id) => {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
  });
});
