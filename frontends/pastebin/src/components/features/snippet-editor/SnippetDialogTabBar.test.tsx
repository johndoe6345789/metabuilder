import React from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DialogTabBar, TabPanel } from './SnippetDialogTabBar'

describe('DialogTabBar', () => {
  const tabs = ['Details', 'Code', 'Parameters']
  const onTabChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all tab buttons', () => {
    render(<DialogTabBar tabs={tabs} activeTab={0} onTabChange={onTabChange} />)
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
    expect(screen.getByText('Parameters')).toBeInTheDocument()
  })

  it('renders a nav with tablist role', () => {
    render(<DialogTabBar tabs={tabs} activeTab={0} onTabChange={onTabChange} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('marks the active tab as selected', () => {
    render(<DialogTabBar tabs={tabs} activeTab={1} onTabChange={onTabChange} />)
    const codeTab = screen.getByTestId('snippet-tab-1-btn')
    expect(codeTab).toHaveAttribute('aria-selected', 'true')
  })

  it('marks non-active tabs as not selected', () => {
    render(<DialogTabBar tabs={tabs} activeTab={0} onTabChange={onTabChange} />)
    const codeTab = screen.getByTestId('snippet-tab-1-btn')
    expect(codeTab).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onTabChange with correct index on click', async () => {
    const user = userEvent.setup()
    render(<DialogTabBar tabs={tabs} activeTab={0} onTabChange={onTabChange} />)
    await user.click(screen.getByTestId('snippet-tab-2-btn'))
    expect(onTabChange).toHaveBeenCalledWith(2)
  })

  it('renders tab buttons with correct data-testid attributes', () => {
    render(<DialogTabBar tabs={tabs} activeTab={0} onTabChange={onTabChange} />)
    expect(screen.getByTestId('snippet-tab-0-btn')).toBeInTheDocument()
    expect(screen.getByTestId('snippet-tab-1-btn')).toBeInTheDocument()
    expect(screen.getByTestId('snippet-tab-2-btn')).toBeInTheDocument()
  })

  it('sets correct aria-controls on each button', () => {
    render(<DialogTabBar tabs={tabs} activeTab={0} onTabChange={onTabChange} />)
    expect(screen.getByTestId('snippet-tab-0-btn')).toHaveAttribute(
      'aria-controls',
      'snippet-tab-0-panel',
    )
    expect(screen.getByTestId('snippet-tab-1-btn')).toHaveAttribute(
      'aria-controls',
      'snippet-tab-1-panel',
    )
  })

  it('handles single tab', () => {
    render(
      <DialogTabBar tabs={['Only']} activeTab={0} onTabChange={onTabChange} />,
    )
    expect(screen.getByText('Only')).toBeInTheDocument()
    expect(screen.getByTestId('snippet-tab-0-btn')).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  // eslint-disable-next-line max-len
  it('calls onTabChange when first tab is clicked while second is active', async () => {
    const user = userEvent.setup()
    render(<DialogTabBar tabs={tabs} activeTab={1} onTabChange={onTabChange} />)
    await user.click(screen.getByTestId('snippet-tab-0-btn'))
    expect(onTabChange).toHaveBeenCalledWith(0)
  })
})

describe('TabPanel', () => {
  it('renders children when active', () => {
    render(
      <TabPanel active={true} index={0}>
        <div>Panel content</div>
      </TabPanel>,
    )
    expect(screen.getByText('Panel content')).toBeInTheDocument()
  })

  it('renders nothing when not active', () => {
    render(
      <TabPanel active={false} index={0}>
        <div>Hidden content</div>
      </TabPanel>,
    )
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('has tabpanel role', () => {
    render(
      <TabPanel active={true} index={0}>
        <span>Content</span>
      </TabPanel>,
    )
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('sets correct id and aria-labelledby', () => {
    render(
      <TabPanel active={true} index={2}>
        <span>Content</span>
      </TabPanel>,
    )
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveAttribute('id', 'snippet-tab-2-panel')
    expect(panel).toHaveAttribute('aria-labelledby', 'snippet-tab-2-btn')
  })
})
