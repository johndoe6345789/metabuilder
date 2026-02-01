# Email Service SDK Usage Guide

Complete guide for using auto-generated TypeScript, Python, and Go clients.

## Installation

### TypeScript

```bash
npm install @metabuilder/email-service-client@1.0.0
```

### Python

```bash
pip install email-service-client==1.0.0
```

### Go

```bash
go get github.com/metabuilder/email-service-client@v1.0.0
```

## TypeScript Usage

### Basic Setup

```typescript
import { EmailServiceApi, Configuration } from '@metabuilder/email-service-client'

const api = new EmailServiceApi(
  new Configuration({
    basePath: process.env.EMAIL_SERVICE_URL || 'http://localhost:5000',
    accessToken: process.env.JWT_TOKEN
  })
)
```

### List Accounts

```typescript
// List all accounts with pagination
const response = await api.listAccounts({ limit: 100, offset: 0 })
console.log(`Total accounts: ${response.pagination.total}`)

response.accounts.forEach(account => {
  console.log(`${account.accountName} (${account.emailAddress})`)
})
```

### Create Account

```typescript
const account = await api.createAccount({
  accountName: 'Work Email',
  emailAddress: 'john@company.com',
  protocol: 'imap',
  hostname: 'imap.company.com',
  port: 993,
  encryption: 'tls',
  username: 'john@company.com',
  password: 'SecurePassword123!',
  isSyncEnabled: true,
  syncInterval: 300
})

console.log(`Account created: ${account.id}`)
```

### Update Account

```typescript
const updated = await api.updateAccount(accountId, {
  accountName: 'Work Email (Updated)',
  syncInterval: 600
})

console.log(`Updated: ${updated.updatedAt}`)
```

### Delete Account

```typescript
await api.deleteAccount(accountId)
console.log('Account deleted')
```

### List Folders

```typescript
const folderResponse = await api.listFolders(accountId)
console.log(`Folders: ${folderResponse.folders.length}`)

folderResponse.folders.forEach(folder => {
  console.log(`${folder.displayName} (${folder.messageCount} messages)`)
})
```

### List Messages

```typescript
const messageResponse = await api.listMessages(accountId, folderId, {
  limit: 50,
  offset: 0,
  sort: 'receivedAt:desc',
  filter: 'unread'
})

console.log(`Unread: ${messageResponse.messages.length}`)
messageResponse.messages.forEach(msg => {
  console.log(`From: ${msg.from}`)
  console.log(`Subject: ${msg.subject}`)
})
```

### Get Message Details

```typescript
const message = await api.getMessage(accountId, messageId)
console.log(message.body)

// Download attachments
message.attachments?.forEach(attachment => {
  console.log(`Attachment: ${attachment.filename} (${attachment.size} bytes)`)
  // Use downloadUrl to fetch file
})
```

### Update Message Flags

```typescript
// Mark as read
const updated = await api.updateMessage(accountId, messageId, {
  isRead: true
})

// Star message
await api.updateMessage(accountId, messageId, {
  isStarred: true
})

// Add labels
await api.updateMessage(accountId, messageId, {
  labels: ['work', 'important']
})
```

### Download Attachment

```typescript
// Get download URL from message
const message = await api.getMessage(accountId, messageId)
const attachment = message.attachments[0]

// Download file
const response = await fetch(attachment.downloadUrl)
const blob = await response.blob()

// Save file
const url = window.URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = attachment.filename
link.click()
```

### Trigger IMAP Sync

```typescript
// Start sync in background
const syncResponse = await api.syncAccount(accountId, {
  force: false
})

console.log(`Sync started: ${syncResponse.taskId}`)

// Poll status
const pollInterval = setInterval(async () => {
  const status = await api.getSyncStatus(syncResponse.taskId)
  console.log(`Sync progress: ${status.progress}%`)

  if (status.status === 'success') {
    clearInterval(pollInterval)
    console.log(`Messages added: ${status.result.messagesAdded}`)
  } else if (status.status === 'failure') {
    clearInterval(pollInterval)
    console.error(`Sync failed: ${status.error}`)
  }
}, 1000)
```

### Send Email

```typescript
const sendResponse = await api.sendEmail({
  accountId: accountId,
  to: ['recipient@example.com'],
  cc: ['cc@example.com'],
  subject: 'Project Update',
  body: 'Hi,\n\nHere is the update...',
  isHtml: false,
  attachmentIds: []
})

console.log(`Email sent, task ID: ${sendResponse.taskId}`)

// Check send status
const status = await api.getSyncStatus(sendResponse.taskId)
```

### Save Draft

```typescript
const draft = await api.saveDraft({
  accountId: accountId,
  to: ['recipient@example.com'],
  subject: 'Draft Email',
  body: 'Work in progress...',
  isHtml: false
})

console.log(`Draft saved: ${draft.draftId}`)
```

### Error Handling

```typescript
try {
  const account = await api.createAccount(data)
} catch (error) {
  if (error.status === 400) {
    console.error(`Validation error: ${error.message}`)
  } else if (error.status === 409) {
    console.error(`Email already exists`)
  } else if (error.status === 429) {
    console.error(`Rate limited - try again later`)
  } else if (error.status === 500) {
    console.error(`Server error: ${error.message}`)
  }
}
```

## Python Usage

### Basic Setup

```python
from email_service_client import EmailServiceApi, Configuration

config = Configuration(
    host=os.getenv('EMAIL_SERVICE_URL', 'http://localhost:5000'),
    api_key={'Authorization': f'Bearer {os.getenv("JWT_TOKEN")}'},
    api_key_prefix={'Authorization': 'Bearer'}
)

api = EmailServiceApi(config)
```

### List Accounts

```python
# List all accounts
response = api.list_accounts(limit=100, offset=0)
print(f"Total accounts: {response.pagination.total}")

for account in response.accounts:
    print(f"{account.account_name} ({account.email_address})")
```

### Create Account

```python
account = api.create_account({
    'accountName': 'Work Email',
    'emailAddress': 'john@company.com',
    'protocol': 'imap',
    'hostname': 'imap.company.com',
    'port': 993,
    'encryption': 'tls',
    'username': 'john@company.com',
    'password': 'SecurePassword123!',
    'isSyncEnabled': True,
    'syncInterval': 300
})

print(f"Account created: {account.id}")
```

### List Messages

```python
response = api.list_messages(
    account_id=account_id,
    folder_id=folder_id,
    limit=50,
    offset=0,
    sort='receivedAt:desc',
    filter='unread'
)

for message in response.messages:
    print(f"From: {message.from_field}")
    print(f"Subject: {message.subject}")
    print(f"Read: {message.is_read}")
```

### Send Email

```python
response = api.send_email({
    'accountId': account_id,
    'to': ['recipient@example.com'],
    'cc': ['cc@example.com'],
    'subject': 'Project Update',
    'body': 'Hi,\n\nHere is the update...',
    'isHtml': False,
    'attachmentIds': []
})

print(f"Email sent, task ID: {response.task_id}")
```

### Sync Account with Polling

```python
import time

# Start sync
sync_response = api.sync_account(account_id, force=False)
print(f"Sync started: {sync_response.task_id}")

# Poll status
while True:
    status = api.get_sync_status(sync_response.task_id)
    print(f"Sync progress: {status.progress}%")

    if status.status == 'success':
        print(f"Sync complete - Messages: {status.result.messages_added} added")
        break
    elif status.status == 'failure':
        print(f"Sync failed: {status.error}")
        break

    time.sleep(1)
```

### Error Handling

```python
try:
    account = api.create_account(data)
except ApiException as e:
    if e.status == 400:
        print(f"Validation error: {e.reason}")
    elif e.status == 409:
        print("Email already exists")
    elif e.status == 429:
        print("Rate limited - try again later")
    elif e.status == 500:
        print(f"Server error: {e.reason}")
```

## Go Usage

### Basic Setup

```go
package main

import (
    "context"
    "fmt"
    client "github.com/metabuilder/email-service-client"
)

func main() {
    config := client.NewConfiguration()
    config.Servers[0].URL = "http://localhost:5000"
    config.AddDefaultHeader("Authorization", "Bearer "+token)

    api := client.NewAPIClient(config)
    ctx := context.Background()

    // Use api...
}
```

### List Accounts

```go
accounts, resp, err := api.AccountsApi.ListAccounts(ctx).
    Limit(100).
    Offset(0).
    Execute()

if err != nil {
    fmt.Printf("Error: %v\n", err)
}

for _, account := range accounts.Accounts {
    fmt.Printf("%s (%s)\n", account.AccountName, account.EmailAddress)
}
```

### Create Account

```go
createReq := *client.NewCreateAccountRequest(
    "Work Email",
    "john@company.com",
    "imap",
    "imap.company.com",
    int32(993),
    "john@company.com",
    "SecurePassword123!",
)

account, _, err := api.AccountsApi.CreateAccount(ctx).
    CreateAccountRequest(createReq).
    Execute()

if err != nil {
    fmt.Printf("Error: %v\n", err)
}

fmt.Printf("Account created: %s\n", account.Id)
```

### List Messages

```go
messages, _, err := api.MessagesApi.ListMessages(ctx, accountId, folderId).
    Limit(50).
    Offset(0).
    Sort("receivedAt:desc").
    Filter("unread").
    Execute()

if err != nil {
    fmt.Printf("Error: %v\n", err)
}

for _, msg := range messages.Messages {
    fmt.Printf("From: %s\n", msg.From)
    fmt.Printf("Subject: %s\n", msg.Subject)
}
```

### Send Email

```go
sendReq := *client.NewSendEmailRequest(
    accountId,
    []string{"recipient@example.com"},
    "Project Update",
    "Hi,\n\nHere is the update...",
)
sendReq.SetCc([]string{"cc@example.com"})

response, _, err := api.ComposeApi.SendEmail(ctx).
    SendEmailRequest(sendReq).
    Execute()

if err != nil {
    fmt.Printf("Error: %v\n", err)
}

fmt.Printf("Email sent, task ID: %s\n", response.TaskId)
```

### Sync Account

```go
// Start sync
syncReq := *client.NewSyncRequest()
syncReq.SetForce(false)

syncResp, _, err := api.SyncApi.SyncAccount(ctx, accountId).
    SyncRequest(syncReq).
    Execute()

if err != nil {
    fmt.Printf("Error: %v\n", err)
}

taskId := syncResp.TaskId
fmt.Printf("Sync started: %s\n", taskId)

// Poll status
for {
    status, _, _ := api.SyncApi.GetSyncStatus(ctx, taskId).Execute()

    fmt.Printf("Sync progress: %d%%\n", status.Progress)

    if status.Status == "success" {
        fmt.Println("Sync complete")
        break
    } else if status.Status == "failure" {
        fmt.Printf("Sync failed: %s\n", status.Error)
        break
    }

    time.Sleep(1 * time.Second)
}
```

### Error Handling

```go
import (
    "net/http"
    client "github.com/metabuilder/email-service-client"
)

account, resp, err := api.AccountsApi.CreateAccount(ctx).
    CreateAccountRequest(req).
    Execute()

if err != nil {
    switch resp.StatusCode {
    case http.StatusBadRequest:
        fmt.Println("Validation error")
    case http.StatusConflict:
        fmt.Println("Email already exists")
    case http.StatusTooManyRequests:
        fmt.Println("Rate limited")
    case http.StatusInternalServerError:
        fmt.Println("Server error")
    }
}
```

## Common Patterns

### Retry with Exponential Backoff (TypeScript)

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (error.status === 429 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }
}

// Usage
const account = await retryWithBackoff(() => api.listAccounts())
```

### Batch Operations

```typescript
// Create multiple accounts in parallel
const accounts = await Promise.all(
  accountConfigs.map(config => api.createAccount(config))
)
```

### Real-time Sync Polling

```typescript
class SyncMonitor {
  private pollInterval: number = 1000

  async monitorSync(
    taskId: string,
    onProgress: (progress: number) => void,
    onComplete: (result: any) => void,
    onError: (error: string) => void
  ) {
    const interval = setInterval(async () => {
      try {
        const status = await api.getSyncStatus(taskId)
        onProgress(status.progress)

        if (status.status === 'success') {
          clearInterval(interval)
          onComplete(status.result)
        } else if (status.status === 'failure') {
          clearInterval(interval)
          onError(status.error)
        }
      } catch (error) {
        clearInterval(interval)
        onError(error.message)
      }
    }, this.pollInterval)
  }
}
```

---

For more information, see the main [Phase 8 OpenAPI Documentation](../PHASE_8_OPENAPI_DOCUMENTATION.md).
