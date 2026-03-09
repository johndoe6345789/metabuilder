import { configureMonacoTypeScript, getMonacoLanguage } from './monaco-config'

describe('monaco-config', () => {
  describe('configureMonacoTypeScript', () => {
    test('handles monaco with typescript support', () => {
      const setEagerModelSyncMock = jest.fn()
      const monaco = {
        languages: {
          typescript: {
            typescriptDefaults: {
              setEagerModelSync: setEagerModelSyncMock,
            },
          },
        },
      } as any

      configureMonacoTypeScript(monaco)
      expect(setEagerModelSyncMock).toHaveBeenCalledWith(true)
    })

    test('handles monaco without typescript support', () => {
      const monaco = {
        languages: {},
      } as any

      expect(() => configureMonacoTypeScript(monaco)).not.toThrow()
    })

    test('handles null typescript', () => {
      const monaco = {
        languages: {
          typescript: null,
        },
      } as any

      expect(() => configureMonacoTypeScript(monaco)).not.toThrow()
    })

    test('enables eager model sync for TypeScript', () => {
      const setEagerModelSyncMock = jest.fn()
      const monaco = {
        languages: {
          typescript: {
            typescriptDefaults: {
              setEagerModelSync: setEagerModelSyncMock,
            },
          },
        },
      } as any

      configureMonacoTypeScript(monaco)
      expect(setEagerModelSyncMock).toHaveBeenCalledTimes(1)
      expect(setEagerModelSyncMock).toHaveBeenCalledWith(true)
    })
  })

  describe('getMonacoLanguage', () => {
    test('maps JavaScript to javascript', () => {
      expect(getMonacoLanguage('JavaScript')).toBe('javascript')
    })

    test('maps TypeScript to typescript', () => {
      expect(getMonacoLanguage('TypeScript')).toBe('typescript')
    })

    test('maps JSX to javascript', () => {
      expect(getMonacoLanguage('JSX')).toBe('javascript')
    })

    test('maps TSX to typescript', () => {
      expect(getMonacoLanguage('TSX')).toBe('typescript')
    })

    test('maps Python to python', () => {
      expect(getMonacoLanguage('Python')).toBe('python')
    })

    test('maps Java to java', () => {
      expect(getMonacoLanguage('Java')).toBe('java')
    })

    test('maps C++ to cpp', () => {
      expect(getMonacoLanguage('C++')).toBe('cpp')
    })

    test('maps C# to csharp', () => {
      expect(getMonacoLanguage('C#')).toBe('csharp')
    })

    test('maps Go to go', () => {
      expect(getMonacoLanguage('Go')).toBe('go')
    })

    test('maps Rust to rust', () => {
      expect(getMonacoLanguage('Rust')).toBe('rust')
    })

    test('maps PHP to php', () => {
      expect(getMonacoLanguage('PHP')).toBe('php')
    })

    test('maps Ruby to ruby', () => {
      expect(getMonacoLanguage('Ruby')).toBe('ruby')
    })

    test('maps SQL to sql', () => {
      expect(getMonacoLanguage('SQL')).toBe('sql')
    })

    test('maps HTML to html', () => {
      expect(getMonacoLanguage('HTML')).toBe('html')
    })

    test('maps CSS to css', () => {
      expect(getMonacoLanguage('CSS')).toBe('css')
    })

    test('maps JSON to json', () => {
      expect(getMonacoLanguage('JSON')).toBe('json')
    })

    test('maps YAML to yaml', () => {
      expect(getMonacoLanguage('YAML')).toBe('yaml')
    })

    test('maps Markdown to markdown', () => {
      expect(getMonacoLanguage('Markdown')).toBe('markdown')
    })

    test('maps XML to xml', () => {
      expect(getMonacoLanguage('XML')).toBe('xml')
    })

    test('maps Shell to shell', () => {
      expect(getMonacoLanguage('Shell')).toBe('shell')
    })

    test('maps Bash to shell', () => {
      expect(getMonacoLanguage('Bash')).toBe('shell')
    })

    test('falls back to lowercase for unknown languages', () => {
      expect(getMonacoLanguage('UnknownLanguage')).toBe('unknownlanguage')
    })

    test('handles empty string', () => {
      expect(getMonacoLanguage('')).toBe('')
    })

    test('handles case sensitivity in fallback', () => {
      expect(getMonacoLanguage('UNKNOWN')).toBe('unknown')
    })
  })
})
