const fs = require('fs')
const path = require('path')

// Comprehensive test template for different component types
const templates = {
  card: () => `import { render, screen } from '@/test-utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

describe('Card Component', () => {
  it('renders Card component', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies card classes', () => {
    const { container } = render(<Card>Test</Card>)
    const card = container.querySelector('[class*="mat-mdc-card"]')
    expect(card).toBeInTheDocument()
  })

  it('renders CardHeader', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    )
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  it('renders CardTitle', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('renders CardDescription', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Description</CardDescription>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders CardContent', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
      </Card>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders CardFooter', () => {
    render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('composes all card parts together', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
          <CardDescription>With all parts</CardDescription>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Action buttons</CardFooter>
      </Card>
    )
    expect(screen.getByText('Complete Card')).toBeInTheDocument()
    expect(screen.getByText('With all parts')).toBeInTheDocument()
    expect(screen.getByText('Main content')).toBeInTheDocument()
    expect(screen.getByText('Action buttons')).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-class">Test</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('custom-class')
  })
})
`,

  input: () => `import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('accepts and displays value', () => {
    render(<Input value="test value" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('test value')
  })

  it('handles onChange events', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)

    await user.type(screen.getByRole('textbox'), 'hello')
    expect(handleChange).toHaveBeenCalled()
  })

  it('accepts placeholder attribute', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('supports disabled state', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('supports type attribute', () => {
    render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
  })

  it('accepts custom className', () => {
    render(<Input className="custom" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom')
  })

  it('supports aria-label', () => {
    render(<Input aria-label="Username" />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('clears value when cleared', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Input value="text" onChange={() => {}} />)

    rerender(<Input value="" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })
})
`,

  checkbox: () => `import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './checkbox'

describe('Checkbox Component', () => {
  it('renders checkbox input', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('is unchecked by default', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('displays checked state', () => {
    render(<Checkbox checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('handles onChange event', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Checkbox onChange={handleChange} />)

    await user.click(screen.getByRole('checkbox'))
    expect(handleChange).toHaveBeenCalled()
  })

  it('supports disabled state', () => {
    render(<Checkbox disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('works with label', () => {
    render(
      <label>
        <Checkbox />
        Accept terms
      </label>
    )
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('accepts aria-label', () => {
    render(<Checkbox aria-label="Agree" />)
    expect(screen.getByLabelText('Agree')).toBeInTheDocument()
  })

  it('toggles checked state on click', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    const { rerender } = render(<Checkbox onChange={handleChange} checked={false} />)

    await user.click(screen.getByRole('checkbox'))
    expect(handleChange).toHaveBeenCalledTimes(1)

    rerender(<Checkbox onChange={handleChange} checked={true} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
`,

  generic: (name) => `import { render, screen } from '@/test-utils'
import { ${name} } from './${name.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1)}'

describe('${name} Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<${name} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(<${name} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('renders children when provided', () => {
    render(
      <${name}>
        <span>Child content</span>
      </${name}>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('supports data attributes', () => {
    render(<${name} data-testid="test-component" />)
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
  })
})
`
}

// Map components to their template types
const componentTemplates = {
  'card.tsx': 'card',
  'input.tsx': 'input',
  'checkbox.tsx': 'checkbox',
}

console.log('ℹ️  Proper test generation requires manual implementation per component')
console.log('   Use these templates as a base for building comprehensive tests.')
console.log('\nTemplate types:')
console.log('  - card: Full card composition with header, title, content, footer')
console.log('  - input: Form input with value, onChange, placeholder, disabled states')
console.log('  - checkbox: Checkbox with checked state, onChange, disabled, label')
console.log('  - generic: Fallback template with className, children, data attributes')
