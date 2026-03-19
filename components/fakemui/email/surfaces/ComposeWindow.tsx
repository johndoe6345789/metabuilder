// fakemui/react/components/email/surfaces/ComposeWindow
import React, { useCallback, useEffect, useState } from 'react'
import { Box, BoxProps, Button, Card } from '../..'
import {
  useAccessible, useFocusTrap
} from '../../../../hooks/useAccessible'
import { MaterialIcon } from '../../../../icons/react/fakemui'
import { RecipientInput, BodyEditor } from '../inputs'

export interface ComposeWindowProps extends BoxProps {
  onSend?: (data: {
    to: string[]; cc?: string[]; bcc?: string[]
    subject: string; body: string
  }) => void
  onClose?: () => void
  testId?: string
}

export const ComposeWindow = ({
  onSend, onClose, testId: customTestId, ...props
}: ComposeWindowProps) => {
  const [to, setTo] = useState<string[]>([])
  const [cc, setCc] = useState<string[]>([])
  const [bcc, setBcc] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showCcBcc, setShowCcBcc] = useState(false)
  const accessible = useAccessible({
    feature: 'email', component: 'compose',
    identifier: customTestId || 'compose'
  })
  const trapRef = useFocusTrap(true)
  const handleSend = () => {
    if (to.length > 0 && subject && body)
      onSend?.({ to, cc, bcc, subject, body })
  }
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }, [onClose]
  )
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () =>
      document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <Card ref={trapRef} className="compose-window"
      role="dialog" aria-modal={true}
      aria-labelledby="compose-dialog-title"
      {...accessible} {...props}>
      <Box className="compose-header">
        <h2 id="compose-dialog-title">Compose Email</h2>
        <button onClick={onClose} className="close-btn"
          aria-label="Close"
          data-testid="compose-close-btn">
          <MaterialIcon name="close" />
        </button>
      </Box>
      <Box className="compose-body">
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RecipientInput recipientType="to"
            recipients={to} onRecipientsChange={setTo}
            placeholder="To:" />
          {!showCcBcc && (
            <button
              type="button"
              onClick={() => setShowCcBcc(true)}
              style={{
                fontSize: '0.75rem',
                color: 'var(--mat-sys-on-surface-variant)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                padding: '4px 6px',
              }}
              aria-label="Show Cc and Bcc fields"
            >
              Cc/Bcc
            </button>
          )}
        </Box>
        {showCcBcc && (
          <>
            <RecipientInput recipientType="cc"
              recipients={cc} onRecipientsChange={setCc}
              placeholder="Cc:" />
            <RecipientInput recipientType="bcc"
              recipients={bcc} onRecipientsChange={setBcc}
              placeholder="Bcc:" />
          </>
        )}
        <input type="text" placeholder="Subject"
          value={subject} id="compose-subject"
          aria-label="Subject"
          data-testid="compose-subject"
          onChange={e => setSubject(e.target.value)}
          className="compose-subject" />
        <BodyEditor value={body}
          onChange={e => setBody(e.target.value)} />
      </Box>
      <Box className="compose-footer">
        <Button variant="primary" onClick={handleSend}
          data-testid="compose-send-btn">
          <MaterialIcon name="send" /> Send
        </Button>
        <Button variant="outline" onClick={onClose}
          data-testid="compose-cancel-btn">
          Cancel
        </Button>
      </Box>
    </Card>
  )
}
