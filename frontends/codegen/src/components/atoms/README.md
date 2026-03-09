# Atomic Component Library

A comprehensive collection of reusable atomic components for the CodeForge low-code development platform. These components follow atomic design principles and provide consistent, accessible UI elements across the application.

## Component Categories

### Typography

#### Heading
Semantic heading elements with consistent styling.

```tsx
<Heading level={1}>Main Title</Heading>
<Heading level={2}>Section Title</Heading>
<Heading level={3} className="text-accent">Custom Styled</Heading>
```

**Props:**
- `level`: 1-6 (default: 1)
- `className`: string
- `children`: ReactNode

#### Text
Paragraph text with semantic variants.

```tsx
<Text variant="body">Default body text</Text>
<Text variant="muted">Less important text</Text>
<Text variant="caption">Small descriptive text</Text>
<Text variant="small">Compact information</Text>
```

**Props:**
- `variant`: 'body' | 'caption' | 'muted' | 'small'
- `className`: string
- `children`: ReactNode

#### Link
Styled anchor elements with variant support.

```tsx
<Link href="/path" variant="default">Internal Link</Link>
<Link href="https://example.com" external>External Link</Link>
```

**Props:**
- `href`: string
- `variant`: 'default' | 'muted' | 'accent' | 'destructive'
- `external`: boolean
- `onClick`: (e: MouseEvent) => void
- `className`: string

---

### Buttons & Actions

#### ActionButton
Full-featured button with icon and tooltip support.

```tsx
<ActionButton 
  label="Save" 
  icon={<FloppyDisk />}
  onClick={handleSave}
  variant="default"
  tooltip="Save changes"
/>
```

**Props:**
- `label`: string
- `onClick`: () => void
- `icon`: ReactNode
- `variant`: 'default' | 'outline' | 'ghost' | 'destructive'
- `size`: 'default' | 'sm' | 'lg' | 'icon'
- `tooltip`: string
- `disabled`: boolean
- `className`: string

#### IconButton
Compact icon-only button.

```tsx
<IconButton icon={<Plus />} onClick={handleAdd} />
<IconButton icon={<Trash />} variant="destructive" />
```

**Props:**
- `icon`: ReactNode
- `onClick`: () => void
- `variant`: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
- `size`: 'default' | 'sm' | 'lg' | 'icon'
- `disabled`: boolean
- `title`: string
- `className`: string

---

### Indicators & Badges

#### StatusBadge
Status indicator with predefined states.

```tsx
<StatusBadge status="active" />
<StatusBadge status="error" label="Failed" />
```

**Props:**
- `status`: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning'
- `label`: string (optional)

#### Chip
Tag component with optional remove functionality.

```tsx
<Chip variant="primary">React</Chip>
<Chip variant="accent" onRemove={handleRemove}>Removable</Chip>
```

**Props:**
- `variant`: 'default' | 'primary' | 'accent' | 'muted'
- `size`: 'sm' | 'md'
- `onRemove`: () => void
- `className`: string

#### Dot
Small status indicator dot with pulse animation.

```tsx
<Dot variant="success" />
<Dot variant="warning" pulse />
```

**Props:**
- `variant`: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error'
- `size`: 'xs' | 'sm' | 'md' | 'lg'
- `pulse`: boolean
- `className`: string

---

### Display Components

#### Avatar
User avatar with fallback to initials.

```tsx
<Avatar src="/avatar.jpg" alt="John Doe" size="md" />
<Avatar fallback="JD" size="lg" />
```

**Props:**
- `src`: string
- `alt`: string
- `fallback`: string
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `className`: string

#### Image
Enhanced image component with loading and error states.

```tsx
<Image 
  src="/photo.jpg" 
  alt="Description"
  width={300}
  height={200}
  fit="cover"
  fallback="/placeholder.jpg"
/>
```

**Props:**
- `src`: string
- `alt`: string
- `width`: number | string
- `height`: number | string
- `fit`: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
- `fallback`: string
- `onLoad`: () => void
- `onError`: () => void
- `className`: string

#### Code
Inline or block code display.

```tsx
<Code inline>npm install</Code>
<Code inline={false}>
  {`function hello() {
    console.log("Hello");
  }`}
</Code>
```

**Props:**
- `inline`: boolean (default: true)
- `className`: string

#### Kbd
Keyboard shortcut display.

```tsx
<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
```

**Props:**
- `className`: string

---

### Feedback Components

#### Alert
Contextual alert messages.

```tsx
<Alert variant="info" title="Note">
  This is important information.
</Alert>
<Alert variant="error" title="Error">
  Something went wrong.
</Alert>
```

**Props:**
- `variant`: 'info' | 'warning' | 'success' | 'error'
- `title`: string
- `className`: string

#### Spinner / LoadingSpinner
Loading indicators.

```tsx
<Spinner size={24} />
<LoadingSpinner size="md" />
```

**Props (Spinner):**
- `size`: number
- `className`: string

**Props (LoadingSpinner):**
- `size`: 'sm' | 'md' | 'lg'
- `className`: string

#### ProgressBar
Progress indicator with percentage.

```tsx
<ProgressBar value={65} max={100} showLabel />
<ProgressBar value={80} variant="accent" />
```

**Props:**
- `value`: number
- `max`: number (default: 100)
- `size`: 'sm' | 'md' | 'lg'
- `variant`: 'default' | 'accent' | 'destructive'
- `showLabel`: boolean
- `className`: string

#### Skeleton
Loading placeholder.

```tsx
<Skeleton variant="text" width="100%" />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rounded" width="100%" height={100} />
```

**Props:**
- `variant`: 'text' | 'rectangular' | 'circular' | 'rounded'
- `width`: string | number
- `height`: string | number
- `className`: string

#### Tooltip
Hover tooltip.

```tsx
<Tooltip content="More information" side="top">
  <Button>Hover me</Button>
</Tooltip>
```

**Props:**
- `content`: ReactNode
- `side`: 'top' | 'right' | 'bottom' | 'left'
- `delayDuration`: number (default: 200)
- `className`: string

---

### Form Components

#### Label
Form field label with required indicator.

```tsx
<Label htmlFor="email">Email Address</Label>
<Label htmlFor="password" required>Password</Label>
```

**Props:**
- `htmlFor`: string
- `required`: boolean
- `className`: string

#### HelperText
Form field helper or error text.

```tsx
<HelperText variant="default">
  Enter your email address
</HelperText>
<HelperText variant="error">
  This field is required
</HelperText>
```

**Props:**
- `variant`: 'default' | 'error' | 'success'
- `className`: string

---

### Layout Components

#### Container
Max-width content container with responsive padding.

```tsx
<Container size="lg">
  <h1>Content</h1>
</Container>
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `className`: string

#### Section
Semantic section with vertical spacing.

```tsx
<Section spacing="lg">
  <h2>Section Title</h2>
  <p>Content</p>
</Section>
```

**Props:**
- `spacing`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `className`: string

#### Stack
Flexbox layout with consistent spacing.

```tsx
<Stack direction="vertical" spacing="md">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

<Stack direction="horizontal" justify="between" align="center">
  <Button>Left</Button>
  <Button>Right</Button>
</Stack>
```

**Props:**
- `direction`: 'horizontal' | 'vertical'
- `spacing`: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `align`: 'start' | 'center' | 'end' | 'stretch'
- `justify`: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
- `wrap`: boolean
- `className`: string

#### Spacer
Blank space for layout spacing.

```tsx
<Spacer size="md" axis="vertical" />
<Spacer size="lg" axis="horizontal" />
```

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `axis`: 'horizontal' | 'vertical' | 'both'
- `className`: string

#### Divider
Visual separator line.

```tsx
<Divider orientation="horizontal" />
<Divider orientation="vertical" className="h-full" />
```

**Props:**
- `orientation`: 'horizontal' | 'vertical'
- `decorative`: boolean (default: true)
- `className`: string

#### ScrollArea
Custom styled scrollable area.

```tsx
<ScrollArea maxHeight={400}>
  <div>Long content...</div>
</ScrollArea>
```

**Props:**
- `maxHeight`: string | number
- `className`: string

---

### Utility Components

#### Timestamp
Formatted date/time display.

```tsx
<Timestamp date={new Date()} />
<Timestamp date={dateValue} relative />
<Timestamp date={dateValue} formatString="MMM d, yyyy" />
```

**Props:**
- `date`: Date | number | string
- `relative`: boolean
- `formatString`: string (default: 'MMM d, yyyy h:mm a')
- `className`: string

---

### Advanced Form Components

#### Input
Enhanced input field with icon support and validation states.

```tsx
<Input
  label="Email"
  placeholder="you@example.com"
  leftIcon={<Envelope />}
  error={false}
  helperText="Enter a valid email"
/>
```

**Props:**
- `label`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `error`: boolean
- `helperText`: string
- `className`: string
- All native input props

#### TextArea
Multi-line text input with validation.

```tsx
<TextArea
  label="Description"
  placeholder="Enter details..."
  error={false}
  helperText="Max 500 characters"
  rows={4}
/>
```

**Props:**
- `label`: string
- `error`: boolean
- `helperText`: string
- `className`: string
- All native textarea props

#### PasswordInput
Password input with visibility toggle.

```tsx
<PasswordInput
  value={password}
  onChange={setPassword}
  label="Password"
  helperText="At least 8 characters"
/>
```

**Props:**
- `value`: string
- `onChange`: (value: string) => void
- `label`: string
- `error`: boolean
- `helperText`: string

#### BasicSearchInput
Search input with clear button.

```tsx
<BasicSearchInput
  value={query}
  onChange={setQuery}
  placeholder="Search items..."
/>
```

**Props:**
- `value`: string
- `onChange`: (value: string) => void
- `placeholder`: string

#### Select
Dropdown selection component.

```tsx
<Select
  value={value}
  onChange={setValue}
  options={[
    { value: 'react', label: 'React' }
  ]}
  label="Framework"
/>
```

**Props:**
- `value`: string
- `onChange`: (value: string) => void
- `options`: SelectOption[]

---

### Interactive Components

#### Tag, Tabs, Accordion, Menu, Popover, Modal, Drawer
See full documentation in component files.

---

### Display Components

#### Card, Table, Timeline, Stepper, Rating, ColorSwatch
See full documentation in component files.

---

### Utility Components

#### Notification, CopyButton, FileUpload, BreadcrumbNav, IconText
See full documentation in component files.

---

## Design Principles

1. **Consistency**: All components use the same design tokens and styling patterns
2. **Accessibility**: ARIA attributes and semantic HTML throughout
3. **Flexibility**: Comprehensive prop APIs for customization
4. **Performance**: Lightweight implementations with minimal dependencies
5. **Type Safety**: Full TypeScript support with proper prop types

## Usage Guidelines

### Import Pattern
```tsx
import { Heading, Text, Button, Stack } from '@/components/atoms'
```

### Composition
Atomic components are designed to be composed together:

```tsx
<Card>
  <Stack spacing="md">
    <Stack direction="horizontal" justify="between" align="center">
      <Stack direction="horizontal" spacing="sm" align="center">
        <Avatar fallback="JD" size="sm" />
        <Stack spacing="xs">
          <Heading level={4}>John Doe</Heading>
          <Text variant="muted">2 hours ago</Text>
        </Stack>
      </Stack>
      <StatusBadge status="active" />
    </Stack>
    <Divider />
    <Text variant="body">
      Check out this <Code>implementation</Code> detail.
    </Text>
    <Stack direction="horizontal" spacing="sm">
      <ActionButton icon={<Heart />} label="Like" onClick={handleLike} />
      <ActionButton icon={<Share />} label="Share" onClick={handleShare} variant="outline" />
    </Stack>
  </Stack>
</Card>
```

## Theme Integration

All components respect the design system defined in `index.css`:
- Color variables: `--primary`, `--accent`, `--background`, etc.
- Typography: JetBrains Mono for code, IBM Plex Sans for UI
- Spacing scale: Consistent gap/padding values
- Border radius: `--radius` variable

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- ES2020+ JavaScript features
