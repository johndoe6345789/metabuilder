# Aria-Live Regions Quick Reference

## At a Glance

This document provides a quick reference for aria-live implementations across the application.

---

## Updated Components Summary

| Component | File | Changes | Urgency |
|-----------|------|---------|---------|
| **MonacoEditor** | `src/components/features/snippet-editor/MonacoEditor.tsx` | Added status announcement | Polite |
| **PythonTerminal** | `src/components/features/python-runner/PythonTerminal.tsx` | Added state/error announcements | Dynamic |
| **TerminalOutput** | `src/components/features/python-runner/TerminalOutput.tsx` | Added error alerts, role="log" | Assertive |
| **InputParameterList** | `src/components/features/snippet-editor/InputParameterList.tsx` | Added count announcements | Polite |
| **EmptyState** | `src/components/features/snippet-display/EmptyState.tsx` | Added empty state announcement | Polite |

---

## Aria-Live Attributes Quick Guide

### `aria-live="polite"`
Used for non-urgent updates that don't interrupt current speech.

```jsx
<div aria-live="polite" role="status">
  Status message that waits for pause
</div>
```

**When to use:**
- Status updates
- Non-critical information
- Regular user feedback
- Parameter count changes

---

### `aria-live="assertive"`
Used for urgent updates that interrupt current speech immediately.

```jsx
<div aria-live="assertive" role="alert">
  Critical error or alert
</div>
```

**When to use:**
- Error messages
- Critical alerts
- Time-sensitive information
- Security warnings

---

### `aria-atomic="true"`
Ensures the entire region is read when it updates, not just changes.

```jsx
<div aria-live="polite" aria-atomic="true">
  Complete message read as whole
</div>
```

**When to use:**
- Multi-part announcements
- Status with context
- Important complete messages

---

### `aria-atomic="false"`
Only announces the parts that changed.

```jsx
<div aria-live="polite" aria-atomic="false">
  Only new items announced
</div>
```

**When to use:**
- Appending to lists
- Dynamic content streams
- Log-style output

---

## Role Attributes

### `role="status"`
Generic status message container.

```jsx
<div role="status" aria-live="polite">
  General status information
</div>
```

---

### `role="alert"`
Important alert that needs attention.

```jsx
<div role="alert" aria-live="assertive">
  Error: Something went wrong
</div>
```

---

### `role="log"`
Container for log-style output (errors, events, etc.).

```jsx
<div role="log" aria-label="Terminal output">
  Terminal content here
</div>
```

---

## Screen-Reader-Only Content

### Sr-Only Class
Hide content visually but keep it for screen readers.

```jsx
<div className="sr-only" aria-live="polite">
  This is only announced to screen readers
</div>
```

---

## Implementation Patterns

### Pattern 1: Simple Status Update

```jsx
<div
  className="sr-only"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  data-testid="status-region"
>
  {statusMessage}
</div>
```

---

### Pattern 2: Dynamic Urgency Based on Content

```jsx
const [hasErrors, setHasErrors] = useState(false)

<div
  className="sr-only"
  role="status"
  aria-live={hasErrors ? 'assertive' : 'polite'}
  aria-atomic="true"
>
  {hasErrors ? 'Errors detected' : 'Processing complete'}
</div>
```

---

### Pattern 3: List with Item Count

```jsx
<div className="space-y-3" role="region" aria-label="Items list">
  <div
    className="sr-only"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    {itemCount} item{itemCount !== 1 ? 's' : ''} configured
  </div>
  {items.map(item => <Item key={item.id} {...item} />)}
</div>
```

---

### Pattern 4: Error Alert

```jsx
{hasErrors && (
  <div
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    data-testid="error-alert"
  >
    Error: {errorMessage}
  </div>
)}
```

---

## Component-Specific Quick Refs

### MonacoEditor
```jsx
// Announcement when editor loads
"Code editor loaded with [Language] syntax highlighting. [Mode] mode."

// Example
"Code editor loaded with TypeScript syntax highlighting. Editable mode."
"Code editor loaded with Python syntax highlighting. Read-only mode."
```

---

### PythonTerminal
```jsx
// Status messages
"Terminal is initializing"
"Code is running"
"Waiting for user input"
"5 lines of output"
"Errors detected in output"  // Assertive!
```

---

### TerminalOutput
```jsx
// Empty state
"Click "Run" to execute the Python code"

// Error announcement (screen-reader-only)
"Error: [Error message]"

// Individual error lines
role="alert" aria-live="assertive"
```

---

### InputParameterList
```jsx
// Parameter count announcements
"0 parameters configured"
"1 parameter configured"
"3 parameters configured"

// Button aria-label
"Add new parameter. Current parameters: 2"
```

---

### EmptyState
```jsx
// Full announcement
"No snippets yet. Create your first snippet to get started."

// Or
"No snippets available. Use the Create button to get started."
```

---

## Testing Quick Checklist

For each component:

- [ ] Aria-live region exists in DOM
- [ ] Aria-live value is correct (polite/assertive)
- [ ] Role attribute matches content type
- [ ] Aria-atomic is set appropriately
- [ ] Content is not empty
- [ ] Screen reader hears announcement
- [ ] Announcement is timely
- [ ] Keyboard navigation works
- [ ] No duplicate announcements

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| Using aria-live on static content | Only use on dynamic content |
| Wrong urgency level (polite for errors) | Use assertive for errors |
| Empty aria-live regions | Always include content |
| Removing/recreating regions | Keep regions in DOM, update content |
| No role attribute | Always specify role (status, alert, etc.) |
| Duplicate aria-live regions | One region per update type |
| Missing aria-labels | Provide context for regions |
| Not testing with screen readers | Manual testing is essential |

---

## Copy-Paste Templates

### Status Region Template
```jsx
<div
  className="sr-only"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  data-testid="[component]-status"
>
  {statusMessage}
</div>
```

### Alert Region Template
```jsx
{showError && (
  <div
    className="sr-only"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    data-testid="[component]-error"
  >
    Error: {errorMessage}
  </div>
)}
```

### Log Region Template
```jsx
<div
  role="log"
  aria-label="[Component] output"
  aria-live="polite"
  aria-atomic="false"
  data-testid="[component]-log"
>
  {logEntries.map(entry => (
    <div key={entry.id}>{entry.content}</div>
  ))}
</div>
```

### Parameter List Template
```jsx
<div role="region" aria-label="[Item type] list">
  <div
    className="sr-only"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    {itemCount} item{itemCount !== 1 ? 's' : ''} configured
  </div>
  {items.map(item => <Item key={item.id} {...item} />)}
</div>
```

---

## Resources

- Full implementation guide: `ARIA_LIVE_REGIONS_IMPLEMENTATION.md`
- Screen reader testing: `SCREEN_READER_TESTING_GUIDE.md`
- Test files: `tests/unit/accessibility/aria-live-regions.test.ts`
- Integration tests: `tests/integration/aria-live-components.test.tsx`

---

## Accessibility Standards

All implementations comply with:
- **WCAG 2.1 Level AA** (web content accessibility guidelines)
- **ARIA 1.2** (Accessible Rich Internet Applications specification)
- **Section 508** (federal accessibility requirements)

---

## Questions?

Refer to the full documentation files for:
- Detailed implementation specifics
- Screen reader testing procedures
- Compliance verification steps
- Troubleshooting guide

