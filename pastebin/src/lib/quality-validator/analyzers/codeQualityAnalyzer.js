/**
 * Code Quality Analyzer
 * Analyzes complexity, duplication, and linting violations
 */
import { readFile, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
/**
 * Code Quality Analyzer
 */
export class CodeQualityAnalyzer {
    /**
     * Analyze code quality across all dimensions
     */
    async analyze(filePaths) {
        const startTime = performance.now();
        try {
            logger.debug('Starting code quality analysis...');
            // Analyze each dimension
            const complexity = this.analyzeComplexity(filePaths);
            const duplication = this.analyzeDuplication(filePaths);
            const linting = this.analyzeLinting(filePaths);
            const metrics = {
                complexity,
                duplication,
                linting,
            };
            // Generate findings
            const findings = this.generateFindings(metrics);
            // Calculate score
            const score = this.calculateScore(metrics);
            const executionTime = performance.now() - startTime;
            logger.debug(`Code quality analysis complete (${executionTime.toFixed(2)}ms)`, {
                complexityScore: score,
                findings: findings.length,
            });
            return {
                category: 'codeQuality',
                score,
                status: (score >= 80 ? 'pass' : score >= 70 ? 'warning' : 'fail'),
                findings,
                metrics: metrics,
                executionTime,
            };
        }
        catch (error) {
            logger.error('Code quality analysis failed', { error: error.message });
            throw error;
        }
    }
    /**
     * Analyze cyclomatic complexity
     */
    analyzeComplexity(filePaths) {
        const functions = [];
        let totalComplexity = 0;
        let maxComplexity = 0;
        for (const filePath of filePaths) {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx'))
                continue;
            try {
                const content = readFile(filePath);
                const parsed = this.extractComplexityFromFile(filePath, content);
                functions.push(...parsed.functions);
                totalComplexity += parsed.totalComplexity;
                maxComplexity = Math.max(maxComplexity, parsed.maxComplexity);
            }
            catch (error) {
                logger.debug(`Failed to analyze complexity in ${filePath}`, {
                    error: error.message,
                });
            }
        }
        const averagePerFile = filePaths.length > 0 ? totalComplexity / filePaths.length : 0;
        // Count distribution
        const distribution = {
            good: functions.filter((f) => f.complexity <= 10).length,
            warning: functions.filter((f) => f.complexity > 10 && f.complexity <= 20).length,
            critical: functions.filter((f) => f.complexity > 20).length,
        };
        return {
            functions: functions.sort((a, b) => b.complexity - a.complexity).slice(0, 20),
            averagePerFile,
            maximum: maxComplexity,
            distribution,
        };
    }
    /**
     * Extract complexity from a single file
     */
    extractComplexityFromFile(filePath, content) {
        const functions = [];
        let totalComplexity = 0;
        let maxComplexity = 0;
        // Simple function detection regex
        const functionRegex = /(?:async\s+)?(?:function|const|let|var)\s+(\w+)\s*(?::|=)\s*(?:async\s*)?(?:function|\()/gm;
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            const functionName = match[1];
            const startIdx = match.index;
            const lineNum = content.substring(0, startIdx).split('\n').length;
            // Simple complexity calculation based on keywords
            const complexity = this.calculateSimpleComplexity(content.substring(startIdx, startIdx + 1000));
            if (complexity > 0) {
                functions.push({
                    file: normalizeFilePath(filePath),
                    name: functionName,
                    line: lineNum,
                    complexity,
                    status: complexity <= 10 ? 'good' : complexity <= 20 ? 'warning' : 'critical',
                });
                totalComplexity += complexity;
                maxComplexity = Math.max(maxComplexity, complexity);
            }
        }
        return { functions, totalComplexity, maxComplexity };
    }
    /**
     * Calculate simple complexity based on control flow keywords
     */
    calculateSimpleComplexity(code) {
        let complexity = 1; // Base complexity
        // Count control flow statements
        const controlFlowKeywords = [
            'if',
            'else',
            'case',
            'catch',
            'while',
            'for',
            'do',
            '&&',
            '||',
            '\\?',
            ':',
        ];
        for (const keyword of controlFlowKeywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const matches = code.match(regex);
            complexity += (matches ? matches.length : 0) * 0.5;
        }
        return Math.ceil(complexity);
    }
    /**
     * Analyze code duplication
     */
    analyzeDuplication(filePaths) {
        // Simplified duplication detection
        const blocks = [];
        let totalDupLines = 0;
        // This is a simplified version - full version would use jscpd library
        // For now, just estimate based on import statements
        const importCounts = new Map();
        for (const filePath of filePaths) {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx'))
                continue;
            try {
                const content = readFile(filePath);
                const imports = content.match(/^import .* from ['"]/gm);
                if (imports) {
                    for (const imp of imports) {
                        importCounts.set(imp, (importCounts.get(imp) || 0) + 1);
                    }
                }
            }
            catch (error) {
                logger.debug(`Failed to analyze duplication in ${filePath}`);
            }
        }
        // Estimate duplication percentage (simplified)
        let duplicateCount = 0;
        for (const count of importCounts.values()) {
            if (count > 1) {
                duplicateCount += count - 1;
            }
        }
        const totalLines = filePaths.reduce((sum, f) => {
            try {
                const content = readFile(f);
                return sum + content.split('\n').length;
            }
            catch {
                return sum;
            }
        }, 0);
        const duplicationPercent = totalLines > 0 ? (duplicateCount / (totalLines / 10)) * 100 : 0;
        return {
            percent: Math.min(100, Math.max(0, duplicationPercent * 0.1)), // Scale down
            lines: Math.ceil(duplicateCount),
            blocks,
            status: duplicationPercent < 3 ? 'good' : duplicationPercent < 5 ? 'warning' : 'critical',
        };
    }
    /**
     * Analyze linting violations
     */
    analyzeLinting(filePaths) {
        // In a real implementation, this would use ESLint API
        // For now, return mock data
        const violations = [];
        // Simple check for common issues
        for (const filePath of filePaths) {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx'))
                continue;
            try {
                const content = readFile(filePath);
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    // Check for common linting issues
                    if (line.includes('console.log') && !filePath.includes('.spec.') && !filePath.includes('.test.')) {
                        violations.push({
                            file: normalizeFilePath(filePath),
                            line: i + 1,
                            column: line.indexOf('console.log') + 1,
                            severity: 'warning',
                            rule: 'no-console',
                            message: 'Unexpected console statement',
                            fixable: true,
                        });
                    }
                    if (line.includes('var ')) {
                        violations.push({
                            file: normalizeFilePath(filePath),
                            line: i + 1,
                            column: line.indexOf('var ') + 1,
                            severity: 'warning',
                            rule: 'no-var',
                            message: 'Unexpected var, use let or const instead',
                            fixable: true,
                        });
                    }
                }
            }
            catch (error) {
                logger.debug(`Failed to lint ${filePath}`);
            }
        }
        const errors = violations.filter((v) => v.severity === 'error').length;
        const warnings = violations.filter((v) => v.severity === 'warning').length;
        const info = violations.filter((v) => v.severity === 'info').length;
        // Group by rule
        const byRule = new Map();
        for (const violation of violations) {
            if (!byRule.has(violation.rule)) {
                byRule.set(violation.rule, []);
            }
            byRule.get(violation.rule).push(violation);
        }
        return {
            errors,
            warnings,
            info,
            violations,
            byRule,
            status: errors > 0 ? 'critical' : warnings > 5 ? 'warning' : 'good',
        };
    }
    /**
     * Generate findings from metrics
     */
    generateFindings(metrics) {
        const findings = [];
        // Complexity findings
        for (const func of metrics.complexity.functions.slice(0, 5)) {
            if (func.status === 'critical') {
                findings.push({
                    id: `cc-${func.file}-${func.line}`,
                    severity: 'high',
                    category: 'codeQuality',
                    title: 'High cyclomatic complexity',
                    description: `Function '${func.name}' has complexity of ${func.complexity}, exceeding threshold of 20`,
                    location: {
                        file: func.file,
                        line: func.line,
                    },
                    remediation: 'Extract complex logic into smaller functions, use guard clauses instead of nested if statements',
                    evidence: `Complexity: ${func.complexity}`,
                });
            }
        }
        // Duplication findings
        if (metrics.duplication.percent > 5) {
            findings.push({
                id: 'dup-high',
                severity: 'medium',
                category: 'codeQuality',
                title: 'High code duplication',
                description: `${metrics.duplication.percent.toFixed(1)}% of code appears to be duplicated`,
                remediation: 'Extract duplicated code into reusable components or utility functions',
                evidence: `Duplication: ${metrics.duplication.percent.toFixed(1)}%`,
            });
        }
        // Linting findings
        if (metrics.linting.errors > 0) {
            findings.push({
                id: 'lint-errors',
                severity: 'high',
                category: 'codeQuality',
                title: 'Linting errors',
                description: `Found ${metrics.linting.errors} linting errors`,
                remediation: 'Run eslint with --fix to auto-fix issues',
                evidence: `Errors: ${metrics.linting.errors}`,
            });
        }
        return findings;
    }
    /**
     * Calculate overall code quality score
     */
    calculateScore(metrics) {
        const { complexity, duplication, linting } = metrics;
        // Complexity score: 0-100
        const complexityScore = Math.max(0, 100 - complexity.distribution.critical * 5 - complexity.distribution.warning * 2);
        // Duplication score: 0-100
        let duplicationScore = 100;
        if (duplication.percent < 3)
            duplicationScore = 100;
        else if (duplication.percent < 5)
            duplicationScore = 90;
        else if (duplication.percent < 10)
            duplicationScore = 70;
        else
            duplicationScore = Math.max(0, 100 - (duplication.percent - 10) * 5);
        // Linting score: 0-100
        let lintingScore = 100 - linting.errors * 10;
        if (linting.warnings > 5) {
            lintingScore -= (linting.warnings - 5) * 2;
        }
        lintingScore = Math.max(0, lintingScore);
        // Weighted average
        return complexityScore * 0.4 + duplicationScore * 0.35 + lintingScore * 0.25;
    }
}
export const codeQualityAnalyzer = new CodeQualityAnalyzer();
