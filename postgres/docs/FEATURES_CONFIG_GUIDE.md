# Features Configuration Guide

This guide explains how to use the enhanced `features.json` configuration system.

**With a good enough features.json, you could build half the app with it!**

The system now supports comprehensive declarative configuration for:
- ✅ **Translations** (i18n) for features, actions, tables, and columns
- ✅ **Action Namespaces** - Mapping UI actions to function names
- ✅ **Table Layouts** - Column ordering, widths, sorting, and visibility
- ✅ **Column Layouts** - Alignment, formatting, and editability
- ✅ **Table Features** - Pagination, search, export, and filters
- ✅ **Column Features** - Searchability, sortability, and validation
- ✅ **Component Layouts** - UI component display settings

## Quick Start

```typescript
import {
  getFeatureTranslation,
  getActionFunctionName,
  getTableLayout,
  getTableFeatures,
  getComponentLayout
} from '@/utils/featureConfig';

// Get translated feature name
const feature = getFeatureTranslation('database-crud', 'en');
// { name: "Database CRUD Operations", description: "..." }

// Get action function name
const handler = getActionFunctionName('database-crud', 'create');
// "createRecord"

// Get table configuration
const layout = getTableLayout('users');
// { columns: [...], columnWidths: {...}, defaultSort: {...} }
```

## Complete API Reference

See the full configuration API at the end of this document.

## Building an App from Configuration

The enhanced features.json enables you to build complex UIs declaratively:

```typescript
// Example: Auto-generate a complete CRUD interface
function generateCRUDInterface(tableName: string, locale = 'en') {
  const layout = getTableLayout(tableName);
  const features = getTableFeatures(tableName);
  const tableTranslation = getTableTranslation(tableName, locale);
  
  return {
    title: tableTranslation?.name,
    columns: layout?.columns.map(col => ({
      field: col,
      label: getColumnTranslation(col, locale),
      ...getColumnLayout(col),
      ...getColumnFeatures(col)
    })),
    actions: features?.allowedActions.map(action => ({
      name: action,
      label: getActionTranslation(action, locale),
      handler: getActionFunctionName('database-crud', action)
    })),
    settings: features
  };
}
```

## API Functions

### Translations
- `getTranslations(locale?)` - Get all translations
- `getFeatureTranslation(featureId, locale?)` - Feature name/description
- `getActionTranslation(actionName, locale?)` - Action label
- `getTableTranslation(tableName, locale?)` - Table name/description
- `getColumnTranslation(columnName, locale?)` - Column label

### Actions
- `getActionFunctionName(featureId, actionName)` - Get handler function name

### Layouts
- `getTableLayout(tableName)` - Table display config
- `getColumnLayout(columnName)` - Column display config
- `getComponentLayout(componentName)` - Component config

### Features
- `getTableFeatures(tableName)` - Table capabilities
- `getColumnFeatures(columnName)` - Column capabilities
- `getFeatures()` - All enabled features
- `getFeatureById(id)` - Specific feature
- `getNavItems()` - Navigation items

### Other
- `getDataTypes()` - Database data types
- `getConstraintTypes()` - Constraint types
- `getQueryOperators()` - Query operators
- `getIndexTypes()` - Index types
