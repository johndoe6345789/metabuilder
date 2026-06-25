/**
 * Security pattern detection helpers for SecurityScanner
 */
import { readFile, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
export { checkPerformanceIssues } from './performance-patterns.js';
const SECRET_PATTERNS = [
    /password\s*[:=]\s*['"]/i,
    /secret\s*[:=]\s*['"]/i,
    /token\s*[:=]\s*['"]/i,
    /apiKey\s*[:=]\s*['"]/i,
    /api_key\s*[:=]\s*['"]/i,
    /authorization\s*[:=]\s*['"]/i,
    /auth\s*[:=]\s*['"]/i,
];
function isHardcodedSecret(line) {
    return SECRET_PATTERNS.some(p => p.test(line));
}
function scanFileSecurity(filePath) {
    const found = [];
    const content = readFile(filePath);
    const lines = content.split('\n');
    const normalized = normalizeFilePath(filePath);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        if (isHardcodedSecret(line)) {
            found.push({
                type: 'secret',
                severity: 'critical',
                file: normalized,
                line: lineNum,
                column: line.indexOf(line.match(/password|secret|token|apiKey|API_KEY/i)[0]),
                message: 'Possible hard-coded secret detected',
                remediation: 'Use environment variables or secure config management',
                evidence: line.substring(0, 50) + '...',
            });
        }
        if (line.includes('dangerouslySetInnerHTML')) {
            found.push({
                type: 'unsafeDom',
                severity: 'high',
                file: normalized,
                line: lineNum,
                message: 'dangerouslySetInnerHTML used',
                remediation: 'Use safe HTML or sanitize with DOMPurify',
                evidence: 'dangerouslySetInnerHTML',
            });
        }
        if (line.includes('eval(')) {
            found.push({
                type: 'unsafeDom',
                severity: 'critical',
                file: normalized,
                line: lineNum,
                message: 'eval() usage detected',
                remediation: 'Never use eval(); use JSON.parse() or alternatives',
                evidence: 'eval(',
            });
        }
        if (line.includes('innerHTML =')) {
            found.push({
                type: 'unsafeDom',
                severity: 'high',
                file: normalized,
                line: lineNum,
                message: 'Direct innerHTML assignment',
                remediation: 'Use textContent or createElement for safe DOM manipulation',
                evidence: 'innerHTML =',
            });
        }
        if ((line.includes('innerHTML') ||
            line.includes('dangerouslySetInnerHTML')) &&
            (line.includes('user') || line.includes('input') || line.includes('data'))) {
            found.push({
                type: 'xss',
                severity: 'high',
                file: normalized,
                line: lineNum,
                message: 'Potential XSS: unescaped user input in HTML',
                remediation: 'Escape HTML entities or use a library like DOMPurify',
                evidence: line.substring(0, 60) + '...',
            });
        }
    }
    return found;
}
export function detectSecurityPatterns(filePaths) {
    const patterns = [];
    for (const filePath of filePaths) {
        if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
            continue;
        }
        try {
            patterns.push(...scanFileSecurity(filePath));
        }
        catch {
            logger.debug(`Failed to scan security patterns in ${filePath}`);
        }
    }
    return patterns.slice(0, 20);
}
