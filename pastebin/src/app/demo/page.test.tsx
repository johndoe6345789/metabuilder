import { render, screen } from '@testing-library/react';
import DemoPage from './page';

jest.mock('@/app/PageLayout', () => ({
  PageLayout: ({ children }: any) => <div data-testid="page-layout">{children}</div>,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: any) => {
    const Component = () => <div data-testid="split-screen-editor">Editor</div>;
    Component.preload ? Component.preload() : Component.render?.preload?.();
    return Component;
  },
}));

jest.mock('@/components/demo/DemoFeatureCards', () => ({
  DemoFeatureCards: () => <div data-testid="demo-feature-cards">Feature Cards</div>,
}));

jest.mock('@/components/demo/demo-constants', () => ({
  DEMO_CODE: 'const App = () => <div>App</div>',
}));

describe('DemoPage', () => {
  test('renders page layout', () => {
    render(<DemoPage />);
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  test('renders Split-Screen Demo heading', () => {
    render(<DemoPage />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Split-Screen Demo/i);
  });

  test('renders demo description', () => {
    render(<DemoPage />);
    expect(screen.getByText(/live React component editing/i)).toBeInTheDocument();
  });

  test('renders Interactive Code Editor title', () => {
    render(<DemoPage />);
    expect(screen.getByText(/Interactive Code Editor/i)).toBeInTheDocument();
  });

  test('renders editor description', () => {
    render(<DemoPage />);
    expect(screen.getByText(/Code, Split, and Preview modes/i)).toBeInTheDocument();
  });

  test('renders SplitScreenEditor component', () => {
    render(<DemoPage />);
    expect(screen.getByTestId('split-screen-editor')).toBeInTheDocument();
  });

  test('renders DemoFeatureCards component', () => {
    render(<DemoPage />);
    expect(screen.getByTestId('demo-feature-cards')).toBeInTheDocument();
  });

  test('motion div is rendered', () => {
    render(<DemoPage />);
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });

  test('renders within motion animation wrapper', () => {
    render(<DemoPage />);
    const motionDiv = screen.getByTestId('motion-div');
    expect(motionDiv).toBeInTheDocument();
  });

  test('heading mentions Sparkle icon', () => {
    render(<DemoPage />);
    expect(screen.getByText(/Split-Screen Demo/i)).toBeInTheDocument();
  });

  test('description mentions instant update', () => {
    render(<DemoPage />);
    expect(screen.getByText(/watch it update instantly/i)).toBeInTheDocument();
  });

  test('mentions JSX and TypeScript support', () => {
    render(<DemoPage />);
    expect(screen.getByText(/JSX, TSX, JavaScript, and TypeScript/i)).toBeInTheDocument();
  });

  test('component renders without crashing', () => {
    const { container } = render(<DemoPage />);
    expect(container).toBeInTheDocument();
  });

  test('has proper page layout structure', () => {
    render(<DemoPage />);
    const layout = screen.getByTestId('page-layout');
    expect(layout).toBeInTheDocument();
  });
});
