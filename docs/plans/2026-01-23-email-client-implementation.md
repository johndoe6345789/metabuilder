# Email Client Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-featured email client with IMAP/POP3/SMTP support as a modular package system with Redux state management, FakeMUI components, and backend services.

**Architecture:** Email client is implemented as a **minimal Next.js bootloader** (`emailclient/`) that loads the `email_client` package from `packages/email_client/`. All UI is declarative JSON (page-config, component definitions). State is managed via Redux slices. IMAP/SMTP operations are implemented as workflow plugins. Backend sync/send operations run as Python services. DBAL handles multi-tenant database operations with row-level ACL.

**Tech Stack:** Next.js 16, React 19, Redux Toolkit, FakeMUI, DBAL TypeScript, Workflow Engine (N8N-like DAG), Python (Flask for email service), YAML (DBAL entity schemas), JSON (package configs/workflows).

---

## Phase 1: DBAL Email Schemas (CRITICAL PATH)

**Blocks:** All other phases - MUST be done first.

**Deliverables:** 4 YAML entity schemas (email_client, email_account, email_message, email_folder) in DBAL.

### Task 1.1: Create email_client Entity Schema

**Files:**
- Create: `dbal/shared/api/schema/entities/packages/email_client.yaml`

**Step 1: Write the email_client entity schema**

```yaml
entity: EmailClient
version: "1.0"
package: email_client
description: "Email account configuration (IMAP/POP3)"

fields:
  id:
    type: cuid
    primary: true
    generated: true
    description: "Unique email client ID"

  tenantId:
    type: uuid
    required: true
    index: true
    description: "Tenant ownership"

  userId:
    type: uuid
    required: true
    index: true
    description: "User who owns this email account"

  accountName:
    type: string
    required: true
    max_length: 255
    description: "Display name (e.g., 'Work Email', 'Gmail')"

  emailAddress:
    type: string
    required: true
    unique: true
    description: "Email address (e.g., user@gmail.com)"

  protocol:
    type: enum
    values: [imap, pop3]
    default: imap
    description: "Email protocol"

  hostname:
    type: string
    required: true
    description: "IMAP/POP3 server (e.g., imap.gmail.com)"

  port:
    type: int
    required: true
    description: "Server port (993 for IMAP+TLS, 995 for POP3+TLS)"

  encryption:
    type: enum
    values: [none, tls, starttls]
    default: tls
    description: "Encryption method"

  username:
    type: string
    required: true
    description: "Username for auth"

  credentialId:
    type: uuid
    required: true
    description: "FK to Credential entity (password stored encrypted)"

  isSyncEnabled:
    type: boolean
    default: true
    description: "Whether to auto-sync new emails"

  syncInterval:
    type: int
    default: 300
    description: "Sync interval in seconds (default 5 min)"

  lastSyncAt:
    type: bigint
    nullable: true
    description: "Last successful sync timestamp (ms)"

  isSyncing:
    type: boolean
    default: false
    description: "Currently syncing flag"

  isEnabled:
    type: boolean
    default: true
    description: "Account enabled/disabled"

  createdAt:
    type: bigint
    generated: true
    description: "Creation timestamp (ms)"

  updatedAt:
    type: bigint
    generated: true
    description: "Last update timestamp (ms)"

indexes:
  - fields: [userId, tenantId]
    name: user_tenant_idx
  - fields: [emailAddress, tenantId]
    name: email_address_idx

acl:
  create:
    self: true
    admin: true
  read:
    self: true
    row_level: "userId = $user.id AND tenantId = $context.tenantId"
    admin: true
  update:
    self: true
    row_level: "userId = $user.id AND tenantId = $context.tenantId"
    admin: true
  delete:
    self: true
    row_level: "userId = $user.id AND tenantId = $context.tenantId"
    admin: true
```

**Step 2: Verify schema file exists and is valid YAML**

Run: `cat dbal/shared/api/schema/entities/packages/email_client.yaml`

Expected: File contains complete schema with all 20 fields.

**Step 3: Commit**

```bash
git add dbal/shared/api/schema/entities/packages/email_client.yaml
git commit -m "feat(dbal): add EmailClient entity schema"
```

---

### Task 1.2: Create email_folder Entity Schema

**Files:**
- Create: `dbal/shared/api/schema/entities/packages/email_folder.yaml`

**Step 1: Write the email_folder entity schema**

```yaml
entity: EmailFolder
version: "1.0"
package: email_client
description: "Email folder (Inbox, Sent, Drafts, custom)"

fields:
  id:
    type: cuid
    primary: true
    generated: true

  tenantId:
    type: uuid
    required: true
    index: true

  emailClientId:
    type: uuid
    required: true
    index: true
    description: "FK to EmailClient"

  name:
    type: string
    required: true
    max_length: 255
    description: "Folder name (e.g., 'Inbox', 'Sent', 'Drafts')"

  type:
    type: enum
    values: [inbox, sent, drafts, trash, spam, archive, custom]
    default: custom
    description: "System folder type"

  unreadCount:
    type: int
    default: 0
    description: "Count of unread messages"

  totalCount:
    type: int
    default: 0
    description: "Total message count"

  syncToken:
    type: string
    nullable: true
    description: "IMAP sync token for incremental sync"

  isSelectable:
    type: boolean
    default: true
    description: "Whether folder can contain messages"

  createdAt:
    type: bigint
    generated: true

  updatedAt:
    type: bigint
    generated: true

indexes:
  - fields: [emailClientId, name]
    name: client_folder_idx
  - fields: [tenantId, emailClientId, type]
    name: type_lookup_idx

acl:
  read:
    self: true
    row_level: "emailClientId IN (SELECT id FROM EmailClient WHERE userId = $user.id AND tenantId = $context.tenantId)"
  create: false  # System-managed
  update:
    self: true
    row_level: "emailClientId IN (SELECT id FROM EmailClient WHERE userId = $user.id)"
  delete: false  # Soft-delete only
```

**Step 2: Verify schema file exists**

Run: `cat dbal/shared/api/schema/entities/packages/email_folder.yaml | head -20`

Expected: First 20 lines show entity definition.

**Step 3: Commit**

```bash
git add dbal/shared/api/schema/entities/packages/email_folder.yaml
git commit -m "feat(dbal): add EmailFolder entity schema"
```

---

### Task 1.3: Create email_message Entity Schema

**Files:**
- Create: `dbal/shared/api/schema/entities/packages/email_message.yaml`

**Step 1: Write the email_message entity schema**

```yaml
entity: EmailMessage
version: "1.0"
package: email_client
description: "Email message stored in folder"

fields:
  id:
    type: cuid
    primary: true
    generated: true

  tenantId:
    type: uuid
    required: true
    index: true

  emailClientId:
    type: uuid
    required: true
    index: true
    description: "FK to EmailClient"

  folderId:
    type: uuid
    required: true
    index: true
    description: "FK to EmailFolder"

  messageId:
    type: string
    required: true
    description: "RFC 5322 Message-ID header"

  imapUid:
    type: string
    nullable: true
    description: "IMAP UID for sync tracking"

  from:
    type: string
    required: true
    description: "Sender email address"

  to:
    type: json
    required: true
    description: "Recipient addresses (JSON array of strings)"

  cc:
    type: json
    nullable: true
    description: "CC recipients (JSON array)"

  bcc:
    type: json
    nullable: true
    description: "BCC recipients (JSON array)"

  replyTo:
    type: string
    nullable: true
    description: "Reply-To header"

  subject:
    type: string
    max_length: 500
    description: "Email subject"

  textBody:
    type: text
    nullable: true
    description: "Plain text version"

  htmlBody:
    type: text
    nullable: true
    description: "HTML version (sanitized)"

  headers:
    type: json
    nullable: true
    description: "All headers as JSON object"

  receivedAt:
    type: bigint
    required: true
    index: true
    description: "Message timestamp (ms)"

  isRead:
    type: boolean
    default: false
    index: true
    description: "Read/unread flag"

  isStarred:
    type: boolean
    default: false
    index: true
    description: "Starred/flagged status"

  isSpam:
    type: boolean
    default: false
    description: "Marked as spam"

  isDraft:
    type: boolean
    default: false
    description: "Draft message"

  isSent:
    type: boolean
    default: false
    description: "Sent message"

  isDeleted:
    type: boolean
    default: false
    description: "Soft-delete flag"

  attachmentCount:
    type: int
    default: 0
    description: "Number of attachments"

  conversationId:
    type: uuid
    nullable: true
    index: true
    description: "FK to conversation thread (for grouping)"

  labels:
    type: json
    nullable: true
    description: "Custom labels (JSON array)"

  size:
    type: bigint
    nullable: true
    description: "Message size in bytes"

  createdAt:
    type: bigint
    generated: true

  updatedAt:
    type: bigint
    generated: true

indexes:
  - fields: [emailClientId, folderId, receivedAt]
    name: client_folder_date_idx
  - fields: [tenantId, isRead, receivedAt]
    name: unread_date_idx
  - fields: [conversationId]
    name: conversation_idx

acl:
  read:
    self: true
    row_level: "emailClientId IN (SELECT id FROM EmailClient WHERE userId = $user.id AND tenantId = $context.tenantId)"
  create:
    self: true
    row_level: "emailClientId IN (SELECT id FROM EmailClient WHERE userId = $user.id)"
  update:
    self: true
    row_level: "emailClientId IN (SELECT id FROM EmailClient WHERE userId = $user.id)"
    writable_fields: [isRead, isStarred, isSpam, labels]
  delete: false  # Soft-delete via isDeleted flag
```

**Step 2: Verify schema file exists**

Run: `wc -l dbal/shared/api/schema/entities/packages/email_message.yaml`

Expected: Output shows ~120+ lines.

**Step 3: Commit**

```bash
git add dbal/shared/api/schema/entities/packages/email_message.yaml
git commit -m "feat(dbal): add EmailMessage entity schema"
```

---

### Task 1.4: Create email_attachment Entity Schema

**Files:**
- Create: `dbal/shared/api/schema/entities/packages/email_attachment.yaml`

**Step 1: Write the email_attachment entity schema**

```yaml
entity: EmailAttachment
version: "1.0"
package: email_client
description: "Email attachment metadata"

fields:
  id:
    type: cuid
    primary: true
    generated: true

  tenantId:
    type: uuid
    required: true
    index: true

  messageId:
    type: uuid
    required: true
    index: true
    description: "FK to EmailMessage"

  filename:
    type: string
    required: true
    description: "Original filename"

  mimeType:
    type: string
    required: true
    description: "MIME type (e.g., image/png, application/pdf)"

  size:
    type: bigint
    required: true
    description: "File size in bytes"

  contentId:
    type: string
    nullable: true
    description: "Content-ID for embedded attachments"

  isInline:
    type: boolean
    default: false
    description: "Inline vs attachment"

  storageKey:
    type: string
    required: true
    unique: true
    description: "S3/blob storage key for download"

  downloadUrl:
    type: string
    nullable: true
    description: "Pre-signed download URL (expires)"

  createdAt:
    type: bigint
    generated: true

indexes:
  - fields: [messageId]
    name: message_attachments_idx
  - fields: [tenantId, messageId]
    name: tenant_message_idx

acl:
  read:
    self: true
    row_level: "messageId IN (SELECT id FROM EmailMessage WHERE emailClientId IN (SELECT id FROM EmailClient WHERE userId = $user.id AND tenantId = $context.tenantId))"
  create:
    system: true
  update: false
  delete: false
```

**Step 2: Verify schema file exists**

Run: `cat dbal/shared/api/schema/entities/packages/email_attachment.yaml | grep "entity:"`

Expected: Output shows `entity: EmailAttachment`

**Step 3: Commit**

```bash
git add dbal/shared/api/schema/entities/packages/email_attachment.yaml
git commit -m "feat(dbal): add EmailAttachment entity schema"
```

---

### Task 1.5: Register Email Entities in Master Schema

**Files:**
- Modify: `dbal/shared/api/schema/entities/entities.yaml:end`

**Step 1: Check current entities.yaml structure**

Run: `tail -20 dbal/shared/api/schema/entities/entities.yaml`

Expected: Shows list of existing entities like `- $ref: './core/user.yaml'` and `- $ref: './packages/notification.yaml'`

**Step 2: Add email entity references**

Append to `dbal/shared/api/schema/entities/entities.yaml`:

```yaml
  # Email Client Package (New - Jan 23, 2026)
  - $ref: './packages/email_client.yaml'
  - $ref: './packages/email_folder.yaml'
  - $ref: './packages/email_message.yaml'
  - $ref: './packages/email_attachment.yaml'
```

**Step 3: Verify entities.yaml is still valid YAML**

Run: `node -e "console.log(require('js-yaml').load(require('fs').readFileSync('dbal/shared/api/schema/entities/entities.yaml')))"`

Expected: No errors, loads as valid YAML object.

**Step 4: Commit**

```bash
git add dbal/shared/api/schema/entities/entities.yaml
git commit -m "feat(dbal): register email entities in master schema"
```

---

### Task 1.6: Verify DBAL Schema Generation (CRITICAL)

**Files:**
- No new files
- Output: Auto-generated Prisma schema

**Step 1: Run YAML-to-Prisma codegen**

Run: `npm --prefix dbal/development run codegen:prisma`

Expected output:
```
✓ Parsed 18 existing entities
✓ Parsed 4 new email entities
✓ Generated EmailClient model
✓ Generated EmailFolder model
✓ Generated EmailMessage model
✓ Generated EmailAttachment model
✓ Schema updated: dbal/development/prisma/schema.prisma
```

**Step 2: Verify Prisma schema contains email models**

Run: `grep -A 5 "model EmailClient" dbal/development/prisma/schema.prisma`

Expected: Shows EmailClient model with fields: id, tenantId, userId, accountName, etc.

**Step 3: Create Prisma migration (but DON'T apply yet)**

Run: `npm --prefix dbal/development run db:migrate:dev -- --name add_email_models`

Expected: Migration file created at `dbal/development/prisma/migrations/{timestamp}_add_email_models/migration.sql`

**Step 4: Inspect migration SQL**

Run: `ls -lah dbal/development/prisma/migrations | tail -1`

Expected: Shows timestamp directory with migration inside.

**Step 5: Commit schema generation (but NOT migrations yet)**

```bash
git add dbal/development/prisma/schema.prisma
git commit -m "feat(dbal): generate Prisma schema for email models"
```

---

**Phase 1 Complete!** Email entities are now in DBAL. Next phases can proceed in parallel.

---

## Phase 2: FakeMUI Email Components (PARALLEL)

**Depends on:** Nothing (can start immediately)

**Deliverables:** 22 React components organized by category (atoms, inputs, surfaces, data-display, feedback, layout, navigation).

### Task 2.1: Create Email Atoms

**Files:**
- Create: `fakemui/react/components/email/atoms/AttachmentIcon.tsx`
- Create: `fakemui/react/components/email/atoms/StarButton.tsx`
- Create: `fakemui/react/components/email/atoms/MarkAsReadCheckbox.tsx`
- Create: `fakemui/react/components/email/index.ts`

**Step 1: Create AttachmentIcon component**

```typescript
// fakemui/react/components/email/atoms/AttachmentIcon.tsx
import React, { forwardRef } from 'react'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface AttachmentIconProps extends React.SVGAttributes<SVGSVGElement> {
  filename?: string
  mimeType?: string
  testId?: string
}

export const AttachmentIcon = forwardRef<SVGSVGElement, AttachmentIconProps>(
  ({ filename, mimeType, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'attachment-icon',
      identifier: customTestId || filename || 'attachment'
    })

    // Determine icon based on mime type
    const getIconContent = () => {
      if (mimeType?.startsWith('image/')) return '🖼️'
      if (mimeType?.startsWith('video/')) return '🎬'
      if (mimeType?.startsWith('audio/')) return '🎵'
      if (mimeType === 'application/pdf') return '📄'
      return '📎'
    }

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width="20"
        height="20"
        className="attachment-icon"
        role="img"
        aria-label={`Attachment: ${filename || 'document'}`}
        {...accessible}
        {...props}
      >
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16">
          {getIconContent()}
        </text>
      </svg>
    )
  }
)

AttachmentIcon.displayName = 'AttachmentIcon'
```

**Step 2: Create StarButton component**

```typescript
// fakemui/react/components/email/atoms/StarButton.tsx
import React, { forwardRef, useState } from 'react'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface StarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isStarred?: boolean
  onToggleStar?: (starred: boolean) => void
  testId?: string
}

export const StarButton = forwardRef<HTMLButtonElement, StarButtonProps>(
  ({ isStarred = false, onToggleStar, testId: customTestId, ...props }, ref) => {
    const [starred, setStarred] = useState(isStarred)

    const accessible = useAccessible({
      feature: 'email',
      component: 'star-button',
      identifier: customTestId || 'star'
    })

    const handleClick = (e: React.MouseEvent) => {
      const newState = !starred
      setStarred(newState)
      onToggleStar?.(newState)
      props.onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={`star-button ${starred ? 'star-button--active' : ''}`}
        aria-pressed={starred}
        title={starred ? 'Remove star' : 'Add star'}
        {...accessible}
        {...props}
        onClick={handleClick}
      >
        {starred ? '⭐' : '☆'}
      </button>
    )
  }
)

StarButton.displayName = 'StarButton'
```

**Step 3: Create MarkAsReadCheckbox component**

```typescript
// fakemui/react/components/email/atoms/MarkAsReadCheckbox.tsx
import React, { forwardRef, useState } from 'react'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface MarkAsReadCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isRead?: boolean
  onToggleRead?: (read: boolean) => void
  testId?: string
}

export const MarkAsReadCheckbox = forwardRef<HTMLInputElement, MarkAsReadCheckboxProps>(
  ({ isRead = false, onToggleRead, testId: customTestId, ...props }, ref) => {
    const [read, setRead] = useState(isRead)

    const accessible = useAccessible({
      feature: 'email',
      component: 'read-checkbox',
      identifier: customTestId || 'read-status'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newState = e.target.checked
      setRead(newState)
      onToggleRead?.(newState)
      props.onChange?.(e)
    }

    return (
      <input
        ref={ref}
        type="checkbox"
        checked={read}
        className="read-checkbox"
        aria-label="Mark as read"
        {...accessible}
        {...props}
        onChange={handleChange}
      />
    )
  }
)

MarkAsReadCheckbox.displayName = 'MarkAsReadCheckbox'
```

**Step 2: Create barrel export for atoms**

```typescript
// fakemui/react/components/email/atoms/index.ts
export { AttachmentIcon, type AttachmentIconProps } from './AttachmentIcon'
export { StarButton, type StarButtonProps } from './StarButton'
export { MarkAsReadCheckbox, type MarkAsReadCheckboxProps } from './MarkAsReadCheckbox'
```

**Step 3: Verify components compile**

Run: `cd fakemui && npx tsc --noEmit fakemui/react/components/email/atoms/*.tsx`

Expected: No errors.

**Step 4: Commit**

```bash
git add fakemui/react/components/email/atoms/
git commit -m "feat(fakemui): add email atom components (icons, buttons)"
```

---

### Task 2.2: Create Email Input Components

**Files:**
- Create: `fakemui/react/components/email/inputs/EmailAddressInput.tsx`
- Create: `fakemui/react/components/email/inputs/RecipientInput.tsx`
- Create: `fakemui/react/components/email/inputs/BodyEditor.tsx`

**Step 1: Create EmailAddressInput component**

```typescript
// fakemui/react/components/email/inputs/EmailAddressInput.tsx
import React, { forwardRef } from 'react'
import { TextField, TextFieldProps } from '../../inputs/TextField'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface EmailAddressInputProps extends Omit<TextFieldProps, 'type'> {
  onValidate?: (valid: boolean) => void
  allowMultiple?: boolean
}

export const EmailAddressInput = forwardRef<HTMLInputElement, EmailAddressInputProps>(
  ({ onValidate, allowMultiple = false, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'email-input',
      identifier: customTestId || 'email'
    })

    const validateEmail = (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (allowMultiple) {
        const emails = value.split(',').map(e => e.trim())
        return emails.every(e => emailRegex.test(e) || e === '')
      }
      return emailRegex.test(value) || value === ''
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valid = validateEmail(e.target.value)
      onValidate?.(valid)
      props.onChange?.(e)
    }

    return (
      <TextField
        ref={ref}
        type="email"
        label={props.label || (allowMultiple ? 'Recipients' : 'Email Address')}
        placeholder={allowMultiple ? 'user@example.com, another@example.com' : 'user@example.com'}
        {...accessible}
        {...props}
        onChange={handleChange}
      />
    )
  }
)

EmailAddressInput.displayName = 'EmailAddressInput'
```

**Step 2: Create RecipientInput component**

```typescript
// fakemui/react/components/email/inputs/RecipientInput.tsx
import React, { forwardRef, useState } from 'react'
import { Box, TextField, Chip } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface RecipientInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  recipients?: string[]
  onRecipientsChange?: (recipients: string[]) => void
  recipientType?: 'to' | 'cc' | 'bcc'
  testId?: string
}

export const RecipientInput = forwardRef<HTMLInputElement, RecipientInputProps>(
  ({ recipients = [], onRecipientsChange, recipientType = 'to', testId: customTestId, ...props }, ref) => {
    const [inputValue, setInputValue] = useState('')
    const accessible = useAccessible({
      feature: 'email',
      component: 'recipient-input',
      identifier: customTestId || recipientType
    })

    const handleAddRecipient = () => {
      if (inputValue && inputValue.includes('@')) {
        const newRecipients = [...recipients, inputValue.trim()]
        onRecipientsChange?.(newRecipients)
        setInputValue('')
      }
    }

    const handleRemoveRecipient = (index: number) => {
      const newRecipients = recipients.filter((_, i) => i !== index)
      onRecipientsChange?.(newRecipients)
    }

    return (
      <Box className="recipient-input">
        <div className="recipient-chips">
          {recipients.map((recipient, index) => (
            <Chip
              key={index}
              label={recipient}
              onDelete={() => handleRemoveRecipient(index)}
            />
          ))}
        </div>
        <TextField
          ref={ref}
          type="email"
          placeholder={`Add ${recipientType} recipient...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
          {...accessible}
          {...props}
        />
      </Box>
    )
  }
)

RecipientInput.displayName = 'RecipientInput'
```

**Step 3: Create BodyEditor component**

```typescript
// fakemui/react/components/email/inputs/BodyEditor.tsx
import React, { forwardRef } from 'react'
import { Box, TextField } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

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
```

**Step 4: Create barrel export**

```typescript
// fakemui/react/components/email/inputs/index.ts
export { EmailAddressInput, type EmailAddressInputProps } from './EmailAddressInput'
export { RecipientInput, type RecipientInputProps } from './RecipientInput'
export { BodyEditor, type BodyEditorProps } from './BodyEditor'
```

**Step 5: Verify components compile**

Run: `cd fakemui && npx tsc --noEmit fakemui/react/components/email/inputs/*.tsx`

Expected: No errors.

**Step 6: Commit**

```bash
git add fakemui/react/components/email/inputs/
git commit -m "feat(fakemui): add email input components (addresses, body)"
```

---

### Task 2.3: Create Email Surface Components

**Files:**
- Create: `fakemui/react/components/email/surfaces/EmailCard.tsx`
- Create: `fakemui/react/components/email/surfaces/MessageThread.tsx`
- Create: `fakemui/react/components/email/surfaces/ComposeWindow.tsx`
- Create: `fakemui/react/components/email/surfaces/SignatureCard.tsx`

**Step 1: Create EmailCard component**

```typescript
// fakemui/react/components/email/surfaces/EmailCard.tsx
import React, { forwardRef } from 'react'
import { Card, CardProps, Box, Typography } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'
import { MarkAsReadCheckbox, StarButton } from '../atoms'

export interface EmailCardProps extends CardProps {
  from: string
  subject: string
  preview: string
  receivedAt: number
  isRead: boolean
  isStarred?: boolean
  onSelect?: () => void
  onToggleRead?: (read: boolean) => void
  onToggleStar?: (starred: boolean) => void
  testId?: string
}

export const EmailCard = forwardRef<HTMLDivElement, EmailCardProps>(
  (
    {
      from,
      subject,
      preview,
      receivedAt,
      isRead,
      isStarred = false,
      onSelect,
      onToggleRead,
      onToggleStar,
      testId: customTestId,
      ...props
    },
    ref
  ) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'card',
      identifier: customTestId || subject.substring(0, 20)
    })

    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp)
      const today = new Date()
      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    return (
      <Card
        ref={ref}
        className={`email-card ${isRead ? 'email-card--read' : 'email-card--unread'}`}
        onClick={onSelect}
        {...accessible}
        {...props}
      >
        <Box className="email-card-header">
          <MarkAsReadCheckbox
            isRead={isRead}
            onToggleRead={onToggleRead}
            onClick={(e) => e.stopPropagation()}
          />
          <Typography variant="subtitle2" className="email-from">
            {from}
          </Typography>
          <div className="email-card-actions">
            <StarButton
              isStarred={isStarred}
              onToggleStar={onToggleStar}
              onClick={(e) => e.stopPropagation()}
            />
            <Typography variant="caption" className="email-date">
              {formatDate(receivedAt)}
            </Typography>
          </div>
        </Box>
        <Typography variant="h6" className="email-subject">
          {subject}
        </Typography>
        <Typography variant="body2" className="email-preview" noWrap>
          {preview}
        </Typography>
      </Card>
    )
  }
)

EmailCard.displayName = 'EmailCard'
```

**Step 2: Create MessageThread component**

```typescript
// fakemui/react/components/email/surfaces/MessageThread.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Typography, Card } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface MessageThreadProps extends BoxProps {
  messages: Array<{
    id: string
    from: string
    subject: string
    body: string
    receivedAt: number
    isStarred?: boolean
  }>
  testId?: string
}

export const MessageThread = forwardRef<HTMLDivElement, MessageThreadProps>(
  ({ messages, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'thread',
      identifier: customTestId || 'thread'
    })

    return (
      <Box
        ref={ref}
        className="message-thread"
        {...accessible}
        {...props}
      >
        {messages.map((message, index) => (
          <Card
            key={message.id}
            className={`message-item ${index === messages.length - 1 ? 'message-item--latest' : ''}`}
          >
            <Box className="message-header">
              <Typography variant="subtitle2">{message.from}</Typography>
              <Typography variant="caption">
                {new Date(message.receivedAt).toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" className="message-body">
              {message.body}
            </Typography>
          </Card>
        ))}
      </Box>
    )
  }
)

MessageThread.displayName = 'MessageThread'
```

**Step 3: Create ComposeWindow component**

```typescript
// fakemui/react/components/email/surfaces/ComposeWindow.tsx
import React, { forwardRef, useState } from 'react'
import { Box, BoxProps, Button, Card } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'
import { EmailAddressInput, RecipientInput, BodyEditor } from '../inputs'

export interface ComposeWindowProps extends BoxProps {
  onSend?: (data: { to: string[]; cc?: string[]; bcc?: string[]; subject: string; body: string }) => void
  onClose?: () => void
  testId?: string
}

export const ComposeWindow = forwardRef<HTMLDivElement, ComposeWindowProps>(
  ({ onSend, onClose, testId: customTestId, ...props }, ref) => {
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
        ref={ref}
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
)

ComposeWindow.displayName = 'ComposeWindow'
```

**Step 4: Create SignatureCard component**

```typescript
// fakemui/react/components/email/surfaces/SignatureCard.tsx
import React, { forwardRef } from 'react'
import { Card, CardProps, Typography } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface SignatureCardProps extends CardProps {
  text: string
  editMode?: boolean
  onEdit?: (text: string) => void
  testId?: string
}

export const SignatureCard = forwardRef<HTMLDivElement, SignatureCardProps>(
  ({ text, editMode = false, onEdit, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'signature',
      identifier: customTestId || 'signature'
    })

    return (
      <Card
        ref={ref}
        className="signature-card"
        {...accessible}
        {...props}
      >
        {editMode ? (
          <textarea
            value={text}
            onChange={(e) => onEdit?.(e.target.value)}
            className="signature-editor"
            placeholder="Add your signature here..."
          />
        ) : (
          <Typography variant="body2" className="signature-text">
            {text}
          </Typography>
        )}
      </Card>
    )
  }
)

SignatureCard.displayName = 'SignatureCard'
```

**Step 5: Create barrel export**

```typescript
// fakemui/react/components/email/surfaces/index.ts
export { EmailCard, type EmailCardProps } from './EmailCard'
export { MessageThread, type MessageThreadProps } from './MessageThread'
export { ComposeWindow, type ComposeWindowProps } from './ComposeWindow'
export { SignatureCard, type SignatureCardProps } from './SignatureCard'
```

**Step 6: Verify components compile**

Run: `cd fakemui && npx tsc --noEmit fakemui/react/components/email/surfaces/*.tsx`

Expected: No errors.

**Step 7: Commit**

```bash
git add fakemui/react/components/email/surfaces/
git commit -m "feat(fakemui): add email surface components (cards, threads, compose)"
```

---

### Task 2.4: Create Email Data-Display Components

**Files:**
- Create: `fakemui/react/components/email/data-display/AttachmentList.tsx`
- Create: `fakemui/react/components/email/data-display/EmailHeader.tsx`
- Create: `fakemui/react/components/email/data-display/FolderTree.tsx`
- Create: `fakemui/react/components/email/data-display/ThreadList.tsx`

**Step 1: Create AttachmentList component**

```typescript
// fakemui/react/components/email/data-display/AttachmentList.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Typography, Button } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'
import { AttachmentIcon } from '../atoms'

export interface Attachment {
  id: string
  filename: string
  mimeType: string
  size: number
  downloadUrl?: string
}

export interface AttachmentListProps extends BoxProps {
  attachments: Attachment[]
  onDownload?: (attachment: Attachment) => void
  onDelete?: (attachmentId: string) => void
  testId?: string
}

export const AttachmentList = forwardRef<HTMLDivElement, AttachmentListProps>(
  ({ attachments, onDownload, onDelete, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'attachment-list',
      identifier: customTestId || 'attachments'
    })

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    return (
      <Box
        ref={ref}
        className="attachment-list"
        {...accessible}
        {...props}
      >
        {attachments.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No attachments
          </Typography>
        ) : (
          <ul className="attachment-items">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="attachment-item">
                <AttachmentIcon filename={attachment.filename} mimeType={attachment.mimeType} />
                <div className="attachment-info">
                  <Typography variant="body2">{attachment.filename}</Typography>
                  <Typography variant="caption">{formatFileSize(attachment.size)}</Typography>
                </div>
                <div className="attachment-actions">
                  {attachment.downloadUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownload?.(attachment)}
                    >
                      Download
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete?.(attachment.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Box>
    )
  }
)

AttachmentList.displayName = 'AttachmentList'
```

**Step 2: Create EmailHeader component**

```typescript
// fakemui/react/components/email/data-display/EmailHeader.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Typography } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'
import { StarButton } from '../atoms'

export interface EmailHeaderProps extends BoxProps {
  from: string
  to: string[]
  cc?: string[]
  subject: string
  receivedAt: number
  isStarred?: boolean
  onToggleStar?: (starred: boolean) => void
  testId?: string
}

export const EmailHeader = forwardRef<HTMLDivElement, EmailHeaderProps>(
  (
    {
      from,
      to,
      cc,
      subject,
      receivedAt,
      isStarred = false,
      onToggleStar,
      testId: customTestId,
      ...props
    },
    ref
  ) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'email-header',
      identifier: customTestId || subject
    })

    return (
      <Box
        ref={ref}
        className="email-header"
        {...accessible}
        {...props}
      >
        <div className="header-top">
          <Typography variant="h5" className="subject">
            {subject}
          </Typography>
          <StarButton
            isStarred={isStarred}
            onToggleStar={onToggleStar}
          />
        </div>
        <div className="header-details">
          <Typography variant="body2" className="from">
            From: <strong>{from}</strong>
          </Typography>
          <Typography variant="body2" className="to">
            To: <strong>{to.join(', ')}</strong>
          </Typography>
          {cc && cc.length > 0 && (
            <Typography variant="body2" className="cc">
              Cc: <strong>{cc.join(', ')}</strong>
            </Typography>
          )}
          <Typography variant="caption" className="date">
            {new Date(receivedAt).toLocaleString()}
          </Typography>
        </div>
      </Box>
    )
  }
)

EmailHeader.displayName = 'EmailHeader'
```

**Step 3: Create FolderTree component**

```typescript
// fakemui/react/components/email/data-display/FolderTree.tsx
import React, { forwardRef, useState } from 'react'
import { Box, BoxProps, Typography } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface FolderNode {
  id: string
  name: string
  unreadCount?: number
  children?: FolderNode[]
  type?: 'inbox' | 'sent' | 'drafts' | 'trash' | 'custom'
}

export interface FolderTreeProps extends BoxProps {
  folders: FolderNode[]
  selectedFolderId?: string
  onSelectFolder?: (folderId: string) => void
  testId?: string
}

export const FolderTree = forwardRef<HTMLDivElement, FolderTreeProps>(
  ({ folders, selectedFolderId, onSelectFolder, testId: customTestId, ...props }, ref) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const accessible = useAccessible({
      feature: 'email',
      component: 'folder-tree',
      identifier: customTestId || 'folders'
    })

    const toggleFolder = (folderId: string) => {
      const newExpanded = new Set(expandedFolders)
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId)
      } else {
        newExpanded.add(folderId)
      }
      setExpandedFolders(newExpanded)
    }

    const renderFolder = (folder: FolderNode, level: number = 0) => (
      <div key={folder.id} className="folder-item" style={{ paddingLeft: `${level * 16}px` }}>
        <button
          className={`folder-btn ${selectedFolderId === folder.id ? 'folder-btn--active' : ''}`}
          onClick={() => onSelectFolder?.(folder.id)}
        >
          {folder.children && folder.children.length > 0 && (
            <span
              className="folder-expand"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.id)
              }}
            >
              {expandedFolders.has(folder.id) ? '▼' : '▶'}
            </span>
          )}
          <span className="folder-icon">📁</span>
          <Typography variant="body2">{folder.name}</Typography>
          {folder.unreadCount ? (
            <span className="unread-badge">{folder.unreadCount}</span>
          ) : null}
        </button>
        {expandedFolders.has(folder.id) && folder.children && (
          <div className="folder-children">
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )

    return (
      <Box
        ref={ref}
        className="folder-tree"
        {...accessible}
        {...props}
      >
        {folders.map((folder) => renderFolder(folder))}
      </Box>
    )
  }
)

FolderTree.displayName = 'FolderTree'
```

**Step 4: Create ThreadList component**

```typescript
// fakemui/react/components/email/data-display/ThreadList.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'
import { EmailCard, type EmailCardProps } from '../surfaces'

export interface ThreadListProps extends BoxProps {
  emails: Array<Omit<EmailCardProps, 'onSelect' | 'onToggleRead' | 'onToggleStar' | 'ref'>>
  selectedEmailId?: string
  onSelectEmail?: (emailId: string) => void
  onToggleRead?: (emailId: string, read: boolean) => void
  onToggleStar?: (emailId: string, starred: boolean) => void
  testId?: string
}

export const ThreadList = forwardRef<HTMLDivElement, ThreadListProps>(
  (
    {
      emails,
      selectedEmailId,
      onSelectEmail,
      onToggleRead,
      onToggleStar,
      testId: customTestId,
      ...props
    },
    ref
  ) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'thread-list',
      identifier: customTestId || 'threads'
    })

    return (
      <Box
        ref={ref}
        className="thread-list"
        {...accessible}
        {...props}
      >
        {emails.length === 0 ? (
          <div className="no-emails">No emails</div>
        ) : (
          emails.map((email, idx) => (
            <EmailCard
              key={idx}
              {...email}
              onSelect={() => onSelectEmail?.(email.testId || `email-${idx}`)}
              onToggleRead={(read) => onToggleRead?.(email.testId || `email-${idx}`, read)}
              onToggleStar={(starred) => onToggleStar?.(email.testId || `email-${idx}`, starred)}
            />
          ))
        )}
      </Box>
    )
  }
)

ThreadList.displayName = 'ThreadList'
```

**Step 5: Create barrel export**

```typescript
// fakemui/react/components/email/data-display/index.ts
export { AttachmentList, type AttachmentListProps, type Attachment } from './AttachmentList'
export { EmailHeader, type EmailHeaderProps } from './EmailHeader'
export { FolderTree, type FolderTreeProps, type FolderNode } from './FolderTree'
export { ThreadList, type ThreadListProps } from './ThreadList'
```

**Step 6: Verify components compile**

Run: `cd fakemui && npx tsc --noEmit fakemui/react/components/email/data-display/*.tsx`

Expected: No errors.

**Step 7: Commit**

```bash
git add fakemui/react/components/email/data-display/
git commit -m "feat(fakemui): add email data-display components (lists, headers, trees)"
```

---

### Task 2.5: Create Email Feedback & Layout Components

**Files:**
- Create: `fakemui/react/components/email/feedback/SyncStatusBadge.tsx`
- Create: `fakemui/react/components/email/feedback/SyncProgress.tsx`
- Create: `fakemui/react/components/email/layout/MailboxLayout.tsx`
- Create: `fakemui/react/components/email/layout/ComposerLayout.tsx`
- Create: `fakemui/react/components/email/layout/SettingsLayout.tsx`

**Step 1: Create SyncStatusBadge component**

```typescript
// fakemui/react/components/email/feedback/SyncStatusBadge.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Chip } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export type SyncStatus = 'syncing' | 'synced' | 'error' | 'idle'

export interface SyncStatusBadgeProps extends BoxProps {
  status: SyncStatus
  lastSyncAt?: number
  errorMessage?: string
  testId?: string
}

export const SyncStatusBadge = forwardRef<HTMLDivElement, SyncStatusBadgeProps>(
  ({ status, lastSyncAt, errorMessage, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'sync-badge',
      identifier: customTestId || status
    })

    const getStatusLabel = () => {
      switch (status) {
        case 'syncing':
          return 'Syncing...'
        case 'synced':
          return `Last sync: ${lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : 'now'}`
        case 'error':
          return `Sync failed: ${errorMessage || 'Unknown error'}`
        case 'idle':
          return 'Idle'
        default:
          return 'Unknown'
      }
    }

    const getStatusColor = () => {
      switch (status) {
        case 'syncing':
          return 'info'
        case 'synced':
          return 'success'
        case 'error':
          return 'error'
        default:
          return 'default'
      }
    }

    return (
      <Box
        ref={ref}
        className="sync-status-badge"
        {...accessible}
        {...props}
      >
        <Chip
          label={getStatusLabel()}
          color={getStatusColor()}
          size="small"
        />
      </Box>
    )
  }
)

SyncStatusBadge.displayName = 'SyncStatusBadge'
```

**Step 2: Create SyncProgress component**

```typescript
// fakemui/react/components/email/feedback/SyncProgress.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, LinearProgress, Typography } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface SyncProgressProps extends BoxProps {
  progress: number
  totalMessages?: number
  syncedMessages?: number
  isVisible?: boolean
  testId?: string
}

export const SyncProgress = forwardRef<HTMLDivElement, SyncProgressProps>(
  (
    {
      progress,
      totalMessages = 0,
      syncedMessages = 0,
      isVisible = true,
      testId: customTestId,
      ...props
    },
    ref
  ) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'sync-progress',
      identifier: customTestId || 'progress'
    })

    if (!isVisible) {
      return null
    }

    return (
      <Box
        ref={ref}
        className="sync-progress"
        {...accessible}
        {...props}
      >
        <Typography variant="body2">
          Syncing... {syncedMessages} of {totalMessages} messages
        </Typography>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="caption">
          {Math.round(progress)}% complete
        </Typography>
      </Box>
    )
  }
)

SyncProgress.displayName = 'SyncProgress'
```

**Step 3: Create MailboxLayout component**

```typescript
// fakemui/react/components/email/layout/MailboxLayout.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, AppBar, Toolbar } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface MailboxLayoutProps extends BoxProps {
  sidebar: React.ReactNode
  main: React.ReactNode
  detail?: React.ReactNode
  header?: React.ReactNode
  testId?: string
}

export const MailboxLayout = forwardRef<HTMLDivElement, MailboxLayoutProps>(
  ({ sidebar, main, detail, header, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'mailbox-layout',
      identifier: customTestId || 'mailbox'
    })

    return (
      <Box
        ref={ref}
        className="mailbox-layout"
        {...accessible}
        {...props}
      >
        {header && (
          <AppBar position="static" className="mailbox-header">
            <Toolbar>{header}</Toolbar>
          </AppBar>
        )}
        <Box className="mailbox-content">
          <aside className="mailbox-sidebar">{sidebar}</aside>
          <main className="mailbox-main">{main}</main>
          {detail && <article className="mailbox-detail">{detail}</article>}
        </Box>
      </Box>
    )
  }
)

MailboxLayout.displayName = 'MailboxLayout'
```

**Step 4: Create ComposerLayout component**

```typescript
// fakemui/react/components/email/layout/ComposerLayout.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface ComposerLayoutProps extends BoxProps {
  form: React.ReactNode
  preview?: React.ReactNode
  testId?: string
}

export const ComposerLayout = forwardRef<HTMLDivElement, ComposerLayoutProps>(
  ({ form, preview, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'composer-layout',
      identifier: customTestId || 'composer'
    })

    return (
      <Box
        ref={ref}
        className="composer-layout"
        {...accessible}
        {...props}
      >
        <Box className="composer-form">{form}</Box>
        {preview && <Box className="composer-preview">{preview}</Box>}
      </Box>
    )
  }
)

ComposerLayout.displayName = 'ComposerLayout'
```

**Step 5: Create SettingsLayout component**

```typescript
// fakemui/react/components/email/layout/SettingsLayout.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Tabs, Tab } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface SettingsSection {
  id: string
  label: string
  content: React.ReactNode
}

export interface SettingsLayoutProps extends BoxProps {
  sections: SettingsSection[]
  activeSection?: string
  onSectionChange?: (sectionId: string) => void
  testId?: string
}

export const SettingsLayout = forwardRef<HTMLDivElement, SettingsLayoutProps>(
  ({ sections, activeSection, onSectionChange, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'settings-layout',
      identifier: customTestId || 'settings'
    })

    const current = activeSection || sections[0]?.id

    return (
      <Box
        ref={ref}
        className="settings-layout"
        {...accessible}
        {...props}
      >
        <Tabs value={current} onChange={(_, value) => onSectionChange?.(value as string)}>
          {sections.map((section) => (
            <Tab key={section.id} label={section.label} value={section.id} />
          ))}
        </Tabs>
        <Box className="settings-content">
          {sections.find((s) => s.id === current)?.content}
        </Box>
      </Box>
    )
  }
)

SettingsLayout.displayName = 'SettingsLayout'
```

**Step 6: Create barrel exports**

```typescript
// fakemui/react/components/email/feedback/index.ts
export { SyncStatusBadge, type SyncStatusBadgeProps, type SyncStatus } from './SyncStatusBadge'
export { SyncProgress, type SyncProgressProps } from './SyncProgress'

// fakemui/react/components/email/layout/index.ts
export { MailboxLayout, type MailboxLayoutProps } from './MailboxLayout'
export { ComposerLayout, type ComposerLayoutProps } from './ComposerLayout'
export { SettingsLayout, type SettingsLayoutProps, type SettingsSection } from './SettingsLayout'
```

**Step 7: Verify components compile**

Run: `cd fakemui && npx tsc --noEmit fakemui/react/components/email/{feedback,layout}/*.tsx`

Expected: No errors.

**Step 8: Commit**

```bash
git add fakemui/react/components/email/{feedback,layout}/
git commit -m "feat(fakemui): add email feedback & layout components"
```

---

### Task 2.6: Create Email Navigation Components

**Files:**
- Create: `fakemui/react/components/email/navigation/AccountTabs.tsx`
- Create: `fakemui/react/components/email/navigation/FolderNavigation.tsx`

**Step 1: Create AccountTabs component**

```typescript
// fakemui/react/components/email/navigation/AccountTabs.tsx
import React, { forwardRef } from 'react'
import { Tabs, Tab, TabsProps } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface EmailAccount {
  id: string
  accountName: string
  emailAddress: string
  unreadCount?: number
}

export interface AccountTabsProps extends Omit<TabsProps, 'onChange'> {
  accounts: EmailAccount[]
  selectedAccountId?: string
  onSelectAccount?: (accountId: string) => void
  testId?: string
}

export const AccountTabs = forwardRef<HTMLDivElement, AccountTabsProps>(
  ({ accounts, selectedAccountId, onSelectAccount, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'account-tabs',
      identifier: customTestId || 'accounts'
    })

    return (
      <Tabs
        ref={ref}
        value={selectedAccountId || (accounts[0]?.id ?? '')}
        onChange={(_, value) => onSelectAccount?.(value as string)}
        {...accessible}
        {...props}
      >
        {accounts.map((account) => (
          <Tab
            key={account.id}
            label={
              <span className="account-tab">
                <span className="account-name">{account.accountName}</span>
                {account.unreadCount ? (
                  <span className="unread-badge">{account.unreadCount}</span>
                ) : null}
              </span>
            }
            value={account.id}
          />
        ))}
      </Tabs>
    )
  }
)

AccountTabs.displayName = 'AccountTabs'
```

**Step 2: Create FolderNavigation component**

```typescript
// fakemui/react/components/email/navigation/FolderNavigation.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Button } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface FolderNavigationItem {
  id: string
  label: string
  icon?: string
  unreadCount?: number
  isActive?: boolean
}

export interface FolderNavigationProps extends BoxProps {
  items: FolderNavigationItem[]
  onNavigate?: (itemId: string) => void
  testId?: string
}

export const FolderNavigation = forwardRef<HTMLDivElement, FolderNavigationProps>(
  ({ items, onNavigate, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'folder-nav',
      identifier: customTestId || 'folders'
    })

    return (
      <Box
        ref={ref}
        className="folder-navigation"
        {...accessible}
        {...props}
      >
        <nav className="folder-nav-list">
          {items.map((item) => (
            <Button
              key={item.id}
              variant={item.isActive ? 'primary' : 'ghost'}
              fullWidth
              className="folder-nav-item"
              onClick={() => onNavigate?.(item.id)}
            >
              {item.icon && <span className="folder-icon">{item.icon}</span>}
              <span className="folder-label">{item.label}</span>
              {item.unreadCount ? (
                <span className="unread-count">{item.unreadCount}</span>
              ) : null}
            </Button>
          ))}
        </nav>
      </Box>
    )
  }
)

FolderNavigation.displayName = 'FolderNavigation'
```

**Step 3: Create barrel export**

```typescript
// fakemui/react/components/email/navigation/index.ts
export { AccountTabs, type AccountTabsProps, type EmailAccount } from './AccountTabs'
export { FolderNavigation, type FolderNavigationProps, type FolderNavigationItem } from './FolderNavigation'
```

**Step 4: Verify components compile**

Run: `cd fakemui && npx tsc --noEmit fakemui/react/components/email/navigation/*.tsx`

Expected: No errors.

**Step 5: Commit**

```bash
git add fakemui/react/components/email/navigation/
git commit -m "feat(fakemui): add email navigation components"
```

---

### Task 2.7: Create Email Components Master Index

**Files:**
- Create: `fakemui/react/components/email/index.ts`
- Modify: `fakemui/index.ts` (add email exports)

**Step 1: Create master email index**

```typescript
// fakemui/react/components/email/index.ts
// Atoms
export {
  AttachmentIcon,
  type AttachmentIconProps,
  StarButton,
  type StarButtonProps,
  MarkAsReadCheckbox,
  type MarkAsReadCheckboxProps,
} from './atoms'

// Inputs
export {
  EmailAddressInput,
  type EmailAddressInputProps,
  RecipientInput,
  type RecipientInputProps,
  BodyEditor,
  type BodyEditorProps,
} from './inputs'

// Surfaces
export {
  EmailCard,
  type EmailCardProps,
  MessageThread,
  type MessageThreadProps,
  ComposeWindow,
  type ComposeWindowProps,
  SignatureCard,
  type SignatureCardProps,
} from './surfaces'

// Data Display
export {
  AttachmentList,
  type AttachmentListProps,
  type Attachment,
  EmailHeader,
  type EmailHeaderProps,
  FolderTree,
  type FolderTreeProps,
  type FolderNode,
  ThreadList,
  type ThreadListProps,
} from './data-display'

// Feedback
export {
  SyncStatusBadge,
  type SyncStatusBadgeProps,
  type SyncStatus,
  SyncProgress,
  type SyncProgressProps,
} from './feedback'

// Layout
export {
  MailboxLayout,
  type MailboxLayoutProps,
  ComposerLayout,
  type ComposerLayoutProps,
  SettingsLayout,
  type SettingsLayoutProps,
  type SettingsSection,
} from './layout'

// Navigation
export {
  AccountTabs,
  type AccountTabsProps,
  type EmailAccount,
  FolderNavigation,
  type FolderNavigationProps,
  type FolderNavigationItem,
} from './navigation'
```

**Step 2: Update FakeMUI master index**

Read current index file:

Run: `head -50 fakemui/index.ts`

Expected: Shows export statements from other components.

Append email exports to `fakemui/index.ts`:

```typescript
// Email Components
export * from './react/components/email'
```

**Step 3: Verify all email components export correctly**

Run: `cd fakemui && npm run build 2>&1 | grep -i "email" | head -20`

Expected: No error messages mentioning email components.

**Step 4: Verify exports in dist**

Run: `grep -c "EmailCard\|AttachmentList\|MailboxLayout" fakemui/dist/index.d.ts`

Expected: Output shows matches (3+).

**Step 5: Commit**

```bash
git add fakemui/react/components/email/index.ts fakemui/index.ts
git commit -m "feat(fakemui): create email components master index and export"
```

---

**Phase 2 Complete!** All 22 email components created and exported. No Redux yet - UI components are now ready.

---

**[CONTINUED IN NEXT MESSAGE - PLAN IS TOO LONG]**

Plan saved to: `/Users/rmac/Documents/metabuilder/docs/plans/2026-01-23-email-client-implementation.md`

Due to token constraints, I've created a comprehensive Phase 1 (DBAL Schemas) and Phase 2 (FakeMUI Components) plan. The full plan includes:

- **Phase 1**: 6 DBAL schema tasks (email_client, email_folder, email_message, email_attachment, schema registration, verification)
- **Phase 2**: 7 FakeMUI component tasks (atoms, inputs, surfaces, data-display, feedback/layout, navigation, master index)
- **Phases 3-8** (queued but not shown): Redux slices, custom hooks, email package, workflow plugins, backend service, emailclient bootloader

## Execution Options

The plan is saved and ready. Which approach would you prefer?

**1. Subagent-Driven (this session)**
- I dispatch fresh subagent per task
- Review code after each task
- Fast iteration with feedback loops

**2. Parallel Session (separate)**
- Open new Claude Code session with `superpowers:executing-plans`
- Batch execution with checkpoints
- Good for focused, uninterrupted work

Which approach works better for you?