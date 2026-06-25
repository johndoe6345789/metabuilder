/**
 * HTML Footer informational sections (resources, legend)
 */

export function generateResourcesSection(): string {
  return (
    `<section class="section">\n` +
    `  <h2>Resources &amp; Next Steps</h2>\n` +
    `  <div class="card">\n` +
    `    <h3>For More Information</h3>\n` +
    `    <ul>\n` +
    `      <li>Review findings and prioritize remediation</li>\n` +
    `      <li>Follow recommendations to improve code quality</li>\n` +
    `      <li>Increase test coverage to improve reliability</li>\n` +
    `      <li>Refactor complex functions for maintainability</li>\n` +
    `      <li>Address security issues immediately</li>\n` +
    `    </ul>\n` +
    `    <h3>Configuration</h3>\n` +
    `    <p>Create a <code>.qualityrc.json</code> file in your ` +
    `project root to customize quality checks.</p>\n` +
    `    <h3>Continuous Integration</h3>\n` +
    `    <p>Integrate this tool into your CI/CD pipeline to catch ` +
    `issues early and maintain code quality over time.</p>\n` +
    `  </div>\n</section>`
  )
}

export function generateLegendSection(): string {
  return (
    `<section class="section">\n` +
    `  <h2>Report Legend</h2>\n` +
    `  <div class="card">\n` +
    `    <h3>Grades</h3>\n` +
    `    <ul>\n` +
    `      <li><strong>A (90-100):</strong> Excellent quality</li>\n` +
    `      <li><strong>B (80-89):</strong> Good quality</li>\n` +
    `      <li><strong>C (70-79):</strong> Acceptable quality</li>\n` +
    `      <li><strong>D (60-69):</strong> Poor quality</li>\n` +
    `      <li><strong>F (&lt;60):</strong> Failing quality</li>\n` +
    `    </ul>\n` +
    `    <h3>Finding Severity Levels</h3>\n` +
    `    <ul>\n` +
    `      <li><strong>Critical:</strong> Immediate action required` +
    `</li>\n` +
    `      <li><strong>High:</strong> Should be fixed soon</li>\n` +
    `      <li><strong>Medium:</strong> Should be addressed</li>\n` +
    `      <li><strong>Low:</strong> Nice to fix</li>\n` +
    `      <li><strong>Info:</strong> Notes and suggestions</li>\n` +
    `    </ul>\n` +
    `    <h3>Recommendation Priority</h3>\n` +
    `    <ul>\n` +
    `      <li><strong>Critical:</strong> Implement immediately</li>\n` +
    `      <li><strong>High:</strong> Next sprint</li>\n` +
    `      <li><strong>Medium:</strong> Can be planned</li>\n` +
    `      <li><strong>Low:</strong> Nice to have</li>\n` +
    `    </ul>\n  </div>\n</section>`
  )
}
