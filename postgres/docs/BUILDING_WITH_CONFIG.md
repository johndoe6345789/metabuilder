# Building Apps with features.json

**With a good enough features.json, you could build half the app with it!**

This example demonstrates how the enhanced configuration system enables declarative application building.

## Complete CRUD Interface Generator

```typescript
import {
  getFormSchema,
  getTableLayout,
  getTableFeatures,
  getColumnLayout,
  getColumnFeatures,
  getColumnTranslation,
  getActionTranslation,
  getApiEndpoints,
  getPermissions,
  getRelationships,
  getUiViews,
  hasPermission,
} from '@/utils/featureConfig';

/**
 * Generates a complete CRUD interface from configuration
 * This demonstrates how features.json can drive application generation
 */
export function generateCRUDInterface(
  resourceName: string,
  locale: 'en' | 'fr' = 'en',
  userRole: string = 'user'
) {
  // Get all configurations
  const formSchema = getFormSchema(resourceName);
  const tableLayout = getTableLayout(resourceName);
  const tableFeatures = getTableFeatures(resourceName);
  const apiEndpoints = getApiEndpoints(resourceName);
  const permissions = getPermissions(resourceName);
  const relationships = getRelationships(resourceName);
  const uiViews = getUiViews(resourceName);

  // Build column definitions
  const columns = tableLayout?.columns.map(columnName => {
    const layout = getColumnLayout(columnName);
    const features = getColumnFeatures(columnName);
    const label = getColumnTranslation(columnName, locale) || columnName;

    return {
      field: columnName,
      label,
      width: tableLayout.columnWidths[columnName],
      align: layout?.align || 'left',
      format: layout?.format || 'text',
      editable: layout?.editable ?? true,
      sortable: features?.sortable ?? true,
      filterable: features?.filterable ?? true,
      searchable: features?.searchable ?? true,
      hidden: tableLayout.hiddenColumns?.includes(columnName) ?? false,
      frozen: tableLayout.frozenColumns?.includes(columnName) ?? false,
    };
  });

  // Build action buttons with permission checks
  const actions = tableFeatures?.allowedActions
    .filter(action => hasPermission(resourceName, action, userRole))
    .map(action => ({
      name: action,
      label: getActionTranslation(action, locale),
      endpoint: apiEndpoints?.[action],
      permitted: true,
    }));

  // Build form configuration
  const form = formSchema ? {
    fields: formSchema.fields.map(field => ({
      ...field,
      label: getColumnTranslation(field.name, locale) || field.label,
    })),
    submitLabel: formSchema.submitLabel,
    cancelLabel: formSchema.cancelLabel,
  } : null;

  // Build complete interface configuration
  return {
    resource: resourceName,
    locale,
    userRole,
    
    // List view
    list: {
      component: uiViews?.list?.component || 'DataGrid',
      columns,
      actions: actions?.filter(a => a.name === 'create'),
      features: {
        pagination: tableFeatures?.enablePagination ?? true,
        search: tableFeatures?.enableSearch ?? true,
        filters: tableFeatures?.enableFilters ?? true,
        export: tableFeatures?.enableExport ?? false,
        rowsPerPage: tableFeatures?.rowsPerPage || 25,
      },
      sorting: tableLayout?.defaultSort,
      api: apiEndpoints?.list,
    },

    // Detail view
    detail: {
      component: uiViews?.detail?.component || 'DetailView',
      columns,
      actions: actions?.filter(a => ['update', 'delete'].includes(a.name)),
      relationships: relationships,
      tabs: uiViews?.detail?.tabs || ['info'],
      api: apiEndpoints?.get,
    },

    // Create form
    create: {
      component: uiViews?.create?.component || 'FormDialog',
      form,
      api: apiEndpoints?.create,
      redirect: uiViews?.create?.redirect || 'list',
      enabled: hasPermission(resourceName, 'create', userRole),
    },

    // Edit form
    edit: {
      component: uiViews?.edit?.component || 'FormDialog',
      form,
      api: apiEndpoints?.update,
      redirect: uiViews?.edit?.redirect || 'detail',
      enabled: hasPermission(resourceName, 'update', userRole),
    },

    // Delete confirmation
    delete: {
      component: 'ConfirmDialog',
      api: apiEndpoints?.delete,
      enabled: hasPermission(resourceName, 'delete', userRole),
    },

    permissions,
    relationships,
  };
}

// Usage example
const usersInterface = generateCRUDInterface('users', 'en', 'admin');
console.log(usersInterface);
```

## Auto-Generated Form Component

```typescript
import { getFormSchema, getValidationRule } from '@/utils/featureConfig';

export function renderForm(resourceName: string) {
  const schema = getFormSchema(resourceName);
  
  if (!schema) return null;

  return schema.fields.map(field => {
    const validationRule = field.validation 
      ? getValidationRule(field.validation) 
      : null;

    return {
      name: field.name,
      type: field.type,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      validation: validationRule,
      
      // Field-specific props
      ...(field.type === 'select' && { options: field.options }),
      ...(field.type === 'number' && { 
        min: field.min, 
        max: field.max, 
        step: field.step,
        prefix: field.prefix,
        suffix: field.suffix,
      }),
      ...(field.type === 'text' && { 
        minLength: field.minLength,
        maxLength: field.maxLength,
      }),
      ...(field.type === 'textarea' && { rows: field.rows }),
      ...(field.type === 'checkbox' && { defaultValue: field.defaultValue }),
    };
  });
}
```

## Auto-Generated API Routes

```typescript
import { getApiEndpoint } from '@/utils/featureConfig';

export function makeApiCall(
  resourceName: string,
  action: string,
  data?: any,
  params?: Record<string, string>
) {
  const endpoint = getApiEndpoint(resourceName, action);
  
  if (!endpoint) {
    throw new Error(`Endpoint not found: ${resourceName}.${action}`);
  }

  // Replace path parameters
  let path = endpoint.path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }

  // Make the API call
  return fetch(path, {
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(data && { body: JSON.stringify(data) }),
  });
}

// Usage
await makeApiCall('users', 'list');
await makeApiCall('users', 'get', null, { id: '123' });
await makeApiCall('users', 'create', { name: 'John', email: 'john@example.com' });
await makeApiCall('users', 'update', { name: 'Jane' }, { id: '123' });
await makeApiCall('users', 'delete', null, { id: '123' });
```

## Permission-Based UI Rendering

```typescript
import { hasPermission, getPermissions } from '@/utils/featureConfig';

export function renderResourceActions(
  resourceName: string,
  userRole: string
) {
  const permissions = getPermissions(resourceName);
  
  const actions = [
    {
      name: 'create',
      label: 'Create New',
      icon: 'Add',
      visible: hasPermission(resourceName, 'create', userRole),
    },
    {
      name: 'update',
      label: 'Edit',
      icon: 'Edit',
      visible: hasPermission(resourceName, 'update', userRole),
    },
    {
      name: 'delete',
      label: 'Delete',
      icon: 'Delete',
      visible: hasPermission(resourceName, 'delete', userRole),
    },
  ];

  return actions.filter(action => action.visible);
}

// Usage in React component
function UsersList({ userRole }: { userRole: string }) {
  const actions = renderResourceActions('users', userRole);
  
  return (
    <div>
      {actions.map(action => (
        <Button key={action.name} startIcon={<Icon>{action.icon}</Icon>}>
          {action.label}
        </Button>
      ))}
    </div>
  );
}
```

## Relationship-Based Data Loading

```typescript
import { getRelationships, getApiEndpoint } from '@/utils/featureConfig';

export async function loadResourceWithRelations(
  resourceName: string,
  resourceId: string
) {
  const relationships = getRelationships(resourceName);
  const endpoint = getApiEndpoint(resourceName, 'get');

  // Load main resource
  const mainData = await fetch(
    endpoint!.path.replace(':id', resourceId)
  ).then(r => r.json());

  // Load related resources
  const relatedData: Record<string, any> = {};

  if (relationships?.hasMany) {
    for (const relation of relationships.hasMany) {
      const relationEndpoint = getApiEndpoint(relation, 'list');
      if (relationEndpoint) {
        relatedData[relation] = await fetch(
          `${relationEndpoint.path}?${resourceName}_id=${resourceId}`
        ).then(r => r.json());
      }
    }
  }

  if (relationships?.belongsTo) {
    for (const relation of relationships.belongsTo) {
      const relationId = mainData[`${relation}_id`];
      if (relationId) {
        const relationEndpoint = getApiEndpoint(relation, 'get');
        if (relationEndpoint) {
          relatedData[relation] = await fetch(
            relationEndpoint.path.replace(':id', relationId)
          ).then(r => r.json());
        }
      }
    }
  }

  return {
    ...mainData,
    _relations: relatedData,
  };
}

// Usage
const userWithRelations = await loadResourceWithRelations('users', '123');
// Returns: { id: 123, name: 'John', _relations: { orders: [...], reviews: [...] } }
```

## Complete Page Generator

```typescript
import { generateCRUDInterface } from './crudGenerator';

/**
 * Generates an entire CRUD page from configuration
 * This is the ultimate example of configuration-driven development
 */
export function generateResourcePage(
  resourceName: string,
  locale: 'en' | 'fr',
  userRole: string
) {
  const config = generateCRUDInterface(resourceName, locale, userRole);

  return {
    // Page metadata
    title: `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} Management`,
    breadcrumbs: ['Home', 'Admin', resourceName],
    
    // Layout
    layout: 'AdminLayout',
    
    // Components to render
    components: [
      {
        type: config.list.component,
        props: {
          columns: config.list.columns,
          api: config.list.api,
          features: config.list.features,
          actions: config.list.actions,
          sorting: config.list.sorting,
        },
      },
      
      config.create.enabled && {
        type: config.create.component,
        props: {
          fields: config.create.form?.fields,
          submitLabel: config.create.form?.submitLabel,
          cancelLabel: config.create.form?.cancelLabel,
          api: config.create.api,
          redirect: config.create.redirect,
        },
      },
      
      config.edit.enabled && {
        type: config.edit.component,
        props: {
          fields: config.edit.form?.fields,
          api: config.edit.api,
          redirect: config.edit.redirect,
        },
      },
      
      config.delete.enabled && {
        type: config.delete.component,
        props: {
          api: config.delete.api,
        },
      },
    ].filter(Boolean),
    
    // Data loading
    dataLoader: async () => {
      const response = await fetch(config.list.api!.path);
      return response.json();
    },
    
    // Permissions
    requiredRole: userRole,
    permissions: config.permissions,
  };
}

// Generate entire pages from configuration
const usersPage = generateResourcePage('users', 'en', 'admin');
const productsPage = generateResourcePage('products', 'fr', 'editor');
```

## Benefits of Configuration-Driven Architecture

1. **Rapid Development**: Add new resources by just updating JSON
2. **Consistency**: All CRUD interfaces follow the same patterns
3. **Maintainability**: Changes to one config affect all resources
4. **Type Safety**: TypeScript types ensure config validity
5. **Testability**: Easy to test configuration vs. hardcoded logic
6. **Internationalization**: Built-in translation support
7. **Permission Management**: Centralized access control
8. **API Documentation**: Config serves as API documentation
9. **UI Generation**: Automatic form and table generation
10. **Flexibility**: Override defaults when needed

## What You Can Build from features.json

- ✅ Complete CRUD interfaces
- ✅ Forms with validation
- ✅ Data tables with sorting, filtering, pagination
- ✅ API routes and endpoints
- ✅ Permission-based UI
- ✅ Relationship loading
- ✅ Multi-language support
- ✅ Navigation menus
- ✅ Admin panels
- ✅ Resource management pages

**Truly, with a good features.json, you can build half the app!**
