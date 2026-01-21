# Quality Validation CLI Tool - API Specification

**Document ID:** QUAL-API-001
**Version:** 1.0
**Date:** January 20, 2025
**Status:** APPROVED FOR DEVELOPMENT

---

## Overview

This document provides complete API specifications for the Quality Validation CLI Tool, including all interfaces, type definitions, function signatures, and data structures.

---

## Table of Contents

1. [Core Interfaces](#1-core-interfaces)
2. [Configuration Interfaces](#2-configuration-interfaces)
3. [Analysis Results](#3-analysis-results)
4. [Scoring Results](#4-scoring-results)
5. [Report Formats](#5-report-formats)
6. [CLI Interfaces](#7-cli-interfaces)
7. [Analyzer Function Signatures](#8-analyzer-function-signatures)
8. [Reporter Function Signatures](#9-reporter-function-signatures)
9. [Error Interfaces](#10-error-interfaces)
10. [Utility Functions](#11-utility-functions)

---

## 1. Core Interfaces

### 1.1 Command Line Options

```typescript
interface CommandLineOptions {
  format?: 'console' | 'json' | 'html' | 'csv';
  output?: string;           // Output file path
  config?: string;           // Config file path (.qualityrc.json)
  verbose?: boolean;         // Verbose logging output
  incremental?: boolean;     // Only analyze changed files
  skipCoverage?: boolean;    // Skip test coverage analysis
  skipSecurity?: boolean;    // Skip security analysis
  skipArchitecture?: boolean;// Skip architecture analysis
  skipComplexity?: boolean;  // Skip complexity analysis
  resetHistory?: boolean;    // Clear historical data
  help?: boolean;            // Display help information
  version?: boolean;         // Display version
  stdin?: boolean;           // Read config from stdin
  noColor?: boolean;         // Disable colored output
}
```

### 1.2 Finding (Core Reporting Unit)

```typescript
interface Finding {
  id: string;                    // Unique identifier
  severity: Severity;            // Severity level
  category: string;              // Category (e.g., "codeQuality")
  title: string;                 // Short title
  description: string;           // Detailed description
  location?: FileLocation;       // Where the issue is
  remediation: string;           // How to fix it
  evidence?: string;             // Code snippet or proof
  moreInfo?: string;             // Link to documentation
  affectedItems?: number;        // Count of occurrences
}

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface FileLocation {
  file: string;                  // Relative path from project root
  line?: number;                 // Line number (1-indexed)
  column?: number;               // Column number (1-indexed)
  endLine?: number;              // End line for range
  endColumn?: number;            // End column for range
}
```

### 1.3 Analysis Result

```typescript
interface AnalysisResult {
  category: AnalysisCategory;
  score: number;                 // 0-100
  status: 'pass' | 'fail' | 'warning';
  findings: Finding[];
  metrics: Record<string, unknown>;
  executionTime: number;         // milliseconds
  errors?: AnalysisError[];      // Errors during analysis
}

type AnalysisCategory =
  | 'codeQuality'
  | 'testCoverage'
  | 'architecture'
  | 'security';

interface AnalysisError {
  code: string;
  message: string;
  details?: string;
}
```

### 1.4 Recommendation

```typescript
interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;              // Which analysis category
  issue: string;                 // What the issue is
  remediation: string;           // How to fix it
  estimatedEffort: 'high' | 'medium' | 'low';
  expectedImpact: string;        // Impact description
  relatedFindings?: string[];    // IDs of related findings
}
```

---

## 2. Configuration Interfaces

### 2.1 Main Configuration

```typescript
interface Configuration {
  projectName?: string;
  description?: string;
  codeQuality: CodeQualityConfig;
  testCoverage: TestCoverageConfig;
  architecture: ArchitectureConfig;
  security: SecurityConfig;
  scoring: ScoringConfig;
  reporting: ReportingConfig;
  history: HistoryConfig;
  excludePaths: string[];
}
```

### 2.2 Code Quality Config

```typescript
interface CodeQualityConfig {
  enabled: boolean;
  complexity: ComplexityConfig;
  duplication: DuplicationConfig;
  linting: LintingConfig;
}

interface ComplexityConfig {
  enabled: boolean;
  max: number;                   // Critical threshold
  warning: number;               // Warning threshold
  ignorePatterns?: string[];
}

interface DuplicationConfig {
  enabled: boolean;
  maxPercent: number;            // Critical threshold (%)
  warningPercent: number;        // Warning threshold (%)
  minBlockSize: number;          // Minimum lines to consider block
  ignoredPatterns?: string[];
}

interface LintingConfig {
  enabled: boolean;
  maxErrors: number;             // Max allowed errors
  maxWarnings: number;           // Max allowed warnings
  ignoredRules?: string[];
  customRules?: string[];
}
```

### 2.3 Test Coverage Config

```typescript
interface TestCoverageConfig {
  enabled: boolean;
  minimumPercent: number;        // Minimum coverage required
  warningPercent: number;        // Warning threshold
  byType?: {
    line?: number;
    branch?: number;
    function?: number;
    statement?: number;
  };
  effectivenessScore?: {
    minAssertionsPerTest: number;
    maxMockUsagePercent: number;
    checkTestNaming: boolean;
    checkTestIsolation: boolean;
  };
  ignoredFiles?: string[];
}
```

### 2.4 Architecture Config

```typescript
interface ArchitectureConfig {
  enabled: boolean;
  components: ComponentConfig;
  dependencies: DependencyConfig;
  patterns: PatternsConfig;
}

interface ComponentConfig {
  enabled: boolean;
  maxLines: number;              // Critical threshold
  warningLines: number;          // Warning threshold
  validateAtomicDesign: boolean;
  validatePropTypes: boolean;
}

interface DependencyConfig {
  enabled: boolean;
  allowCircularDependencies: boolean;
  allowCrossLayerDependencies: boolean;
  maxExternalDeps?: number;
}

interface PatternsConfig {
  enabled: boolean;
  validateRedux: boolean;
  validateHooks: boolean;
  validateReactBestPractices: boolean;
}
```

### 2.5 Security Config

```typescript
interface SecurityConfig {
  enabled: boolean;
  vulnerabilities: VulnerabilityConfig;
  patterns: SecurityPatternConfig;
  performance: PerformanceConfig;
}

interface VulnerabilityConfig {
  enabled: boolean;
  allowCritical: number;         // Count allowed
  allowHigh: number;
  checkTransitive: boolean;
}

interface SecurityPatternConfig {
  enabled: boolean;
  checkSecrets: boolean;
  checkDangerousPatterns: boolean;
  checkInputValidation: boolean;
  checkXssRisks: boolean;
}

interface PerformanceConfig {
  enabled: boolean;
  checkRenderOptimization: boolean;
  checkBundleSize: boolean;
  checkUnusedDeps: boolean;
}
```

### 2.6 Scoring Config

```typescript
interface ScoringConfig {
  weights: ScoringWeights;
  passingGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  passingScore: number;          // Percentage
}

interface ScoringWeights {
  codeQuality: number;
  testCoverage: number;
  architecture: number;
  security: number;
  // Must sum to 1.0
}
```

### 2.7 Reporting Config

```typescript
interface ReportingConfig {
  defaultFormat: 'console' | 'json' | 'html' | 'csv';
  colors: boolean;
  verbose: boolean;
  outputDirectory: string;
  includeRecommendations: boolean;
  includeTrends: boolean;
}
```

### 2.8 History Config

```typescript
interface HistoryConfig {
  enabled: boolean;
  keepRuns: number;              // Number of runs to keep
  storePath: string;             // Where to store history
  compareToPrevious: boolean;
}
```

---

## 3. Analysis Results

### 3.1 Code Quality Metrics

```typescript
interface CodeQualityMetrics {
  complexity: ComplexityMetrics;
  duplication: DuplicationMetrics;
  linting: LintingMetrics;
}

interface ComplexityMetrics {
  functions: ComplexityFunction[];
  averagePerFile: number;
  maximum: number;
  distribution: {
    good: number;              // CC <= 10
    warning: number;           // 11-20
    critical: number;          // > 20
  };
}

interface ComplexityFunction {
  file: string;
  name: string;
  line: number;
  complexity: number;
  status: 'good' | 'warning' | 'critical';
}

interface DuplicationMetrics {
  percent: number;
  lines: number;
  blocks: DuplicationBlock[];
  status: 'good' | 'warning' | 'critical';
}

interface DuplicationBlock {
  locations: FileLocation[];
  size: number;
  lines: string[];
  suggestion: string;
}

interface LintingMetrics {
  errors: number;
  warnings: number;
  info: number;
  violations: LintingViolation[];
  byRule: Map<string, LintingViolation[]>;
  status: 'good' | 'warning' | 'critical';
}

interface LintingViolation {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  fixable: boolean;
}
```

### 3.2 Test Coverage Metrics

```typescript
interface TestCoverageMetrics {
  overall: CoverageSummary;
  byFile: Record<string, FileCoverage>;
  effectiveness: TestEffectiveness;
  gaps: CoverageGap[];
}

interface CoverageSummary {
  lines: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  statements: CoverageMetric;
}

interface CoverageMetric {
  total: number;
  covered: number;
  percentage: number;
  status: 'excellent' | 'acceptable' | 'poor';
}

interface FileCoverage {
  path: string;
  lines: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  statements: CoverageMetric;
}

interface TestEffectiveness {
  totalTests: number;
  testsWithMeaningfulNames: number;
  averageAssertionsPerTest: number;
  testsWithoutAssertions: number;
  excessivelyMockedTests: number;
  effectivenessScore: number;    // 0-100
  issues: TestIssue[];
}

interface TestIssue {
  file: string;
  testName?: string;
  issue: string;
  suggestion: string;
  severity: Severity;
}

interface CoverageGap {
  file: string;
  coverage: number;
  uncoveredLines: number;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  suggestedTests: string[];
  estimatedEffort: 'high' | 'medium' | 'low';
}
```

### 3.3 Architecture Metrics

```typescript
interface ArchitectureMetrics {
  components: ComponentMetrics;
  dependencies: DependencyMetrics;
  patterns: PatternMetrics;
}

interface ComponentMetrics {
  totalCount: number;
  byType: {
    atoms: number;
    molecules: number;
    organisms: number;
    templates: number;
    unknown: number;
  };
  oversized: OversizedComponent[];
  misplaced: MisplacedComponent[];
  averageSize: number;
}

interface OversizedComponent {
  file: string;
  name: string;
  lines: number;
  type: 'atom' | 'molecule' | 'organism' | 'template' | 'unknown';
  suggestion: string;
}

interface MisplacedComponent {
  file: string;
  name: string;
  currentLocation: string;
  suggestedLocation: string;
}

interface DependencyMetrics {
  totalModules: number;
  circularDependencies: CircularDependency[];
  layerViolations: LayerViolation[];
  externalDependencies: Map<string, number>;
}

interface CircularDependency {
  path: string[];                // Full cycle path
  files: string[];               // Files in cycle
  severity: 'critical' | 'high';
}

interface LayerViolation {
  source: string;
  target: string;
  violationType: string;
  suggestion: string;
}

interface PatternMetrics {
  reduxCompliance: {
    issues: PatternIssue[];
    score: number;
  };
  hookUsage: {
    issues: PatternIssue[];
    score: number;
  };
  reactBestPractices: {
    issues: PatternIssue[];
    score: number;
  };
}

interface PatternIssue {
  file: string;
  line?: number;
  pattern: string;
  issue: string;
  suggestion: string;
  severity: Severity;
}
```

### 3.4 Security Metrics

```typescript
interface SecurityMetrics {
  vulnerabilities: Vulnerability[];
  codePatterns: SecurityAntiPattern[];
  performanceIssues: PerformanceIssue[];
}

interface Vulnerability {
  package: string;
  currentVersion: string;
  vulnerabilityType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fixedInVersion: string;
  affectedCodeLocations?: string[];
}

interface SecurityAntiPattern {
  type: 'secret' | 'unsafeDom' | 'unvalidatedInput' | 'xss' | 'other';
  severity: Severity;
  file: string;
  line?: number;
  column?: number;
  message: string;
  remediation: string;
  evidence?: string;
}

interface PerformanceIssue {
  type: string;
  severity: Severity;
  file: string;
  line?: number;
  message: string;
  suggestion: string;
  estimatedImpact?: string;
}
```

---

## 4. Scoring Results

### 4.1 Scoring Result

```typescript
interface ScoringResult {
  overall: OverallScore;
  componentScores: ComponentScores;
  findings: Finding[];
  recommendations: Recommendation[];
  trend?: TrendData;
  metadata: ResultMetadata;
}

interface OverallScore {
  score: number;                 // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'pass' | 'fail';
  summary: string;
  passesThresholds: boolean;
}

interface ComponentScores {
  codeQuality: {
    score: number;
    weight: number;
    weightedScore: number;
  };
  testCoverage: {
    score: number;
    weight: number;
    weightedScore: number;
  };
  architecture: {
    score: number;
    weight: number;
    weightedScore: number;
  };
  security: {
    score: number;
    weight: number;
    weightedScore: number;
  };
}

interface TrendData {
  currentScore: number;
  previousScore?: number;
  changePercent?: number;
  direction?: 'improving' | 'stable' | 'degrading';
  lastFiveScores?: number[];
  componentTrends?: {
    codeQuality: TrendDirection;
    testCoverage: TrendDirection;
    architecture: TrendDirection;
    security: TrendDirection;
  };
}

interface TrendDirection {
  current: number;
  previous?: number;
  change?: number;
  direction?: 'up' | 'down' | 'stable';
}

interface ResultMetadata {
  timestamp: string;             // ISO 8601
  toolVersion: string;
  analysisTime: number;          // milliseconds
  projectPath: string;
  nodeVersion: string;
  configUsed: Configuration;
}
```

---

## 5. Report Formats

### 5.1 Console Report

```typescript
interface ConsoleReport {
  header: string;
  sections: ReportSection[];
  footer: string;
}

interface ReportSection {
  title: string;
  content: string;
  subsections?: ReportSection[];
  indentLevel: number;
}

// Example output structure
function generateConsoleReport(result: ScoringResult): string {
  // Returns formatted console string with ANSI colors
}
```

### 5.2 JSON Report

```typescript
interface JsonReport {
  metadata: ResultMetadata;
  overall: OverallScore;
  componentScores: ComponentScores;
  codeQuality: CodeQualityMetrics;
  testCoverage: TestCoverageMetrics;
  architecture: ArchitectureMetrics;
  security: SecurityMetrics;
  findings: Finding[];
  recommendations: Recommendation[];
  trend?: TrendData;
}

function generateJsonReport(result: ScoringResult): string {
  // Returns JSON string
}
```

### 5.3 HTML Report

```typescript
interface HtmlReport {
  html: string;                  // Complete HTML document
  title: string;
  generatedAt: string;
  projectName: string;
  assets: {
    charts?: string[];           // Chart data
    styles: string;              // Inline CSS
    scripts: string;             // Inline JavaScript
  };
}

async function generateHtmlReport(result: ScoringResult): Promise<string> {
  // Returns standalone HTML with embedded CSS/JS
}
```

### 5.4 CSV Report

```typescript
interface CsvReport {
  csv: string;                   // CSV formatted string
  headers: string[];
  rows: Array<Record<string, string>>;
}

function generateCsvReport(result: ScoringResult): string {
  // Returns CSV string
}
```

---

## 6. CLI Interfaces

### 6.1 CLI Parser Result

```typescript
interface ParsedCliArgs {
  command: string;               // 'check', 'quick', 'detailed'
  options: CommandLineOptions;
  configPath: string;
}

function parseCliArguments(args: string[]): ParsedCliArgs {
  // Parse and validate command line arguments
}
```

---

## 7. Analyzer Function Signatures

### 7.1 Code Quality Analyzer

```typescript
async function analyzeCodeQuality(
  config: CodeQualityConfig,
  filePaths: string[]
): Promise<AnalysisResult>

async function calculateComplexity(
  files: SourceFile[]
): Promise<ComplexityMetrics>

async function detectDuplication(
  files: SourceFile[]
): Promise<DuplicationMetrics>

async function analyzeLinting(
  eslintConfig: any
): Promise<LintingMetrics>
```

### 7.2 Test Coverage Analyzer

```typescript
async function analyzeTestCoverage(
  config: TestCoverageConfig,
  coverageDataPath: string
): Promise<AnalysisResult>

async function parseCoverageData(
  jestCoveragePath: string
): Promise<TestCoverageMetrics>

async function analyzeTestEffectiveness(
  testFilePaths: string[]
): Promise<TestEffectiveness>

async function identifyCoverageGaps(
  metrics: TestCoverageMetrics,
  sourceFiles: SourceFile[]
): Promise<CoverageGap[]>
```

### 7.3 Architecture Checker

```typescript
async function checkArchitecture(
  config: ArchitectureConfig,
  filePaths: string[]
): Promise<AnalysisResult>

async function validateComponentArchitecture(
  componentFiles: SourceFile[]
): Promise<ComponentMetrics>

async function analyzeDependencies(
  sourceFiles: SourceFile[]
): Promise<DependencyMetrics>

async function validatePatterns(
  sourceFiles: SourceFile[]
): Promise<PatternMetrics>
```

### 7.4 Security Scanner

```typescript
async function scanSecurity(
  config: SecurityConfig,
  filePaths: string[]
): Promise<AnalysisResult>

async function scanVulnerabilities(): Promise<Vulnerability[]>

async function detectSecurityPatterns(
  sourceFiles: SourceFile[]
): Promise<SecurityAntiPattern[]>

async function checkPerformanceIssues(
  sourceFiles: SourceFile[]
): Promise<PerformanceIssue[]>
```

---

## 8. Reporter Function Signatures

### 8.1 Report Generation

```typescript
async function generateReports(
  result: ScoringResult,
  options: CommandLineOptions
): Promise<void>

function generateConsoleReport(
  result: ScoringResult,
  options: ReportingConfig
): string

function generateJsonReport(
  result: ScoringResult,
  options: ReportingConfig
): string

async function generateHtmlReport(
  result: ScoringResult,
  options: ReportingConfig
): Promise<string>

function generateCsvReport(
  result: ScoringResult,
  options: ReportingConfig
): string

async function writeReportToFile(
  content: string,
  filePath: string,
  format: string
): Promise<void>
```

---

## 9. Error Interfaces

### 9.1 Error Types

```typescript
abstract class QualityValidationError extends Error {
  code: string;
  details?: string;
  solution?: string;
  context?: Record<string, unknown>;
  originalError?: Error;
}

class ConfigurationError extends QualityValidationError {
  constructor(message: string, details?: string);
}

class AnalysisError extends QualityValidationError {
  constructor(message: string, details?: string);
}

class IntegrationError extends QualityValidationError {
  constructor(message: string, details?: string);
}

class ReportingError extends QualityValidationError {
  constructor(message: string, details?: string);
}

interface ErrorReport {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  suggestion?: string;
  context?: string;
  timestamp: string;
}
```

---

## 10. Utility Functions

### 10.1 Configuration Management

```typescript
async function loadConfiguration(
  configPath?: string
): Promise<Configuration>

function validateConfiguration(
  config: unknown
): config is Configuration

function mergeWithDefaults(
  partial: Partial<Configuration>
): Configuration

function createDefaultConfiguration(): Configuration
```

### 10.2 History Management

```typescript
interface HistoricalRun {
  timestamp: string;
  score: number;
  grade: string;
  componentScores: ComponentScores;
}

function saveHistory(
  result: ScoringResult,
  historyConfig: HistoryConfig
): void

function loadHistory(
  historyConfig: HistoryConfig
): HistoricalRun[] | null

function calculateTrend(
  current: ScoringResult,
  previous: HistoricalRun | null
): TrendData

function getLastRun(
  historyConfig: HistoryConfig
): HistoricalRun | null
```

### 10.3 Aggregation

```typescript
function aggregateMetrics(
  results: AnalysisResult[]
): {
  codeQuality: CodeQualityMetrics;
  testCoverage: TestCoverageMetrics;
  architecture: ArchitectureMetrics;
  security: SecurityMetrics;
}

function normalizeMetric(
  value: number,
  min: number,
  max: number
): number

function calculateCategoryScore(
  metrics: Record<string, number>,
  weights: Record<string, number>
): number
```

### 10.4 Scoring

```typescript
function calculateOverallScore(
  componentScores: ComponentScores,
  weights: ScoringWeights
): number

function assignGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F'

function generateRecommendations(
  result: ScoringResult
): Recommendation[]

function prioritizeFindings(
  findings: Finding[]
): Finding[]
```

### 10.5 Utility Functions

```typescript
function normalizeFilePath(filePath: string): string

function getProjectRoot(): string

function getSourceFiles(
  excludePatterns: string[]
): string[]

function getTestFiles(
  excludePatterns: string[]
): string[]

function loadJsonFile<T>(filePath: string): T

function saveJsonFile<T>(
  filePath: string,
  data: T
): void

function getCoverageDataPath(): string

function getEslintConfig(): any

function getJestConfig(): any
```

---

## Exit Codes

```typescript
enum ExitCode {
  SUCCESS = 0,                   // All thresholds passed
  QUALITY_FAILURE = 1,           // Quality issues detected
  CONFIGURATION_ERROR = 2,       // Config error
  EXECUTION_ERROR = 3,           // Execution error
  KEYBOARD_INTERRUPT = 130       // Ctrl+C
}
```

---

## Environment Variables

```typescript
// Configuration
QUALITY_CONFIG_PATH              // Path to .qualityrc.json
QUALITY_PROJECT_ROOT             // Project root directory

// Output
QUALITY_FORMAT                   // 'console', 'json', 'html', 'csv'
QUALITY_OUTPUT                   // Output file path
QUALITY_NO_COLOR                 // Disable colored output
QUALITY_VERBOSE                  // Enable verbose logging

// Analysis Control
QUALITY_SKIP_COVERAGE            // Skip test coverage analysis
QUALITY_SKIP_SECURITY            // Skip security analysis
QUALITY_SKIP_ARCHITECTURE        // Skip architecture analysis
QUALITY_SKIP_COMPLEXITY          // Skip complexity analysis
QUALITY_INCREMENTAL              // Only analyze changed files

// History
QUALITY_SAVE_HISTORY             // Save results to history
QUALITY_RESET_HISTORY            // Clear historical data
QUALITY_HISTORY_PATH             // Path to history file
```

---

## Complete Example

### Example: Using the API Programmatically

```typescript
import {
  loadConfiguration,
  analyzeProject,
  aggregateMetrics,
  calculateScore,
  generateJsonReport
} from 'quality-validator';

async function runQualityCheck() {
  try {
    // Load configuration
    const config = await loadConfiguration('.qualityrc.json');

    // Run all analyzers
    const results = await analyzeProject(
      {
        format: 'json',
        verbose: true
      },
      config
    );

    // Access scoring result
    console.log(`Overall Grade: ${results.overall.grade}`);
    console.log(`Score: ${results.overall.score}`);

    // Generate report
    const jsonReport = generateJsonReport(results);
    console.log(jsonReport);

    // Check if quality passed
    if (results.overall.status === 'pass') {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Quality validation failed:', error);
    process.exit(3);
  }
}

runQualityCheck();
```

---

**End of Document**
