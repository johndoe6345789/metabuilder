/**
 * featureConfig — public barrel for all feature configuration.
 *
 * Existing imports from '@/utils/featureConfig' continue to work;
 * the actual implementations now live in focused modules:
 *   - featureTypes.ts   — TypeScript type definitions
 *   - featureAccessors.ts — data accessor functions
 *   - featureValidators.ts — SQL parameter/template validators
 */

export * from './featureTypes';
export * from './featureAccessors';
export * from './featureValidators';
