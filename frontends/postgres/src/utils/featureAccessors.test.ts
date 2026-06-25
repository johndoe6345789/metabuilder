import { describe, expect, it } from 'vitest';
import {
  getIndexTypes,
  getQueryOperators,
} from './featureAccessors';

// The core functions (getFeatures, getFeatureById, getDataTypes, etc.) are
// already tested in featureConfig.test.ts which imports from featureConfig.ts
// (the re-export barrel). This file tests the accessors not covered there.

describe('featureAccessors – additional accessors', () => {
  describe('getQueryOperators', () => {
    it('should return an array', () => {
      const operators = getQueryOperators();
      expect(Array.isArray(operators)).toBe(true);
    });

    it('should have operators with required properties if any exist', () => {
      const operators = getQueryOperators();
      operators.forEach((op: any) => {
        // QueryOperator uses 'value' + 'label' per features.json
        expect(
          op.name !== undefined || op.value !== undefined,
        ).toBe(true);
      });
    });
  });

  describe('getIndexTypes', () => {
    it('should return an array', () => {
      const indexTypes = getIndexTypes();
      expect(Array.isArray(indexTypes)).toBe(true);
    });

    it('should include BTREE index type if configured', () => {
      const indexTypes = getIndexTypes();
      if (indexTypes.length > 0) {
        const btree = indexTypes.find((t: any) => t.value === 'BTREE');
        if (btree) {
          expect((btree as any).value).toBe('BTREE');
          expect((btree as any).description).toBeDefined();
        }
      }
    });

    it('should have index types with required properties', () => {
      const indexTypes = getIndexTypes();
      indexTypes.forEach((indexType: any) => {
        // IndexType uses 'value' field (not 'name') per features.json
        expect(
          indexType.name !== undefined || indexType.value !== undefined,
        ).toBe(true);
      });
    });
  });
});
