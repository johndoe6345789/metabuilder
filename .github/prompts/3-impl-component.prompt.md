# Add Declarative Component

Add a new component using the declarative pattern (not hardcoded TSX):

1. **Define in package** `packages/{pkg}/seed/components.json`:
```json
{
  "type": "MyComponent",
  "category": "ui",
  "label": "My Component",
  "props": [
    { "name": "title", "type": "string", "required": true }
  ],
  "config": {
    "layout": "vertical",
    "styling": { "className": "myComponentRoot" }
  }
}
```

Note: `styling.className` should reference a real CSS class (SCSS/modules), not Tailwind utility classes.

2. **Register** via `DeclarativeComponentRenderer.registerComponentConfig()`

3. **Render** using `<RenderComponent component={...} />`

Keep components under 150 LOC. Use composition for complex UIs.
