/**
 * Lua Code Editor Stories
 *
 * Demonstrates Lua scripting features with Monaco editor
 * Showcases syntax highlighting, snippets, and execution
 */

import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

// Monaco Editor placeholder (in real impl, use @monaco-editor/react)
const CodeEditor: React.FC<{
  value: string
  language: string
  onChange?: (value: string) => void
  readOnly?: boolean
  height?: string
}> = ({ value, language, onChange, readOnly, height = '400px' }) => {
  const [code, setCode] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setCode(newValue)
    onChange?.(newValue)
  }

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <div style={{
        backgroundColor: 'var(--color-muted)',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--color-border)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{language.toUpperCase()}</span>
        <span style={{ color: 'var(--color-muted-foreground)' }}>
          {code.split('\n').length} lines
        </span>
      </div>
      <textarea
        value={code}
        onChange={handleChange}
        readOnly={readOnly}
        spellCheck={false}
        style={{
          width: '100%',
          height,
          padding: '1rem',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.875rem',
          lineHeight: '1.5',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-foreground)',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          tabSize: 2
        }}
      />
    </div>
  )
}

// Lua Script Snippet Library
const LuaSnippet: React.FC<{
  title: string
  description: string
  code: string
  onInsert?: (code: string) => void
}> = ({ title, description, code, onInsert }) => (
  <div style={{
    padding: '1rem',
    border: '1px solid var(--color-border)',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    cursor: onInsert ? 'pointer' : 'default',
    transition: 'all 200ms ease-in-out'
  }}
  onClick={() => onInsert?.(code)}
  onMouseEnter={(e) => {
    if (onInsert) {
      e.currentTarget.style.borderColor = 'var(--color-primary)'
      e.currentTarget.style.backgroundColor = 'var(--color-muted)'
    }
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = 'var(--color-border)'
    e.currentTarget.style.backgroundColor = 'transparent'
  }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
      <div>
        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>{title}</h4>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
          {description}
        </p>
      </div>
      {onInsert && (
        <button style={{
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-primary-foreground)',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer'
        }}>
          Insert
        </button>
      )}
    </div>
    <pre style={{
      margin: 0,
      padding: '0.5rem',
      backgroundColor: 'var(--color-background)',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontFamily: "'JetBrains Mono', monospace",
      overflow: 'auto'
    }}>
      {code}
    </pre>
  </div>
)

// Lua Execution Output
const ExecutionOutput: React.FC<{
  output: string[]
  errors: string[]
}> = ({ output, errors }) => (
  <div style={{
    marginTop: '1rem',
    border: '1px solid var(--color-border)',
    borderRadius: '0.5rem',
    overflow: 'hidden'
  }}>
    <div style={{
      backgroundColor: 'var(--color-muted)',
      padding: '0.5rem 1rem',
      borderBottom: '1px solid var(--color-border)',
      fontWeight: 600,
      fontSize: '0.875rem'
    }}>
      Output
    </div>
    <div style={{
      padding: '1rem',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.875rem',
      minHeight: '100px',
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      {errors.length > 0 && (
        <div style={{ color: 'var(--color-destructive)', marginBottom: '0.5rem' }}>
          {errors.map((error, idx) => (
            <div key={idx}>❌ {error}</div>
          ))}
        </div>
      )}
      {output.length > 0 ? (
        output.map((line, idx) => (
          <div key={idx} style={{ marginBottom: '0.25rem' }}>{line}</div>
        ))
      ) : (
        <div style={{ color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>
          No output yet. Run your Lua code to see results.
        </div>
      )}
    </div>
  </div>
)

// Interactive Lua Editor
const LuaEditorWorkspace: React.FC = () => {
  const [code, setCode] = useState(`-- Hello World in Lua
function greet(name)
  return "Hello, " .. name .. "!"
end

print(greet("MetaBuilder"))

-- Calculate factorial
function factorial(n)
  if n <= 1 then
    return 1
  else
    return n * factorial(n - 1)
  end
end

print("Factorial of 5:", factorial(5))`)

  const [output, setOutput] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const handleRun = () => {
    // Simulate Lua execution (in real impl, use Fengari or similar)
    try {
      setOutput([
        '> Hello, MetaBuilder!',
        '> Factorial of 5: 120',
        '✓ Execution completed successfully'
      ])
      setErrors([])
    } catch (error) {
      setErrors([String(error)])
      setOutput([])
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '0.25rem' }}>Lua Script Editor</h2>
          <p style={{ margin: 0, color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
            Write and execute Lua code with syntax highlighting
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleRun}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 200ms ease-in-out',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
          >
            ▶️ Run Code
          </button>
        </div>
      </div>

      <CodeEditor
        value={code}
        language="lua"
        onChange={setCode}
        height="500px"
      />

      <ExecutionOutput output={output} errors={errors} />
    </div>
  )
}

// Lua Snippet Library
const LuaSnippetLibrary: React.FC = () => {
  const [currentCode, setCurrentCode] = useState('')

  const snippets = [
    {
      title: 'Hello World',
      description: 'Basic print statement',
      code: `print("Hello, World!")`
    },
    {
      title: 'Function Definition',
      description: 'Define a simple function',
      code: `function myFunction(param)
  return param * 2
end`
    },
    {
      title: 'Table Iteration',
      description: 'Loop through a table',
      code: `local items = {1, 2, 3, 4, 5}
for i, value in ipairs(items) do
  print(i, value)
end`
    },
    {
      title: 'Conditional Logic',
      description: 'If-else statement',
      code: `local value = 10
if value > 5 then
  print("Greater than 5")
else
  print("Less than or equal to 5")
end`
    },
    {
      title: 'Component Generator',
      description: 'Generate UI components',
      code: `function createButton(text, onClick)
  return {
    type = "Button",
    props = {
      text = text,
      onClick = onClick
    }
  }
end`
    },
    {
      title: 'Data Validation',
      description: 'Validate user input',
      code: `function validate(data)
  if not data.username or #data.username < 3 then
    return false, "Username too short"
  end
  if not data.email or not data.email:match("@") then
    return false, "Invalid email"
  end
  return true, "Valid"
end`
    }
  ]

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Lua Snippet Library</h2>
      <p style={{ color: 'var(--color-muted-foreground)', marginBottom: '2rem' }}>
        Click any snippet to insert it into your code
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
        {snippets.map((snippet, idx) => (
          <LuaSnippet
            key={idx}
            {...snippet}
            onInsert={(code) => {
              setCurrentCode(code)
              console.log('Inserted:', code)
            }}
          />
        ))}
      </div>

      {currentCode && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Currently Selected:</h3>
          <CodeEditor value={currentCode} language="lua" readOnly height="200px" />
        </div>
      )}
    </div>
  )
}

// Meta configuration
const meta: Meta = {
  title: 'Developer/Lua Code Editor',
  parameters: {
    package: 'code_editor',
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj

export const BasicEditor: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <CodeEditor
        value={`-- Simple Lua example
local message = "Hello from Lua!"
print(message)`}
        language="lua"
      />
    </div>
  ),
}

export const InteractiveWorkspace: Story = {
  render: () => <LuaEditorWorkspace />,
}

export const SnippetLibrary: Story = {
  render: () => <LuaSnippetLibrary />,
}

export const ReadOnlyViewer: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Read-Only Code Viewer</h3>
      <CodeEditor
        value={`-- This code is read-only
-- Used for documentation or examples

function calculateSum(a, b)
  return a + b
end

-- Example usage:
local result = calculateSum(5, 3)
print("Sum:", result)  -- Output: Sum: 8`}
        language="lua"
        readOnly
        height="300px"
      />
    </div>
  ),
}

export const MultipleEditors: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Multiple Lua Scripts</h2>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Script 1: Data Processing</h3>
        <CodeEditor
          value={`function processData(data)
  local result = {}
  for k, v in pairs(data) do
    result[k] = v * 2
  end
  return result
end`}
          language="lua"
          height="200px"
        />
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Script 2: UI Builder</h3>
        <CodeEditor
          value={`function buildUI(config)
  return {
    type = "Container",
    children = {
      { type = "Header", text = config.title },
      { type = "Content", text = config.body }
    }
  }
end`}
          language="lua"
          height="200px"
        />
      </div>
    </div>
  ),
}
