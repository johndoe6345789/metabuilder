/**
 * Rule executors barrel — pattern, complexity, naming, structure
 */
import { logger } from '../utils/logger.js';
export { executeNamingRule, executeStructureRule, } from './rule-executor-naming.js';
function calcComplexity(content, type) {
    switch (type) {
        case 'lines':
            return { value: content.split('\n').length };
        case 'parameters': {
            const re = /function\s+\w+\s*\(([^)]*)\)|const\s+\w+\s*=\s*\(([^)]*)\)/gm;
            let m;
            const counts = [];
            while ((m = re.exec(content)) !== null) {
                counts.push((m[1] || m[2] || '').split(',').filter(p => p.trim()).length);
            }
            return { value: counts.length ? Math.max(...counts) : 0 };
        }
        case 'nesting': {
            let max = 0, cur = 0;
            for (const ch of content) {
                if ('({['.includes(ch))
                    max = Math.max(max, ++cur);
                else if (')}]'.includes(ch))
                    cur--;
            }
            return { value: max };
        }
        case 'cyclomaticComplexity': {
            const decisions = content.match(/\b(if|else|case|catch|for|while|&&|\|\||switch)\b/g) ||
                [];
            return { value: decisions.length + 1 };
        }
        default:
            return { value: 0 };
    }
}
export async function executePatternRule(rule, sourceFiles, violations) {
    try {
        const regex = new RegExp(rule.pattern, 'gm');
        const extensions = rule.fileExtensions || ['.ts', '.tsx', '.js', '.jsx'];
        const excludeRegex = rule.excludePatterns?.map(p => new RegExp(p, 'gm'));
        for (const file of sourceFiles) {
            if (!extensions.some(ext => file.endsWith(ext)))
                continue;
            try {
                const { readFileSync } = await import('fs');
                const content = readFileSync(file, 'utf-8');
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    let match;
                    while ((match = regex.exec(line)) !== null) {
                        if (excludeRegex?.some(ex => ex.test(line)))
                            continue;
                        violations.push({
                            ruleId: rule.id,
                            ruleName: rule.message,
                            file,
                            line: i + 1,
                            column: match.index + 1,
                            message: rule.message,
                            severity: rule.severity,
                            evidence: line.trim(),
                        });
                    }
                }
            }
            catch (err) {
                logger.debug(`Failed to read file ${file}: ${err.message}`);
            }
        }
    }
    catch (err) {
        logger.error(`Pattern rule ${rule.id} error: ${err.message}`);
    }
}
export async function executeComplexityRule(rule, sourceFiles, violations) {
    const tsExts = ['.ts', '.tsx', '.js', '.jsx'];
    try {
        for (const file of sourceFiles) {
            if (!tsExts.some(e => file.endsWith(e)))
                continue;
            try {
                const { readFileSync } = await import('fs');
                const content = readFileSync(file, 'utf-8');
                const metrics = calcComplexity(content, rule.complexityType);
                if (metrics.value > rule.threshold) {
                    violations.push({
                        ruleId: rule.id,
                        ruleName: rule.message,
                        file,
                        // eslint-disable-next-line max-len
                        message: `${rule.message}: ${metrics.value} (threshold: ${rule.threshold})`,
                        severity: rule.severity,
                        evidence: `${rule.complexityType}: ${metrics.value}`,
                    });
                }
            }
            catch (err) {
                logger.debug(`Complexity check failed for ${file}: ${err.message}`);
            }
        }
    }
    catch (err) {
        logger.error(`Complexity rule ${rule.id} error: ${err.message}`);
    }
}
