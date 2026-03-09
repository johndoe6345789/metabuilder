# Component Props Definitions

**Define component prop schemas for validation, auto-completion, and type safety!**

The `componentProps` section in features.json provides comprehensive prop definitions for all UI components, enabling:
- ✅ Prop validation at runtime
- ✅ Auto-completion hints in editors
- ✅ Type safety without TypeScript
- ✅ Self-documenting component APIs
- ✅ Design system consistency
- ✅ Error prevention

## Overview

Component prop schemas define:
- **Prop types**: string, number, boolean, array, object, function, enum, any
- **Required props**: Validation fails if missing
- **Default values**: Fallback when prop not provided
- **Enum values**: Allowed values for enum types
- **Descriptions**: Documentation for each prop
- **Categories**: Group components by purpose

## Schema Structure

```json
{
  "componentProps": {
    "ComponentName": {
      "description": "Component description",
      "category": "inputs|display|layout|navigation|feedback",
      "props": {
        "propName": {
          "type": "string|number|boolean|array|object|function|enum|any",
          "description": "Prop description",
          "required": true/false,
          "default": "default value",
          "values": ["for", "enum", "types"]
        }
      }
    }
  }
}
```

## Prop Type Reference

### Basic Types

```json
{
  "text": {
    "type": "string",
    "description": "Text content"
  },
  "count": {
    "type": "number",
    "description": "Numeric value"
  },
  "disabled": {
    "type": "boolean",
    "description": "Whether component is disabled"
  },
  "items": {
    "type": "array",
    "description": "Array of items"
  },
  "config": {
    "type": "object",
    "description": "Configuration object"
  },
  "onClick": {
    "type": "function",
    "description": "Click handler"
  }
}
```

### Enum Types

```json
{
  "variant": {
    "type": "enum",
    "values": ["text", "outlined", "contained"],
    "default": "text",
    "description": "Button variant style"
  }
}
```

### Required Props

```json
{
  "columns": {
    "type": "array",
    "required": true,
    "description": "Column definitions"
  }
}
```

## Component Categories

### Inputs
Components for user input:
- Button
- TextField
- Select
- Checkbox
- IconButton

### Display
Components for displaying content:
- Typography
- DataGrid
- Icon

### Layout
Components for page structure:
- Box
- Grid
- Paper
- Card
- AppBar
- Toolbar
- Drawer

### Navigation
Components for navigation:
- Tabs
- Tab
- Pagination
- Drawer

### Feedback
Components for user feedback:
- Dialog
- Alert
- CircularProgress

## Using Component Props in Code

### Get Component Schema

```typescript
import { getComponentPropSchema } from '@/utils/featureConfig';

const schema = getComponentPropSchema('Button');

console.log(schema?.description); // "Material-UI Button component"
console.log(schema?.category); // "inputs"
console.log(schema?.props.variant.type); // "enum"
console.log(schema?.props.variant.values); // ["text", "outlined", "contained"]
```

### Get Specific Prop Definition

```typescript
import { getComponentPropDefinition } from '@/utils/featureConfig';

const variantProp = getComponentPropDefinition('Button', 'variant');

console.log(variantProp?.type); // "enum"
console.log(variantProp?.default); // "text"
console.log(variantProp?.values); // ["text", "outlined", "contained"]
```

### Validate Component Props

```typescript
import { validateComponentProps } from '@/utils/featureConfig';

// Valid props
const result1 = validateComponentProps('Button', {
  text: 'Click me',
  variant: 'contained',
  color: 'primary',
});

console.log(result1.valid); // true
console.log(result1.errors); // []

// Invalid props
const result2 = validateComponentProps('Button', {
  variant: 'invalid',
  unknownProp: 'value',
});

console.log(result2.valid); // false
console.log(result2.errors);
// [
//   "Invalid value for variant: invalid. Expected one of: text, outlined, contained",
//   "Unknown prop: unknownProp"
// ]

// Missing required props
const result3 = validateComponentProps('DataGrid', {
  rows: [],
  // Missing required 'columns' prop
});

console.log(result3.valid); // false
console.log(result3.errors); // ["Missing required prop: columns"]
```

### Get Components by Category

```typescript
import { getComponentsByCategory } from '@/utils/featureConfig';

const inputComponents = getComponentsByCategory('inputs');
console.log(inputComponents);
// ["Button", "TextField", "Select", "Checkbox", "IconButton"]

const layoutComponents = getComponentsByCategory('layout');
console.log(layoutComponents);
// ["Box", "Grid", "Paper", "Card", "AppBar", "Toolbar", "Drawer"]
```

## Complete Example: Dynamic Component Renderer

```typescript
import {
  getComponentPropSchema,
  validateComponentProps,
} from '@/utils/featureConfig';

function DynamicComponent({ name, props }: { name: string; props: Record<string, any> }) {
  // Validate props
  const validation = validateComponentProps(name, props);
  
  if (!validation.valid) {
    console.error(`Invalid props for ${name}:`, validation.errors);
    return (
      <Alert severity="error">
        <Typography variant="h6">Invalid Component Props</Typography>
        <ul>
          {validation.errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      </Alert>
    );
  }
  
  // Get schema to apply defaults
  const schema = getComponentPropSchema(name);
  const finalProps = { ...props };
  
  // Apply default values
  if (schema) {
    Object.entries(schema.props).forEach(([propName, propDef]) => {
      if (!(propName in finalProps) && propDef.default !== undefined) {
        finalProps[propName] = propDef.default;
      }
    });
  }
  
  // Render component
  const Component = getComponent(name);
  return <Component {...finalProps} />;
}

// Usage
<DynamicComponent
  name="Button"
  props={{
    text: 'Click me',
    variant: 'contained',
    onClick: handleClick,
  }}
/>
```

## Example: Form Field Generator

```typescript
import {
  getComponentPropSchema,
  getComponentPropDefinition,
} from '@/utils/featureConfig';

function FormFieldGenerator({ componentName }: { componentName: string }) {
  const schema = getComponentPropSchema(componentName);
  
  if (!schema) return null;
  
  return (
    <Box>
      <Typography variant="h6">{componentName} Props</Typography>
      
      {Object.entries(schema.props).map(([propName, propDef]) => (
        <Box key={propName} sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            {propName}
            {propDef.required && <span style={{ color: 'red' }}>*</span>}
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            Type: {propDef.type}
            {propDef.default && ` • Default: ${propDef.default}`}
          </Typography>
          
          <Typography variant="body2">
            {propDef.description}
          </Typography>
          
          {propDef.type === 'enum' && propDef.values && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption">Options:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {propDef.values.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
```

## Example: Component Tree Validator

```typescript
import {
  getComponentTree,
  validateComponentProps,
} from '@/utils/featureConfig';

function validateComponentTree(treeName: string): { valid: boolean; errors: Array<{ path: string; errors: string[] }> } {
  const tree = getComponentTree(treeName);
  
  if (!tree) {
    return { valid: false, errors: [{ path: 'root', errors: ['Tree not found'] }] };
  }
  
  const allErrors: Array<{ path: string; errors: string[] }> = [];
  
  function validateNode(node: any, path: string) {
    const validation = validateComponentProps(node.component, node.props || {});
    
    if (!validation.valid) {
      allErrors.push({ path, errors: validation.errors });
    }
    
    if (node.children) {
      node.children.forEach((child: any, idx: number) => {
        validateNode(child, `${path}.children[${idx}]`);
      });
    }
  }
  
  validateNode(tree, treeName);
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

// Usage
const validation = validateComponentTree('AdminDashboard');

if (!validation.valid) {
  console.error('Component tree has validation errors:');
  validation.errors.forEach(({ path, errors }) => {
    console.error(`  ${path}:`, errors);
  });
}
```

## Example: Props Documentation Generator

```typescript
import { getAllComponentPropSchemas } from '@/utils/featureConfig';

function ComponentDocumentation() {
  const schemas = getAllComponentPropSchemas();
  
  return (
    <Box>
      <Typography variant="h4">Component Reference</Typography>
      
      {Object.entries(schemas).map(([componentName, schema]) => (
        <Paper key={componentName} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5">{componentName}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Category: {schema.category}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {schema.description}
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 2 }}>Props</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Required</TableCell>
                <TableCell>Default</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(schema.props).map(([propName, propDef]) => (
                <TableRow key={propName}>
                  <TableCell>
                    <code>{propName}</code>
                  </TableCell>
                  <TableCell>
                    {propDef.type === 'enum' ? (
                      <Tooltip title={propDef.values?.join(', ')}>
                        <span>{propDef.type}</span>
                      </Tooltip>
                    ) : (
                      propDef.type
                    )}
                  </TableCell>
                  <TableCell>
                    {propDef.required ? '✓' : ''}
                  </TableCell>
                  <TableCell>
                    {propDef.default !== undefined ? (
                      <code>{JSON.stringify(propDef.default)}</code>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{propDef.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ))}
    </Box>
  );
}
```

## Component Reference

### Button

Material-UI Button component

**Category:** inputs

**Props:**
- `text` (string): Button text content
- `variant` (enum: "text" | "outlined" | "contained"): Button variant style (default: "text")
- `color` (enum): Button color theme (default: "primary")
- `size` (enum: "small" | "medium" | "large"): Button size (default: "medium")
- `disabled` (boolean): Whether button is disabled (default: false)
- `fullWidth` (boolean): Whether button takes full width (default: false)
- `startIcon` (string): Icon name to show at start
- `endIcon` (string): Icon name to show at end
- `onClick` (function): Click event handler function name

### TextField

Material-UI TextField component

**Category:** inputs

**Props:**
- `label` (string): Field label
- `placeholder` (string): Placeholder text
- `value` (any): Field value
- `type` (enum: "text" | "email" | "password" | "number" | "tel" | "url"): Input type (default: "text")
- `variant` (enum: "standard" | "outlined" | "filled"): TextField variant (default: "outlined")
- `size` (enum: "small" | "medium"): Field size (default: "medium")
- `required` (boolean): Whether field is required (default: false)
- `disabled` (boolean): Whether field is disabled (default: false)
- `fullWidth` (boolean): Whether field takes full width (default: false)
- `multiline` (boolean): Whether field is multiline textarea (default: false)
- `rows` (number): Number of rows for multiline
- `error` (boolean): Whether field has error
- `helperText` (string): Helper text below field
- `onChange` (function): Change event handler

### DataGrid

Custom DataGrid component for displaying tables

**Category:** display

**Props:**
- `columns` (array) **required**: Column definitions
- `rows` (array) **required**: Data rows
- `loading` (boolean): Whether data is loading (default: false)
- `primaryKey` (string): Primary key field name (default: "id")
- `onEdit` (function): Edit row handler
- `onDelete` (function): Delete row handler
- `size` (enum: "small" | "medium"): Table size (default: "medium")

### Dialog

Material-UI Dialog component

**Category:** feedback

**Props:**
- `open` (boolean) **required**: Whether dialog is open
- `onClose` (function): Close handler function
- `maxWidth` (enum: "xs" | "sm" | "md" | "lg" | "xl" | false): Maximum width of dialog (default: "sm")
- `fullWidth` (boolean): Whether dialog takes full available width (default: false)
- `fullScreen` (boolean): Whether dialog is fullscreen (default: false)

## Benefits

1. **Runtime Validation**: Catch prop errors before rendering
2. **Self-Documenting**: Props documented in configuration
3. **Type Safety**: Without TypeScript overhead
4. **Consistency**: Enforce design system patterns
5. **Auto-Completion**: Enable editor hints
6. **Error Prevention**: Catch mistakes early
7. **Component Discovery**: Browse available components
8. **Onboarding**: New developers see prop options
9. **Testing**: Validate component usage
10. **Maintenance**: Central prop definitions

## Best Practices

1. **Document all props**: Include clear descriptions
2. **Mark required props**: Set `required: true`
3. **Provide defaults**: Set sensible defaults
4. **Use enums**: Limit values to valid options
5. **Categorize components**: Group by purpose
6. **Keep updated**: Sync with actual components
7. **Validate early**: Check props before rendering
8. **Generate docs**: Auto-generate reference
9. **Test schemas**: Ensure validation works
10. **Version control**: Track schema changes

## API Reference

### `getComponentPropSchema(componentName: string): ComponentPropSchema | undefined`

Get the complete prop schema for a component.

### `getAllComponentPropSchemas(): Record<string, ComponentPropSchema>`

Get all component prop schemas.

### `getComponentPropDefinition(componentName: string, propName: string): PropDefinition | undefined`

Get the definition for a specific prop.

### `validateComponentProps(componentName: string, props: Record<string, any>): { valid: boolean; errors: string[] }`

Validate component props against the schema.

### `getComponentsByCategory(category: string): string[]`

Get all components in a specific category.

## Conclusion

Component prop definitions in features.json provide:
- **Type safety** without TypeScript
- **Runtime validation** to catch errors
- **Self-documenting** component APIs
- **Design system** consistency
- **Better developer experience**

With component props, features.json becomes a complete design system definition, enabling robust, validated, configuration-driven UI development!
