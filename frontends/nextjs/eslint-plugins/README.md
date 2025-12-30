# ESLint Plugins for MetaBuilder

Custom ESLint plugins to enforce architectural patterns and best practices.

## Atomic Design Rules

**File:** `atomic-design-rules.js`

Enforces atomic design hierarchy to prevent upward dependencies.

### Rules

#### `atomic-design/no-upward-imports`

Prevents components from importing higher-level components in the atomic design hierarchy:

- **Atoms** cannot import from **molecules** or **organisms**
- **Molecules** cannot import from **organisms**

**Severity:** `error`

**Why?** This ensures the component hierarchy remains clean and prevents circular dependencies. Atoms should be the most fundamental components, composed only of React and MUI primitives.

### Examples

❌ **Bad** - Atom importing from molecule:
```typescript
// frontends/nextjs/src/components/atoms/Button.tsx
import { FormField } from '@/components/molecules/FormField' // ERROR!
```

❌ **Bad** - Atom importing from organism:
```typescript
// frontends/nextjs/src/components/atoms/Input.tsx
import { DataTable } from '@/components/organisms/DataTable' // ERROR!
```

❌ **Bad** - Molecule importing from organism:
```typescript
// frontends/nextjs/src/components/molecules/FormField.tsx
import { UserManagement } from '@/components/organisms/UserManagement' // ERROR!
```

✅ **Good** - Atom using only MUI:
```typescript
// frontends/nextjs/src/components/atoms/Button.tsx
import { Button as MuiButton } from '@mui/material'
```

✅ **Good** - Molecule using atoms:
```typescript
// frontends/nextjs/src/components/molecules/FormField.tsx
import { Label, Input } from '@/components/atoms'
```

✅ **Good** - Organism using atoms and molecules:
```typescript
// frontends/nextjs/src/components/organisms/UserForm.tsx
import { Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
```

### Testing the Rule

Run ESLint on your components:

```bash
cd frontends/nextjs

# Check all atoms
npx eslint src/components/atoms/**/*.tsx

# Check all molecules
npx eslint src/components/molecules/**/*.tsx
```

### Disabling the Rule (Not Recommended)

If you have a legitimate exception, you can disable the rule for a specific line:

```typescript
// eslint-disable-next-line atomic-design/no-upward-imports
import { SpecialComponent } from '@/components/organisms/SpecialComponent'
```

However, this should be avoided. If you find yourself needing to disable this rule, consider:
1. Is your component in the right category?
2. Can you refactor the code to avoid the upward dependency?
3. Should the imported component be moved to a lower level?

## Adding New Rules

To add a new custom rule:

1. Create a new file in `eslint-plugins/` with your rule logic
2. Import and register the plugin in `eslint.config.js`
3. Add documentation here
4. Test the rule with example violations

### Rule Template

```javascript
export default {
  rules: {
    'my-rule-name': {
      meta: {
        type: 'problem', // or 'suggestion', 'layout'
        docs: {
          description: 'Description of the rule',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          myMessage: 'Error message with {{variable}} placeholders',
        },
        schema: [], // JSON schema for rule options
      },
      create(context) {
        return {
          // AST node visitors
          ImportDeclaration(node) {
            // Rule logic
          },
        }
      },
    },
  },
}
```

## Resources

- [ESLint Custom Rules Guide](https://eslint.org/docs/latest/extend/custom-rules)
- [ESTree AST Spec](https://github.com/estree/estree)
- [Atomic Design Principles](https://atomicdesign.bradfrost.com/)
