import type { Monaco } from '@monaco-editor/react'
import { useEffect } from 'react'

export const useLuaDiagnostics = (monaco: Monaco | null) =>
  useEffect(() => {
    if (!monaco) return

    monaco.languages.registerCompletionItemProvider('lua', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions: any[] = [
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
