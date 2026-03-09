import { renderHook, act } from '@testing-library/react'
import { useSnippetForm } from './useSnippetForm'
import { Snippet } from '@/lib/types'

describe('useSnippetForm', () => {
  const mockSnippet: Snippet = {
    id: '1',
    title: 'Test Snippet',
    description: 'Test description',
    code: 'console.log("test")',
    language: 'javascript',
    category: 'general',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hasPreview: true,
    functionName: 'TestFunc',
    inputParameters: [
      { name: 'param1', type: 'string', defaultValue: '"default"', description: 'A parameter' },
    ],
  }

  test('initializes with empty form', () => {
    const { result } = renderHook(() => useSnippetForm())

    expect(result.current.title).toBe('')
    expect(result.current.description).toBe('')
    expect(result.current.code).toBe('')
    expect(result.current.hasPreview).toBe(false)
    expect(result.current.functionName).toBe('')
    expect(result.current.inputParameters).toEqual([])
    expect(result.current.errors).toEqual({})
  })

  test('populates form with editing snippet', () => {
    const { result } = renderHook(() => useSnippetForm(mockSnippet, true))

    expect(result.current.title).toBe('Test Snippet')
    expect(result.current.description).toBe('Test description')
    expect(result.current.code).toBe('console.log("test")')
    expect(result.current.language).toBe('javascript')
    expect(result.current.hasPreview).toBe(true)
    expect(result.current.functionName).toBe('TestFunc')
    expect(result.current.inputParameters).toEqual(mockSnippet.inputParameters)
  })

  test('updates title', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setTitle('New Title')
    })

    expect(result.current.title).toBe('New Title')
  })

  test('updates description', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setDescription('New Description')
    })

    expect(result.current.description).toBe('New Description')
  })

  test('updates code', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setCode('const x = 5')
    })

    expect(result.current.code).toBe('const x = 5')
  })

  test('updates language', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setLanguage('python')
    })

    expect(result.current.language).toBe('python')
  })

  test('toggles hasPreview', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setHasPreview(true)
    })

    expect(result.current.hasPreview).toBe(true)
  })

  test('updates functionName', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setFunctionName('MyFunction')
    })

    expect(result.current.functionName).toBe('MyFunction')
  })

  test('adds parameter', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.handleAddParameter()
    })

    expect(result.current.inputParameters).toHaveLength(1)
    expect(result.current.inputParameters[0]).toEqual({
      name: '',
      type: 'string',
      defaultValue: '',
      description: '',
    })
  })

  test('removes parameter', () => {
    const { result } = renderHook(() => useSnippetForm(mockSnippet, true))

    expect(result.current.inputParameters).toHaveLength(1)

    act(() => {
      result.current.handleRemoveParameter(0)
    })

    expect(result.current.inputParameters).toHaveLength(0)
  })

  test('updates parameter field', () => {
    const { result } = renderHook(() => useSnippetForm(mockSnippet, true))

    act(() => {
      result.current.handleUpdateParameter(0, 'name', 'updatedParam')
    })

    expect(result.current.inputParameters[0].name).toBe('updatedParam')
  })

  test('updates parameter description', () => {
    const { result } = renderHook(() => useSnippetForm(mockSnippet, true))

    act(() => {
      result.current.handleUpdateParameter(0, 'description', 'New description')
    })

    expect(result.current.inputParameters[0].description).toBe('New description')
  })

  test('validates empty title', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setCode('some code')
    })

    let isValid = false
    act(() => {
      isValid = result.current.validate()
    })

    expect(isValid).toBe(false)
    expect(result.current.errors.title).toBeDefined()
  })

  test('validates empty code', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setTitle('Test Title')
    })

    let isValid = false
    act(() => {
      isValid = result.current.validate()
    })

    expect(isValid).toBe(false)
    expect(result.current.errors.code).toBeDefined()
  })

  test('validates with whitespace only', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setTitle('   ')
      result.current.setCode('   ')
    })

    let isValid = false
    act(() => {
      isValid = result.current.validate()
    })

    expect(isValid).toBe(false)
  })

  test('passes validation with required fields', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setTitle('Valid Title')
      result.current.setCode('valid code')
    })

    let isValid = false
    act(() => {
      isValid = result.current.validate()
    })

    expect(isValid).toBe(true)
    expect(result.current.errors.title).toBeUndefined()
    expect(result.current.errors.code).toBeUndefined()
  })

  test('getFormData returns trimmed values', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setTitle('  Test Title  ')
      result.current.setDescription('  Test Description  ')
      result.current.setCode('  console.log("test")  ')
      result.current.setLanguage('javascript')
    })

    const formData = result.current.getFormData()

    expect(formData.title).toBe('Test Title')
    expect(formData.description).toBe('Test Description')
    expect(formData.code).toBe('console.log("test")')
    expect(formData.language).toBe('javascript')
  })

  test('getFormData returns undefined for empty functionName', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setTitle('Test')
      result.current.setCode('code')
    })

    const formData = result.current.getFormData()

    expect(formData.functionName).toBeUndefined()
  })

  test('getFormData includes functionName when set', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setTitle('Test')
      result.current.setCode('code')
      result.current.setFunctionName('MyFunc')
    })

    const formData = result.current.getFormData()

    expect(formData.functionName).toBe('MyFunc')
  })

  test('getFormData returns undefined for empty inputParameters', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setTitle('Test')
      result.current.setCode('code')
    })

    const formData = result.current.getFormData()

    expect(formData.inputParameters).toBeUndefined()
  })

  test('getFormData includes inputParameters when present', () => {
    const { result } = renderHook(() => useSnippetForm(mockSnippet, true))

    const formData = result.current.getFormData()

    expect(formData.inputParameters).toEqual(mockSnippet.inputParameters)
  })

  test('resetForm clears all fields', () => {
    const { result } = renderHook(() => useSnippetForm(mockSnippet, true))

    expect(result.current.title).toBe('Test Snippet')

    act(() => {
      result.current.resetForm()
    })

    expect(result.current.title).toBe('')
    expect(result.current.description).toBe('')
    expect(result.current.code).toBe('')
    expect(result.current.hasPreview).toBe(false)
    expect(result.current.functionName).toBe('')
    expect(result.current.inputParameters).toEqual([])
    expect(result.current.errors).toEqual({})
  })

  test('clears editing snippet when editingSnippet changes to null', () => {
    const { result, rerender } = renderHook(
      ({ snippet, open }: { snippet: Snippet | undefined, open: boolean }) => useSnippetForm(snippet, open),
      { initialProps: { snippet: mockSnippet as Snippet | undefined, open: true } }
    )

    expect(result.current.title).toBe('Test Snippet')

    rerender({ snippet: undefined, open: true })

    expect(result.current.title).toBe('')
    expect(result.current.description).toBe('')
  })

  test('multiple parameters can be added and managed', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.handleAddParameter()
      result.current.handleAddParameter()
    })

    expect(result.current.inputParameters).toHaveLength(2)

    act(() => {
      result.current.handleUpdateParameter(0, 'name', 'param1')
      result.current.handleUpdateParameter(1, 'name', 'param2')
    })

    expect(result.current.inputParameters[0].name).toBe('param1')
    expect(result.current.inputParameters[1].name).toBe('param2')
  })

  test('uses editing snippet category in getFormData', () => {
    const snippetWithCategory: Snippet = {
      ...mockSnippet,
      category: 'special',
    }

    const { result } = renderHook(() => useSnippetForm(snippetWithCategory, true))

    const formData = result.current.getFormData()

    expect(formData.category).toBe('special')
  })

  test('defaults to general category when no editing snippet', () => {
    const { result } = renderHook(() => useSnippetForm())

    act(() => {
      result.current.setTitle('Test')
      result.current.setCode('code')
    })

    const formData = result.current.getFormData()

    expect(formData.category).toBe('general')
  })
})
