'use client'

import type { QueryResponse } from '../types'
import { isPlainOutput } from '../queryUtils'
import styles from '../QueryConsole.module.scss'

function syntaxHighlight(json: string): string {
  return json.replace(
    // eslint-disable-next-line no-useless-escape
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = styles.jsonNumber
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? styles.jsonKey : styles.jsonString
      } else if (/true|false/.test(match)) {
        cls = styles.jsonBool
      } else if (/null/.test(match)) {
        cls = styles.jsonNull
      }
      return `<span class="${cls}">${match}</span>`
    },
  )
}

interface ResponsePanelProps {
  loading: boolean
  response: QueryResponse | null
}

export function ResponsePanel({ loading, response }: ResponsePanelProps) {
  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.loading}>
          <span className={styles.spinner} />
          {' Sending request...'}
        </div>
      </div>
    )
  }

  if (!response) return null

  const isSuccess = response.status >= 200 && response.status < 300

  return (
    <div className={styles.panel}>
      <div className={styles.responseHeader}>
        <h3 className={styles.responseTitle}>Response</h3>
        <span
          className={[
            styles.statusBadge,
            isSuccess ? styles.statusSuccess : styles.statusError,
          ].join(' ')}
        >
          {response.status} {response.statusText}
        </span>
      </div>
      <pre className={styles.responsePre}>
        {isPlainOutput(response.data)
          ? (response.data as { output: string }).output
          : (
            <span
              dangerouslySetInnerHTML={{
                __html: syntaxHighlight(
                  JSON.stringify(response.data, null, 2),
                ),
              }}
            />
          )}
      </pre>
    </div>
  )
}
