/**
 * HTML Report Metrics Section Module
 * Generates detailed metrics display for code quality, coverage, architecture, and security
 */
/**
 * Generate detailed metrics display section
 *
 * @param {ScoringResult} result - Complete scoring result with all metrics
 * @returns {string} HTML section with detailed metrics
 *
 * @description
 * Displays detailed metrics from all analysis categories if available
 */
export function generateMetricsSection(result) {
    let html = '<section class="section"><h2>Detailed Metrics</h2>';
    // Get metrics from metadata (simplified approach)
    const config = result.metadata.configUsed;
    html += generateCodeQualityMetrics(config);
    html += generateTestCoverageMetrics(config);
    html += generateArchitectureMetrics(config);
    html += generateSecurityMetrics(config);
    html += '</section>';
    return html;
}
/**
 * Generate code quality metrics card
 *
 * @param {any} config - Configuration object
 * @returns {string} HTML code quality metrics card
 */
function generateCodeQualityMetrics(config) {
    if (!config.codeQuality?.enabled) {
        return '';
    }
    const cq = config.codeQuality;
    return `<div class="card">
  <h3>Code Quality Configuration</h3>
  <div class="metrics-grid">
    <div class="metric">
      <div class="metric-label">Complexity Threshold</div>
      <div class="metric-value">${cq.complexity?.max || 'N/A'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Complexity Warning</div>
      <div class="metric-value">${cq.complexity?.warning || 'N/A'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Max Duplication %</div>
      <div class="metric-value">${cq.duplication?.maxPercent || 'N/A'}%</div>
    </div>
    <div class="metric">
      <div class="metric-label">Max Lint Errors</div>
      <div class="metric-value">${cq.linting?.maxErrors || 'N/A'}</div>
    </div>
  </div>
</div>`;
}
/**
 * Generate test coverage metrics card
 *
 * @param {any} config - Configuration object
 * @returns {string} HTML test coverage metrics card
 */
function generateTestCoverageMetrics(config) {
    if (!config.testCoverage?.enabled) {
        return '';
    }
    const tc = config.testCoverage;
    return `<div class="card">
  <h3>Test Coverage Configuration</h3>
  <div class="metrics-grid">
    <div class="metric">
      <div class="metric-label">Minimum Coverage</div>
      <div class="metric-value">${tc.minimumPercent || 'N/A'}%</div>
    </div>
    <div class="metric">
      <div class="metric-label">Warning Threshold</div>
      <div class="metric-value">${tc.warningPercent || 'N/A'}%</div>
    </div>
    <div class="metric">
      <div class="metric-label">Min Assertions</div>
      <div class="metric-value">${tc.effectivenessScore?.minAssertionsPerTest || 'N/A'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Max Mock Usage</div>
      <div class="metric-value">${tc.effectivenessScore?.maxMockUsagePercent || 'N/A'}%</div>
    </div>
  </div>
</div>`;
}
/**
 * Generate architecture metrics card
 *
 * @param {any} config - Configuration object
 * @returns {string} HTML architecture metrics card
 */
function generateArchitectureMetrics(config) {
    if (!config.architecture?.enabled) {
        return '';
    }
    const arch = config.architecture;
    return `<div class="card">
  <h3>Architecture Configuration</h3>
  <div class="metrics-grid">
    <div class="metric">
      <div class="metric-label">Max Component Lines</div>
      <div class="metric-value">${arch.components?.maxLines || 'N/A'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Component Warning</div>
      <div class="metric-value">${arch.components?.warningLines || 'N/A'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Atomic Design Check</div>
      <div class="metric-value">${arch.components?.validateAtomicDesign ? 'Enabled' : 'Disabled'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Pattern Check</div>
      <div class="metric-value">${arch.patterns?.enabled ? 'Enabled' : 'Disabled'}</div>
    </div>
  </div>
</div>`;
}
/**
 * Generate security metrics card
 *
 * @param {any} config - Configuration object
 * @returns {string} HTML security metrics card
 */
function generateSecurityMetrics(config) {
    if (!config.security?.enabled) {
        return '';
    }
    const sec = config.security;
    return `<div class="card">
  <h3>Security Configuration</h3>
  <div class="metrics-grid">
    <div class="metric">
      <div class="metric-label">Allow Critical Vulns</div>
      <div class="metric-value">${sec.vulnerabilities?.allowCritical || 0}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Allow High Vulns</div>
      <div class="metric-value">${sec.vulnerabilities?.allowHigh || 0}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Check Secrets</div>
      <div class="metric-value">${sec.patterns?.checkSecrets ? 'Yes' : 'No'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Check XSS Risks</div>
      <div class="metric-value">${sec.patterns?.checkXssRisks ? 'Yes' : 'No'}</div>
    </div>
  </div>
</div>`;
}
/**
 * Generate component weight visualization
 *
 * @param {ScoringResult} result - Scoring result
 * @returns {string} HTML weight visualization card
 *
 * @description
 * Shows how each component contributes to overall score
 */
export function generateWeightVisualization(result) {
    const weights = result.metadata.configUsed.scoring?.weights;
    if (!weights) {
        return '';
    }
    return `<section class="section">
  <h2>Scoring Weights</h2>
  <div class="card">
    <h3>Component Contribution to Overall Score</h3>
    <div class="metrics-grid">
      <div class="metric">
        <div class="metric-label">Code Quality</div>
        <div class="score-bar">
          <div class="score-fill" style="width: ${weights.codeQuality * 100}%"></div>
        </div>
        <div class="metric-value">${(weights.codeQuality * 100).toFixed(1)}%</div>
      </div>
      <div class="metric">
        <div class="metric-label">Test Coverage</div>
        <div class="score-bar">
          <div class="score-fill" style="width: ${weights.testCoverage * 100}%"></div>
        </div>
        <div class="metric-value">${(weights.testCoverage * 100).toFixed(1)}%</div>
      </div>
      <div class="metric">
        <div class="metric-label">Architecture</div>
        <div class="score-bar">
          <div class="score-fill" style="width: ${weights.architecture * 100}%"></div>
        </div>
        <div class="metric-value">${(weights.architecture * 100).toFixed(1)}%</div>
      </div>
      <div class="metric">
        <div class="metric-label">Security</div>
        <div class="score-bar">
          <div class="score-fill" style="width: ${weights.security * 100}%"></div>
        </div>
        <div class="metric-value">${(weights.security * 100).toFixed(1)}%</div>
      </div>
    </div>
  </div>
</section>`;
}
