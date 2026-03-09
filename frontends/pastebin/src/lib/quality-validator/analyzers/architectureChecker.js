/**
 * Architecture Checker
 * Validates component organization and architecture compliance
 */
import { readFile, getLineCount, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
/**
 * Architecture Checker
 */
export class ArchitectureChecker {
    /**
     * Check architecture compliance
     */
    async analyze(filePaths) {
        const startTime = performance.now();
        try {
            logger.debug('Starting architecture analysis...');
            const components = this.analyzeComponents(filePaths);
            const dependencies = this.analyzeDependencies(filePaths);
            const patterns = this.analyzePatterns(filePaths);
            const metrics = {
                components,
                dependencies,
                patterns,
            };
            const findings = this.generateFindings(metrics);
            const score = this.calculateScore(metrics);
            const executionTime = performance.now() - startTime;
            logger.debug(`Architecture analysis complete (${executionTime.toFixed(2)}ms)`, {
                components: components.totalCount,
                circularDeps: dependencies.circularDependencies.length,
            });
            return {
                category: 'architecture',
                score,
                status: (score >= 80 ? 'pass' : score >= 70 ? 'warning' : 'fail'),
                findings,
                metrics: metrics,
                executionTime,
            };
        }
        catch (error) {
            logger.error('Architecture analysis failed', { error: error.message });
            throw error;
        }
    }
    /**
     * Analyze component organization
     */
    analyzeComponents(filePaths) {
        const componentFiles = [];
        let oversized = [];
        // Find component files
        for (const filePath of filePaths) {
            if (filePath.includes('/components/') &&
                (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))) {
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
                        type: type,
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
    extractComponentName(filePath) {
        const parts = filePath.split('/');
        const fileName = parts[parts.length - 1];
        return fileName.replace(/\.(tsx?|jsx?)$/, '');
    }
    /**
     * Classify component type based on folder
     */
    classifyComponent(filePath) {
        if (filePath.includes('/atoms/'))
            return 'atom';
        if (filePath.includes('/molecules/'))
            return 'molecule';
        if (filePath.includes('/organisms/'))
            return 'organism';
        if (filePath.includes('/templates/'))
            return 'template';
        return 'unknown';
    }
    /**
     * Analyze dependencies and detect circular dependencies
     */
    analyzeDependencies(filePaths) {
        const imports = new Map();
        const externalDependencies = new Map();
        // Build import graph
        for (const filePath of filePaths) {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx'))
                continue;
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
                    }
                    else {
                        // Track internal imports
                        imports.get(normalizedPath).add(importPath);
                    }
                }
            }
            catch (error) {
                logger.debug(`Failed to analyze dependencies in ${filePath}`);
            }
        }
        // Detect circular dependencies (simplified)
        const circularDependencies = [];
        const visited = new Set();
        const recursionStack = new Set();
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
    hasCyclicDependency(file, deps, allImports, visited, recursionStack) {
        if (visited.has(file))
            return false;
        if (recursionStack.has(file))
            return true;
        visited.add(file);
        recursionStack.add(file);
        for (const dep of deps) {
            if (allImports.has(dep) && this.hasCyclicDependency(dep, allImports.get(dep), allImports, visited, recursionStack)) {
                return true;
            }
        }
        recursionStack.delete(file);
        return false;
    }
    /**
     * Analyze pattern compliance
     */
    analyzePatterns(filePaths) {
        const reduxIssues = [];
        const hookIssues = [];
        for (const filePath of filePaths) {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx'))
                continue;
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
            }
            catch (error) {
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
    generateFindings(metrics) {
        const findings = [];
        // Component size findings
        for (const component of metrics.components.oversized.slice(0, 3)) {
            findings.push({
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
            findings.push({
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
            findings.push({
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
        return findings;
    }
    /**
     * Calculate overall architecture score
     */
    calculateScore(metrics) {
        const { components, dependencies, patterns } = metrics;
        // Component score: reduce for oversized
        let componentScore = Math.max(0, 100 - components.oversized.length * 10);
        // Dependency score: reduce for circular deps
        let dependencyScore = Math.max(0, 100 - dependencies.circularDependencies.length * 20);
        // Pattern score: use existing pattern scores
        const patternScore = (patterns.reduxCompliance.score + patterns.hookUsage.score + patterns.reactBestPractices.score) /
            3;
        return componentScore * 0.35 + dependencyScore * 0.35 + patternScore * 0.3;
    }
}
export const architectureChecker = new ArchitectureChecker();
