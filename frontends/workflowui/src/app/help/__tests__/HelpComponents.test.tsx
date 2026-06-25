/**
 * Tests for help page components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

import HelpPageHeader from '../HelpPageHeader';
import HelpGettingStarted from '../HelpGettingStarted';
import HelpVideoTutorials from '../HelpVideoTutorials';
import HelpQuickLinks from '../HelpQuickLinks';
import FAQCategoryFilter from '../FAQCategoryFilter';
import FAQAccordionItem from '../FAQAccordionItem';
import HelpFAQSection from '../HelpFAQSection';

// ── HelpPageHeader ────────────────────────────────────────────────────────────
describe('HelpPageHeader', () => {
  it('renders the help header', () => {
    render(<HelpPageHeader searchQuery="" onSearchChange={jest.fn()} />);
    expect(screen.getByTestId('help-header')).toBeInTheDocument();
  });

  it('renders "Help & Support" title', () => {
    render(<HelpPageHeader searchQuery="" onSearchChange={jest.fn()} />);
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<HelpPageHeader searchQuery="" onSearchChange={jest.fn()} />);
    expect(screen.getByTestId('help-search')).toBeInTheDocument();
  });

  it('calls onSearchChange when user types', async () => {
    const onSearchChange = jest.fn();
    render(<HelpPageHeader searchQuery="" onSearchChange={onSearchChange} />);
    await userEvent.type(screen.getByTestId('help-search'), 'w');
    expect(onSearchChange).toHaveBeenCalled();
  });

  it('shows current search value', () => {
    render(<HelpPageHeader searchQuery="workflow" onSearchChange={jest.fn()} />);
    const input = screen.getByTestId('help-search') as HTMLInputElement;
    expect(input.value).toBe('workflow');
  });
});

// ── HelpGettingStarted ────────────────────────────────────────────────────────
describe('HelpGettingStarted', () => {
  it('renders the getting started card', () => {
    render(<HelpGettingStarted />);
    expect(screen.getByTestId('getting-started-card')).toBeInTheDocument();
  });

  it('renders "Getting Started" heading', () => {
    render(<HelpGettingStarted />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('renders the view tutorials button', () => {
    render(<HelpGettingStarted />);
    expect(screen.getByTestId('view-tutorials-btn')).toBeInTheDocument();
  });

  it('renders step instructions', () => {
    render(<HelpGettingStarted />);
    expect(screen.getByText(/Create a workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Start a new workflow/i)).toBeInTheDocument();
  });
});

// ── HelpVideoTutorials ────────────────────────────────────────────────────────
describe('HelpVideoTutorials', () => {
  it('renders "Video Tutorials" heading', () => {
    render(<HelpVideoTutorials />);
    expect(screen.getByText('Video Tutorials')).toBeInTheDocument();
  });

  it('renders tutorial cards', () => {
    render(<HelpVideoTutorials />);
    expect(screen.getByTestId('video-tutorial-1')).toBeInTheDocument();
    expect(screen.getByTestId('video-tutorial-2')).toBeInTheDocument();
  });

  it('renders tutorial titles', () => {
    render(<HelpVideoTutorials />);
    expect(screen.getByText('Creating Your First Workflow')).toBeInTheDocument();
    expect(screen.getByText('Advanced Node Techniques')).toBeInTheDocument();
  });
});

// ── HelpQuickLinks ────────────────────────────────────────────────────────────
describe('HelpQuickLinks', () => {
  it('renders "Quick Links" heading', () => {
    render(<HelpQuickLinks />);
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
  });

  it('renders at least one quick link card', () => {
    render(<HelpQuickLinks />);
    const cards = document.querySelectorAll('[data-testid^="quick-link-"]');
    expect(cards.length).toBeGreaterThan(0);
  });
});

// ── FAQCategoryFilter ─────────────────────────────────────────────────────────
describe('FAQCategoryFilter', () => {
  const categories = ['General', 'Billing', 'Technical'];

  it('renders "All" filter chip', () => {
    render(<FAQCategoryFilter categories={categories} searchQuery="" setSearchQuery={jest.fn()} />);
    expect(screen.getByTestId('filter-all')).toBeInTheDocument();
  });

  it('renders category chips for each category', () => {
    render(<FAQCategoryFilter categories={categories} searchQuery="" setSearchQuery={jest.fn()} />);
    expect(screen.getByTestId('filter-general')).toBeInTheDocument();
    expect(screen.getByTestId('filter-billing')).toBeInTheDocument();
    expect(screen.getByTestId('filter-technical')).toBeInTheDocument();
  });

  it('calls setSearchQuery with empty string when "All" is clicked', async () => {
    const setSearchQuery = jest.fn();
    render(<FAQCategoryFilter categories={categories} searchQuery="General" setSearchQuery={setSearchQuery} />);
    await userEvent.click(screen.getByTestId('filter-all'));
    expect(setSearchQuery).toHaveBeenCalledWith('');
  });

  it('calls setSearchQuery with category when chip is clicked', async () => {
    const setSearchQuery = jest.fn();
    render(<FAQCategoryFilter categories={categories} searchQuery="" setSearchQuery={setSearchQuery} />);
    await userEvent.click(screen.getByTestId('filter-general'));
    expect(setSearchQuery).toHaveBeenCalledWith('General');
  });
});

// ── FAQAccordionItem ──────────────────────────────────────────────────────────
describe('FAQAccordionItem', () => {
  const faq = {
    id: 'faq-1',
    question: 'How do I create a workflow?',
    answer: 'Click New Workflow on the dashboard.',
    category: 'General',
  };

  it('renders with correct data-testid', () => {
    render(<FAQAccordionItem faq={faq} expanded={false} onChange={jest.fn()} />);
    expect(screen.getByTestId('faq-faq-1')).toBeInTheDocument();
  });

  it('renders the question', () => {
    render(<FAQAccordionItem faq={faq} expanded={false} onChange={jest.fn()} />);
    expect(screen.getByText('How do I create a workflow?')).toBeInTheDocument();
  });

  it('renders the category chip', () => {
    render(<FAQAccordionItem faq={faq} expanded={false} onChange={jest.fn()} />);
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('renders the answer when expanded', () => {
    render(<FAQAccordionItem faq={faq} expanded={true} onChange={jest.fn()} />);
    expect(screen.getByText('Click New Workflow on the dashboard.')).toBeInTheDocument();
  });
});

// ── HelpFAQSection ────────────────────────────────────────────────────────────
describe('HelpFAQSection', () => {
  const faqs = [
    { id: 'f1', question: 'Q1?', answer: 'A1', category: 'General' },
    { id: 'f2', question: 'Q2?', answer: 'A2', category: 'Billing' },
  ];

  it('renders the FAQ list', () => {
    render(
      <HelpFAQSection
        filteredFAQs={faqs}
        categories={['General', 'Billing']}
        expandedAccordion={false}
        searchQuery=""
        setSearchQuery={jest.fn()}
        handleAccordionChange={() => jest.fn()}
      />
    );
    expect(screen.getByTestId('faq-list')).toBeInTheDocument();
  });

  it('renders FAQ questions', () => {
    render(
      <HelpFAQSection
        filteredFAQs={faqs}
        categories={['General', 'Billing']}
        expandedAccordion={false}
        searchQuery=""
        setSearchQuery={jest.fn()}
        handleAccordionChange={() => jest.fn()}
      />
    );
    expect(screen.getByText('Q1?')).toBeInTheDocument();
    expect(screen.getByText('Q2?')).toBeInTheDocument();
  });

  it('shows no results message when filteredFAQs is empty', () => {
    render(
      <HelpFAQSection
        filteredFAQs={[]}
        categories={[]}
        expandedAccordion={false}
        searchQuery="xyz"
        setSearchQuery={jest.fn()}
        handleAccordionChange={() => jest.fn()}
      />
    );
    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });

  it('renders the FAQ heading', () => {
    render(
      <HelpFAQSection
        filteredFAQs={[]}
        categories={[]}
        expandedAccordion={false}
        searchQuery=""
        setSearchQuery={jest.fn()}
        handleAccordionChange={() => jest.fn()}
      />
    );
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });
});
