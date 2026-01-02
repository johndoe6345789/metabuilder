# CSS Database Schema

This document describes how CSS/SCSS styling is structured for database storage in the MetaBuilder system.

## Overview

The MetaBuilder system allows CSS to be stored in the database and edited through the CSS Designer package. This enables dynamic theming and real-time style updates without redeployment.

## Styles JSON Structure

Each package can include a `seed/styles.json` file containing CSS rules that will be loaded into the database.

### Style Entry Format

```json
{
  "id": "unique_style_id",
  "type": "global|component|utility|animation",
  "category": "descriptive-category",
  "className": "css-class-name",
  "description": "Human-readable description",
  "priority": 1,
  "css": "actual CSS code here"
}
```

### Field Descriptions

- **id**: Unique identifier for the style entry
- **type**: Style type classification
  - `global`: Global styles (theme variables, resets, base styles)
  - `component`: Component-specific styles
  - `utility`: Reusable utility classes
  - `animation`: Animation keyframes and classes
- **category**: Categorization for organization (e.g., "theme-variables", "layout", "typography")
- **className**: Optional CSS class name for component/utility styles
- **description**: Human-readable description of the style's purpose
- **priority**: Optional numeric priority for style loading order (lower = earlier)
- **css**: The actual CSS code as a string

## Database Schema

### Table: `styles`

```sql
CREATE TABLE styles (
  id VARCHAR(255) PRIMARY KEY,
  package_id VARCHAR(255) NOT NULL,
  type ENUM('global', 'component', 'utility', 'animation') NOT NULL,
  category VARCHAR(100),
  class_name VARCHAR(255),
  description TEXT,
  priority INT DEFAULT 100,
  css TEXT NOT NULL,
  compiled_css TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  INDEX idx_package_type (package_id, type),
  INDEX idx_enabled (enabled),
  INDEX idx_priority (priority)
);
```

### Table: `style_variables`

Stores CSS custom properties that can be edited through the CSS Designer.

```sql
CREATE TABLE style_variables (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value VARCHAR(500) NOT NULL,
  type ENUM('color', 'size', 'font', 'number', 'string') NOT NULL,
  category VARCHAR(100),
  description TEXT,
  default_value VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_name (name),
  INDEX idx_category (category)
);
```

## Loading Styles

### Priority-Based Loading

Styles are loaded in priority order:
1. Global theme variables (priority 1-10)
2. Global base styles (priority 11-50)
3. Component styles (priority 51-100)
4. Utility classes (priority 101-150)
5. Animations (priority 151-200)

### Runtime Loading

```javascript
// Example: Load styles from database
async function loadStyles(packageId) {
  const styles = await db.query(`
    SELECT css FROM styles
    WHERE package_id = ? AND enabled = true
    ORDER BY priority ASC, id ASC
  `, [packageId]);

  const styleSheet = styles.map(s => s.css).join('\n\n');
  return styleSheet;
}
```

### Live CSS Injection

```javascript
// Inject styles into the page
function injectStyles(styleId, css) {
  let styleEl = document.getElementById(styleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}
```

## CSS Designer Integration

The CSS Designer package allows editing CSS through a GUI:

1. **Color Palette Editor**: Edit CSS custom properties for colors
2. **Typography Editor**: Modify font families and sizes
3. **Spacing Editor**: Adjust spacing and sizing variables
4. **Live Preview**: Real-time preview of changes
5. **Export Options**:
   - Save to database
   - Export as CSS file
   - Export as SCSS file
   - Export as CSS-in-JS

### Workflow

```
User edits in CSS Designer
  → Changes saved to style_variables table
  → CSS regenerated from template + variables
  → Updated in styles table
  → Live-injected into running application
  → Optional: Export to static files
```

## Example: Theme Customization

### 1. Edit Color Variable

```javascript
// Update a color variable
await db.query(`
  UPDATE style_variables
  SET value = ?
  WHERE name = '--primary'
`, ['oklch(0.55 0.20 270)']);
```

### 2. Regenerate CSS

```javascript
// Template with variables
const cssTemplate = `
:root {
  --primary: {{primary}};
  --background: {{background}};
}
`;

// Substitute variables
const variables = await db.query('SELECT name, value FROM style_variables');
let css = cssTemplate;
variables.forEach(v => {
  css = css.replace(`{{${v.name.replace('--', '')}}}`, v.value);
});
```

### 3. Update and Inject

```javascript
// Update database
await db.query(`
  UPDATE styles
  SET css = ?, compiled_css = ?
  WHERE id = 'global_theme'
`, [css, css]);

// Inject into page
injectStyles('global-theme', css);
```

## Migration from Static CSS

To migrate existing CSS files to the database:

1. Parse CSS file
2. Split into logical chunks (global, component, utility)
3. Generate style entries with appropriate metadata
4. Insert into database via seed files
5. Verify styles load correctly
6. Optional: Remove static CSS files

## Best Practices

1. **Modular Styles**: Keep styles focused and modular
2. **Use Variables**: Use CSS custom properties for values that might change
3. **Descriptive IDs**: Use clear, descriptive IDs for style entries
4. **Categories**: Properly categorize styles for easy management
5. **Priority Management**: Set appropriate priorities for load order
6. **Performance**: Consider bundling related styles
7. **Versioning**: Track style changes for rollback capability

## Future Enhancements

- **Style Versioning**: Track changes and allow rollback
- **Theme Presets**: Save complete theme configurations
- **A/B Testing**: Test different styles with different user groups
- **CSS Preprocessing**: Support SCSS/LESS compilation
- **CSS Minification**: Automatic minification for production
- **Hot Reload**: Real-time style updates in development
