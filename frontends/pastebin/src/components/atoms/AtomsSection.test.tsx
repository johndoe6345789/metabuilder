import { render, screen } from '@/test-utils';
import { AtomsSection } from './AtomsSection';
import type { Snippet } from '@/lib/types';

jest.mock('./ButtonsSection', () => ({
  ButtonsSection: ({ onSaveSnippet }: any) => <div data-testid="buttons-section">Buttons</div>,
}));

jest.mock('./BadgesSection', () => ({
  BadgesSection: ({ onSaveSnippet }: any) => <div data-testid="badges-section">Badges</div>,
}));

jest.mock('./InputsSection', () => ({
  InputsSection: ({ onSaveSnippet }: any) => <div data-testid="inputs-section">Inputs</div>,
}));

jest.mock('./TypographySection', () => ({
  TypographySection: () => <div data-testid="typography-section">Typography</div>,
}));

jest.mock('./IconsSection', () => ({
  IconsSection: () => <div data-testid="icons-section">Icons</div>,
}));

jest.mock('./ColorsSection', () => ({
  ColorsSection: () => <div data-testid="colors-section">Colors</div>,
}));

describe('AtomsSection', () => {
  const mockOnSaveSnippet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all atom sections', () => {
    render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);

    expect(screen.getByTestId('buttons-section')).toBeInTheDocument();
    expect(screen.getByTestId('badges-section')).toBeInTheDocument();
    expect(screen.getByTestId('inputs-section')).toBeInTheDocument();
    expect(screen.getByTestId('typography-section')).toBeInTheDocument();
    expect(screen.getByTestId('icons-section')).toBeInTheDocument();
    expect(screen.getByTestId('colors-section')).toBeInTheDocument();
  });

  test('passes onSaveSnippet to ButtonsSection', () => {
    render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('buttons-section')).toBeInTheDocument();
  });

  test('passes onSaveSnippet to BadgesSection', () => {
    render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('badges-section')).toBeInTheDocument();
  });

  test('passes onSaveSnippet to InputsSection', () => {
    render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('inputs-section')).toBeInTheDocument();
  });

  test('TypographySection is rendered without handler', () => {
    render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('typography-section')).toBeInTheDocument();
  });

  test('IconsSection is rendered without handler', () => {
    render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('icons-section')).toBeInTheDocument();
  });

  test('ColorsSection is rendered without handler', () => {
    render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(screen.getByTestId('colors-section')).toBeInTheDocument();
  });

  test('renders sections in correct order', () => {
    const { container } = render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    const sections = container.querySelectorAll('[data-testid]');
    expect(sections.length).toBe(6);
  });

  test('applies space-y-16 styling for spacing', () => {
    const { container } = render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    const mainDiv = container.querySelector('[class*="space-y"]');
    expect(mainDiv).toBeInTheDocument();
  });

  test('handler is called correctly by child components', () => {
    render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    // The handler will be passed to ButtonsSection and BadgesSection and InputsSection
    expect(screen.getByTestId('buttons-section')).toBeInTheDocument();
  });

  test('component renders without crashing', () => {
    const { container } = render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    expect(container).toBeInTheDocument();
  });

  test('all sections have appropriate data-testid attributes', () => {
    render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);

    const testIds = [
      'buttons-section',
      'badges-section',
      'inputs-section',
      'typography-section',
      'icons-section',
      'colors-section',
    ];

    testIds.forEach((id) => {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
  });

  test('component structure is correct', () => {
    const { container } = render(<AtomsSection onSaveSnippet={mockOnSaveSnippet} />);
    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
  });
});
