import { useEffect } from 'react'
import type { languages } from 'monaco-editor'
import type { LuaScript } from '@/lib/level-types'

interface UsePersistenceProps {
  monaco: typeof import('monaco-editor') | null
  currentScript: LuaScript | null
  setTestInputs: (value: Record<string, any>) => void
}

export function useLuaEditorPersistence({
  monaco,
  currentScript,
  setTestInputs,
}: UsePersistenceProps) {
  useEffect(() => {
    if (!monaco) return

    monaco.languages.registerCompletionItemProvider('lua', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range: languages.CompletionItem['range'] = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions: languages.CompletionItem[] = [
          {
            label: 'context.data',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'context.data',
            documentation: 'Access input parameters passed to the script',
            range,
          },
          {
            label: 'context.user',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'context.user',
            documentation: 'Current user information (username, role, etc.)',
            range,
          },
          {
            label: 'context.kv',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'context.kv',
            documentation: 'Key-value storage interface',
            range,
          },
          {
            label: 'context.log',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'context.log(${1:message})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Log a message to the output console',
            range,
          },
          {
            label: 'log',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'log(${1:message})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Log a message (shortcut for context.log)',
            range,
          },
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:message})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Print a message to output',
            range,
          },
          {
            label: 'return',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'return ${1:result}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Return a value from the script',
            range,
          },
        ]

        return { suggestions }
      },
    })

    monaco.languages.setLanguageConfiguration('lua', {
      comments: {
        lineComment: '--',
        blockComment: ['--[[', ']]'],
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    })
  }, [monaco])

  useEffect(() => {
    if (!currentScript) return

    const inputs: Record<string, any> = {}
    currentScript.parameters.forEach(param => {
      inputs[param.name] = param.type === 'number' ? 0 : param.type === 'boolean' ? false : ''
    })
    setTestInputs(inputs)
  }, [currentScript?.id, currentScript?.parameters.length, setTestInputs])

}
