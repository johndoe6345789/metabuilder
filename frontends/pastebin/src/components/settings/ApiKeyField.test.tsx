import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiKeyField } from './ApiKeyField'
import type { AIPlatform } from '@/config/aiPlatforms'

jest.mock('@metabuilder/components/fakemui', () => ({
  Input: ({ id, type, value, onChange, placeholder, 'data-testid': testId, 'aria-label': ariaLabel }: any) => (
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
      data-testid={testId} aria-label={ariaLabel} />
  ),
  FormLabel: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
  MaterialIcon: ({ name }: any) => <span data-icon={name} />,
}))

const platform: AIPlatform = {
  id: 'openai',
  name: 'OpenAI',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  defaultModel: 'gpt-4o-mini',
  keyPlaceholder: 'sk-...',
  keyRequired: true,
  docsUrl: 'https://platform.openai.com/api-keys',
  docsLabel: 'OpenAI Platform',
  apiFormat: 'openai',
}

describe('ApiKeyField', () => {
  const defaultProps = {
    platform,
    apiKey: '',
    showKey: false,
    serverKeyStatus: 'none' as const,
    keyLabel: 'API Key',
    showLabel: 'Show key',
    hideLabel: 'Hide key',
    hintText: 'Get your key from',
    onApiKeyChange: jest.fn(),
    onToggleShow: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders the key label', () => {
    render(<ApiKeyField {...defaultProps} />)
    expect(screen.getByText('API Key')).toBeInTheDocument()
  })

  it('renders the api key input with data-testid', () => {
    render(<ApiKeyField {...defaultProps} />)
    expect(screen.getByTestId('openai-api-key-input')).toBeInTheDocument()
  })

  it('input is password type when showKey is false', () => {
    render(<ApiKeyField {...defaultProps} showKey={false} />)
    expect(screen.getByTestId('openai-api-key-input')).toHaveAttribute('type', 'password')
  })

  it('input is text type when showKey is true', () => {
    render(<ApiKeyField {...defaultProps} showKey={true} />)
    expect(screen.getByTestId('openai-api-key-input')).toHaveAttribute('type', 'text')
  })

  it('uses platform keyPlaceholder when serverKeyStatus is not stored', () => {
    render(<ApiKeyField {...defaultProps} serverKeyStatus="none" />)
    expect(screen.getByTestId('openai-api-key-input')).toHaveAttribute('placeholder', 'sk-...')
  })

  it('uses server-stored placeholder when serverKeyStatus is stored', () => {
    render(<ApiKeyField {...defaultProps} serverKeyStatus="stored" />)
    expect(screen.getByTestId('openai-api-key-input')).toHaveAttribute('placeholder', '(using server-stored key)')
  })

  it('renders toggle button with data-testid', () => {
    render(<ApiKeyField {...defaultProps} />)
    expect(screen.getByTestId('toggle-api-key-visibility')).toBeInTheDocument()
  })

  it('toggle button aria-label is showLabel when key is hidden', () => {
    render(<ApiKeyField {...defaultProps} showKey={false} />)
    expect(screen.getByTestId('toggle-api-key-visibility')).toHaveAttribute('aria-label', 'Show key')
  })

  it('toggle button aria-label is hideLabel when key is visible', () => {
    render(<ApiKeyField {...defaultProps} showKey={true} />)
    expect(screen.getByTestId('toggle-api-key-visibility')).toHaveAttribute('aria-label', 'Hide key')
  })

  it('toggle button aria-pressed reflects showKey', () => {
    render(<ApiKeyField {...defaultProps} showKey={true} />)
    expect(screen.getByTestId('toggle-api-key-visibility')).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onToggleShow when toggle button clicked', async () => {
    const user = userEvent.setup()
    render(<ApiKeyField {...defaultProps} />)
    await user.click(screen.getByTestId('toggle-api-key-visibility'))
    expect(defaultProps.onToggleShow).toHaveBeenCalledTimes(1)
  })

  it('calls onApiKeyChange when input changes', async () => {
    const user = userEvent.setup()
    render(<ApiKeyField {...defaultProps} />)
    await user.type(screen.getByTestId('openai-api-key-input'), 'sk-test')
    expect(defaultProps.onApiKeyChange).toHaveBeenCalled()
  })

  it('renders hint text', () => {
    render(<ApiKeyField {...defaultProps} />)
    expect(screen.getByText('Get your key from')).toBeInTheDocument()
  })

  it('renders docs link with correct href', () => {
    render(<ApiKeyField {...defaultProps} />)
    const link = screen.getByText('OpenAI Platform')
    expect(link).toHaveAttribute('href', 'https://platform.openai.com/api-keys')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('displays current apiKey value', () => {
    render(<ApiKeyField {...defaultProps} apiKey="sk-existing" />)
    const input = screen.getByTestId('openai-api-key-input') as HTMLInputElement
    expect(input.value).toBe('sk-existing')
  })
})
