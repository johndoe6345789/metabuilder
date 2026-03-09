/**
 * Architecture Checker
 * Validates component organization and architecture compliance
 */

import {
  AnalysisResult,
  ArchitectureMetrics,
  ComponentMetrics,
  OversizedComponent,
  DependencyMetrics,
  PatternMetrics,
  CircularDependency,
  PatternIssue,
  Finding,
  Status,
} from '../types/index.js';
import { getSourceFiles, readFile, getLineCount, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
import { BaseAnalyzer, AnalyzerConfig } from './BaseAnalyzer.js';

/**
 * Architecture Checker
 * Extends BaseAnalyzer to implement SOLID principles
 */
export class ArchitectureChecker extends BaseAnalyzer {
  constructor(config?: AnalyzerConfig) {
    super(
      config || {
        name: 'ArchitectureChecker',
        enabled: true,
        timeout: 45000,
        retryAttempts: 1,
      }
    );
  }

  /**
   * Check architecture compliance
   */
  async analyze(filePaths: string[] = []): Promise<AnalysisResult> {
    return this.executeWithTiming(async () => {
      if (!this.validate()) {
        throw new Error('ArchitectureChecker validation failed');
      }

      this.startTiming();

      const components = this.analyzeComponents(filePaths);
      const dependencies = this.analyzeDependencies(filePaths);
      const patterns = this.analyzePatterns(filePaths);

      const metrics: ArchitectureMetrics = {
        components,
        dependencies,
        patterns,
      };

      this.generateFindings(metrics);
      const score = this.calculateScore(metrics);

      const executionTime = this.getExecutionTime();

      this.logProgress('Architecture analysis complete', {
        components: components.totalCount,
        circularDeps: dependencies.circularDependencies.length,
      });

      return {
        category: 'architecture' as const,
        score,
        status: this.getStatus(score),
        findings: this.getFindings(),
        metrics: metrics as unknown as Record<string, unknown>,
        executionTime,
      };
    }, 'architecture analysis');
  }

  /**
   * Validate analyzer configuration and preconditions
   */
  validate(): boolean {
    if (!this.validateConfig()) {
      return false;
    }

    if (!this.config.enabled) {
      logger.debug(`${this.config.name} is disabled`);
      return false;
    }

    return true;
  }

  /**
   * Analyze component organization
   */
  private analyzeComponents(filePaths: string[]): ComponentMetrics {
    const componentFiles: string[] = [];
    let oversized: OversizedComponent[] = [];

    // Find component files
    for (const filePath of filePaths) {
      if (
        filePath.includes('/components/') &&
        (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))
      ) {
        componentFiles.push(filePath);

        // Check file size
        const lines = getLineCount(filePath);
        if (lines > 500) {
          const componentName = this.extractComponentName(filePath);
          const type = this.classifyComponent(filePath);

          oversized.push({
            file: normalizeFilePath(filePath),
            name: componentName,
            lines,
            type: type as any,
            suggestion: `Split into smaller components or extract logic to utilities`,
          });
        }
      }
    }

    // Classify components by folder
    const byType = {
      atoms: filePaths.filter((f) => f.includes('/atoms/')).length,
      molecules: filePaths.filter((f) => f.includes('/molecules/')).length,
      organisms: filePaths.filter((f) => f.includes('/organisms/')).length,
      templates: filePaths.filter((f) => f.includes('/templates/')).length,
      unknown: componentFiles.length -
        filePaths.filter((f) => f.includes('/atoms/')).length -
        filePaths.filter((f) => f.includes('/molecules/')).length -
        filePaths.filter((f) => f.includes('/organisms/')).length -
        filePaths.filter((f) => f.includes('/templates/')).length,
    };

    const avgSize = componentFiles.length > 0
      ? componentFiles.reduce((sum, f) => sum + getLineCount(f), 0) / componentFiles.length
      : 0;

    return {
      totalCount: componentFiles.length,
      byType,
      oversized: oversized.slice(0, 10),
      misplaced: [],
      averageSize: Math.round(avgSize),
    };
  }

  /**
   * Extract component name from file path
   */
  private extractComponentName(filePath: string): string {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.(tsx?|jsx?)$/, '');
  }

  /**
   * Classify component type based on folder
   */
  private classifyComponent(filePath: string): string {
    if (filePath.includes('/atoms/')) return 'atom';
    if (filePath.includes('/molecules/')) return 'molecule';
    if (filePath.includes('/organisms/')) return 'organism';
    if (filePath.includes('/templates/')) return 'template';
    return 'unknown';
  }

  /**
   * Analyze dependencies and detect circular dependencies
   */
  private analyzeDependencies(filePaths: string[]): DependencyMetrics {
    const imports = new Map<string, Set<string>>();
    const externalDependencies = new Map<string, number>();

    // Build import graph
    for (const filePath of filePaths) {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;

      try {
        const content = readFile(filePath);
        const normalizedPath = normalizeFilePath(filePath);
        imports.set(normalizedPath, new Set());

        // Extract imports
        const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];

          // Track external dependencies
          if (importPath.startsWith('@') || (!importPath.startsWith('.') && !importPath.startsWith('/'))) {
            const pkgName = importPath.split('/')[0];
            externalDependencies.set(pkgName, (externalDependencies.get(pkgName) || 0) + 1);
          } else {
            // Track internal imports
            imports.get(normalizedPath)!.add(importPath);
          }
        }
      } catch (error) {
        logger.debug(`Failed to analyze dependencies in ${filePath}`);
      }
    }

    // Detect circular dependencies (simplified)
    const circularDependencies: CircularDependency[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const [file, deps] of imports.entries()) {
      if (this.hasCyclicDependency(file, deps, imports, visited, recursionStack)) {
        circularDependencies.push({
          path: [file],
          files: [file],
          severity: 'high',
        });
      }
    }

    return {
      totalModules: filePaths.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx')).length,
      circularDependencies: circularDependencies.slice(0, 5),
      layerViolations: [],
      externalDependencies,
    };
  }

  /**
   * Check if a file has cyclic dependencies
   */
  private hasCyclicDependency(
    file: string,
    deps: Set<string>,
    allImports: Map<string, Set<string>>,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    if (visited.has(file)) return false;
    if (recursionStack.has(file)) return true;

    visited.add(file);
    recursionStack.add(file);

    for (const dep of deps) {
      if (allImports.has(dep) && this.hasCyclicDependency(dep, allImports.get(dep)!, allImports, visited, recursionStack)) {
        return true;
      }
    }

    recursionStack.delete(file);
    return false;
  }

  /**
   * Analyze pattern compliance
   */
  private analyzePatterns(filePaths: string[]): PatternMetrics {
    const reduxIssues: PatternIssue[] = [];
    const hookIssues: PatternIssue[] = [];

    for (const filePath of filePaths) {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;

      try {
        const content = readFile(filePath);

        // Check Redux patterns
        if (filePath.includes('/store/') || filePath.includes('/slices/')) {
          if (content.includes('state.') && content.includes('=')) {
            reduxIssues.push({
              file: normalizeFilePath(filePath),
              pattern: 'Redux Mutation',
              issue: 'Direct state mutation detected',
              suggestion: 'Use immer middleware or clone state before modifying',
              severity: 'high',
            });
          }
        }

        // Check Hook patterns
        if (content.includes('use')) {
          // Simple check for hooks not at top level
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('if') && i + 1 < lines.length && lines[i + 1].includes('use')) {
              hookIssues.push({
                file: normalizeFilePath(filePath),
                line: i + 1,
                pattern: 'Hook not at top level',
                issue: 'Hook called conditionally or inside a loop',
                suggestion: 'Move hook to top level of component',
                severity: 'high',
              });
            }
          }
        }
      } catch (error) {
        logger.debug(`Failed to analyze patterns in ${filePath}`);
      }
    }

    return {
      reduxCompliance: {
        issues: reduxIssues.slice(0, 5),
        score: 100 - Math.min(reduxIssues.length * 20, 100),
      },
      hookUsage: {
        issues: hookIssues.slice(0, 5),
        score: 100 - Math.min(hookIssues.length * 20, 100),
      },
      reactBestPractices: {
        issues: [],
        score: 80,
      },
    };
  }

  /**
   * Generate findings from metrics
   */
  private generateFindings(metrics: ArchitectureMetrics): void {
    // Component size findings
    for (const component of metrics.components.oversized.slice(0, 3)) {
      this.addFinding({
        id: `oversized-${component.file}`,
        severity: 'medium',
        category: 'architecture',
        title: 'Oversized component',
        description: `Component '${component.name}' has ${component.lines} lines, recommended max is 300`,
        location: {
          file: component.file,
        },
        remediation: component.suggestion,
        evidence: `Lines: ${component.lines}`,
      });
    }

    // Circular dependency findings
    for (const cycle of metrics.dependencies.circularDependencies) {
      this.addFinding({
        id: `circular-${cycle.files[0]}`,
        severity: 'high',
        category: 'architecture',
        title: 'Circular dependency detected',
        description: `Circular dependency: ${cycle.files.join(' → ')}`,
        remediation: 'Restructure modules to break the circular dependency',
        evidence: `Cycle: ${cycle.path.join(' → ')}`,
      });
    }

    // Pattern violations
    for (const issue of metrics.patterns.reduxCompliance.issues.slice(0, 2)) {
      this.addFinding({
        id: `redux-${issue.file}`,
        severity: issue.severity,
        category: 'architecture',
        title: 'Redux pattern violation',
        description: issue.issue,
        location: {
          file: issue.file,
          line: issue.line,
        },
        remediation: issue.suggestion,
      });
    }
  }

  /**
   * Calculate overall architecture score
   */
  private calculateScore(metrics: ArchitectureMetrics): number {
    const { components, dependencies, patterns } = metrics;

    // Component score: reduce for oversized
    let componentScore = Math.max(0, 100 - components.oversized.length * 10);

    // Dependency score: reduce for circular deps
    let dependencyScore = Math.max(0, 100 - dependencies.circularDependencies.length * 20);

    // Pattern score: use existing pattern scores
    const patternScore =
      (patterns.reduxCompliance.score + patterns.hookUsage.score + patterns.reactBestPractices.score) /
      3;

    return componentScore * 0.35 + dependencyScore * 0.35 + patternScore * 0.3;
  }
}

export const architectureChecker = new ArchitectureChecker();
