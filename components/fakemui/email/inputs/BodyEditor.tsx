// fakemui/react/components/email/inputs/BodyEditor.tsx
import React, { forwardRef } from 'react'
import { Box } from '../../layout/Box'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface BodyEditorProps
  extends React.TextareaHTMLAttributes<
    HTMLTextAreaElement
  > {
  mode?: 'plain' | 'html'
  onModeChange?: (mode: 'plain' | 'html') => void
  testId?: string
}

export const BodyEditor = forwardRef<
  HTMLTextAreaElement,
  BodyEditorProps
>(({
  mode = 'plain',
  onModeChange,
  testId: customTestId,
  ...props
}, ref) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'body-editor',
    identifier: customTestId || 'body',
    ariaLabel: 'Email body'
  })

  const modeBtn = (m: 'plain' | 'html', label: string) => (
    <button
      type="button"
      className={`mode-btn${mode === m ? ' mode-btn--active' : ''}`}
      onClick={() => onModeChange?.(m)}
      aria-pressed={mode === m}
      data-testid={`mode-${m}`}
    >
      {label}
    </button>
  )

  return (
    <Box className="body-editor">
      <div
        className="body-editor-toolbar"
        role="toolbar"
        aria-label="Editor mode"
      >
        {modeBtn('plain', 'Plain Text')}
        {modeBtn('html', 'HTML')}
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
})

BodyEditor.displayName = 'BodyEditor'
