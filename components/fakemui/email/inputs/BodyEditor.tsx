// fakemui/react/components/email/inputs/BodyEditor.tsx
import React, { forwardRef } from 'react'
import { Box } from '../../layout/Box'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface BodyEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  mode?: 'plain' | 'html'
  onModeChange?: (mode: 'plain' | 'html') => void
  testId?: string
}

export const BodyEditor = forwardRef<HTMLTextAreaElement, BodyEditorProps>(
  ({ mode = 'plain', onModeChange, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'body-editor',
      identifier: customTestId || 'body'
    })

    return (
      <Box className="body-editor">
        <div className="body-editor-toolbar">
          <button
            type="button"
            className={`mode-btn ${mode === 'plain' ? 'mode-btn--active' : ''}`}
            onClick={() => onModeChange?.('plain')}
          >
            Plain Text
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'html' ? 'mode-btn--active' : ''}`}
            onClick={() => onModeChange?.('html')}
          >
            HTML
          </button>
        </div>
        <textarea
          ref={ref}
          className="body-editor-textarea"
          placeholder="Write your message here..."
          {...accessible}
          {...props}
        />
      </Box>
    )
  }
)

BodyEditor.displayName = 'BodyEditor'
