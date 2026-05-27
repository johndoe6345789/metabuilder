/**
 * Sample rules configuration for RulesLoader
 */

import type {
  PatternRule,
  ComplexityRule,
  NamingRule,
  StructureRule,
} from './RulesEngine.js';
import type { RulesConfigFile } from './RulesLoader.js';

export const SAMPLE_RULES_CONFIG: RulesConfigFile = {
  version: '1.0.0',
  description:
    'Custom code quality rules - customize based on your project needs',
  rules: [
    {
      id: 'no-console-logs',
      type: 'pattern',
      severity: 'warning',
      pattern: 'console\\.(log|warn|error)\\s*\\(',
      message: 'Remove console.log statements',
      enabled: true,
      description: 'Avoid leaving console logs in production code',
      fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
      excludePatterns: ['// console.log'],
    } as PatternRule,
    {
      id: 'max-function-lines',
      type: 'complexity',
      severity: 'warning',
      complexityType: 'lines',
      threshold: 50,
      message: 'Function exceeds 50 lines',
      enabled: true,
      description: 'Functions should be kept under 50 lines for readability',
    } as ComplexityRule,
    {
      id: 'function-naming-convention',
      type: 'naming',
      severity: 'info',
      nameType: 'function',
      pattern: '^[a-z][a-zA-Z0-9]*$|^[a-z][a-zA-Z0-9]*Async$',
      message: 'Function names should use camelCase',
      enabled: true,
      description: 'Enforce camelCase naming for functions',
      excludePatterns: ['React.memo', 'export default'],
    } as NamingRule,
    {
      id: 'max-file-size',
      type: 'structure',
      severity: 'warning',
      check: 'maxFileSize',
      threshold: 300,
      message: 'File exceeds maximum size',
      enabled: true,
      description: 'Large files should be broken into smaller modules',
    } as StructureRule,
    {
      id: 'no-todo-comments',
      type: 'pattern',
      severity: 'info',
      pattern: '//\\s*TODO|//\\s*FIXME',
      message: 'TODO/FIXME comments should be addressed',
      enabled: false,
      fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
    } as PatternRule,
    {
      id: 'max-parameters',
      type: 'complexity',
      severity: 'warning',
      complexityType: 'parameters',
      threshold: 5,
      message: 'Function has too many parameters',
      enabled: true,
      description: 'Functions with more than 5 parameters are hard to use',
    } as ComplexityRule,
  ],
};
