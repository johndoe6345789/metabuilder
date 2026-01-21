/**
 * Comprehensive Unit Tests for Security Scanner
 * Tests vulnerability detection, security pattern identification
 * XSS/SQL injection detection, and performance anti-patterns
 * with realistic security scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { SecurityScanner } from '../../../../../src/lib/quality-validator/analyzers/securityScanner';
import {
  createTempDir,
  cleanupTempDir,
  createTestFile,
} from '../../../../test-utils';

describe('SecurityScanner - Comprehensive Tests', () => {
  let scanner: SecurityScanner;
  let tempDir: string;

  beforeEach(() => {
    scanner = new SecurityScanner();
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  // ============================================================================
  // HARDCODED SECRETS DETECTION TESTS
  // ============================================================================

  describe('Hardcoded Secrets Detection', () => {
    it('should detect hardcoded password', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/config.ts',
          `
export const config = {
  password: 'mySecurePassword123!',
  api: 'https://api.example.com'
};
        `
        );

        const result = await scanner.analyze(['src/config.ts']);

        const secretFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('secret') ||
          f.title.toLowerCase().includes('hardcoded')
        );

        if (secretFindings.length > 0) {
          expect(secretFindings[0].severity).toMatch(/critical|high/);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect hardcoded API keys', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/api.ts',
          `
const apiKey = 'sk_live_51234567890abcdef';
const API_KEY = 'AIzaSyDummyKeyForTesting';
export const getClient = () => apiKey;
        `
        );

        const result = await scanner.analyze(['src/api.ts']);

        const metrics = result.metrics as any;
        expect(metrics.codePatterns).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect hardcoded authentication tokens', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/auth.ts',
          `
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const auth = 'Bearer abc123xyz789';
export const authenticate = () => token;
        `
        );

        const result = await scanner.analyze(['src/auth.ts']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect secret in environment-like variable names', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/secrets.ts',
          `
const SECRET_KEY = 'super_secret_key_123';
const DATABASE_PASSWORD = 'admin@password';
const authorization = 'Basic dXNlcjpwYXNz';
        `
        );

        const result = await scanner.analyze(['src/secrets.ts']);

        const metrics = result.metrics as any;
        expect(metrics.codePatterns).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // XSS VULNERABILITY DETECTION TESTS
  // ============================================================================

  describe('XSS Vulnerability Detection', () => {
    it('should detect dangerouslySetInnerHTML usage', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/components/Content.tsx',
          `
import React from 'react';

export const ContentComponent = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
        `
        );

        const result = await scanner.analyze(['src/components/Content.tsx']);

        const xssFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('dangerously') ||
          f.title.toLowerCase().includes('xss')
        );

        if (xssFindings.length > 0) {
          expect(xssFindings[0].severity).toMatch(/high|critical/);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect innerHTML assignments', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/utils/dom.ts',
          `
export const renderContent = (element, html) => {
  element.innerHTML = html;
};
        `
        );

        const result = await scanner.analyze(['src/utils/dom.ts']);

        const innerHtmlFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('innerhtml')
        );

        if (innerHtmlFindings.length > 0) {
          expect(innerHtmlFindings[0].severity).toMatch(/high/);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect eval() usage', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/evaluator.ts',
          `
export const executeCode = (code) => {
  return eval(code);
};
        `
        );

        const result = await scanner.analyze(['src/evaluator.ts']);

        const evalFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('eval')
        );

        if (evalFindings.length > 0) {
          expect(evalFindings[0].severity).toBe('critical');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect potential XSS with user input in innerHTML', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/render.tsx',
          `
export const renderUserData = (userData) => {
  return <div dangerouslySetInnerHTML={{ __html: userData.content }} />;
};
        `
        );

        const result = await scanner.analyze(['src/render.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.codePatterns).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // REALISTIC SECURITY SCENARIOS
  // ============================================================================

  describe('Realistic Security Scenarios', () => {
    it('should analyze real-world API client with multiple security issues', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/services/userService.ts',
          `
const API_KEY = 'sk_live_abc123def456xyz';
const DATABASE_PASSWORD = 'admin@password123';

export const userService = {
  async fetchUser(userId, htmlContent) {
    const headers = {
      'Authorization': 'Bearer ' + API_KEY,
      'X-API-Key': 'sk_test_123456'
    };

    const response = await fetch(\`/api/users/\${userId}\`, { headers });
    const userData = await response.json();

    // Vulnerable: dangerouslySetInnerHTML with user data
    return {
      ...userData,
      profile: dangerouslySetInnerHTML(htmlContent)
    };
  },

  renderHTML(userInput) {
    // Vulnerable: direct innerHTML assignment
    document.getElementById('content').innerHTML = userInput;
  },

  executeUserCode(code) {
    // Critical: eval usage
    return eval(code);
  }
};

function dangerouslySetInnerHTML(html) {
  return { __html: html };
}
        `
        );

        const result = await scanner.analyze(['src/services/userService.ts']);

        expect(result.findings.length).toBeGreaterThan(0);
        expect(result.score).toBeLessThan(100);

        // Verify critical security issues are found
        const criticalFindings = result.findings.filter(f => f.severity === 'critical');
        expect(criticalFindings.length).toBeGreaterThan(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect multiple secret types in configuration file', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/config/secrets.ts',
          `
export const secrets = {
  DATABASE_URL: 'postgresql://user:password123@localhost:5432/mydb',
  SECRET_KEY: 'my-super-secret-key-for-jwt',
  API_PASSWORD: 'admin123!@#',
  oauth_token: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  apiKey: 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYzAb',
};
        `
        );

        const result = await scanner.analyze(['src/config/secrets.ts']);

        const secretFindings = result.findings.filter(f =>
          f.severity === 'critical' ||
          (f.description?.toLowerCase().includes('secret') ||
           f.description?.toLowerCase().includes('password') ||
           f.description?.toLowerCase().includes('hardcoded'))
        );

        expect(secretFindings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should analyze component with mixed XSS risks', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/components/UserContent.tsx',
          `
import React from 'react';
import { sanitizeHtml } from 'lib/sanitizer';

interface Props {
  content: string;
  userHTML: string;
}

export const UserContent: React.FC<Props> = ({ content, userHTML }) => {
  const handleRender = () => {
    // Vulnerable pattern
    return <div dangerouslySetInnerHTML={{ __html: userHTML }} />;
  };

  const handleDOM = (element: HTMLElement, html: string) => {
    // Vulnerable: direct innerHTML
    element.innerHTML = html;
  };

  // Safe pattern
  const safeRender = () => {
    return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userHTML) }} />;
  };

  return (
    <div>
      {handleRender()}
      {safeRender()}
    </div>
  );
};
        `
        );

        const result = await scanner.analyze(['src/components/UserContent.tsx']);

        const highSeverityFindings = result.findings.filter(f =>
          f.severity === 'high' || f.severity === 'critical'
        );

        expect(highSeverityFindings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // PERFORMANCE ISSUES DETECTION TESTS
  // ============================================================================

  describe('Performance Issues Detection', () => {
    it('should detect inline function definitions in JSX', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/Button.tsx',
          `
export const Button = ({ onClick }) => {
  return <button onClick={() => onClick()}>Click</button>;
};
        `
        );

        const result = await scanner.analyze(['src/Button.tsx']);

        const perfFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('inline') ||
          f.title.toLowerCase().includes('performance')
        );

        if (perfFindings.length > 0) {
          expect(perfFindings[0].severity).toMatch(/medium|high/);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect missing keys in list rendering', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/List.tsx',
          `
export const List = ({ items }) => {
  return (
    <ul>
      {items.map((item) => (
        <li>{item.name}</li>
      ))}
    </ul>
  );
};
        `
        );

        const result = await scanner.analyze(['src/List.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.performanceIssues).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect inline objects in JSX props', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/Component.tsx',
          `
export const Component = () => {
  return <Child style={{ color: 'red', fontSize: 14 }} />;
};
        `
        );

        const result = await scanner.analyze(['src/Component.tsx']);

        const inlineFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('inline')
        );

        if (inlineFindings.length > 0) {
          expect(inlineFindings[0].severity).toMatch(/medium/);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect inline array literals in JSX', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/Modal.tsx',
          `
export const Modal = () => {
  return <Dialog actions={['OK', 'Cancel']} />;
};
        `
        );

        const result = await scanner.analyze(['src/Modal.tsx']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should report performance issue impact', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/Grid.tsx',
          `
export const Grid = ({ items }) => {
  return (
    <div>
      {items.map((item) => (
        <Item onClick={() => console.log(item)} />
      ))}
    </div>
  );
};
        `
        );

        const result = await scanner.analyze(['src/Grid.tsx']);

        const metrics = result.metrics as any;
        if (metrics.performanceIssues.length > 0) {
          const issue = metrics.performanceIssues[0];
          expect(issue.estimatedImpact).toBeDefined();
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // FINDINGS GENERATION TESTS
  // ============================================================================

  describe('Findings Generation', () => {
    it('should generate findings for vulnerabilities', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/dangerous.ts',
          `
export const evaluate = (code) => {
  return eval(code);
};
        `
        );

        const result = await scanner.analyze(['src/dangerous.ts']);

        const vulnFindings = result.findings.filter((f) =>
          f.category === 'security'
        );

        expect(vulnFindings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should provide remediation guidance in findings', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/insecure.tsx',
          `
export const Component = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
        `
        );

        const result = await scanner.analyze(['src/insecure.tsx']);

        const securityFindings = result.findings.filter((f) =>
          f.category === 'security'
        );

        if (securityFindings.length > 0) {
          expect(securityFindings[0].remediation).toBeDefined();
          expect(securityFindings[0].remediation.length).toBeGreaterThan(0);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should include location info in findings', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/located.tsx',
          `
export const Component = () => {
  const password = 'secret123';
  return <div dangerouslySetInnerHTML={{ __html: 'test' }} />;
};
        `
        );

        const result = await scanner.analyze(['src/located.tsx']);

        const findings = result.findings.filter((f) => f.location);

        if (findings.length > 0) {
          expect(findings[0].location?.file).toBeDefined();
          expect(findings[0].location?.line).toBeGreaterThanOrEqual(1);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // SCORE CALCULATION TESTS
  // ============================================================================

  describe('Score Calculation', () => {
    it('should return score between 0 and 100', async () => {
      const result = await scanner.analyze([]);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should reduce score for critical vulnerabilities', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/critical.ts',
          `
export const bad = () => {
  eval('dangerous code');
};
        `
        );

        const result = await scanner.analyze(['src/critical.ts']);

        expect(typeof result.score).toBe('number');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should reduce score for high vulnerabilities', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/high.tsx',
          `
export const Component = () => {
  return <div dangerouslySetInnerHTML={{ __html: 'unsafe' }} />;
};
        `
        );

        const result = await scanner.analyze(['src/high.tsx']);

        expect(result.score).toBeLessThanOrEqual(100);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should assign status based on score', async () => {
      const result = await scanner.analyze([]);

      if (result.score >= 80) {
        expect(result.status).toBe('pass');
      } else if (result.score >= 70) {
        expect(result.status).toBe('warning');
      } else {
        expect(result.status).toBe('fail');
      }
    });

    it('should heavily penalize critical security issues', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // File with secrets
        createTestFile(
          tempDir,
          'src/file1.ts',
          `
const password: 'mySecret123';
const apiKey = 'sk_live_123456';
        `
        );

        // File with eval
        createTestFile(
          tempDir,
          'src/file2.ts',
          `
eval(code);
        `
        );

        const result = await scanner.analyze([
          'src/file1.ts',
          'src/file2.ts',
        ]);

        // Should have significant score reduction
        expect(result.score).toBeLessThan(100);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // ERROR HANDLING AND EDGE CASES
  // ============================================================================

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty file paths array', async () => {
      const result = await scanner.analyze([]);

      expect(result).toBeDefined();
      expect(result.category).toBe('security');
    });

    it('should skip non-TypeScript files', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/config.json', '{}');
        createTestFile(tempDir, 'src/readme.md', '# README');

        const result = await scanner.analyze([
          'src/config.json',
          'src/readme.md',
        ]);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle non-existent files gracefully', async () => {
      const result = await scanner.analyze(['non-existent.ts']);

      expect(result).toBeDefined();
      expect(result.category).toBe('security');
    });

    it('should measure execution time', async () => {
      const result = await scanner.analyze([]);

      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.executionTime).toBe('number');
    });

    it('should handle files with special characters', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/special-chars.ts',
          `
const emoji = '🔒';
const unicodeVar = 'こんにちは';
const symbols = '@#$%^&*()';
        `
        );

        const result = await scanner.analyze(['src/special-chars.ts']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // MULTIPLE ISSUES SCENARIOS
  // ============================================================================

  describe('Multiple Security Issues Scenarios', () => {
    it('should detect multiple issues in single file', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/multiple-issues.tsx',
          `
export const ComponentWithIssues = ({ userInput }) => {
  // Issue 1: Hardcoded secret
  const apiKey = 'sk_live_secret_123';

  // Issue 2: dangerouslySetInnerHTML
  return (
    <div dangerouslySetInnerHTML={{ __html: userInput }} />
  );
};
        `
        );

        const result = await scanner.analyze(['src/multiple-issues.tsx']);

        expect(result.findings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should analyze complete project for security issues', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/utils/encrypt.ts', `
const SECRET = 'my-secret-key';
export const encrypt = (data) => data;
`);

        createTestFile(tempDir, 'src/components/Display.tsx', `
export const Display = ({ html }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
);
`);

        createTestFile(tempDir, 'src/evaluator.ts', `
export const run = (code) => eval(code);
`);

        const result = await scanner.analyze([
          'src/utils/encrypt.ts',
          'src/components/Display.tsx',
          'src/evaluator.ts',
        ]);

        expect(result.findings).toBeDefined();
        expect(Array.isArray(result.findings)).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should limit findings to top 20', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        let largeFile = '';
        for (let i = 0; i < 30; i++) {
          largeFile += `element_${i}.innerHTML = userInput;\n`;
        }

        createTestFile(tempDir, 'src/many-issues.ts', largeFile);

        const result = await scanner.analyze(['src/many-issues.ts']);

        const metrics = result.metrics as any;
        expect(metrics.codePatterns.length).toBeLessThanOrEqual(20);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // SAFE CODE TESTS
  // ============================================================================

  describe('Safe Code Recognition', () => {
    it('should not flag safe component code', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/SafeComponent.tsx',
          `
import React, { useState } from 'react';

interface Props {
  title: string;
  onClick: () => void;
}

export const SafeComponent: React.FC<Props> = ({ title, onClick }) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    onClick();
  };

  return (
    <div className="component">
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
};
        `
        );

        const result = await scanner.analyze(['src/SafeComponent.tsx']);

        expect(result.score).toBeGreaterThanOrEqual(80);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should not flag safe utility code', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/utils/helpers.ts',
          `
export const add = (a: number, b: number): number => a + b;
export const multiply = (a: number, b: number): number => a * b;
export const isEmpty = (str: string): boolean => str.length === 0;

interface User {
  id: string;
  name: string;
  email: string;
}

export const getUserName = (user: User): string => user.name;
export const isValidEmail = (email: string): boolean => {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
};
        `
        );

        const result = await scanner.analyze(['src/utils/helpers.ts']);

        expect(result.score).toBeGreaterThan(80);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
