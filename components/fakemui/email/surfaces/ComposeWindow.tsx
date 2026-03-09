// fakemui/react/components/email/surfaces/ComposeWindow.tsx
import React, { useState } from 'react'
import { Box, BoxProps, Button, Card } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'
import { EmailAddressInput, RecipientInput, BodyEditor } from '../inputs'

export interface ComposeWindowProps extends BoxProps {
  onSend?: (data: { to: string[]; cc?: string[]; bcc?: string[]; subject: string; body: string }) => void
  onClose?: () => void
  testId?: string
}

export const ComposeWindow = ({
  onSend,
  onClose,
  testId: customTestId,
  ...props
}: ComposeWindowProps) => {
  const [to, setTo] = useState<string[]>([])
  const [cc, setCc] = useState<string[]>([])
  const [bcc, setBcc] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const accessible = useAccessible({
    feature: 'email',
    component: 'compose',
    identifier: customTestId || 'compose'
  })

  const handleSend = () => {
    if (to.length > 0 && subject && body) {
      onSend?.({ to, cc, bcc, subject, body })
    }
  }

  return (
    <Card
      className="compose-window"
      {...accessible}
      {...props}
    >
      <Box className="compose-header">
        <h2>Compose Email</h2>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </Box>
      <Box className="compose-body">
        <RecipientInput
          recipientType="to"
          recipients={to}
          onRecipientsChange={setTo}
          placeholder="To:"
        />
        <RecipientInput
          recipientType="cc"
          recipients={cc}
          onRecipientsChange={setCc}
          placeholder="Cc:"
        />
        <RecipientInput
          recipientType="bcc"
          recipients={bcc}
          onRecipientsChange={setBcc}
          placeholder="Bcc:"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="compose-subject"
        />
        <BodyEditor
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </Box>
      <Box className="compose-footer">
        <Button variant="primary" onClick={handleSend}>
          Send
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </Card>
  )
}
