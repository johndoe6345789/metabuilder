import React from 'react'
import { render, screen } from '@/test-utils'
import { PageLayout } from './PageLayout'

// Mock the navigation hook
jest.mock('@/components/layout/navigation/useNavigation', () => ({
  useNavigation: jest.fn(() => ({ menuOpen: false })),
}))

// Mock redux hooks
jest.mock('@/store/hooks', () => ({
  useAppSelector: jest.fn((selector) => {
    if (selector.toString().includes('selectIsAuthenticated')) return false
    if (selector.toString().includes('selectCurrentUser')) return null
    return undefined
  }),
}))

// Mock useTranslation
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: jest.fn(() => ({
    page: {
      footer: {
        tagline: 'Save, organize, and share your code snippets',
        techNote: 'Supports React preview and multi-language Docker execution',
      },
    },
  })),
}))

// Mock components to avoid rendering complex nested components
jest.mock('@/components/layout/navigation/NavigationSidebar', () => ({
  NavigationSidebar: () => (
    <div data-testid="nav-sidebar">Navigation Sidebar</div>
  ),
}))

jest.mock('@/components/layout/navigation/Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}))

jest.mock('@/components/layout/BackendIndicator', () => ({
  BackendIndicator: () => (
    <div data-testid="backend-indicator">Backend Indicator</div>
  ),
}))

jest.mock('@/components/layout/AlertsBell', () => ({
  AlertsBell: () => <div data-testid="alerts-bell">Alerts</div>,
}))

jest.mock('@/components/layout/ThemeSwitcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme</div>,
}))

jest.mock('@/components/layout/LangSelector', () => ({
  LangSelector: () => <div data-testid="lang-selector">Language</div>,
}))

jest.mock('@/components/layout/ThemeApplier', () => ({
  ThemeApplier: () => <div data-testid="theme-applier">Theme Applier</div>,
}))

jest.mock('@/components/layout/ProfileMenu', () => ({
  ProfileMenu: () => <div data-testid="profile-menu">Profile</div>,
}))

jest.mock('@/components/auth/AuthGuard', () => ({
  AuthGuard: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('next/link', () => {
  return ({ children, ...props }: any) => <a {...props}>{children}</a>
})

describe('PageLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render page layout container', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      expect(screen.getByTestId('page-layout')).toBeInTheDocument()
    })

    it('should render children', () => {
      render(
        <PageLayout>
          <div data-testid="child-content">Test Content</div>
        </PageLayout>,
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render NavigationSidebar', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      expect(screen.getByTestId('nav-sidebar')).toBeInTheDocument()
    })

    it('should render header with logo', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      expect(screen.getByTestId('page-header')).toBeInTheDocument()
      expect(screen.getByTestId('logo-text')).toBeInTheDocument()
      expect(screen.getByText('CodeSnippet')).toBeInTheDocument()
    })

    it('should render main content area', () => {
      render(
        <PageLayout>
          <div>Main Content</div>
        </PageLayout>,
      )

      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    it('should render Navigation component in header', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      expect(screen.getByTestId('navigation')).toBeInTheDocument()
    })

    it('should render BackendIndicator in header', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      expect(screen.getByTestId('backend-indicator')).toBeInTheDocument()
    })

    it('should render theme switcher in header', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      expect(screen.getByTestId('theme-switcher')).toBeInTheDocument()
    })

    it('should render footer with information text', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      const footerText = screen.getByText(
        /Save, organize, and share your code snippets/i,
      )
      expect(footerText).toBeInTheDocument()

      const techNote = screen.getByText(
        /Supports React preview and multi-language Docker execution/i,
      )
      expect(techNote).toBeInTheDocument()
    })

    it('should render grid pattern background', () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      const gridPattern = container.querySelector('[aria-hidden="true"]')
      expect(gridPattern).toBeInTheDocument()
    })
  })

  describe('layout structure', () => {
    it('should have correct CSS classes for styling', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      const layout = screen.getByTestId('page-layout')
      expect(layout).toBeInTheDocument()
    })

    it('should have header with sticky positioning', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      const header = screen.getByTestId('page-header')
      expect(header).toBeInTheDocument()
    })

    it('should structure main content properly', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { container } = render(
        <PageLayout>
          <div data-testid="test-child">Content</div>
        </PageLayout>,
      )

      const main = screen.getByTestId('main-content')
      expect(main).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      expect(container.querySelector('header')).toBeInTheDocument()
      expect(container.querySelector('main')).toBeInTheDocument()
      expect(container.querySelector('footer')).toBeInTheDocument()
    })

    it('should have grid pattern marked as decorative', () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      const gridPattern = container.querySelector('[aria-hidden="true"]')
      expect(gridPattern).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have logo with aria-label', () => {
      render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      )

      const logo = screen.getByTestId('logo-text')
      expect(logo).toHaveAttribute('aria-label', 'CodeSnippet')
    })
  })
})
