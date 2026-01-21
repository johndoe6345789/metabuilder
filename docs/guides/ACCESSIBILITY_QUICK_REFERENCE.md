# Accessibility Quick Reference Guide

**Status**: Implementation Guide for WCAG AA Compliance
**Target**: All MetaBuilder developers

---

## One-Minute Summary

MetaBuilder components must be:
1. **Keyboard accessible** - All interactions via keyboard
2. **Screen reader friendly** - Clear semantic HTML + ARIA labels
3. **Visually clear** - 4.5:1 contrast, visible focus indicators
4. **Error handling** - Clear messages with `role="alert"`

---

## Essential Patterns

### ✅ Button Component
```tsx
// GOOD
<button aria-label="Delete user" onClick={handleDelete}>
  <TrashIcon aria-hidden="true" />
</button>

// GOOD - Visible text
<button onClick={handleDelete}>Delete</button>

// BAD - Icon only, no label
<button onClick={handleDelete}>
  <TrashIcon />
</button>
```

### ✅ Form Input
```tsx
// GOOD
<label htmlFor="email">Email Address <span aria-label="required">*</span></label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby={error ? 'error-email' : undefined}
  aria-invalid={!!error}
/>
{error && (
  <div id="error-email" role="alert">
    {error}
  </div>
)}

// BAD - No label
<input type="email" placeholder="Enter email" />

// BAD - Placeholder instead of label
<input type="email" placeholder="Email Address" />
```

### ✅ Link Text
```tsx
// GOOD - Descriptive
<a href="/about">Learn about MetaBuilder</a>

// GOOD - Icon + text
<a href="/next">
  Next <ChevronRightIcon aria-hidden="true" />
</a>

// BAD - Generic "click here"
<a href="/about">Click here</a>

// BAD - No text
<a href="/about" aria-label="Learn more">
  <ArrowIcon />
</a>
```

### ✅ Keyboard Navigation
```tsx
// GOOD - Handle Escape to close
<Modal onClose={onClose}>
  {/* useEffect to handle Escape key */}
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])
</Modal>

// GOOD - Tab order with arrow keys (tabs)
<button
  role="tab"
  aria-selected={active}
  onKeyDown={(e) => {
    if (e.key === 'ArrowRight') handleNextTab()
  }}
/>
```

### ✅ Focus Indicators
```css
/* GOOD - Visible focus */
button:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* GOOD - Custom focus state */
.button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.5);
}

/* BAD - Outline removed */
button:focus {
  outline: none;
}

/* BAD - No visible focus */
button:focus {
  background-color: #f0f0f0;
}
```

### ✅ Loading State
```tsx
// GOOD - Announced to screen readers
<div aria-live="polite" aria-busy={loading}>
  {loading ? <Spinner /> : <Content />}
</div>

// GOOD - With region label
<div
  role="region"
  aria-label="Data loading"
  aria-live="polite"
  aria-busy={loading}
>
  {loading && <p>Loading data...</p>}
</div>
```

### ✅ Error Message
```tsx
// GOOD - Announced immediately
{error && (
  <div role="alert">
    Error: {error}
  </div>
)}

// GOOD - Associated with input
<input
  aria-invalid={!!error}
  aria-describedby={error ? 'error-field' : undefined}
/>
{error && <div id="error-field" role="alert">{error}</div>}
```

### ✅ Page Structure
```tsx
// GOOD - Semantic structure
<>
  <h1>Page Title</h1>
  <nav aria-label="Main navigation">
    {/* Navigation content */}
  </nav>
  <main>
    <section aria-labelledby="section-title">
      <h2 id="section-title">Section Title</h2>
      {/* Content */}
    </section>
  </main>
  <footer>Footer content</footer>
</>

// BAD - Divs instead of semantic elements
<div className="header">
  <div className="title">Page Title</div>
  <div className="nav">{/* Navigation */}</div>
</div>
<div className="main">{/* Content */}</div>
```

### ✅ Data Table
```tsx
// GOOD - Semantic table with captions
<table>
  <caption>Monthly sales data</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Sales</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>January</td>
      <td>$50,000</td>
    </tr>
  </tbody>
</table>

// BAD - No caption or scope
<table>
  <tr>
    <td>Month</td>
    <td>Sales</td>
  </tr>
</table>
```

### ✅ Image
```tsx
// GOOD - Meaningful alt text
<img
  src="user-avatar.jpg"
  alt="Jane Smith's profile picture"
/>

// GOOD - Decorative image
<img
  src="background-pattern.jpg"
  alt=""
  aria-hidden="true"
/>

// GOOD - Next.js Image component
<Image
  src={url}
  alt="Description"
  width={300}
  height={300}
  loading="lazy"
/>

// BAD - No alt text
<img src="user-avatar.jpg" />

// BAD - Alt text is not descriptive
<img src="user-avatar.jpg" alt="image" />
```

---

## Color Contrast Quick Check

**Tools**:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Lighthouse DevTools (Accessibility tab)
- axe DevTools browser extension

**Quick Reference**:
- **WCAG AA Text**: 4.5:1 minimum
- **WCAG AA Large Text** (18pt+): 3:1 minimum
- **WCAG AA Graphics**: 3:1 minimum

**Common Contrasts**:
```
✅ Black (#000000) on White (#FFFFFF): 21:1 - EXCELLENT
✅ #0066cc on White: ~8:1 - GOOD
✅ #666666 on White: ~5.5:1 - ACCEPTABLE
❌ #999999 on White: ~3.5:1 - FAIL FOR NORMAL TEXT
❌ #CCCCCC on White: ~1.4:1 - FAIL
```

---

## Keyboard Navigation Testing

**Steps**:
1. **Tab**: Move to next element
2. **Shift+Tab**: Move to previous element
3. **Enter**: Activate button/link
4. **Space**: Activate checkbox/radio/button
5. **Escape**: Close modal/dropdown
6. **Arrow Keys**: Navigate tabs, dropdown options, sliders

**Test Checklist**:
- [ ] All interactive elements reachable by Tab
- [ ] Tab order follows visual flow (left→right, top→bottom)
- [ ] Focus visible on all tabbed elements
- [ ] No keyboard traps (can always Tab out)
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys navigate lists/tabs/dropdowns

**Testing Command** (macOS):
```bash
# Enable keyboard navigation in System Preferences
System Preferences → Accessibility → Keyboard → Full Keyboard Access
# Then in Safari/Chrome: use Tab to navigate
```

---

## Screen Reader Testing (macOS)

**Enable VoiceOver**:
```
Cmd + F5  # Toggle on/off
```

**Common Commands**:
```
VO = Control + Option (on macOS)

VO + Right Arrow     → Next element
VO + Left Arrow      → Previous element
VO + Down Arrow      → Read element
VO + Space           → Activate button/link
VO + Shift + Down    → Read continuously
VO + U               → Open Rotor (headings, links, etc.)
VO + Down (from Rotor) → Jump to section
```

**Rotor (Cmd+Option+U)**:
- View all headings on page
- View all links
- View all form controls
- View all landmarks

**Test Checklist**:
- [ ] Page title announced first
- [ ] All headings present in Rotor
- [ ] All links have descriptive text
- [ ] All form inputs have labels
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Images have alt text
- [ ] Page structure announced (main, nav, footer)

---

## Common ARIA Attributes

| Attribute | Usage | Example |
|-----------|-------|---------|
| `aria-label` | Provide accessible name | `<button aria-label="Close">×</button>` |
| `aria-labelledby` | Link element to heading | `<section aria-labelledby="h2-id">` |
| `aria-describedby` | Add description | `<input aria-describedby="help-text">` |
| `aria-invalid` | Mark invalid input | `<input aria-invalid="true">` |
| `aria-required` | Mark required field | `<input aria-required="true">` |
| `aria-hidden` | Hide from screen readers | `<Icon aria-hidden="true" />` |
| `aria-live` | Announce updates | `<div aria-live="polite">` |
| `aria-busy` | Indicate loading | `<div aria-busy="true">` |
| `role` | Define element role | `<button role="tab">` |
| `aria-selected` | Current tab/option | `<button aria-selected="true">` |

---

## Semantic HTML Elements

| Element | Use For |
|---------|---------|
| `<h1>` - `<h6>` | Headings (hierarchy) |
| `<main>` | Main content region |
| `<nav>` | Navigation region |
| `<header>` | Page header |
| `<footer>` | Page footer |
| `<aside>` | Supplementary content |
| `<section>` | Thematic grouping |
| `<article>` | Self-contained content |
| `<button>` | Clickable action |
| `<a>` | Links to pages/sections |
| `<form>` | Form container |
| `<label>` | Form input label |
| `<input>` | Form input |
| `<textarea>` | Multi-line text input |
| `<select>` | Dropdown list |
| `<table>` | Data table |
| `<figure>` | Image with caption |
| `<time>` | Dates/times |
| `<mark>` | Highlighted text |
| `<strong>` | Strong emphasis |
| `<em>` | Emphasis |

---

## ESLint Plugin: jsx-a11y

Install:
```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

Config (`.eslintrc.json`):
```json
{
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/html-has-lang": "error",
    "jsx-a11y/iframe-has-title": "error",
    "jsx-a11y/img-redundant-alt": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/mouse-events-have-key-events": "error",
    "jsx-a11y/no-access-key": "warn",
    "jsx-a11y/no-distracting-elements": "error",
    "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "error",
    "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
    "jsx-a11y/scope": "error"
  }
}
```

---

## Development Workflow

### Before Coding
1. [ ] Read component requirements for accessibility needs
2. [ ] Choose semantic HTML when possible
3. [ ] Plan keyboard navigation flow
4. [ ] Check color palette for contrast

### While Coding
1. [ ] Use semantic HTML elements
2. [ ] Add ARIA labels where needed
3. [ ] Test Tab navigation frequently
4. [ ] Verify focus indicators visible
5. [ ] Run ESLint with jsx-a11y plugin

### Before Submitting PR
1. [ ] Test with keyboard only (no mouse)
2. [ ] Test with screen reader (VoiceOver on macOS)
3. [ ] Check color contrast (WebAIM)
4. [ ] Verify focus indicators visible
5. [ ] Run ESLint checks
6. [ ] Test on mobile (responsive)

### Final QA
1. [ ] Axe DevTools accessibility scan
2. [ ] WAVE browser extension check
3. [ ] Lighthouse accessibility audit
4. [ ] Cross-browser testing

---

## Resources

**Learning**:
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- WebAIM: https://webaim.org/
- ARIA Practices: https://www.w3.org/WAI/ARIA/practices/
- Inclusive Components: https://inclusive-components.design/

**Tools**:
- Axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- NVDA: https://www.nvaccess.org/
- Color Contrast Analyzer: https://www.tpgi.com/color-contrast-analyzer/

**Standards**:
- WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/
- Section 508: https://www.access-board.gov/ict/
- ADA Compliance: https://www.ada.gov/

---

## Common Mistakes to Avoid

❌ **Don't**:
- Rely on color alone to convey information
- Remove focus indicators with `outline: none`
- Use `placeholder` instead of `<label>`
- Forget `alt` text on images
- Use icon-only buttons without labels
- Create keyboard traps
- Use `<div onClick>` instead of `<button>`
- Skip heading hierarchy levels

✅ **Do**:
- Use semantic HTML elements
- Provide ARIA labels for complex components
- Ensure keyboard navigation works
- Test with screen readers
- Use sufficient color contrast
- Keep focus indicators visible
- Test on multiple browsers
- Involve people with disabilities in testing

---

## Getting Help

**Questions?** See the main Phase 5.4 document:
`/docs/PHASE5.4_ACCESSIBILITY_PERFORMANCE.md`

**Accessibility Team**:
- Review accessibility section of design docs
- Use accessibility review checklist in PRs
- Run automated checks before submitting

**Status**: ✅ Ready for implementation
