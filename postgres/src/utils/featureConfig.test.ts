import { describe, expect, it } from 'vitest';
import {
  getConstraintTypes,
  getDataTypes,
  getEnabledFeaturesByPriority,
  getFeatureById,
  getFeatures,
  getNavItems,
  getTranslations,
  getFeatureTranslation,
  getActionTranslation,
  getTableTranslation,
  getColumnTranslation,
  getActionFunctionName,
  getTableLayout,
  getColumnLayout,
  getTableFeatures,
  getColumnFeatures,
  getComponentLayout,
  getFormSchema,
  getValidationRule,
  getApiEndpoints,
  getApiEndpoint,
  getPermissions,
  hasPermission,
  getRelationships,
  getUiViews,
  getUiView,
  getComponentTree,
  getAllComponentTrees,
  getComponentPropSchema,
  getAllComponentPropSchemas,
  getComponentPropDefinition,
  validateComponentProps,
  getComponentsByCategory,
} from './featureConfig';

describe('FeatureConfig', () => {
  describe('getFeatures', () => {
    it('should return only enabled features', () => {
      const features = getFeatures();
      
      expect(features).toBeDefined();
      expect(Array.isArray(features)).toBe(true);
      
      // All returned features should be enabled
      features.forEach(feature => {
        expect(feature.enabled).toBe(true);
      });
    });

    it('should return features with required properties', () => {
      const features = getFeatures();
      
      features.forEach(feature => {
        expect(feature).toHaveProperty('id');
        expect(feature).toHaveProperty('name');
        expect(feature).toHaveProperty('description');
        expect(feature).toHaveProperty('enabled');
        expect(feature).toHaveProperty('priority');
        expect(feature).toHaveProperty('endpoints');
        expect(feature).toHaveProperty('ui');
      });
    });

    it('should return features with valid UI configuration', () => {
      const features = getFeatures();
      
      features.forEach(feature => {
        expect(feature.ui).toHaveProperty('showInNav');
        expect(feature.ui).toHaveProperty('icon');
        expect(feature.ui).toHaveProperty('actions');
        expect(Array.isArray(feature.ui.actions)).toBe(true);
      });
    });
  });

  describe('getFeatureById', () => {
    it('should return feature when ID exists and is enabled', () => {
      const feature = getFeatureById('database-crud');
      
      expect(feature).toBeDefined();
      expect(feature?.id).toBe('database-crud');
      expect(feature?.enabled).toBe(true);
    });

    it('should return feature for table-management', () => {
      const feature = getFeatureById('table-management');
      
      expect(feature).toBeDefined();
      expect(feature?.id).toBe('table-management');
      expect(feature?.name).toBe('Table Management');
    });

    it('should return feature for column-management', () => {
      const feature = getFeatureById('column-management');
      
      expect(feature).toBeDefined();
      expect(feature?.id).toBe('column-management');
      expect(feature?.name).toBe('Column Management');
    });

    it('should return feature for sql-query', () => {
      const feature = getFeatureById('sql-query');
      
      expect(feature).toBeDefined();
      expect(feature?.id).toBe('sql-query');
      expect(feature?.name).toBe('SQL Query Interface');
    });

    it('should return undefined for non-existent feature ID', () => {
      const feature = getFeatureById('non-existent-feature');
      
      expect(feature).toBeUndefined();
    });

    it('should return undefined for disabled feature', () => {
      // This test assumes there might be disabled features in the config
      const features = getFeatures();
      const _enabledIds = features.map(f => f.id);

      // Try to get a feature that doesn't exist in enabled list
      const disabledFeature = getFeatureById('disabled-test-feature');
      expect(disabledFeature).toBeUndefined();
    });
  });

  describe('getDataTypes', () => {
    it('should return array of data types', () => {
      const dataTypes = getDataTypes();
      
      expect(dataTypes).toBeDefined();
      expect(Array.isArray(dataTypes)).toBe(true);
      expect(dataTypes.length).toBeGreaterThan(0);
    });

    it('should return data types with required properties', () => {
      const dataTypes = getDataTypes();
      
      dataTypes.forEach(dataType => {
        expect(dataType).toHaveProperty('name');
        expect(dataType).toHaveProperty('category');
        expect(dataType).toHaveProperty('requiresLength');
        expect(typeof dataType.name).toBe('string');
        expect(typeof dataType.category).toBe('string');
        expect(typeof dataType.requiresLength).toBe('boolean');
      });
    });

    it('should include common PostgreSQL data types', () => {
      const dataTypes = getDataTypes();
      const typeNames = dataTypes.map(dt => dt.name);
      
      // Check for essential PostgreSQL types
      expect(typeNames).toContain('INTEGER');
      expect(typeNames).toContain('VARCHAR');
      expect(typeNames).toContain('TEXT');
      expect(typeNames).toContain('BOOLEAN');
      expect(typeNames).toContain('TIMESTAMP');
    });

    it('should have VARCHAR with requiresLength = true', () => {
      const dataTypes = getDataTypes();
      const varchar = dataTypes.find(dt => dt.name === 'VARCHAR');
      
      expect(varchar).toBeDefined();
      expect(varchar?.requiresLength).toBe(true);
      expect(varchar?.defaultLength).toBeDefined();
    });

    it('should have INTEGER with requiresLength = false', () => {
      const dataTypes = getDataTypes();
      const integer = dataTypes.find(dt => dt.name === 'INTEGER');
      
      expect(integer).toBeDefined();
      expect(integer?.requiresLength).toBe(false);
    });

    it('should categorize data types correctly', () => {
      const dataTypes = getDataTypes();
      
      const integer = dataTypes.find(dt => dt.name === 'INTEGER');
      expect(integer?.category).toBe('numeric');
      
      const varchar = dataTypes.find(dt => dt.name === 'VARCHAR');
      expect(varchar?.category).toBe('text');
      
      const boolean = dataTypes.find(dt => dt.name === 'BOOLEAN');
      expect(boolean?.category).toBe('boolean');
    });
  });

  describe('getNavItems', () => {
    it('should return array of navigation items', () => {
      const navItems = getNavItems();
      
      expect(navItems).toBeDefined();
      expect(Array.isArray(navItems)).toBe(true);
    });

    it('should return nav items with required properties', () => {
      const navItems = getNavItems();
      
      navItems.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('featureId');
      });
    });

    it('should only return nav items for enabled features', () => {
      const navItems = getNavItems();
      
      navItems.forEach(item => {
        const feature = getFeatureById(item.featureId);
        expect(feature).toBeDefined();
        expect(feature?.enabled).toBe(true);
      });
    });

    it('should include Tables nav item', () => {
      const navItems = getNavItems();
      const tablesItem = navItems.find(item => item.id === 'tables');
      
      expect(tablesItem).toBeDefined();
      expect(tablesItem?.featureId).toBe('database-crud');
    });

    it('should include SQL Query nav item', () => {
      const navItems = getNavItems();
      const queryItem = navItems.find(item => item.id === 'query');
      
      expect(queryItem).toBeDefined();
      expect(queryItem?.featureId).toBe('sql-query');
    });

    it('should include Table Manager nav item', () => {
      const navItems = getNavItems();
      const tableManagerItem = navItems.find(item => item.id === 'table-manager');
      
      expect(tableManagerItem).toBeDefined();
      expect(tableManagerItem?.featureId).toBe('table-management');
    });
  });

  describe('getEnabledFeaturesByPriority', () => {
    it('should return features with high priority', () => {
      const highPriorityFeatures = getEnabledFeaturesByPriority('high');
      
      expect(Array.isArray(highPriorityFeatures)).toBe(true);
      
      highPriorityFeatures.forEach(feature => {
        expect(feature.priority).toBe('high');
        expect(feature.enabled).toBe(true);
      });
    });

    it('should return all enabled features have high priority', () => {
      const highPriorityFeatures = getEnabledFeaturesByPriority('high');
      
      // All current features should have high priority
      expect(highPriorityFeatures.length).toBeGreaterThan(0);
      
      const ids = highPriorityFeatures.map(f => f.id);
      expect(ids).toContain('database-crud');
      expect(ids).toContain('table-management');
      expect(ids).toContain('column-management');
      expect(ids).toContain('sql-query');
    });

    it('should return empty array for non-existent priority', () => {
      const features = getEnabledFeaturesByPriority('non-existent-priority');
      
      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBe(0);
    });

    it('should return empty array for low priority (if none exist)', () => {
      const lowPriorityFeatures = getEnabledFeaturesByPriority('low');
      
      expect(Array.isArray(lowPriorityFeatures)).toBe(true);
      // Expecting 0 since current config has all high priority
      expect(lowPriorityFeatures.length).toBe(0);
    });
  });

  describe('getConstraintTypes', () => {
    it('should return array of constraint types', () => {
      const constraintTypes = getConstraintTypes();
      
      expect(Array.isArray(constraintTypes)).toBe(true);
    });

    it('should return constraint types with required properties', () => {
      const constraintTypes = getConstraintTypes();
      
      constraintTypes.forEach(constraintType => {
        expect(constraintType).toHaveProperty('name');
        expect(constraintType).toHaveProperty('description');
        expect(constraintType).toHaveProperty('requiresColumn');
        expect(constraintType).toHaveProperty('requiresExpression');
        expect(typeof constraintType.name).toBe('string');
        expect(typeof constraintType.description).toBe('string');
        expect(typeof constraintType.requiresColumn).toBe('boolean');
        expect(typeof constraintType.requiresExpression).toBe('boolean');
      });
    });

    it('should include PRIMARY KEY constraint type', () => {
      const constraintTypes = getConstraintTypes();
      const primaryKeyConstraint = constraintTypes.find(ct => ct.name === 'PRIMARY KEY');
      
      expect(primaryKeyConstraint).toBeDefined();
      expect(primaryKeyConstraint?.requiresColumn).toBe(true);
      expect(primaryKeyConstraint?.requiresExpression).toBe(false);
    });

    it('should include UNIQUE constraint type', () => {
      const constraintTypes = getConstraintTypes();
      const uniqueConstraint = constraintTypes.find(ct => ct.name === 'UNIQUE');
      
      expect(uniqueConstraint).toBeDefined();
      expect(uniqueConstraint?.requiresColumn).toBe(true);
      expect(uniqueConstraint?.requiresExpression).toBe(false);
    });

    it('should include CHECK constraint type', () => {
      const constraintTypes = getConstraintTypes();
      const checkConstraint = constraintTypes.find(ct => ct.name === 'CHECK');
      
      expect(checkConstraint).toBeDefined();
      expect(checkConstraint?.requiresColumn).toBe(false);
      expect(checkConstraint?.requiresExpression).toBe(true);
    });
  });

  describe('Feature endpoints', () => {
    it('should have valid endpoint structure for database-crud', () => {
      const feature = getFeatureById('database-crud');
      
      expect(feature?.endpoints).toBeDefined();
      expect(Array.isArray(feature?.endpoints)).toBe(true);
      expect(feature?.endpoints.length).toBeGreaterThan(0);
      
      feature?.endpoints.forEach(endpoint => {
        expect(endpoint).toHaveProperty('path');
        expect(endpoint).toHaveProperty('methods');
        expect(endpoint).toHaveProperty('description');
        expect(endpoint.path).toMatch(/^\/api\//);
      });
    });

    it('should have valid endpoint structure for table-management', () => {
      const feature = getFeatureById('table-management');
      
      expect(feature?.endpoints).toBeDefined();
      const tableManageEndpoint = feature?.endpoints.find(
        ep => ep.path === '/api/admin/table-manage'
      );
      
      expect(tableManageEndpoint).toBeDefined();
      expect(tableManageEndpoint?.methods).toContain('POST');
      expect(tableManageEndpoint?.methods).toContain('DELETE');
    });

    it('should have valid endpoint structure for column-management', () => {
      const feature = getFeatureById('column-management');
      
      expect(feature?.endpoints).toBeDefined();
      const columnManageEndpoint = feature?.endpoints.find(
        ep => ep.path === '/api/admin/column-manage'
      );
      
      expect(columnManageEndpoint).toBeDefined();
      expect(columnManageEndpoint?.methods).toContain('POST');
      expect(columnManageEndpoint?.methods).toContain('PUT');
      expect(columnManageEndpoint?.methods).toContain('DELETE');
    });
  });

  describe('Feature UI configuration', () => {
    it('should have correct UI actions for database-crud', () => {
      const feature = getFeatureById('database-crud');
      
      expect(feature?.ui.actions).toContain('create');
      expect(feature?.ui.actions).toContain('read');
      expect(feature?.ui.actions).toContain('update');
      expect(feature?.ui.actions).toContain('delete');
    });

    it('should have correct UI actions for table-management', () => {
      const feature = getFeatureById('table-management');
      
      expect(feature?.ui.actions).toContain('create');
      expect(feature?.ui.actions).toContain('delete');
    });

    it('should have correct UI actions for column-management', () => {
      const feature = getFeatureById('column-management');
      
      expect(feature?.ui.actions).toContain('add');
      expect(feature?.ui.actions).toContain('modify');
      expect(feature?.ui.actions).toContain('delete');
    });

    it('should all features have showInNav in UI config', () => {
      const features = getFeatures();
      
      features.forEach(feature => {
        expect(typeof feature.ui.showInNav).toBe('boolean');
      });
    });
  });

  describe('getTranslations', () => {
    it('should return English translations by default', () => {
      const translations = getTranslations();
      
      expect(translations).toBeDefined();
      expect(translations).toHaveProperty('features');
      expect(translations).toHaveProperty('actions');
      expect(translations).toHaveProperty('tables');
      expect(translations).toHaveProperty('columns');
    });

    it('should return French translations when locale is fr', () => {
      const translations = getTranslations('fr');
      
      expect(translations).toBeDefined();
      expect(translations).toHaveProperty('features');
      expect(translations).toHaveProperty('actions');
    });
  });

  describe('getFeatureTranslation', () => {
    it('should return English translation for database-crud', () => {
      const translation = getFeatureTranslation('database-crud', 'en');
      
      expect(translation).toBeDefined();
      expect(translation?.name).toBe('Database CRUD Operations');
      expect(translation?.description).toContain('Create, read, update, and delete');
    });

    it('should return French translation for database-crud', () => {
      const translation = getFeatureTranslation('database-crud', 'fr');
      
      expect(translation).toBeDefined();
      expect(translation?.name).toBe('Opérations CRUD de base de données');
    });

    it('should return undefined for non-existent feature', () => {
      const translation = getFeatureTranslation('non-existent', 'en');
      
      expect(translation).toBeUndefined();
    });
  });

  describe('getActionTranslation', () => {
    it('should return English translation for create action', () => {
      const translation = getActionTranslation('create', 'en');
      
      expect(translation).toBe('Create');
    });

    it('should return French translation for create action', () => {
      const translation = getActionTranslation('create', 'fr');
      
      expect(translation).toBe('Créer');
    });

    it('should return English translation for delete action', () => {
      const translation = getActionTranslation('delete', 'en');
      
      expect(translation).toBe('Delete');
    });

    it('should return French translation for delete action', () => {
      const translation = getActionTranslation('delete', 'fr');
      
      expect(translation).toBe('Supprimer');
    });
  });

  describe('getTableTranslation', () => {
    it('should return English translation for users table', () => {
      const translation = getTableTranslation('users', 'en');
      
      expect(translation).toBeDefined();
      expect(translation?.name).toBe('Users');
      expect(translation?.description).toBe('User accounts and profiles');
    });

    it('should return French translation for users table', () => {
      const translation = getTableTranslation('users', 'fr');
      
      expect(translation).toBeDefined();
      expect(translation?.name).toBe('Utilisateurs');
    });
  });

  describe('getColumnTranslation', () => {
    it('should return English translation for name column', () => {
      const translation = getColumnTranslation('name', 'en');
      
      expect(translation).toBe('Name');
    });

    it('should return French translation for name column', () => {
      const translation = getColumnTranslation('name', 'fr');
      
      expect(translation).toBe('Nom');
    });

    it('should return English translation for email column', () => {
      const translation = getColumnTranslation('email', 'en');
      
      expect(translation).toBe('Email');
    });
  });

  describe('getActionFunctionName', () => {
    it('should return function name for database-crud create action', () => {
      const functionName = getActionFunctionName('database-crud', 'create');
      
      expect(functionName).toBe('createRecord');
    });

    it('should return function name for table-management create action', () => {
      const functionName = getActionFunctionName('table-management', 'create');
      
      expect(functionName).toBe('createTable');
    });

    it('should return function name for column-management add action', () => {
      const functionName = getActionFunctionName('column-management', 'add');
      
      expect(functionName).toBe('addColumn');
    });

    it('should return undefined for non-existent feature', () => {
      const functionName = getActionFunctionName('non-existent', 'create');
      
      expect(functionName).toBeUndefined();
    });
  });

  describe('getTableLayout', () => {
    it('should return layout configuration for users table', () => {
      const layout = getTableLayout('users');
      
      expect(layout).toBeDefined();
      expect(layout?.columns).toContain('id');
      expect(layout?.columns).toContain('name');
      expect(layout?.columns).toContain('email');
      expect(layout?.columnWidths).toHaveProperty('id');
      expect(layout?.defaultSort).toHaveProperty('column');
      expect(layout?.defaultSort).toHaveProperty('direction');
    });

    it('should return layout configuration for products table', () => {
      const layout = getTableLayout('products');
      
      expect(layout).toBeDefined();
      expect(layout?.columns).toContain('id');
      expect(layout?.columns).toContain('name');
      expect(layout?.defaultSort.column).toBe('name');
      expect(layout?.defaultSort.direction).toBe('asc');
    });

    it('should return undefined for non-existent table', () => {
      const layout = getTableLayout('non-existent');
      
      expect(layout).toBeUndefined();
    });
  });

  describe('getColumnLayout', () => {
    it('should return layout configuration for id column', () => {
      const layout = getColumnLayout('id');
      
      expect(layout).toBeDefined();
      expect(layout?.align).toBe('left');
      expect(layout?.format).toBe('number');
      expect(layout?.editable).toBe(false);
    });

    it('should return layout configuration for email column', () => {
      const layout = getColumnLayout('email');
      
      expect(layout).toBeDefined();
      expect(layout?.align).toBe('left');
      expect(layout?.format).toBe('email');
      expect(layout?.editable).toBe(true);
    });

    it('should return layout configuration for price column', () => {
      const layout = getColumnLayout('price');
      
      expect(layout).toBeDefined();
      expect(layout?.align).toBe('right');
      expect(layout?.format).toBe('currency');
    });
  });

  describe('getTableFeatures', () => {
    it('should return features configuration for users table', () => {
      const features = getTableFeatures('users');
      
      expect(features).toBeDefined();
      expect(features?.enablePagination).toBe(true);
      expect(features?.enableSearch).toBe(true);
      expect(features?.enableExport).toBe(true);
      expect(features?.enableFilters).toBe(true);
      expect(features?.rowsPerPage).toBe(25);
      expect(features?.allowedActions).toContain('create');
      expect(features?.allowedActions).toContain('read');
    });

    it('should return features configuration for products table', () => {
      const features = getTableFeatures('products');
      
      expect(features).toBeDefined();
      expect(features?.rowsPerPage).toBe(50);
    });

    it('should return undefined for non-existent table', () => {
      const features = getTableFeatures('non-existent');
      
      expect(features).toBeUndefined();
    });
  });

  describe('getColumnFeatures', () => {
    it('should return features configuration for id column', () => {
      const features = getColumnFeatures('id');
      
      expect(features).toBeDefined();
      expect(features?.searchable).toBe(true);
      expect(features?.sortable).toBe(true);
      expect(features?.filterable).toBe(true);
      expect(features?.required).toBe(true);
    });

    it('should return features configuration for email column with validation', () => {
      const features = getColumnFeatures('email');
      
      expect(features).toBeDefined();
      expect(features?.validation).toBe('email');
      expect(features?.required).toBe(true);
    });

    it('should return features configuration for created_at column', () => {
      const features = getColumnFeatures('created_at');
      
      expect(features).toBeDefined();
      expect(features?.searchable).toBe(false);
      expect(features?.sortable).toBe(true);
    });
  });

  describe('getComponentLayout', () => {
    it('should return layout configuration for DataGrid component', () => {
      const layout = getComponentLayout('DataGrid');
      
      expect(layout).toBeDefined();
      expect(layout?.headerHeight).toBe(56);
      expect(layout?.rowHeight).toBe(48);
      expect(layout?.density).toBe('standard');
      expect(layout?.showBorders).toBe(true);
    });

    it('should return layout configuration for FormDialog component', () => {
      const layout = getComponentLayout('FormDialog');
      
      expect(layout).toBeDefined();
      expect(layout?.width).toBe('md');
      expect(layout?.fullScreen).toBe(false);
      expect(layout?.showCloseButton).toBe(true);
    });

    it('should return layout configuration for Sidebar component', () => {
      const layout = getComponentLayout('Sidebar');
      
      expect(layout).toBeDefined();
      expect(layout?.width).toBe(240);
      expect(layout?.collapsible).toBe(true);
      expect(layout?.defaultOpen).toBe(true);
    });

    it('should return undefined for non-existent component', () => {
      const layout = getComponentLayout('NonExistentComponent');
      
      expect(layout).toBeUndefined();
    });
  });

  describe('getFormSchema', () => {
    it('should return form schema for users table', () => {
      const schema = getFormSchema('users');
      
      expect(schema).toBeDefined();
      expect(schema?.fields).toBeDefined();
      expect(Array.isArray(schema?.fields)).toBe(true);
      expect(schema?.submitLabel).toBe('Save User');
      expect(schema?.cancelLabel).toBe('Cancel');
    });

    it('should have name field in users schema', () => {
      const schema = getFormSchema('users');
      const nameField = schema?.fields.find(f => f.name === 'name');
      
      expect(nameField).toBeDefined();
      expect(nameField?.type).toBe('text');
      expect(nameField?.required).toBe(true);
    });

    it('should return form schema for products table', () => {
      const schema = getFormSchema('products');
      
      expect(schema).toBeDefined();
      expect(schema?.fields).toBeDefined();
      expect(schema?.submitLabel).toBe('Save Product');
    });

    it('should have price field with number type in products schema', () => {
      const schema = getFormSchema('products');
      const priceField = schema?.fields.find(f => f.name === 'price');
      
      expect(priceField).toBeDefined();
      expect(priceField?.type).toBe('number');
      expect(priceField?.required).toBe(true);
      expect(priceField?.prefix).toBe('$');
    });
  });

  describe('getValidationRule', () => {
    it('should return validation rule for email', () => {
      const rule = getValidationRule('email');
      
      expect(rule).toBeDefined();
      expect(rule?.pattern).toBeDefined();
      expect(rule?.message).toContain('email');
    });

    it('should return validation rule for phone', () => {
      const rule = getValidationRule('phone');
      
      expect(rule).toBeDefined();
      expect(rule?.pattern).toBeDefined();
      expect(rule?.message).toContain('phone');
    });

    it('should return validation rule for number', () => {
      const rule = getValidationRule('number');
      
      expect(rule).toBeDefined();
      expect(rule?.message).toContain('number');
    });
  });

  describe('getApiEndpoints', () => {
    it('should return all endpoints for users resource', () => {
      const endpoints = getApiEndpoints('users');
      
      expect(endpoints).toBeDefined();
      expect(endpoints?.list).toBeDefined();
      expect(endpoints?.get).toBeDefined();
      expect(endpoints?.create).toBeDefined();
      expect(endpoints?.update).toBeDefined();
      expect(endpoints?.delete).toBeDefined();
    });

    it('should return all endpoints for products resource', () => {
      const endpoints = getApiEndpoints('products');
      
      expect(endpoints).toBeDefined();
      expect(endpoints?.list).toBeDefined();
    });
  });

  describe('getApiEndpoint', () => {
    it('should return list endpoint for users', () => {
      const endpoint = getApiEndpoint('users', 'list');
      
      expect(endpoint).toBeDefined();
      expect(endpoint?.method).toBe('GET');
      expect(endpoint?.path).toBe('/api/admin/users');
    });

    it('should return create endpoint for users', () => {
      const endpoint = getApiEndpoint('users', 'create');
      
      expect(endpoint).toBeDefined();
      expect(endpoint?.method).toBe('POST');
      expect(endpoint?.path).toBe('/api/admin/users');
    });

    it('should return update endpoint for products', () => {
      const endpoint = getApiEndpoint('products', 'update');
      
      expect(endpoint).toBeDefined();
      expect(endpoint?.method).toBe('PUT');
      expect(endpoint?.path).toBe('/api/admin/products/:id');
    });
  });

  describe('getPermissions', () => {
    it('should return permissions for users resource', () => {
      const permissions = getPermissions('users');
      
      expect(permissions).toBeDefined();
      expect(permissions?.create).toContain('admin');
      expect(permissions?.read).toContain('admin');
      expect(permissions?.read).toContain('user');
    });

    it('should return permissions for products resource', () => {
      const permissions = getPermissions('products');
      
      expect(permissions).toBeDefined();
      expect(permissions?.create).toContain('admin');
      expect(permissions?.create).toContain('editor');
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', () => {
      expect(hasPermission('users', 'create', 'admin')).toBe(true);
      expect(hasPermission('users', 'read', 'user')).toBe(true);
    });

    it('should return false when user does not have permission', () => {
      expect(hasPermission('users', 'create', 'user')).toBe(false);
      expect(hasPermission('users', 'delete', 'guest')).toBe(false);
    });

    it('should check product permissions correctly', () => {
      expect(hasPermission('products', 'create', 'editor')).toBe(true);
      expect(hasPermission('products', 'update', 'editor')).toBe(true);
      expect(hasPermission('products', 'delete', 'editor')).toBe(false);
    });
  });

  describe('getRelationships', () => {
    it('should return relationships for users table', () => {
      const relationships = getRelationships('users');
      
      expect(relationships).toBeDefined();
      expect(relationships?.hasMany).toContain('orders');
      expect(relationships?.hasMany).toContain('reviews');
    });

    it('should return relationships for products table', () => {
      const relationships = getRelationships('products');
      
      expect(relationships).toBeDefined();
      expect(relationships?.hasMany).toContain('reviews');
      expect(relationships?.belongsTo).toContain('category');
    });

    it('should return relationships for orders table', () => {
      const relationships = getRelationships('orders');
      
      expect(relationships).toBeDefined();
      expect(relationships?.belongsTo).toContain('users');
      expect(relationships?.hasMany).toContain('orderItems');
    });
  });

  describe('getUiViews', () => {
    it('should return all views for users resource', () => {
      const views = getUiViews('users');
      
      expect(views).toBeDefined();
      expect(views?.list).toBeDefined();
      expect(views?.detail).toBeDefined();
      expect(views?.create).toBeDefined();
      expect(views?.edit).toBeDefined();
    });

    it('should return all views for products resource', () => {
      const views = getUiViews('products');
      
      expect(views).toBeDefined();
      expect(views?.list).toBeDefined();
    });
  });

  describe('getUiView', () => {
    it('should return list view configuration for users', () => {
      const view = getUiView('users', 'list');
      
      expect(view).toBeDefined();
      expect(view?.component).toBe('DataGrid');
      expect(view?.showActions).toBe(true);
      expect(view?.showSearch).toBe(true);
      expect(view?.showFilters).toBe(true);
    });

    it('should return detail view configuration for users', () => {
      const view = getUiView('users', 'detail');
      
      expect(view).toBeDefined();
      expect(view?.component).toBe('DetailView');
      expect(view?.showRelated).toBe(true);
      expect(view?.tabs).toContain('info');
      expect(view?.tabs).toContain('orders');
    });

    it('should return create view configuration with redirect', () => {
      const view = getUiView('users', 'create');
      
      expect(view).toBeDefined();
      expect(view?.component).toBe('FormDialog');
      expect(view?.redirect).toBe('list');
    });

    it('should return edit view configuration for products', () => {
      const view = getUiView('products', 'edit');
      
      expect(view).toBeDefined();
      expect(view?.redirect).toBe('detail');
    });
  });

  describe('getComponentTree', () => {
    it('should return component tree for AdminDashboard', () => {
      const tree = getComponentTree('AdminDashboard');
      
      expect(tree).toBeDefined();
      expect(tree?.component).toBe('Box');
      expect(tree?.children).toBeDefined();
      expect(Array.isArray(tree?.children)).toBe(true);
    });

    it('should have Sidebar in AdminDashboard tree', () => {
      const tree = getComponentTree('AdminDashboard');
      const sidebar = tree?.children?.find(child => child.component === 'Sidebar');
      
      expect(sidebar).toBeDefined();
      expect(sidebar?.props?.width).toBe(240);
    });

    it('should return component tree for ResourceListPage', () => {
      const tree = getComponentTree('ResourceListPage');
      
      expect(tree).toBeDefined();
      expect(tree?.component).toBe('Box');
      expect(tree?.children).toBeDefined();
    });

    it('should have DataGrid in ResourceListPage tree', () => {
      const tree = getComponentTree('ResourceListPage');
      
      function findComponent(node: any, componentName: string): any {
        if (node.component === componentName) return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findComponent(child, componentName);
            if (found) return found;
          }
        }
        return null;
      }
      
      const dataGrid = findComponent(tree, 'DataGrid');
      expect(dataGrid).toBeDefined();
      expect(dataGrid?.dataSource).toBe('tableData');
    });

    it('should return component tree for FormDialogTree', () => {
      const tree = getComponentTree('FormDialogTree');
      
      expect(tree).toBeDefined();
      expect(tree?.component).toBe('Dialog');
    });

    it('should have conditional rendering in component tree', () => {
      const tree = getComponentTree('ResourceListPage');
      
      function findNodeWithCondition(node: any): any {
        if (node.condition) return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findNodeWithCondition(child);
            if (found) return found;
          }
        }
        return null;
      }
      
      const conditionalNode = findNodeWithCondition(tree);
      expect(conditionalNode).toBeDefined();
      expect(conditionalNode?.condition).toBeDefined();
    });

    it('should have forEach loops in component tree', () => {
      const tree = getComponentTree('ResourceDetailPage');
      
      function findNodeWithForEach(node: any): any {
        if (node.forEach) return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findNodeWithForEach(child);
            if (found) return found;
          }
        }
        return null;
      }
      
      const loopNode = findNodeWithForEach(tree);
      expect(loopNode).toBeDefined();
      expect(loopNode?.forEach).toBeDefined();
    });
  });

  describe('getAllComponentTrees', () => {
    it('should return all component trees', () => {
      const trees = getAllComponentTrees();
      
      expect(trees).toBeDefined();
      expect(typeof trees).toBe('object');
    });

    it('should include AdminDashboard tree', () => {
      const trees = getAllComponentTrees();
      
      expect(trees.AdminDashboard).toBeDefined();
    });

    it('should include ResourceListPage tree', () => {
      const trees = getAllComponentTrees();
      
      expect(trees.ResourceListPage).toBeDefined();
    });

    it('should include FormDialogTree tree', () => {
      const trees = getAllComponentTrees();
      
      expect(trees.FormDialogTree).toBeDefined();
    });

    it('should include DashboardStatsCards tree', () => {
      const trees = getAllComponentTrees();
      
      expect(trees.DashboardStatsCards).toBeDefined();
    });
  });

  describe('getComponentPropSchema', () => {
    it('should return prop schema for Button component', () => {
      const schema = getComponentPropSchema('Button');
      
      expect(schema).toBeDefined();
      expect(schema?.description).toContain('Button');
      expect(schema?.category).toBe('inputs');
      expect(schema?.props).toBeDefined();
    });

    it('should have variant prop in Button schema', () => {
      const schema = getComponentPropSchema('Button');
      
      expect(schema?.props.variant).toBeDefined();
      expect(schema?.props.variant.type).toBe('enum');
      expect(schema?.props.variant.values).toContain('contained');
    });

    it('should return prop schema for TextField component', () => {
      const schema = getComponentPropSchema('TextField');
      
      expect(schema).toBeDefined();
      expect(schema?.category).toBe('inputs');
      expect(schema?.props.label).toBeDefined();
    });

    it('should return prop schema for Typography component', () => {
      const schema = getComponentPropSchema('Typography');
      
      expect(schema).toBeDefined();
      expect(schema?.category).toBe('display');
      expect(schema?.props.variant).toBeDefined();
    });

    it('should return undefined for non-existent component', () => {
      const schema = getComponentPropSchema('NonExistentComponent');
      
      expect(schema).toBeUndefined();
    });
  });

  describe('getAllComponentPropSchemas', () => {
    it('should return all component prop schemas', () => {
      const schemas = getAllComponentPropSchemas();
      
      expect(schemas).toBeDefined();
      expect(typeof schemas).toBe('object');
    });

    it('should include Button schema', () => {
      const schemas = getAllComponentPropSchemas();
      
      expect(schemas.Button).toBeDefined();
    });

    it('should include TextField schema', () => {
      const schemas = getAllComponentPropSchemas();
      
      expect(schemas.TextField).toBeDefined();
    });

    it('should include DataGrid schema', () => {
      const schemas = getAllComponentPropSchemas();
      
      expect(schemas.DataGrid).toBeDefined();
    });
  });

  describe('getComponentPropDefinition', () => {
    it('should return prop definition for Button variant', () => {
      const propDef = getComponentPropDefinition('Button', 'variant');
      
      expect(propDef).toBeDefined();
      expect(propDef?.type).toBe('enum');
      expect(propDef?.default).toBe('text');
    });

    it('should return prop definition for TextField label', () => {
      const propDef = getComponentPropDefinition('TextField', 'label');
      
      expect(propDef).toBeDefined();
      expect(propDef?.type).toBe('string');
    });

    it('should return prop definition for DataGrid columns', () => {
      const propDef = getComponentPropDefinition('DataGrid', 'columns');
      
      expect(propDef).toBeDefined();
      expect(propDef?.type).toBe('array');
      expect(propDef?.required).toBe(true);
    });

    it('should return undefined for non-existent prop', () => {
      const propDef = getComponentPropDefinition('Button', 'nonExistentProp');
      
      expect(propDef).toBeUndefined();
    });
  });

  describe('validateComponentProps', () => {
    it('should validate Button props successfully', () => {
      const result = validateComponentProps('Button', {
        text: 'Click me',
        variant: 'contained',
        color: 'primary',
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect invalid enum value', () => {
      const result = validateComponentProps('Button', {
        variant: 'invalid',
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid value');
    });

    it('should detect missing required prop', () => {
      const result = validateComponentProps('DataGrid', {
        rows: [],
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('columns'))).toBe(true);
    });

    it('should detect unknown prop', () => {
      const result = validateComponentProps('Button', {
        unknownProp: 'value',
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Unknown prop'))).toBe(true);
    });

    it('should validate TextField props', () => {
      const result = validateComponentProps('TextField', {
        label: 'Name',
        type: 'text',
        value: 'John',
      });
      
      expect(result.valid).toBe(true);
    });

    it('should return valid for non-existent component', () => {
      const result = validateComponentProps('NonExistent', {
        anyProp: 'value',
      });
      
      expect(result.valid).toBe(true);
    });
  });

  describe('getComponentsByCategory', () => {
    it('should return all input components', () => {
      const components = getComponentsByCategory('inputs');
      
      expect(Array.isArray(components)).toBe(true);
      expect(components).toContain('Button');
      expect(components).toContain('TextField');
    });

    it('should return all layout components', () => {
      const components = getComponentsByCategory('layout');
      
      expect(Array.isArray(components)).toBe(true);
      expect(components).toContain('Box');
      expect(components).toContain('Grid');
      expect(components).toContain('Paper');
    });

    it('should return all display components', () => {
      const components = getComponentsByCategory('display');
      
      expect(Array.isArray(components)).toBe(true);
      expect(components).toContain('Typography');
      expect(components).toContain('DataGrid');
    });

    it('should return all navigation components', () => {
      const components = getComponentsByCategory('navigation');
      
      expect(Array.isArray(components)).toBe(true);
      expect(components).toContain('Tabs');
      expect(components).toContain('Drawer');
    });

    it('should return all feedback components', () => {
      const components = getComponentsByCategory('feedback');
      
      expect(Array.isArray(components)).toBe(true);
      expect(components).toContain('Dialog');
      expect(components).toContain('Alert');
    });

    it('should return empty array for non-existent category', () => {
      const components = getComponentsByCategory('nonexistent');
      
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBe(0);
    });
  });
});
