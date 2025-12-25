# Atoms

Atoms are the smallest, indivisible UI elements in the MetaBuilder component library.

## What belongs here?

- **Basic UI elements** that cannot be broken down further without losing meaning
- **Single responsibility** components
- **No dependencies** on other custom components (only shadcn/ui primitives)
- **Highly reusable** across the entire application
- **Stateless or minimal state**

## Examples

### From shadcn/ui (via index.ts export)
- `Button` - Basic button element
- `Input` - Text input field
- `Label` - Form label
- `Badge` - Status/tag badge
- `Avatar` - User avatar image
- `Separator` - Visual divider
- `Skeleton` - Loading placeholder
- `Switch` - Toggle switch
- `Slider` - Range slider
- `Progress` - Progress bar
- `Checkbox` - Checkbox input
- `RadioGroup` - Radio button group

### Custom Atoms (if needed)
Custom atoms should only be created when shadcn/ui doesn't provide a suitable primitive. Examples might include:
- Brand-specific icon components
- Custom loading indicators
- Specialized badge variants

## Usage

```typescript
import { Button, Input, Label, Badge } from '@/components/atoms'

function MyComponent() {
  return (
    <div>
      <Label>Username</Label>
      <Input type="text" />
      <Badge>New</Badge>
      <Button>Submit</Button>
    </div>
  )
}
```

## Rules

1. ✅ **DO** keep atoms simple and focused
2. ✅ **DO** make atoms highly reusable
3. ✅ **DO** use TypeScript for type safety
4. ✅ **DO** use Tailwind utilities for styling
5. ❌ **DON'T** import molecules or organisms
6. ❌ **DON'T** add business logic
7. ❌ **DON'T** make atoms context-dependent
8. ❌ **DON'T** duplicate shadcn components

## Notes

Most of our atoms come from shadcn/ui. Only create custom atoms when absolutely necessary and they represent truly atomic, reusable elements.
